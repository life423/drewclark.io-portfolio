/* global document, window */
const { test, expect } = require('@playwright/test');

const COMPACT = 'Software that solves real problems.';
const FULL = 'Building elegant solutions to complex problems.';

function copy(page, compact = true) {
    return page.getByTestId('hero-tagline').locator(`[data-typed-copy="${compact ? 'compact' : 'full'}"]`);
}

async function openHero(page, { width = 390, height = 844, reducedMotion = 'no-preference' } = {}) {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion });
    await page.clock.install();
    await page.goto('/');
    await expect(page.getByTestId('hero-tagline')).toBeAttached();
    // Let page loading run naturally, then control time without waiting through
    // long idle periods. Small steps below allow React's timeout effects to render.
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
    await page.clock.runFor(0);
}

async function advance(page, milliseconds) {
    for (let elapsed = 0; elapsed < milliseconds; elapsed += 100) {
        await page.clock.runFor(Math.min(100, milliseconds - elapsed));
        await page.evaluate(() => 0);
    }
}

async function completeTyping(page) {
    for (let step = 0; step < 80; step++) {
        if ((await copy(page, false).textContent()) === FULL) break;
        await advance(page, 100);
    }
    await expect(copy(page)).toHaveText(COMPACT);
    await expect(copy(page, false)).toHaveText(FULL);
    await expect(page.locator('.hero-tagline-cursor')).toHaveCount(0);
}

for (const width of [390, 1280]) {
    test(`completed tagline stays readable after pointer movement and idle at ${width}px`, async ({ page }) => {
        await openHero(page, { width });
        await completeTyping(page);
        const visibleCopy = copy(page, width < 768);
        await expect(visibleCopy).toBeVisible();
        for (const [x, y] of [[20, 120], [width / 2, 120], [width - 20, 120], [20, 450], [width - 20, 450]]) {
            await page.mouse.move(x, y);
            await expect(visibleCopy).toHaveText(width < 768 ? COMPACT : FULL);
        }
        await page.clock.fastForward(60000);
        await expect(visibleCopy).toHaveText(width < 768 ? COMPACT : FULL);
        await expect(page.locator('.hero-tagline-cursor')).toHaveCount(0);
    });
}

for (const width of [320, 1280]) {
    test(`typing reserves its final space and keeps the actions in place at ${width}px`, async ({ page }) => {
        await openHero(page, { width });
        await advance(page, 300);
        const measure = () => page.getByTestId('hero-tagline').evaluate(element => ({
            height: element.offsetHeight,
            actionsTop: document.querySelector('#hero-cta').offsetTop,
        }));
        const before = await measure();
        expect(before.height).toBeGreaterThan(0);
        for (let sample = 0; sample < 6; sample++) {
            await advance(page, 500);
            const current = await measure();
            expect(Math.abs(current.height - before.height)).toBeLessThanOrEqual(1);
            expect(Math.abs(current.actionsTop - before.actionsTop)).toBeLessThanOrEqual(1);
        }
        await completeTyping(page);
        const after = await measure();
        expect(Math.abs(after.actionsTop - before.actionsTop)).toBeLessThanOrEqual(1);
    });
}

test('typing pauses offscreen and resumes the current sentence on return', async ({ page }) => {
    await openHero(page);
    await advance(page, 700);
    const initial = await copy(page).textContent();
    expect(initial.length).toBeGreaterThan(0);
    expect(initial.length).toBeLessThan(COMPACT.length);

    await page.getByRole('button', { name: 'View Projects', exact: true }).scrollIntoViewIfNeeded();
    await expect(page.getByTestId('hero-tagline')).not.toBeInViewport();
    await advance(page, 200);
    const paused = await copy(page).textContent();
    await advance(page, 3000);
    await expect(copy(page)).toHaveText(paused);

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect(page.getByTestId('hero-tagline')).toBeInViewport();
    expect((await copy(page).textContent()).length).toBeGreaterThanOrEqual(paused.length);
    await completeTyping(page);
});

test('partial and complete copy survive height changes, rotation and the tablet breakpoint', async ({ page }) => {
    await openHero(page);
    await advance(page, 700);
    const partial = { compact: await copy(page).textContent(), full: await copy(page, false).textContent() };
    expect(partial.compact.length).toBeGreaterThan(0);
    expect(partial.full.length).toBeLessThan(FULL.length);

    for (const [width, height] of [[390, 550], [844, 390], [767, 600], [768, 600]]) {
        await page.setViewportSize({ width, height });
        await expect(copy(page, width < 768)).toBeVisible();
        await expect(copy(page)).toHaveText(partial.compact);
        await expect(copy(page, false)).toHaveText(partial.full);
    }
    await completeTyping(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(copy(page)).toBeVisible();
    await expect(copy(page)).toHaveText(COMPACT);
    await expect(page.locator('.hero-tagline-cursor')).toHaveCount(0);
});

test('reduced motion shows complete accessible copy immediately and never replays it', async ({ page }) => {
    await openHero(page, { reducedMotion: 'reduce' });
    await expect(copy(page)).toHaveText(COMPACT);
    await expect(copy(page, false)).toHaveText(FULL);
    await expect(page.locator('.hero-tagline-cursor')).toHaveCount(0);
    expect(await copy(page).evaluate(element => element.closest('[aria-hidden]')?.getAttribute('aria-hidden'))).toBe('true');
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(copy(page, false)).toBeVisible();
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await advance(page, 1000);
    await expect(copy(page, false)).toHaveText(FULL);
    await expect(page.locator('.hero-tagline-cursor')).toHaveCount(0);
});

test('typing pauses in a real background tab when the browser exposes tab visibility', async ({ page, context }) => {
    await openHero(page);
    await advance(page, 700);
    const before = await copy(page).textContent();
    expect(before.length).toBeGreaterThan(0);
    expect(before.length).toBeLessThan(COMPACT.length);
    const foreground = await context.newPage();
    await foreground.goto('about:blank');
    await foreground.bringToFront();
    const backgrounded = await page.evaluate(() => document.visibilityState === 'hidden');
    if (!backgrounded) {
        await foreground.close();
        test.skip(true, 'This headless browser keeps background tabs visible; no synthetic visibility event is used.');
    }
    try {
        await advance(page, 200);
        const paused = await copy(page).textContent();
        await advance(page, 3000);
        await expect(copy(page)).toHaveText(paused);
        await page.bringToFront();
        await expect.poll(() => page.evaluate(() => document.visibilityState)).toBe('visible');
        expect((await copy(page).textContent()).length).toBeGreaterThanOrEqual(paused.length);
        await completeTyping(page);
    } finally {
        await foreground.close();
    }
});
