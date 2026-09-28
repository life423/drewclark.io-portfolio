/**
 * Keep the code index in MongoDB in step with the repos on GitHub
 *
 * Each repo's files are split into chunks and stored with their embeddings in
 * code_chunks, where Atlas Vector Search finds them for the chat. code_index_state
 * remembers the last indexed commit and file hashes per repo, so later runs only
 * re-embed files whose contents changed.
 */
const config = require('../../config');
const { getDb, isMongoConfigured } = require('../../db');
const { cloneRepo, latestCommit, listIndexableFiles, removeDir } = require('./repoFiles');
const { chunkFile } = require('./chunker');
const { embedTexts } = require('./embeddings');

const settings = config.codeIndex;
const EMBED_BATCH = 100; // chunks per embeddings request
const WRITE_BATCH = 200; // operations per bulk write
const PRICE_PER_MILLION_TOKENS = 0.02; // text-embedding-3-small

const VECTOR_INDEX_DEFINITION = {
    fields: [
        { type: 'vector', path: 'embedding', numDimensions: settings.dimensions, similarity: 'cosine' },
        { type: 'filter', path: 'repo' },
    ],
};

function formatCost(tokens) {
    return `$${((tokens / 1e6) * PRICE_PER_MILLION_TOKENS).toFixed(4)}`;
}

// The location goes first, so questions about where something lives match on paths too
function embeddingInput(repo, chunk) {
    return `Repository: ${repo}\nFile: ${chunk.path} (lines ${chunk.startLine}-${chunk.endLine})\n\n${chunk.text}`;
}

async function getCollections() {
    const db = await getDb();
    return {
        db,
        chunks: db.collection(settings.chunksCollection),
        state: db.collection(settings.stateCollection),
    };
}

// What's already indexed. An index built with other settings or another model is rebuilt from scratch.
async function loadPreviousState(collections, repo, full) {
    const state = collections ? await collections.state.findOne({ _id: repo }) : null;
    const compatible = Boolean(
        state && state.version === settings.version && state.embeddingModel === settings.embeddingModel
    );
    const rebuild = full || !compatible;
    return {
        rebuild,
        commit: rebuild ? null : state.commit,
        hashes: new Map(rebuild ? [] : (state.files || []).map(file => [file.path, file.hash])),
    };
}

// Which files changed or disappeared since the last run, and the chunks to embed for them
function planChanges(files, previousHashes) {
    const changedFiles = files.filter(file => previousHashes.get(file.path) !== file.hash);
    const currentPaths = new Set(files.map(file => file.path));
    const removedPaths = [...previousHashes.keys()].filter(filePath => !currentPaths.has(filePath));
    const chunks = changedFiles.flatMap(file =>
        chunkFile(file.content, settings).map((chunk, chunkIndex) => ({
            ...chunk,
            chunkIndex,
            path: file.path,
            language: file.language,
            fileHash: file.hash,
        }))
    );
    return { changedFiles, removedPaths, chunks };
}

async function embedChunks(repo, chunks) {
    let tokens = 0;
    const vectors = [];
    for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
        const batch = chunks.slice(i, i + EMBED_BATCH);
        const result = await embedTexts(batch.map(chunk => embeddingInput(repo, chunk)));
        vectors.push(...result.vectors);
        tokens += result.tokens;
    }
    return { vectors, tokens };
}

function buildWriteOperations({ repo, commit, plan, vectors, rebuild }) {
    const indexedAt = new Date();
    const operations = [];

    if (rebuild) {
        operations.push({ deleteMany: { filter: { repo } } });
    } else if (plan.removedPaths.length > 0) {
        operations.push({ deleteMany: { filter: { repo, path: { $in: plan.removedPaths } } } });
    }

    const chunkCounts = new Map();
    plan.chunks.forEach((chunk, i) => {
        chunkCounts.set(chunk.path, (chunkCounts.get(chunk.path) || 0) + 1);
        operations.push({
            replaceOne: {
                filter: { _id: `${repo}:${chunk.path}:${chunk.chunkIndex}` },
                replacement: {
                    repo,
                    path: chunk.path,
                    chunkIndex: chunk.chunkIndex,
                    startLine: chunk.startLine,
                    endLine: chunk.endLine,
                    language: chunk.language,
                    text: chunk.text,
                    embedding: vectors[i],
                    fileHash: chunk.fileHash,
                    commit,
                    indexedAt,
                },
                upsert: true,
            },
        });
    });

    // A file that got shorter leaves chunks past its new end; clear those out
    if (!rebuild) {
        for (const file of plan.changedFiles) {
            const count = chunkCounts.get(file.path) || 0;
            operations.push({ deleteMany: { filter: { repo, path: file.path, chunkIndex: { $gte: count } } } });
        }
    }
    return operations;
}

async function saveIndex(collections, { repo, commit, files, operations }) {
    for (let i = 0; i < operations.length; i += WRITE_BATCH) {
        await collections.chunks.bulkWrite(operations.slice(i, i + WRITE_BATCH), { ordered: true });
    }
    const chunkCount = await collections.chunks.countDocuments({ repo });
    await collections.state.replaceOne(
        { _id: repo },
        {
            commit,
            version: settings.version,
            embeddingModel: settings.embeddingModel,
            files: files.map(file => ({ path: file.path, hash: file.hash })),
            chunkCount,
            indexedAt: new Date(),
        },
        { upsert: true }
    );
    return chunkCount;
}

/**
 * Bring one repo's chunks up to date.
 *   dryRun: report what would change, without embedding or writing anything
 *   full:   re-embed every file, ignoring what's already indexed
 */
async function indexRepo(repo, { dryRun = false, full = false, log = console.log } = {}) {
    const collections = isMongoConfigured() ? await getCollections() : null;
    const previous = await loadPreviousState(collections, repo, full);

    // Nothing pushed since the last run: done, without cloning
    if (!previous.rebuild) {
        const latest = await latestCommit(repo);
        if (latest && latest === previous.commit) {
            log(`${repo}: up to date at ${latest.slice(0, 7)}`);
            return { repo, upToDate: true, tokens: 0 };
        }
    }

    const { dir, commit } = await cloneRepo(repo);
    try {
        const files = await listIndexableFiles(dir, settings);
        const plan = planChanges(files, previous.hashes);
        const summary =
            `${repo}@${commit.slice(0, 7)}: ${files.length} files, ${plan.changedFiles.length} changed, ` +
            `${plan.removedPaths.length} removed, ${plan.chunks.length} chunks to embed`;

        if (dryRun) {
            const characters = plan.chunks.reduce((total, chunk) => total + embeddingInput(repo, chunk).length, 0);
            const estimatedTokens = Math.round(characters / 4);
            log(`${summary} (about ${estimatedTokens.toLocaleString()} tokens, ${formatCost(estimatedTokens)})`);
            return { repo, commit, tokens: 0, estimatedTokens };
        }

        // Embed everything before writing, so a failure part way through leaves the index as it was
        const { vectors, tokens } = await embedChunks(repo, plan.chunks);
        const operations = buildWriteOperations({ repo, commit, plan, vectors, rebuild: previous.rebuild });
        const chunkCount = await saveIndex(collections, { repo, commit, files, operations });

        log(`${summary}; embedded ${tokens.toLocaleString()} tokens (${formatCost(tokens)}), ${chunkCount} chunks stored`);
        return { repo, commit, tokens, chunkCount };
    } finally {
        await removeDir(dir);
    }
}

/**
 * Create the Atlas Vector Search index if it doesn't exist yet. If the cluster
 * doesn't allow that from a driver, print how to do it in the Atlas UI instead.
 */
async function ensureVectorIndex(log = console.log) {
    const { db, chunks } = await getCollections();
    const name = settings.vectorIndexName;
    try {
        const existing = await chunks.listSearchIndexes(name).toArray();
        if (existing.length > 0) {
            log(`Vector index "${name}": ${String(existing[0].status || 'present').toLowerCase()}`);
            return true;
        }
        await chunks.createSearchIndex({ name, type: 'vectorSearch', definition: VECTOR_INDEX_DEFINITION });
        log(`Created vector index "${name}"; Atlas takes a minute or two to build it`);
        return true;
    } catch (error) {
        log(`Couldn't create the vector index from here (${error.message}).`);
        log(
            `Create it in the Atlas UI as a Vector Search index named "${name}" on ` +
                `${db.databaseName}.${settings.chunksCollection}, with this JSON definition:`
        );
        log(JSON.stringify(VECTOR_INDEX_DEFINITION, null, 2));
        return false;
    }
}

module.exports = { indexRepo, ensureVectorIndex, VECTOR_INDEX_DEFINITION, formatCost };
