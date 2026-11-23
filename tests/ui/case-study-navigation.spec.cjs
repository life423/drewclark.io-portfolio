/* global document, window, innerWidth, getComputedStyle */
const { test, expect } = require('@playwright/test');
const projects = require('../../app/src/data/projects.json');

async function ready(page, index = 0) {
    await page.goto('/');
    await expect(page.locator('#hero-cta')).toHaveClass(/pe-visible/);
    await page.getByRole('button', { name: 'Read case study: ' + projects[index].title, exact: true }).click();
    await expect(page.getByRole('heading', { name: projects[index].title, level: 2, exact: true })).toBeVisible();
    await expect(page.locator('html')).not.toHaveClass(/project-view-transition/);
}

const navigation = page => page.getByRole('navigation', { name: 'Case study navigation' });

const documentBounds = button => button.evaluate(node => {
    const rect = node.getBoundingClientRect();
    return { x: rect.x + window.scrollX, y: rect.y + window.scrollY, width: rect.width, height: rect.height };
});

async function noOverflow(page) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test('navigation stays aligned and comfortably sized on phone, tablet and desktop', async ({ page }, info) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await ready(page);
    for (const [width, height] of [[320, 568], [768, 1024], [1440, 900]]) {
        await page.setViewportSize({ width, height });
        await navigation(page).scrollIntoViewIfNeeded();
        const [back, next] = await navigation(page).getByRole('button').evaluateAll(buttons => buttons.map(button => {
            const rect = button.getBoundingClientRect();
            const icon = button.querySelector('svg').getBoundingClientRect();
            return { x: rect.x, right: rect.right, y: rect.y, width: rect.width, height: rect.height, iconCenter: icon.y + icon.height / 2 };
        }));
        expect(back.height).toBeGreaterThanOrEqual(48);
        expect(next.height).toBeGreaterThanOrEqual(48);
        expect(Math.abs(back.height - next.height)).toBeLessThan(1);
        expect(Math.abs(back.y - next.y)).toBeLessThan(1);
        expect(back.right + 8).toBeLessThanOrEqual(next.x);
        for (const target of [back, next]) {
            expect(target.x).toBeGreaterThanOrEqual(0);
            expect(target.right).toBeLessThanOrEqual(width);
            expect(Math.abs(target.iconCenter - target.y - target.height / 2)).toBeLessThan(1);
        }
        await noOverflow(page);
        await page.screenshot({ path: info.outputPath(`navigation-${width}.png`) });
    }
});

test('keyboard Next cycles every case study and All projects returns to the current card', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await ready(page);
    const next = navigation(page).getByRole('button', { name: /^Next project:/ });
    for (let index = 1; index <= projects.length; index++) {
        await next.press(index % 2 ? 'Enter' : 'Space');
        await expect(page.getByRole('heading', { name: projects[index % projects.length].title, level: 2, exact: true })).toBeVisible();
        await expect(next).toBeFocused();
        await expect(next).toHaveAttribute('aria-label', 'Next project: ' + projects[(index + 1) % projects.length].title);
    }
    const back = navigation(page).getByRole('button', { name: 'All projects', exact: true });
    await back.press('Enter');
    await expect(page.getByRole('button', { name: 'Read case study: ' + projects[0].title, exact: true })).toBeFocused();
    await noOverflow(page);
});

test('hover, press and keyboard focus give feedback without moving navigation targets', async ({ page }, info) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await ready(page);
    for (const [position, direction] of [[0, -1], [1, 1]]) {
        const button = navigation(page).getByRole('button').nth(position);
        await page.mouse.move(0, 0);
        const before = await documentBounds(button);
        const normalColor = await button.evaluate(node => getComputedStyle(node).backgroundColor);
        await button.hover();
        await expect.poll(() => button.evaluate(node => getComputedStyle(node).backgroundColor)).not.toBe(normalColor);
        await expect.poll(() => button.locator('svg').evaluate(node => {
            const matrix = getComputedStyle(node).transform;
            return matrix === 'none' ? 0 : new window.DOMMatrix(matrix).m41;
        })).toBe(direction * 1.5);
        expect(await documentBounds(button)).toEqual(before);
        const hoverColor = await button.evaluate(node => getComputedStyle(node).backgroundColor);
        await page.mouse.down();
        await expect.poll(() => button.evaluate(node => getComputedStyle(node).backgroundColor)).not.toBe(hoverColor);
        expect(await documentBounds(button)).toEqual(before);
        if (position === 1) await page.screenshot({ path: info.outputPath('navigation-pressed.png') });
        // Release away from the button to inspect states without navigating.
        await page.mouse.move(0, 0);
        await page.mouse.up();
        await page.keyboard.press('Tab');
        await button.focus();
        await expect(button).toBeFocused();
        await expect.poll(() => button.evaluate(node => getComputedStyle(node).outlineStyle)).toBe('solid');
        expect(await button.evaluate(node => parseFloat(getComputedStyle(node).outlineWidth))).toBeGreaterThanOrEqual(2);
    }
    await page.screenshot({ path: info.outputPath('navigation-focus.png') });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const next = navigation(page).getByRole('button', { name: /^Next project:/ });
    await next.hover();
    await expect(next.locator('svg')).toHaveCSS('transform', 'none');
    await expect(next).toHaveCSS('transition-duration', '0s');
    await noOverflow(page);
});

test('touch navigation works in one tap without hover movement', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: 'no-preference' });
    try {
        const page = await context.newPage();
        await ready(page, 2);
        const next = navigation(page).getByRole('button', { name: /^Next project:/ });
        await next.tap();
        await expect(page.getByRole('heading', { name: projects[3].title, level: 2, exact: true })).toBeVisible();
        await expect(next.locator('svg')).toHaveCSS('transform', 'none');
        await navigation(page).getByRole('button', { name: 'All projects', exact: true }).tap();
        await expect(page.getByRole('button', { name: 'Read case study: ' + projects[3].title, exact: true })).toBeFocused();
        await noOverflow(page);
    } finally {
        await context.close();
    }
});

test('enlarged text keeps both actions readable and reachable on a narrow phone', async ({ page }, info) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await ready(page, 1);
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    const nav = navigation(page);
    await nav.scrollIntoViewIfNeeded();
    for (const button of await nav.getByRole('button').all()) {
        await button.scrollIntoViewIfNeeded();
        const visible = await button.evaluate(node => {
            const rect = node.getBoundingClientRect();
            return { fits: node.scrollWidth <= node.clientWidth, left: rect.left, right: rect.right, height: rect.height };
        });
        expect(visible.fits).toBe(true);
        expect(visible.left).toBeGreaterThanOrEqual(0);
        expect(visible.right).toBeLessThanOrEqual(320);
        expect(visible.height).toBeGreaterThanOrEqual(48);
    }
    await noOverflow(page);
    await page.screenshot({ path: info.outputPath('navigation-320-enlarged.png') });
});
