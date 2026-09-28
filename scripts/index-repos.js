#!/usr/bin/env node
/**
 * Index the portfolio's GitHub repos for the code-aware chat
 *
 *   npm run index:repos                              update whatever changed
 *   npm run index:repos -- --dry-run                 show what would change; no embeddings or writes
 *   npm run index:repos -- --full                    re-embed everything
 *   npm run index:repos -- life423/ascend-avoid      just one repo
 *
 * Needs OPENAI_API_KEY and MONGODB_URI: from .env locally, from secrets in GitHub Actions.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const config = require('../api/config');
const { indexRepo, ensureVectorIndex, formatCost } = require('../api/services/codeIndex/indexer');
const { closeDb } = require('../api/db');

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const full = args.includes('--full');
    const requested = args.filter(arg => !arg.startsWith('--')).map(arg => arg.toLowerCase());

    const allowed = config.repositories.allowed;
    const notAllowed = requested.filter(repo => !allowed.includes(repo));
    if (notAllowed.length > 0) {
        console.error(`Not in the allowed repos: ${notAllowed.join(', ')}`);
        return 1;
    }
    if (!dryRun) {
        const missing = ['OPENAI_API_KEY', 'MONGODB_URI'].filter(name => !process.env[name]);
        if (missing.length > 0) {
            console.error(`Missing ${missing.join(' and ')}`);
            return 1;
        }
    }

    const repos = requested.length > 0 ? requested : allowed;
    console.log(`\n${dryRun ? 'Dry run: ' : ''}indexing ${repos.length} repo(s)${full ? ' from scratch' : ''}`);

    let failures = 0;
    let tokens = 0;
    for (const repo of repos) {
        try {
            const result = await indexRepo(repo, { dryRun, full });
            tokens += result.tokens;
        } catch (error) {
            failures += 1;
            console.error(`${repo}: failed (${error.message})`);
        }
    }

    if (!dryRun) {
        console.log(`Total embedded: ${tokens.toLocaleString()} tokens (${formatCost(tokens)})`);
        await ensureVectorIndex();
    }
    return failures > 0 ? 1 : 0;
}

main()
    .then(async code => {
        await closeDb();
        process.exit(code);
    })
    .catch(async error => {
        console.error(error);
        await closeDb();
        process.exit(1);
    });
