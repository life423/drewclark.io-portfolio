/* global document, window, innerWidth, getComputedStyle */
const { test, expect } = require('@playwright/test');
const projects = require('../../app/src/data/projects.json');

async function observeTransitions(page) {
    await page.addInitScript(() => {
        window.__projectTransitions = [];
        if (!document.startViewTransition) return;
        const start = document.startViewTransition.bind(document);
        const names = () => Array.from(document.querySelectorAll('[data-project-art], [data-project-title]'))
            .map(node => getComputedStyle(node).viewTransitionName)
            .filter(name => name && name !== 'none');
        document.startViewTransition = (...args) => {
            const record = { before: names(), after: [], ready: false, finished: false, error: null };
            window.__projectTransitions.push(record);
            const transition = start(...args);
            transition.ready.then(() => {
                record.ready = true;
                record.after = names();
                if (window.__pauseProjectTransitions) {
                    const snapshots = document.getAnimations().filter(animation =>
                        animation.effect?.pseudoElement?.includes('view-transition')
                        || animation.animationName?.includes('view-transition'));
                    snapshots.forEach(animation => { animation.pause(); animation.currentTime = 120; });
                    record.pausedAnimations = snapshots.map(animation => ({
                        pseudoElement: animation.effect?.pseudoElement,
                        name: animation.animationName,
                        duration: animation.effect?.getTiming().duration,
                        currentTime: animation.currentTime,
                    }));
                    record.root = {
                        oldDisplay: getComputedStyle(document.documentElement, '::view-transition-old(root)').display,
                        newAnimation: getComputedStyle(document.documentElement, '::view-transition-new(root)').animationName,
                    };
                    window.__resumeProjectTransitions = () => snapshots.forEach(animation => animation.play());
                }
            }, error => { record.error = error.name; });
            transition.finished.then(() => { record.finished = true; }, error => { record.error = error.name; });
            return transition;
        };
    });
}

async function ready(page) {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Read case study: ' + projects[0].title, exact: true })).toBeVisible();
    await expect(page.locator('#hero-cta')).toHaveClass(/pe-visible/);
}

function openButton(page, index) {
    return page.getByRole('button', { name: 'Read case study: ' + projects[index].title, exact: true });
}

async function settled(page) {
    await expect.poll(() => page.evaluate(() => window.__projectTransitions.every(record => record.finished))).toBe(true);
    await expect(page.locator('html')).not.toHaveClass(/project-view-transition/);
    expect(await page.locator('[data-project-art], [data-project-title]').evaluateAll(nodes => nodes.every(node =>
        !node.style.viewTransitionName || node.style.viewTransitionName === 'none'))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

for (const [width, height] of [[390, 844], [768, 1024], [1440, 900]]) {
    test(`selected artwork and title keep continuity and keyboard position at ${width}x${height}`, async ({ page }, info) => {
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.setViewportSize({ width, height });
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await observeTransitions(page);
        await ready(page);
        test.skip(!await page.evaluate(() => typeof document.startViewTransition === 'function'), 'Native view transitions are unavailable in this browser.');

        for (let index = 0; index < projects.length; index++) {
            const open = openButton(page, index);
            await open.focus();
            await open.scrollIntoViewIfNeeded();
            const beforeScroll = await page.evaluate(() => window.scrollY);
            await open.press(index % 2 ? 'Space' : 'Enter');
            const heading = page.getByRole('heading', { name: projects[index].title, level: 2, exact: true });
            await expect(heading).toBeFocused();
            await expect(page.locator('.work-studio-media img')).toHaveAttribute('src', projects[index].image);
            await settled(page);
            if (index === 0) await page.screenshot({ path: info.outputPath(`case-${width}.png`) });

            const record = await page.evaluate(() => window.__projectTransitions.at(-1));
            expect(record.ready).toBe(true);
            expect(record.error).toBeNull();
            expect(record.before).toContain('project-title');
            expect(record.after).toContain('project-title');
            for (const names of [record.before, record.after]) {
                expect(new Set(names).size).toBe(names.length);
                expect(names.every(name => ['project-title', 'project-art'].includes(name))).toBe(true);
            }

            await page.getByRole('button', { name: 'All projects', exact: true }).press('Enter');
            await expect(open).toBeFocused();
            await settled(page);
            expect(Math.abs(await page.evaluate(() => window.scrollY) - beforeScroll)).toBeLessThan(4);
        }
        expect(await page.evaluate(() => window.__projectTransitions.length)).toBe(projects.length * 2);
        expect(errors).toEqual([]);
    });
}

for (const [width, height, index] of [[320, 568, 1], [1440, 900, 0]]) {
    test(`visual review of selective shared motion at ${width}x${height}`, async ({ page }, info) => {
        await page.setViewportSize({ width, height });
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await observeTransitions(page);
        await ready(page);
        test.skip(!await page.evaluate(() => typeof document.startViewTransition === 'function'), 'Native view transitions are unavailable in this browser.');

        // Warm only the selected project's real detail asset. The second open
        // then exercises artwork continuity rather than the cold-image fallback.
        await openButton(page, index).press('Enter');
        await expect.poll(() => page.locator('.work-studio-media img').evaluate(node => node.complete && node.naturalWidth > 0)).toBe(true);
        await settled(page);
        await page.getByRole('button', { name: 'All projects', exact: true }).press('Enter');
        await settled(page);

        const card = page.locator(`.work-gallery-card[data-project-id="${projects[index].id}"]`);
        await card.evaluate(node => window.scrollTo({ top: window.scrollY + node.getBoundingClientRect().top - 96, behavior: 'instant' }));
        await page.evaluate(() => { window.__pauseProjectTransitions = true; });
        // Click the visible artwork so a long card's lower action does not
        // auto-scroll the title/art out of the source snapshot on a short phone.
        await card.click({ position: { x: 30, y: 30 } });
        await expect.poll(() => page.evaluate(() => window.__projectTransitions.at(-1)?.pausedAnimations?.length || 0)).toBeGreaterThan(0);
        const record = await page.evaluate(() => window.__projectTransitions.at(-1));
        expect(record.before).toContain('project-title');
        expect(record.after).toContain('project-title');
        expect(record.before).toContain('project-art');
        const detailArtVisible = await page.locator('.work-studio-case [data-project-art]').evaluate(node => {
            const rect = node.getBoundingClientRect();
            return rect.bottom > 0 && rect.top < window.innerHeight;
        });
        if (detailArtVisible) expect(record.after).toContain('project-art');
        expect(record.root).toEqual({ oldDisplay: 'none', newAnimation: 'none' });
        await page.screenshot({ path: info.outputPath(`shared-motion-${width}-midpoint.png`) });
        await info.attach('native-transition-records', {
            body: JSON.stringify(await page.evaluate(() => window.__projectTransitions), null, 2),
            contentType: 'application/json',
        });
        await page.evaluate(() => {
            window.__pauseProjectTransitions = false;
            window.__resumeProjectTransitions();
        });
        await settled(page);
        await expect(page.locator('#case-study-title')).toBeFocused();
        await page.screenshot({ path: info.outputPath(`shared-motion-${width}-settled.png`) });
    });
}

test('reduced motion and unavailable native API preserve immediate navigation and focus', async ({ browser }) => {
    for (const mode of ['reduced', 'unsupported']) {
        const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference' });
        try {
            const page = await context.newPage();
            await observeTransitions(page);
            if (mode === 'unsupported') await page.addInitScript(() => { document.startViewTransition = undefined; });
            await ready(page);
            await openButton(page, 2).press('Enter');
            await expect(page.locator('#case-study-title')).toBeFocused();
            await page.getByRole('button', { name: 'All projects', exact: true }).press('Space');
            await expect(openButton(page, 2)).toBeFocused();
            await settled(page);
            expect(await page.evaluate(() => window.__projectTransitions)).toEqual([]);
        } finally {
            await context.close();
        }
    }
});

test('a cold detail image does not delay navigation or animate a blank artwork frame', async ({ page }) => {
    let releaseImage;
    const imageGate = new Promise(resolve => { releaseImage = resolve; });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await observeTransitions(page);
    // Ascend-Avoid deliberately has different overview and detail artwork.
    await page.route('**' + projects[2].image, async route => {
        await imageGate;
        await route.continue();
    });
    try {
        await ready(page);
        test.skip(!await page.evaluate(() => typeof document.startViewTransition === 'function'), 'Native view transitions are unavailable in this browser.');
        await page.locator('.work-gallery-card').nth(2).scrollIntoViewIfNeeded();
        await openButton(page, 2).press('Enter');
        await expect(page.locator('#case-study-title')).toBeFocused();
        await settled(page);
        expect(await page.locator('.work-studio-media img').evaluate(node => node.complete && node.naturalWidth > 0)).toBe(false);
        const record = await page.evaluate(() => window.__projectTransitions.at(-1));
        expect(record.ready).toBe(true);
        expect(record.after).not.toContain('project-art');
        releaseImage();
        await expect.poll(() => page.locator('.work-studio-media img').evaluate(node => node.complete && node.naturalWidth > 0)).toBe(true);
    } finally {
        releaseImage();
    }
});

test('returning during an active native animation preserves the second shared snapshot', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await observeTransitions(page);
    await ready(page);
    test.skip(!await page.evaluate(() => typeof document.startViewTransition === 'function'), 'Native view transitions are unavailable in this browser.');
    const open = openButton(page, 0);
    await open.focus();
    await open.scrollIntoViewIfNeeded();
    await page.evaluate(() => { window.__pauseProjectTransitions = true; });
    await open.press('Enter');
    await expect.poll(() => page.evaluate(() => window.__projectTransitions[0]?.pausedAnimations?.length || 0)).toBeGreaterThan(0);
    expect(await page.evaluate(() => window.__projectTransitions[0].finished)).toBe(false);

    // Real browser input is suppressed during the document animation. Invoke
    // the existing handler directly to force the interruption before finish.
    await page.getByRole('button', { name: 'All projects', exact: true }).evaluate(node => node.click());
    await expect.poll(() => page.evaluate(() => window.__projectTransitions.length)).toBe(2);
    await expect.poll(() => page.evaluate(() => window.__projectTransitions[1].ready)).toBe(true);
    const second = await page.evaluate(() => window.__projectTransitions[1]);
    expect(second.error).toBeNull();
    expect(second.before.filter(name => name === 'project-title')).toHaveLength(1);
    expect(second.after.filter(name => name === 'project-title')).toHaveLength(1);
    await expect(open).toBeFocused();
    await page.evaluate(() => {
        window.__pauseProjectTransitions = false;
        window.__resumeProjectTransitions();
    });
    await settled(page);
    expect(errors).toEqual([]);
});

test('resize and overlapping navigation leave the current project usable without stale snapshots', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await observeTransitions(page);
    await ready(page);
    await openButton(page, 0).press('Enter');
    await expect(page.locator('#case-study-title')).toBeFocused();
    await page.setViewportSize({ width: 390, height: 844 });
    await settled(page);

    const next = page.getByRole('button', { name: /^Next project:/ });
    await next.press('Enter');
    await expect(page.getByRole('heading', { name: projects[1].title, level: 2, exact: true })).toBeVisible();
    await expect(next).toBeFocused();
    // Dispatch during the asynchronous snapshot lifecycle, rather than waiting
    // for browser input suppression to finish, to exercise interrupted work.
    await page.getByRole('button', { name: 'All projects', exact: true }).evaluate(node => node.click());
    await expect(openButton(page, 1)).toBeAttached();
    await openButton(page, 2).evaluate(node => node.click());
    await expect(page.getByRole('heading', { name: projects[2].title, level: 2, exact: true })).toBeFocused();
    await settled(page);
    await page.getByRole('button', { name: 'All projects', exact: true }).press('Enter');
    await expect(openButton(page, 2)).toBeFocused();
    await settled(page);
    expect(errors).toEqual([]);
});
