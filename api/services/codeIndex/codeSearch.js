/**
 * Find the code most relevant to a visitor's question
 *
 * The question is embedded and matched against the code index with Atlas Vector
 * Search, and neighbouring chunks of the same file are joined into one excerpt.
 * Callers treat any error as "no excerpts", so the chat still answers from the
 * project descriptions if the index is unavailable.
 */
const config = require('../../config');
const { getDb } = require('../../db');
const { embedTexts } = require('./embeddings');

const settings = config.codeIndex;

function withTimeout(promise, ms, label) {
    let timer;
    const timeout = new Promise((resolve, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} took longer than ${ms} ms`)), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function lineCount(text) {
    return text.split('\n').length;
}

// Chunks overlap by a few lines; join overlapping or touching chunks of a file into one excerpt
function mergeNeighbours(results) {
    const byFile = new Map();
    for (const result of results) {
        const key = `${result.repo}:${result.path}`;
        byFile.set(key, [...(byFile.get(key) || []), result]);
    }

    const excerpts = [];
    for (const chunks of byFile.values()) {
        chunks.sort((a, b) => a.startLine - b.startLine);
        let current = { ...chunks[0] };
        for (const next of chunks.slice(1)) {
            const intact = lineCount(current.text) === current.endLine - current.startLine + 1;
            if (intact && next.startLine <= current.endLine + 1) {
                const newLines = next.text.split('\n').slice(current.endLine - next.startLine + 1);
                current = {
                    ...current,
                    text: newLines.length > 0 ? `${current.text}\n${newLines.join('\n')}` : current.text,
                    endLine: Math.max(current.endLine, next.endLine),
                    score: Math.max(current.score, next.score),
                };
            } else {
                excerpts.push(current);
                current = { ...next };
            }
        }
        excerpts.push(current);
    }
    return excerpts.sort((a, b) => b.score - a.score);
}

function truncate(excerpt, maxChars) {
    const cut = excerpt.text.lastIndexOf('\n', maxChars);
    const text = excerpt.text.slice(0, cut > 0 ? cut : maxChars);
    return { ...excerpt, text, endLine: excerpt.startLine + lineCount(text) - 1 };
}

// Best excerpts first, until the prompt budget is used up
function fitToBudget(excerpts, maxChars) {
    const kept = [];
    let used = 0;
    for (const excerpt of excerpts) {
        if (used + excerpt.text.length <= maxChars) {
            kept.push(excerpt);
            used += excerpt.text.length;
        } else if (kept.length === 0) {
            kept.push(truncate(excerpt, maxChars));
            used = maxChars;
        }
    }
    return kept;
}

async function runVectorSearch(question, repos) {
    const [{ vectors }, db] = await Promise.all([embedTexts([question]), getDb()]);
    return db
        .collection(settings.chunksCollection)
        .aggregate(
            [
                {
                    $vectorSearch: {
                        index: settings.vectorIndexName,
                        path: 'embedding',
                        queryVector: vectors[0],
                        numCandidates: settings.searchLimit * 20,
                        limit: settings.searchLimit,
                        filter: { repo: { $in: repos } },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        repo: 1,
                        path: 1,
                        startLine: 1,
                        endLine: 1,
                        language: 1,
                        text: 1,
                        commit: 1,
                        score: { $meta: 'vectorSearchScore' },
                    },
                },
            ],
            { maxTimeMS: settings.searchTimeoutMs }
        )
        .toArray();
}

/**
 * @param {string} question - The visitor's question
 * @param {string[]} repos - Repos to search, as owner/name
 * @returns {Promise<Array<{repo: string, path: string, startLine: number, endLine: number,
 *   language: string, text: string, commit: string, score: number}>>} Best excerpts first
 */
async function searchCode(question, repos) {
    if (!settings.enabled || !question || repos.length === 0) {
        return [];
    }
    const results = await withTimeout(runVectorSearch(question, repos), settings.searchTimeoutMs, 'Code search');
    const relevant = results.filter(result => result.score >= settings.minScore);
    return fitToBudget(mergeNeighbours(relevant), settings.maxContextChars);
}

module.exports = { searchCode, mergeNeighbours, fitToBudget };
