/* global document, window, innerWidth, innerHeight, getComputedStyle */
const { test, expect } = require('@playwright/test');
const projects = require('../../app/src/data/projects.json');

async function ready(page) {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Read case study: ' + projects[0].title, exact: true })).toBeVisible();
    await expect(page.locator('#hero-cta')).toHaveClass(/pe-visible/);
}

async function noOverflow(page) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

function caseStudy(page, index) {
    return page.getByRole('heading', { name: projects[index].title, level: 2, exact: true });
}

test('hover enlarges a card while the gallery stays in place and artwork remains clickable', async ({ page }, info) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await ready(page);
    expect(await page.locator('.work-gallery-card').evaluateAll(cards => cards.every(node =>
        getComputedStyle(node).backgroundImage.includes('linear-gradient(135deg')))).toBe(true);
    for (const width of [1440, 930, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        await page.mouse.move(0, 0);
        const card = page.locator('.work-gallery-card').first();
        await card.scrollIntoViewIfNeeded();
        await expect(card).toHaveCSS('transform', 'none');
        const before = await page.locator('.work-gallery-card').evaluateAll(cards => cards.map(node => ({
            width: node.offsetWidth, height: node.offsetHeight, x: node.offsetLeft, y: node.offsetTop,
        })));
        const base = await card.boundingBox();
        if ([1440, 768].includes(width)) await page.screenshot({ path: info.outputPath(`gallery-${width}-rest.png`) });
        await card.hover();
        await expect.poll(() => card.evaluate(node => node.getBoundingClientRect().width / node.offsetWidth)).toBeGreaterThan(1.02);
        await expect.poll(() => card.evaluate(node => node.getAnimations().some(animation => animation.playState === 'running'))).toBe(false);
        const expanded = await card.boundingBox();
        expect(expanded.width).toBeGreaterThan(base.width);
        expect(expanded.width).toBeLessThan(base.width * 1.08);
        expect(expanded.height).toBeGreaterThan(base.height);
        expect(expanded.x).toBeGreaterThanOrEqual(0);
        expect(expanded.x + expanded.width).toBeLessThanOrEqual(width);
        expect(await page.locator('.work-gallery-card').evaluateAll(cards => cards.map(node => ({
            width: node.offsetWidth, height: node.offsetHeight, x: node.offsetLeft, y: node.offsetTop,
        })))).toEqual(before);
        await noOverflow(page);
        if ([1440, 768].includes(width)) await page.screenshot({ path: info.outputPath(`gallery-${width}-expanded.png`) });
        await page.mouse.move(0, 0);
        await expect(card).toHaveCSS('transform', 'none');
    }

    // This point is over the artwork, covered by the card's native stretched button.
    await page.locator('.work-gallery-card').first().click({ position: { x: 40, y: 40 } });
    await expect(caseStudy(page, 0)).toBeVisible();
    await expect(page.locator('.work-project-surface')).toHaveCount(3);
    expect(await page.locator('.work-project-surface').evaluateAll(cards => cards.every(node =>
        getComputedStyle(node).backgroundImage.includes('linear-gradient(135deg')))).toBe(true);
    await page.getByRole('button', { name: 'All projects', exact: true }).click();
    const second = page.locator('.work-gallery-card').nth(1);
    const artHeight = await second.locator('.work-gallery-art').evaluate(node => node.offsetHeight);
    await second.click({ position: { x: 30, y: artHeight + 60 } });
    await expect(caseStudy(page, 1)).toBeVisible();
});

test('card actions stay independent from case-study activation', async ({ page, context }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await context.route(/^https:\/\/(?:cudarl\.drewclark\.io|github\.com)\//, route => route.fulfill({
        contentType: 'text/html', body: '<!doctype html><title>Project destination fixture</title>',
    }));
    await ready(page);
    const card = page.locator('.work-gallery-card').first();
    for (const name of [/Visit the site: CudaRL-Arena/, /View the CudaRL-Arena source code/]) {
        const link = card.getByRole('link', { name });
        const target = await link.getAttribute('href');
        const popupPromise = page.waitForEvent('popup');
        await link.click();
        const popup = await popupPromise;
        await expect.poll(() => popup.url()).toMatch(new RegExp('^' + target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
        await expect(page.getByRole('heading', { name: 'My Portfolio Projects', exact: true })).toBeVisible();
        await expect(page.locator('.work-studio-case')).toHaveCount(0);
        await popup.close();
    }
});

test('keyboard activation and reduced motion preserve project navigation', async ({ page }) => {
    await page.setViewportSize({ width: 988, height: 1253 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await ready(page);
    for (const [index, key] of [[0, 'Enter'], [2, 'Space']]) {
        const card = page.locator('.work-gallery-card').nth(index);
        await card.hover();
        await expect(card).toHaveCSS('transform', 'none');
        await expect(card).toHaveCSS('transition-duration', '0s');
        const open = card.getByRole('button', { name: 'Read case study: ' + projects[index].title, exact: true });
        await open.press(key);
        await expect(caseStudy(page, index)).toBeVisible();
        await noOverflow(page);
        await page.getByRole('button', { name: 'All projects', exact: true }).press('Enter');
    }
});

test('touch opens the case study in one tap without a hover expansion trap', async ({ browser }, info) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: 'no-preference' });
    try {
        const page = await context.newPage();
        await ready(page);
        const card = page.locator('.work-gallery-card').nth(2);
        await card.scrollIntoViewIfNeeded();
        await expect(card).toHaveCSS('transform', 'none');
        await page.screenshot({ path: info.outputPath('touch-gallery-390.png') });
        await card.tap({ position: { x: 40, y: 40 } });
        await expect(caseStudy(page, 2)).toBeVisible();
        await page.getByRole('button', { name: 'All projects', exact: true }).tap();
        await expect(page.locator('.work-gallery-card').nth(2)).toHaveCSS('transform', 'none');
        await noOverflow(page);
    } finally {
        await context.close();
    }
});

test('a roomy window uses the reading-side Explorer and resizing preserves its draft and focus', async ({ page }, info) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width: 988, height: 1253 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await ready(page);
    await page.getByRole('button', { name: 'Read case study: ' + projects[2].title, exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Build explorer' });
    const input = dialog.getByRole('textbox', { name: 'Question for Project Chat' });
    const launcher = page.getByRole('button', { name: 'Open project chat', exact: true });
    await expect(dialog).toHaveCSS('position', 'sticky');
    await expect(launcher).toBeHidden();
    const [reading, panel] = await page.evaluate(() => ['.work-studio-depth .prose', '.case-chat-dialog']
        .map(selector => document.querySelector(selector).getBoundingClientRect().toJSON()));
    expect(panel.left).toBeGreaterThanOrEqual(reading.right + 15);
    expect(panel.width).toBeGreaterThanOrEqual(256);
    await input.fill('draft survives the layout change');
    await page.screenshot({ path: info.outputPath('reading-side-explorer.png') });

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(launcher).toBeVisible();
    await expect(launcher).toBeFocused();
    await launcher.click();
    await expect(dialog).toBeVisible();
    expect(await dialog.evaluate(node => Math.abs(node.getBoundingClientRect().bottom - innerHeight))).toBeLessThan(2);
    await expect(input).toHaveValue('draft survives the layout change');
    await input.focus();
    await page.setViewportSize({ width: 988, height: 1253 });
    await expect(dialog).toHaveCSS('position', 'sticky');
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('draft survives the layout change');
    expect(await dialog.evaluate(node => node.matches(':modal'))).toBe(false);

    const next = page.getByRole('button', { name: /^Next project:/ });
    await next.focus();
    await page.setViewportSize({ width: 988, height: 650 });
    await expect(launcher).toBeVisible();
    await expect(next).toBeFocused();
    await launcher.click();
    const centered = await dialog.evaluate(node => {
        const rect = node.getBoundingClientRect();
        return { horizontal: Math.abs(rect.left - (innerWidth - rect.right)), vertical: Math.abs(rect.top - (innerHeight - rect.bottom)) };
    });
    expect(centered.horizontal).toBeLessThan(2);
    expect(centered.vertical).toBeLessThan(2);
    await page.keyboard.press('Escape');
    await expect(launcher).toBeFocused();
    await next.focus();
    await page.setViewportSize({ width: 900, height: 700 });
    await expect(dialog).toHaveCSS('position', 'sticky');
    await expect(next).toBeFocused();
    await page.setViewportSize({ width: 899, height: 900 });
    await expect(launcher).toBeVisible();
    await expect(next).toBeFocused();
    await noOverflow(page);
    expect(errors).toEqual([]);
});
