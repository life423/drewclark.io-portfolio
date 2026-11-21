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

for (const [width, height] of [[1280, 800], [1810, 1031], [390, 844]]) {
    test('hero keeps the work heading near the first fold at ' + width + 'x' + height, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('/');
        await expect(page.getByRole('heading', { name: 'My Portfolio Projects', exact: true })).toBeInViewport();
        const geometry = await page.evaluate(() => {
            const r = select => document.querySelector(select).getBoundingClientRect().toJSON();
            const hero = r('.portfolio-hero'), heroContent = r('.portfolio-hero__content');
            const work = r('.work-studio-shell'), box = r('.portfolio-hero__tagline');
            return {
                edgeDifference: Math.abs(work.left - heroContent.left), taglineWidth: box.width, taglineHeight: box.height,
                controlsEnd: r('#hero-cta').bottom, heroEnd: hero.bottom, overflows: document.documentElement.scrollWidth > innerWidth,
            };
        });
        expect(geometry.edgeDifference).toBeLessThan(1);
        expect(geometry.taglineWidth).toBeLessThanOrEqual(width < 640 ? width - 25 : 570);
        expect(geometry.taglineHeight).toBeLessThanOrEqual(75);
        expect(geometry.controlsEnd).toBeLessThan(geometry.heroEnd);
        expect(geometry.overflows).toBe(false);
    });
}

test('desktop hero leaves the top sprout leaf beneath the fixed navigation', async ({ page }) => {
    await page.goto('/');
    const art = page.locator('.portfolio-hero__image');
    for (const [width, height] of [[1280, 800], [2048, 675], [2540, 844]]) {
        await page.setViewportSize({ width, height });
        await art.evaluate(img => img.decode());
        const clearance = await art.evaluate(img => {
            const box = img.getBoundingClientRect();
            const scale = Math.max(box.width / img.naturalWidth, box.height / img.naturalHeight);
            const y = Number.parseFloat(window.getComputedStyle(img).objectPosition.split(' ')[1]) / 100;
            // The earliest visible pixel of the top leaf is at ~23% asset height.
            const leafTop = box.top + (box.height - img.naturalHeight * scale) * y + 0.23 * img.naturalHeight * scale;
            return leafTop - document.querySelector('header nav').getBoundingClientRect().bottom;
        });
        expect(clearance).toBeGreaterThan(3);
    }
});

test('section slope is decorative and the aligned footer keeps its working controls', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const entry = page.locator('.portfolio-work-entry');
    const seam = await entry.evaluate(element => {
        const edge = window.getComputedStyle(element, '::before');
        return { pointers: edge.pointerEvents, clip: edge.clipPath, height: parseFloat(edge.height) };
    });
    expect(seam.pointers).toBe('none');
    expect(seam.clip).toContain('polygon(');
    expect(seam.height).toBeGreaterThanOrEqual(60);
    expect(seam.height).toBeLessThanOrEqual(92);
    await page.getByRole('link', { name: 'Featured Projects' }).click();
    await expect(page.getByRole('heading', { name: 'My Portfolio Projects' })).toBeInViewport();

    const footer = page.getByRole('contentinfo');
    await expect(footer.getByRole('link', { name: 'Drew Clark on GitHub' })).toHaveAttribute('href', 'https://github.com/life423');
    await expect(footer.getByRole('link', { name: 'Drew Clark on Twitter' })).toHaveAttribute('href', 'https://twitter.com/andrewgenai');
    await expect(footer.getByRole('button', { name: /drew@/ })).toBeEnabled();
    const leftGap = await page.evaluate(() => Math.abs(
        document.querySelector('.portfolio-footer__inner').getBoundingClientRect().left -
        document.querySelector('.work-studio-shell').getBoundingClientRect().left
    ));
    expect(leftGap).toBeLessThan(1);
});

test('wide art is paired with the active preload; tablets and social previews stay original', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const art = page.locator('.portfolio-hero__image');
    await expect.poll(() => art.evaluate(img => new window.URL(img.currentSrc).pathname)).toBe('/assets/portfolio-sprout-wide.webp');
    await expect(page.locator('link[rel=preload][href="/assets/portfolio-sprout-wide.webp"]')).toHaveAttribute('media', '(min-width: 1024px)');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://drewclark.io/og-image.jpg');
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', 'https://drewclark.io/og-image.jpg');
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect.poll(() => art.evaluate(img => new window.URL(img.currentSrc).pathname)).toBe('/assets/sprout-mobile.webp');
});

test('narrow desktop framing leaves room to the right of the sprout leaf', async ({ page }) => {
    await page.goto('/');
    const art = page.locator('.portfolio-hero__image');
    for (const [width, height] of [[1024, 675], [1105, 679], [1105, 1010]]) {
        await page.setViewportSize({ width, height });
        await art.evaluate(img => img.decode());
        const clearance = await art.evaluate(img => {
            const box = img.getBoundingClientRect();
            const scale = Math.max(box.width / img.naturalWidth, box.height / img.naturalHeight);
            const x = parseFloat(window.getComputedStyle(img).objectPosition) / 100;
            // The rightmost tip is at ~85.6% of the desktop artwork's intrinsic width.
            return box.width - ((box.width - img.naturalWidth * scale) * x + .856 * img.naturalWidth * scale);
        });
        expect(clearance).toBeGreaterThanOrEqual(20);
    }
});

test('footer links and copy-email action have visible keyboard focus and keep copy feedback', async ({ page }) => {
    await page.addInitScript(() => {
        Object.defineProperty(window.navigator, 'clipboard', {
            configurable: true,
            value: { writeText: async text => { window.__copiedFooterEmail = text; } },
        });
    });
    await page.goto('/');
    const footer = page.getByRole('contentinfo');
    const twitter = footer.getByRole('link', { name: 'Drew Clark on Twitter' });
    const github = footer.getByRole('link', { name: 'Drew Clark on GitHub' });
    const email = footer.getByRole('button', { name: 'drew@drewclark.io' });
    await twitter.focus();
    for (const control of [twitter, github, email]) {
        await expect(control).toBeFocused();
        await expect(control).toHaveCSS('outline-color', 'rgb(250, 250, 250)');
        await expect(control).toHaveCSS('outline-width', '2px');
        if (control !== email) await page.keyboard.press('Tab');
    }
    await page.keyboard.press('Enter');
    await expect(footer.getByText('Copied', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => window.__copiedFooterEmail)).toBe('drew@drewclark.io');
});
