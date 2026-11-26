const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { excludedPathsForRepo, listIndexableFiles } = require('../api/services/codeIndex/repoFiles');

test('the archive cleanup matches only files omitted from the CudaRL chat index', async t => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'portfolio-index-test-'));
    t.after(() => fs.rm(root, { recursive: true, force: true }));
    const keep = [
        'src/agent.cu',
        'assets/research-evidence/trial/README.md',
        'assets/ppo-four-axis-checkpoints/run/notes.MD',
        'assets/research-evidence-tools/report.json',
        'examples/assets/research-evidence/result.json',
    ];
    const omit = [
        'assets/research-evidence/trial/result.json',
        'assets/ppo-four-axis-checkpoints/run/snapshot/agent.cu',
    ];
    const paths = [...keep, ...omit].sort();
    for (const name of paths) {
        const file = path.join(root, name);
        await fs.mkdir(path.dirname(file), { recursive: true });
        await fs.writeFile(file, 'fixture');
    }

    const settings = { maxFileBytes: 1024 };
    const filter = excludedPathsForRepo('life423/cudarl-arena');
    assert.deepEqual(paths.filter(name => filter.test(name)), omit.sort());
    const cuda = await listIndexableFiles(root, settings, filter);
    assert.deepEqual(cuda.map(file => file.path).sort(), keep.sort());

    const otherFilter = excludedPathsForRepo('life423/ascend-avoid');
    assert.equal(otherFilter, null);
    const other = await listIndexableFiles(root, settings, otherFilter);
    assert.deepEqual(other.map(file => file.path).sort(), paths);
});
