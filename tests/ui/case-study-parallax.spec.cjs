/* global document, window, innerWidth, getComputedStyle */
const { test, expect } = require('@playwright/test');
const { decodePng, greenTintStats } = require('./png-pixels.cjs');
const { mkdir, writeFile } = require('node:fs/promises');
const projects = require('../../app/src/data/projects.json');

async function ready(page, index = 0) {
    await page.goto('/');
    const open = page.getByRole('button', { name: 'Read case study: ' + projects[index].title, exact: true });
    await expect(open).toBeVisible();
    await expect(page.locator('#hero-cta')).toHaveClass(/pe-visible/);
    await open.click();
    await expect(page.getByRole('heading', { name: projects[index].title, level: 2, exact: true })).toBeVisible();
}

async function depthOffset(page) {
    return page.locator('.case-chat-depth-wash').evaluate(node => {
        const transform = getComputedStyle(node).transform;
        return transform === 'none' ? 0 : new window.DOMMatrix(transform).m42;
    });
}

async function boundedDepth(page) {
    const offset = await depthOffset(page);
    expect(offset).toBeGreaterThanOrEqual(0);
    expect(offset).toBeLessThanOrEqual(48.01);
}

async function panelFits(page, vertical = true) {
    const dialog = page.locator('.case-chat-dialog');
    expect(await dialog.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
    expect(await page.locator('.case-build-explorer').evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
    if (vertical) expect(await dialog.evaluate(node => node.scrollHeight <= node.clientHeight)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('.case-build-explorer')).toHaveCSS('transform', 'none');
}

async function pinAtReadingInset(page) {
    await expect(page.locator('html')).not.toHaveClass(/project-view-transition/);
    await expect.poll(() => page.evaluate(() => document.querySelector('header nav').getAnimations({ subtree: true })
        .some(animation => animation.playState === 'running'))).toBe(false);
    await expect.poll(() => page.locator('.case-chat-dialog').evaluate(node => Math.abs(parseFloat(getComputedStyle(node).top)
        - document.querySelector('header nav').getBoundingClientRect().height - 24))).toBeLessThan(1);
    await page.evaluate(() => {
        const dialog = document.querySelector('.case-chat-dialog');
        const anchor = document.querySelector('.case-chat-anchor');
        const inset = parseFloat(getComputedStyle(dialog).top);
        window.scrollTo({ top: window.scrollY + anchor.getBoundingClientRect().top - inset + 32, behavior: 'instant' });
    });
    await expect(page.locator('.case-chat-dialog')).toHaveAttribute('data-docked', 'true');
    await expect.poll(() => page.locator('.case-chat-dialog').evaluate(node => Math.abs(node.getBoundingClientRect().top
        - document.querySelector('nav').getBoundingClientRect().bottom - 24))).toBeLessThan(2);
}

async function rightDrawerFits(page) {
    const bounds = await page.locator('.case-chat-dialog').evaluate(node => {
        const rect = node.getBoundingClientRect();
        return { left: rect.left, top: rect.top, rightGap: window.innerWidth - rect.right, bottomGap: window.innerHeight - rect.bottom };
    });
    expect(bounds.left).toBeGreaterThanOrEqual(15);
    expect(Math.abs(bounds.top)).toBeLessThan(2);
    expect(Math.abs(bounds.rightGap)).toBeLessThan(2);
    expect(Math.abs(bounds.bottomGap)).toBeLessThan(2);
    await panelFits(page, false);
}

test('all project controls stay fixed while only the clipped background moves with reading progress', async ({ page }, info) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await ready(page);
    const depth = page.locator('.case-chat-depth');
    const controls = page.locator('.case-build-explorer').locator('.case-build-collapse, .case-build-prompts button, textarea, .case-build-send');
    const geometry = () => controls.evaluateAll(nodes => nodes.map(node => {
        const rect = node.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    }));

    for (let index = 0; index < projects.length; index++) {
        await expect(page.getByRole('heading', { name: projects[index].title, level: 2, exact: true })).toBeVisible();
        await expect(depth).toHaveAttribute('aria-hidden', 'true');
        await expect(depth).toHaveCSS('pointer-events', 'none');
        await expect(depth).toBeVisible();
        await pinAtReadingInset(page);
        const before = await geometry();
        const initialOffset = await depthOffset(page);
        const initialScroll = await page.evaluate(() => window.scrollY);
        const advance = await page.evaluate(() => {
            const article = document.querySelector('.work-studio-case').getBoundingClientRect();
            const dialog = document.querySelector('.case-chat-dialog').getBoundingClientRect();
            return Math.min(120, article.bottom - dialog.bottom - 32);
        });
        expect(advance).toBeGreaterThan(30);
        // Scroll the reading column, keeping the pointer away from both the
        // Explorer's outer scrolling area and its textarea.
        const reading = await page.locator('.work-studio-depth').boundingBox();
        await page.mouse.move(reading.x + 30, 500);
        await page.mouse.wheel(0, advance);
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(initialScroll + 24);
        await expect.poll(() => depthOffset(page)).toBeGreaterThan(initialOffset + 1);
        await expect.poll(() => page.evaluate(expected => Math.abs(window.scrollY - expected), initialScroll + advance)).toBeLessThan(2);
        const twoFrames = () => page.evaluate(() => new Promise(resolve => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve))));
        await twoFrames();
        const stoppedOffset = await depthOffset(page);
        await twoFrames();
        expect(Math.abs(await depthOffset(page) - stoppedOffset)).toBeLessThan(0.001);
        await boundedDepth(page);
        const after = await geometry();
        expect(after).toHaveLength(before.length);
        for (let control = 0; control < before.length; control++) {
            for (const dimension of ['x', 'y', 'width', 'height']) {
                expect(Math.abs(after[control][dimension] - before[control][dimension])).toBeLessThan(1);
            }
        }
        await panelFits(page);
        if (index === 0) {
            await page.screenshot({ path: info.outputPath('case-depth-desktop.png') });
            await page.getByRole('button', { name: 'Collapse explorer', exact: true }).click();
            await expect(page.getByRole('button', { name: 'Expand explorer', exact: true })).toBeVisible();
            expect(await page.locator('.case-chat-dialog').evaluate(node => node.clientHeight)).toBeLessThan(120);
            await panelFits(page);
            await page.getByRole('button', { name: 'Expand explorer', exact: true }).click();
        }
        if (index < projects.length - 1) await page.getByRole('button', { name: /^Next project:/ }).click();
    }
    expect(errors).toEqual([]);
});

test('pending and long source-backed answers preserve scrolling and reduced motion preserves the draft', async ({ page }, info) => {
    let releaseAnswer;
    const answerGate = new Promise(resolve => { releaseAnswer = resolve; });
    const sourceFile = 'src/' + 'descriptive_source_file_name_'.repeat(5) + '.cpp';
    const answer = Array.from({ length: 28 }, (_, index) => `Build detail ${index + 1}: This is a longer explanation of the project structure and its update checks.`).join('\n\n');
    await page.route('**/api/askGPT', async route => {
        await answerGate;
        return route.fulfill({ json: { answer, sources: [
            { project: projects[0].title, file: sourceFile, lines: '1-20', url: 'https://github.com/life423/CudaRL-Arena/blob/main/' + sourceFile + '#L1-L20' },
        ] } });
    });
    try {
        await page.setViewportSize({ width: 1070, height: 900 });
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await ready(page);
        await pinAtReadingInset(page);
        const dialog = page.locator('.case-chat-dialog');
        const chat = page.locator('.case-build-explorer');
        const input = chat.getByRole('textbox', { name: 'Question for Project Chat' });
        // Verify outer scrolling while the three prompt rows genuinely exceed
        // a short laptop's available height. A compact answered state can fit.
        await page.setViewportSize({ width: 1070, height: 700 });
        await expect(dialog).toHaveCSS('position', 'sticky');
        expect(await dialog.evaluate(node => node.scrollHeight > node.clientHeight)).toBe(true);
        await panelFits(page, false);
        await dialog.evaluate(node => { node.scrollTop = 0; });
        await chat.locator('.case-build-header').hover();
        await page.mouse.wheel(0, 350);
        await expect.poll(() => dialog.evaluate(node => node.scrollTop)).toBeGreaterThan(0);
        await input.focus();
        await input.press('Tab');
        await page.keyboard.press('Tab');
        const scopeControl = chat.getByRole('button', { name: 'Ask across projects', exact: true });
        await expect(scopeControl).toBeFocused();
        await expect(scopeControl).toBeInViewport();
        await page.setViewportSize({ width: 1070, height: 900 });
        await pinAtReadingInset(page);
        await input.fill('Explain the build with sources');
        await chat.getByRole('button', { name: 'Ask', exact: true }).click();
        await expect(chat.locator('.case-build-send')).toBeDisabled();
        await expect(chat.getByRole('log')).toHaveAttribute('aria-busy', 'true');
        await panelFits(page);
        await boundedDepth(page);
        releaseAnswer();
        await expect(chat.locator('.case-build-message--assistant')).toHaveCount(1);
        const source = chat.getByRole('link', { name: sourceFile.split('/').pop(), exact: true });
        await expect(source).toHaveAttribute('href', 'https://github.com/life423/CudaRL-Arena/blob/main/' + sourceFile + '#L1-L20');
        await panelFits(page);
        await boundedDepth(page);
        const transcript = chat.getByRole('log');
        expect(await transcript.evaluate(node => node.scrollHeight > node.clientHeight)).toBe(true);
        expect(await transcript.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
        await transcript.evaluate(node => { node.scrollTop = 0; });
        await transcript.hover();
        await page.mouse.wheel(0, 250);
        await expect.poll(() => transcript.evaluate(node => node.scrollTop)).toBeGreaterThan(0);
        await source.scrollIntoViewIfNeeded();
        await expect(source).toBeInViewport();
        expect(await transcript.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
        await page.screenshot({ path: info.outputPath('case-depth-long-answer-desktop.png') });

        await input.fill('Keep this follow-up draft');
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await expect.poll(() => depthOffset(page)).toBe(0);
        await expect(input).toHaveValue('Keep this follow-up draft');
        await panelFits(page, false);
    } finally {
        releaseAnswer();
    }
});

test('phone and tablet drawers keep the decorative layer off through rotation and desktop return', async ({ browser }, info) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: 'no-preference' });
    try {
        const page = await context.newPage();
        await ready(page, 1);
        const dialog = page.locator('.case-chat-dialog');
        const depth = page.locator('.case-chat-depth');
        const input = page.getByRole('textbox', { name: 'Question for Project Chat' });
        await page.getByRole('button', { name: 'Open project chat', exact: true }).tap();
        await expect(dialog).toBeVisible();
        await expect.poll(() => dialog.evaluate(node => node.getAnimations().some(animation => animation.playState === 'running'))).toBe(false);
        await expect(depth).toBeHidden();
        await input.fill('A draft that survives layout changes');
        await rightDrawerFits(page);
        await page.screenshot({ path: info.outputPath('case-depth-phone-drawer.png') });

        await page.setViewportSize({ width: 768, height: 1024 });
        await expect(depth).toBeHidden();
        await expect(input).toHaveValue('A draft that survives layout changes');
        await rightDrawerFits(page);
        await page.screenshot({ path: info.outputPath('case-depth-tablet-drawer.png') });
        await page.setViewportSize({ width: 844, height: 390 });
        await expect(depth).toBeHidden();
        await rightDrawerFits(page);
        await dialog.evaluate(node => { node.scrollTop = 0; });
        await dialog.getByRole('button', { name: 'Close build explorer', exact: true }).hover();
        await page.mouse.wheel(0, 250);
        await expect.poll(() => dialog.evaluate(node => node.scrollTop)).toBeGreaterThan(0);

        await page.setViewportSize({ width: 1070, height: 650 });
        await expect(depth).toBeHidden();
        await expect(input).toHaveValue('A draft that survives layout changes');
        await panelFits(page, false);
        await input.focus();
        await page.setViewportSize({ width: 1440, height: 900 });
        await expect(dialog).toHaveCSS('position', 'sticky');
        await expect(depth).toBeVisible();
        await expect(depth).toHaveAttribute('aria-hidden', 'true');
        await expect(input).toBeFocused();
        await expect(input).toHaveValue('A draft that survives layout changes');
        await boundedDepth(page);
        await panelFits(page);
        expect(await dialog.evaluate(node => node.matches(':modal'))).toBe(false);
    } finally {
        await context.close();
    }
});

test('the parallax wash paints visible green pixels behind the unchanged desktop controls', async ({ page }, info) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await ready(page);
    await pinAtReadingInset(page);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => new Promise(resolve => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve))));
    const dialog = page.locator('.case-chat-dialog');
    const wash = page.locator('.case-chat-depth-wash');
    const before = await dialog.boundingBox();
    const original = await wash.evaluate(node => ({ value: node.style.getPropertyValue('visibility'), priority: node.style.getPropertyPriority('visibility') }));
    const on = await dialog.screenshot({ animations: 'disabled', caret: 'hide' });
    let off;
    try {
        await wash.evaluate(node => node.style.setProperty('visibility', 'hidden', 'important'));
        off = await dialog.screenshot({ animations: 'disabled', caret: 'hide' });
    } finally {
        await wash.evaluate((node, original) => {
            if (original.value) node.style.setProperty('visibility', original.value, original.priority);
            else node.style.removeProperty('visibility');
        }, original);
    }
    const restored = await dialog.screenshot({ animations: 'disabled', caret: 'hide' });
    const stats = {
        on: greenTintStats(decodePng(on), decodePng(off)),
        restored: greenTintStats(decodePng(restored), decodePng(off)),
    };
    // An opaque foreground is the missed failure mode: the transform still
    // changes, but its pixels cannot reach the screenshot. Prove the same
    // visibility metric rejects that counterfactual without changing layout.
    const chat = page.locator('.case-build-explorer');
    const originalBackground = await chat.evaluate(node => ({ value: node.style.getPropertyValue('background-color'), priority: node.style.getPropertyPriority('background-color') }));
    let coveredOn, coveredOff;
    try {
        await chat.evaluate(node => node.style.setProperty('background-color', '#18181b', 'important'));
        coveredOn = await dialog.screenshot({ animations: 'disabled', caret: 'hide' });
        await wash.evaluate(node => node.style.setProperty('visibility', 'hidden', 'important'));
        coveredOff = await dialog.screenshot({ animations: 'disabled', caret: 'hide' });
        stats.opaqueCover = greenTintStats(decodePng(coveredOn), decodePng(coveredOff));
    } finally {
        await wash.evaluate((node, original) => {
            if (original.value) node.style.setProperty('visibility', original.value, original.priority);
            else node.style.removeProperty('visibility');
        }, original);
        await chat.evaluate((node, original) => {
            if (original.value) node.style.setProperty('background-color', original.value, original.priority);
            else node.style.removeProperty('background-color');
        }, originalBackground);
    }
    await mkdir(info.outputPath(), { recursive: true });
    for (const [name, body, extension, contentType] of [
        ['wash-visible', on, 'png', 'image/png'],
        ['wash-hidden', off, 'png', 'image/png'],
        ['wash-restored', restored, 'png', 'image/png'],
        ['wash-opaque-cover-visible', coveredOn, 'png', 'image/png'],
        ['wash-opaque-cover-hidden', coveredOff, 'png', 'image/png'],
        ['wash-painted-pixels', JSON.stringify(stats, null, 2), 'json', 'application/json'],
    ]) {
        const path = info.outputPath(name + '.' + extension);
        await writeFile(path, body);
        await info.attach(name, { path, contentType });
    }
    for (const comparison of [stats.on, stats.restored]) {
        expect(comparison.greenPixels).toBeGreaterThanOrEqual(1500);
        expect(comparison.maxGreen).toBeGreaterThanOrEqual(12);
    }
    expect(stats.opaqueCover.greenPixels).toBeLessThan(1500);
    expect(await dialog.boundingBox()).toEqual(before);
    await panelFits(page);
});
