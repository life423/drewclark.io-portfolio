/* global fetch, AbortSignal, document, window, innerWidth, innerHeight, Buffer, __dirname */
// Actual desktop Safari smoke coverage. Exact phone viewports run separately
// in Playwright WebKit; SafariDriver cannot emulate an iPhone browser.
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');
const { setTimeout: delay } = require('node:timers/promises');
const projects = require('../app/src/data/projects.json');

const root = path.resolve(__dirname, '..');
const artifacts = path.join(root, 'test-results', 'safari');
const appUrl = 'http://127.0.0.1:3202';
const driverUrl = 'http://127.0.0.1:4444';
const result = { browser: 'Safari', checks: [], passed: false };
let sessionId;
const children = [];

function start(command, args, name, env = {}) {
    const log = fs.openSync(path.join(artifacts, `${name}.log`), 'w');
    const child = spawn(command, args, {
        cwd: root, env: { ...process.env, ...env }, stdio: ['ignore', log, log],
    });
    fs.closeSync(log);
    child.on('error', error => { child.startError = error; });
    children.push(child);
    return child;
}

async function waitFor(description, predicate, timeout = 20000) {
    const deadline = Date.now() + timeout;
    let lastError;
    while (Date.now() < deadline) {
        const failed = children.find(child => child.startError || child.exitCode !== null);
        if (failed) throw failed.startError || new Error(`A test service exited (${failed.exitCode})`);
        try { if (await predicate()) return; } catch (error) { lastError = error; }
        await delay(200);
    }
    throw new Error(`Timed out: ${description}${lastError ? ` (${lastError.message})` : ''}`);
}

async function webdriver(method, endpoint, body) {
    const response = await fetch(`${driverUrl}${endpoint}`, {
        method, headers: { 'Content-Type': 'application/json' },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: AbortSignal.timeout(30000),
    });
    const data = await response.json();
    if (!response.ok || data.value?.error) {
        throw new Error(`SafariDriver ${method} ${endpoint}: ${data.value?.message || response.status}`);
    }
    return data.value;
}

const session = (method, endpoint, body) => webdriver(method, `/session/${sessionId}${endpoint}`, body);
const execute = (fn, ...args) => session('POST', '/execute/sync', {
    script: `return (${fn.toString()})(...arguments);`, args,
});

async function geometry() {
    return execute(() => {
        const title = document.querySelector('#hero-name h1').getBoundingClientRect();
        const nav = document.querySelector('header nav').getBoundingClientRect();
        return { width: innerWidth, height: innerHeight, gap: title.top - nav.bottom,
            navHeight: nav.height, overflow: document.documentElement.scrollWidth > innerWidth };
    });
}

async function checkLayout(label) {
    await waitFor(`${label}: title clears navbar`, async () => (await geometry()).gap >= 16);
    const measured = await geometry();
    assert.equal(measured.overflow, false, `${label}: horizontal overflow`);
    result.checks.push({ label, ...measured });
    const png = await session('GET', '/screenshot');
    fs.writeFileSync(path.join(artifacts, `${label}.png`), Buffer.from(png, 'base64'));
    return measured;
}

async function click(selector) {
    const element = await session('POST', '/element', { using: 'css selector', value: selector });
    await session('POST', `/element/${element['element-6066-11e4-a52e-4f735466cecf']}/click`, {});
}

async function run() {
    assert.equal(process.platform, 'darwin', 'This check requires macOS with SafariDriver enabled.');
    fs.mkdirSync(artifacts, { recursive: true });
    start(process.execPath, ['server.js'], 'server', {
        PORT: '3202', APP_VERSION: 'safari-smoke', NODE_ENV: 'development',
        OPENAI_API_KEY: '', MONGODB_URI: '',
    });
    start('/usr/bin/safaridriver', ['--port', '4444'], 'safaridriver');
    await waitFor('isolated server', async () => (await fetch(`${appUrl}/api/health`, { signal: AbortSignal.timeout(2000) })).ok);
    await waitFor('SafariDriver', async () => (await fetch(`${driverUrl}/status`, { signal: AbortSignal.timeout(2000) })).ok);
    const created = await webdriver('POST', '/session', {
        capabilities: { alwaysMatch: { browserName: 'safari' } },
    });
    sessionId = created.sessionId;
    result.capabilities = created.capabilities;
    await session('POST', '/timeouts', { implicit: 0, pageLoad: 30000, script: 10000 });
    await session('POST', '/window/rect', { width: 1280, height: 900 });
    await session('POST', '/url', { url: `${appUrl}/` });
    await waitFor('page reveal and project links', () => execute(count =>
        document.querySelector('#hero-cta')?.classList.contains('pe-focused') &&
        document.querySelectorAll('#projects article').length === count, projects.length));
    await checkLayout('desktop');

    const expected = projects.flatMap(project => [project.liveUrl,
        ...(project.downloads || []).map(file => file.url)]).filter(Boolean);
    const hrefs = await execute(() => Array.from(document.querySelectorAll('a[href]'), a => a.getAttribute('href')));
    for (const url of [...expected, 'https://blog.drewclark.io']) assert.ok(hrefs.includes(url), `Missing link: ${url}`);
    result.checks.push({ label: 'portfolio and Blog links', urls: expected });

    // Desktop Safari enforces a minimum window width; record the measured
    // viewport rather than calling a requested window size an iPhone test.
    await session('POST', '/window/rect', { width: 600, height: 800 });
    const resting = await checkLayout('narrow-window');
    assert.ok(resting.width < 768, `Safari's viewport (${resting.width}) must reach the mobile menu breakpoint`);
    await execute(() => window.scrollTo({ top: 180, behavior: 'instant' }));
    await waitFor('compact header', async () => (await geometry()).navHeight < resting.navHeight);
    await execute(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await waitFor('restored header', async () => (await geometry()).navHeight >= resting.navHeight - 1);
    await checkLayout('return-to-top');
    await session('POST', '/window/rect', { width: 600, height: 500 });
    await checkLayout('short-window');
    await session('POST', '/window/rect', { width: 600, height: 800 });

    await click('button[aria-label="Open Menu"]');
    await waitFor('visible drawer Blog link', () => execute(() => {
        const link = document.querySelector('[aria-labelledby="drawer-title"] a[href="https://blog.drewclark.io"]');
        const rect = link?.getBoundingClientRect();
        return rect && rect.width > 0 && rect.x >= 0 && rect.right <= innerWidth;
    }));
    await click('button[aria-label="Close Menu"]');
    await waitFor('closed drawer', () => execute(() => !document.querySelector('[aria-labelledby="drawer-title"]')));
    result.checks.push({ label: 'mobile menu opens, shows Blog and closes' });

    await execute(() => { document.documentElement.style.fontSize = '200%'; });
    await waitFor('enlarged header', async () => (await geometry()).navHeight > resting.navHeight);
    await checkLayout('text-enlarged');
    result.passed = true;
}

run().catch(async error => {
    result.error = error.stack;
    process.exitCode = 1;
    if (sessionId) {
        try {
            const png = await session('GET', '/screenshot');
            fs.writeFileSync(path.join(artifacts, 'failure.png'), Buffer.from(png, 'base64'));
        } catch { /* Keep the original failure if Safari has already exited. */ }
    }
}).finally(async () => {
    if (sessionId) await session('DELETE', '').catch(() => {});
    for (const child of children) child.kill('SIGTERM');
    if (fs.existsSync(artifacts)) fs.writeFileSync(path.join(artifacts, 'results.json'), JSON.stringify(result, null, 2));
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
});
