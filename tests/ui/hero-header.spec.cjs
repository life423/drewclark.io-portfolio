/* global document, window, innerWidth */
const { test, expect } = require('@playwright/test');

const viewports = [
    [320, 480], [375, 600], [390, 550], [390, 664], [390, 844],
    [667, 375], [767, 800], [768, 600], [1280, 480], [1280, 800],
];

async function titleClearance(page) {
    return page.evaluate(() => {
        const title = document.querySelector('#hero-name h1').getBoundingClientRect();
        const nav = document.querySelector('header nav').getBoundingClientRect();
        return { gap: title.top - nav.bottom, titleTop: title.top, navBottom: nav.bottom, navHeight: nav.height,
            overflow: document.documentElement.scrollWidth > innerWidth };
    });
}

for (const [width, height] of viewports) {
    test(`hero title clears the fixed navbar ${width}x${height}`, async ({ page }, info) => {
        await page.setViewportSize({ width, height });
        await page.goto('/');
        const name = page.getByRole('heading', { name: 'Drew Clark', level: 1 });
        await expect(name).toBeVisible();
        await expect(page.locator('#hero-cta')).toHaveClass(/pe-visible/);
        await expect.poll(async () => (await titleClearance(page)).gap).toBeGreaterThanOrEqual(16);
        await expect(page.locator('#hero-cta')).toHaveClass(/pe-focused/);
        const resting = await titleClearance(page);
        expect(resting.overflow).toBe(false);
        expect(resting.gap).toBeGreaterThanOrEqual(16);

        // Returning from lower content and resizing Safari's browser viewport
        // must not leave the heading underneath the restored tall header.
        await page.evaluate(() => window.scrollTo({ top: 180, behavior: 'instant' }));
        await expect.poll(async () => (await titleClearance(page)).navHeight).toBeLessThan(resting.navHeight);
        if (width < 768) {
            const menu = await page.getByRole('button', { name: 'Open Menu', exact: true }).boundingBox();
            expect(menu.height).toBeGreaterThanOrEqual(44);
            expect(menu.width).toBeGreaterThanOrEqual(44);
        }
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        await expect.poll(async () => (await titleClearance(page)).navHeight).toBeGreaterThanOrEqual(resting.navHeight - 1);
        await expect.poll(async () => (await titleClearance(page)).gap).toBeGreaterThanOrEqual(16);
        if (width === 390) {
            await page.setViewportSize({ width, height: height - 100 });
            await expect.poll(async () => (await titleClearance(page)).gap).toBeGreaterThanOrEqual(16);
            await page.setViewportSize({ width, height });
        }
        if ((width === 390 && height === 664) || (width === 1280 && height === 800)) {
            await page.screenshot({ path: info.outputPath('hero.png') });
        }
    });
}

test('enlarged phone text stays below the navbar', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 664 });
    await page.goto('/');
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    await expect(page.locator('#hero-cta')).toHaveClass(/pe-focused/);
    await expect.poll(async () => (await titleClearance(page)).gap).toBeGreaterThanOrEqual(16);
    await expect(page.getByRole('heading', { name: 'Drew Clark', level: 1 })).toBeVisible();
});

test('header clearance adapts through portrait and landscape resizing', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 664 });
    await page.goto('/');
    await expect(page.locator('#hero-cta')).toHaveClass(/pe-focused/);
    for (const [width, height] of [[844, 390], [768, 600], [767, 600], [390, 550]]) {
        await page.setViewportSize({ width, height });
        await expect.poll(async () => (await titleClearance(page)).gap).toBeGreaterThanOrEqual(16);
        expect((await titleClearance(page)).overflow).toBe(false);
    }
});

test('hero follows natural header growth without a viewport change', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 664 });
    await page.goto('/');
    await expect(page.locator('#hero-cta')).toHaveClass(/pe-focused/);
    const original = await titleClearance(page);
    // Simulate extra header space, such as a changed inset or accessibility
    // styling. Clearance must follow the resulting layout, without guessed sizes.
    await page.addStyleTag({ content: 'header nav > div:first-child { padding-block: 3rem !important; }' });
    await expect.poll(async () => (await titleClearance(page)).navHeight).toBeGreaterThan(original.navHeight);
    await expect.poll(async () => (await titleClearance(page)).gap).toBeGreaterThanOrEqual(16);
});
