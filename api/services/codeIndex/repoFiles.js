/**
 * Fetch a repo and pick out the files worth indexing
 *
 * Only the indexer script calls this (never a chat request). It shallow-clones
 * into a temp folder and returns the text files the chat should know about.
 */
const { execFile } = require('child_process');
const { promisify } = require('util');
const crypto = require('crypto');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');

const run = promisify(execFile);
const GIT_ENV = { ...process.env, GIT_TERMINAL_PROMPT: '0' }; // fail instead of prompting for credentials

const INCLUDED_EXTENSIONS = new Set([
    '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx',
    '.py', '.html', '.css', '.scss',
    '.md', '.json', '.yml', '.yaml', '.toml', '.sh',
]);
const INCLUDED_NAMES = new Set(['dockerfile', 'makefile', 'procfile', 'requirements.txt']);

const SKIPPED_DIRS = new Set([
    '.git', 'node_modules', 'dist', 'build', 'coverage', '.next', '.cache',
    '__pycache__', 'venv', '.venv', '.pytest_cache', '.mypy_cache',
    '.idea', '.vscode', '.specstory',
]);
const SKIPPED_NAMES = new Set([
    'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'poetry.lock', 'pipfile.lock',
]);

const LANGUAGES = {
    '.js': 'javascript', '.jsx': 'javascript', '.mjs': 'javascript', '.cjs': 'javascript',
    '.ts': 'typescript', '.tsx': 'typescript', '.py': 'python', '.html': 'html',
    '.css': 'css', '.scss': 'scss', '.md': 'markdown', '.json': 'json',
    '.yml': 'yaml', '.yaml': 'yaml', '.toml': 'toml', '.sh': 'shell',
};

// Anything that looks like a credential is blanked out before it can reach the index
const SECRET_PATTERNS = [
    /\bsk-[A-Za-z0-9_-]{20,}/g, // OpenAI-style keys
    /\bgh[pousr]_[A-Za-z0-9]{30,}/g, // GitHub tokens
    /\bgithub_pat_[A-Za-z0-9_]{30,}/g,
    /\bAKIA[0-9A-Z]{16}\b/g, // AWS access key ids
    /\bAIza[0-9A-Za-z_-]{35}/g, // Google API keys
    /\bxox[abprs]-[A-Za-z0-9-]{10,}/g, // Slack tokens
    /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
    /(mongodb(?:\+srv)?:\/\/[^:\s/]+:)[^@\s]+@/g, // passwords in connection strings
];

function redactSecrets(text) {
    let redacted = text;
    for (const pattern of SECRET_PATTERNS) {
        redacted = redacted.replace(pattern, (match, prefix) =>
            typeof prefix === 'string' ? `${prefix}[redacted]@` : '[redacted]'
        );
    }
    return redacted;
}

function isIndexable(relativePath) {
    const name = path.basename(relativePath).toLowerCase();
    if (name.startsWith('.env')) return false; // never index env files
    if (SKIPPED_NAMES.has(name)) return false;
    if (/\.min\.(js|css)$/.test(name)) return false;
    return INCLUDED_NAMES.has(name) || INCLUDED_EXTENSIONS.has(path.extname(name));
}

function languageFor(relativePath) {
    const name = path.basename(relativePath).toLowerCase();
    if (name === 'dockerfile' || name === 'makefile') return name;
    if (name === 'requirements.txt') return 'text';
    return LANGUAGES[path.extname(name)] || 'text';
}

function repoUrl(repo) {
    return `https://github.com/${repo}.git`;
}

// Commit at the tip of the default branch, without cloning
async function latestCommit(repo) {
    const { stdout } = await run('git', ['ls-remote', repoUrl(repo), 'HEAD'], {
        timeout: 30000,
        env: GIT_ENV,
    });
    return stdout.split(/\s+/)[0] || null;
}

async function removeDir(dir) {
    await fs.rm(dir, { recursive: true, force: true });
}

async function cloneRepo(repo) {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'code-index-'));
    try {
        await run('git', ['clone', '--depth', '1', '--quiet', repoUrl(repo), dir], {
            timeout: 120000,
            env: GIT_ENV,
        });
        const { stdout } = await run('git', ['-C', dir, 'rev-parse', 'HEAD'], { env: GIT_ENV });
        return { dir, commit: stdout.trim() };
    } catch (error) {
        await removeDir(dir);
        throw new Error(`could not clone ${repo}: ${error.message}`);
    }
}

async function listIndexableFiles(rootDir, { maxFileBytes }) {
    const files = [];

    async function walk(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (!SKIPPED_DIRS.has(entry.name.toLowerCase())) {
                    await walk(fullPath);
                }
                continue;
            }
            if (!entry.isFile()) continue; // skip symlinks and anything unusual

            const relativePath = path.relative(rootDir, fullPath).split(path.sep).join('/');
            if (!isIndexable(relativePath)) continue;

            const { size } = await fs.stat(fullPath);
            if (size === 0 || size > maxFileBytes) continue; // empty, or almost certainly generated

            const buffer = await fs.readFile(fullPath);
            if (buffer.includes(0)) continue; // binary

            files.push({
                path: relativePath,
                language: languageFor(relativePath),
                content: redactSecrets(buffer.toString('utf8')),
                hash: crypto.createHash('sha1').update(buffer).digest('hex'),
            });
        }
    }

    await walk(rootDir);
    return files.sort((a, b) => a.path.localeCompare(b.path));
}

module.exports = {
    cloneRepo,
    latestCommit,
    listIndexableFiles,
    removeDir,
};
