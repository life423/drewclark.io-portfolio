const { test, expect } = require('@playwright/test');
const projects = require('../../app/src/data/projects.json');

const sizes = [
    [320, 568], [390, 844], [844, 390], [768, 1024],
    [1023, 768], [1024, 768], [1280, 800], [1440, 900], [1920, 1080],
];

async function ready(page) {
    await page.goto('/');
    await expect(page.getByRole('button', { name: projects[0].title, exact: true })).toBeVisible();
    await expect(page.locator('#hero-cta')).toHaveClass(/pe-visible/);
}

async function noOverflow(page) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

async function imageLoaded(locator) {
    await expect.poll(() => locator.evaluate(i => i.complete && i.naturalWidth > 0)).toBe(true);
}

function errorsOn(page) {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    return errors;
}

for (const [width, height] of sizes) {
    test(`responsive navigation and artwork ${width}x${height}`, async ({ page }, info) => {
        await page.setViewportSize({ width, height });
        const errors = errorsOn(page);
        await ready(page);
        await noOverflow(page);
        const play = page.getByRole('link', { name: 'Play Ascend-Avoid (opens in a new tab)', exact: true });
        await expect(play).toHaveAttribute('href', 'https://ascend.drewclark.io');
        const heroFit = await play.evaluate(a => {
            const r = a.getBoundingClientRect(), s = a.closest('section').getBoundingClientRect();
            return r.height >= 44 && r.top >= s.top && r.bottom <= s.bottom + 1;
        });
        expect(heroFit).toBe(true);
        for (const project of projects) {
            const card = page.getByRole('button', { name: project.title, exact: true }).locator('xpath=ancestor::article');
            const image = card.getByRole('img');
            await image.scrollIntoViewIfNeeded();
            await imageLoaded(image);
            await expect(image).toHaveAttribute('src', project.cardImage?.src || project.image);
        }
        await page.getByRole('button', { name: projects[0].title, exact: true }).click();
        for (let index = 0; index < projects.length; index++) {
            const project = projects[index];
            await expect(page.getByRole('heading', { name: project.title, level: 2, exact: true })).toBeVisible();
            const full = page.getByRole('link', { name: `View the full ${project.title} image (opens in a new tab)`, exact: true });
            await expect(full).toHaveAttribute('href', project.image);
            await imageLoaded(full.locator('img'));
            const sizing = await full.locator('img').evaluate(i => {
                const r = i.getBoundingClientRect(), p = i.parentElement.getBoundingClientRect();
                return Math.abs(r.width - p.width) < 1 && Math.abs(r.width / r.height - i.naturalWidth / i.naturalHeight) < 0.01;
            });
            expect(sizing).toBe(true);
            await noOverflow(page);
            const next = page.getByRole('button', { name: /^Next project:/ });
            await expect(next).toHaveAttribute('aria-label', `Next project: ${projects[(index + 1) % projects.length].title}`);
            await expect.poll(async () => {
                const r = await next.boundingBox();
                return r && r.height >= 44;
            }).toBeTruthy();
            if (width >= 1024) {
                const alternatives = page.getByRole('button', { name: /^View .+ details$/ });
                await expect(alternatives).toHaveCount(projects.length - 1);
                const gaps = await alternatives.first().evaluate(a => {
                    const row = a.parentElement, detail = row.previousElementSibling.firstElementChild;
                    return { after: row.getBoundingClientRect().top - detail.getBoundingClientRect().bottom,
                        chat: document.querySelector('#project-chat').getBoundingClientRect().top - row.parentElement.parentElement.nextElementSibling.getBoundingClientRect().bottom };
                });
                expect(gaps.after).toBeGreaterThanOrEqual(16);
                expect(gaps.after).toBeLessThanOrEqual(32);
                expect(gaps.chat).toBeGreaterThanOrEqual(16);
                expect(gaps.chat).toBeLessThanOrEqual(48);
            }
            await next.click();
        }
        await expect(page.getByRole('heading', { name: projects[0].title, level: 2, exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Next Project', exact: true })).toBeVisible();
        if (width === 390 || width === 768 || width === 1280) {
            await page.getByRole('button', { name: /^Next project:/ }).scrollIntoViewIfNeeded();
            await page.screenshot({ path: info.outputPath('detail.png') });
        }
        expect(errors).toEqual([]);
    });
}

test('keyboard cycling, wrapping, card selection and focus feedback', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await ready(page);
    await page.getByRole('button', { name: projects[0].title, exact: true }).press('Enter');
    const next = page.getByRole('button', { name: /^Next project:/ });
    await next.focus();
    await next.press('Space');
    await expect(page.getByRole('heading', { name: projects[1].title, level: 2, exact: true })).toBeVisible();
    await expect(next).toBeFocused();
    expect(await next.evaluate(a => getComputedStyle(a).outlineStyle)).toBe('solid');
    await page.getByRole('button', { name: `View ${projects[2].title} details`, exact: true }).press('Enter');
    await expect(page.getByRole('heading', { name: projects[2].title, level: 2, exact: true })).toBeVisible();
    await page.getByRole('button', { name: /^Next project:/ }).press('Enter');
    await page.getByRole('button', { name: /^Next project:/ }).press('Enter');
    await expect(page.getByRole('heading', { name: projects[0].title, level: 2, exact: true })).toBeVisible();
});

test('outline action hover, press, keyboard focus and reduced motion', async ({ page }) => {
    await ready(page);
    const play = page.locator('.hero-action--outline');
    await expect(play).toHaveCSS('color', 'rgb(52, 211, 153)');
    await play.hover();
    await expect(play).toHaveCSS('color', 'rgb(24, 24, 27)');
    await expect.poll(() => play.evaluate(a => getComputedStyle(a, '::before').transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
    await page.mouse.down();
    await expect(play).toHaveCSS('background-color', 'rgb(16, 185, 129)');
    await page.mouse.move(0, 0);
    await page.mouse.up();
    await page.keyboard.press('Tab');
    await play.focus();
    await expect(play).toBeFocused();
    expect(await play.evaluate(a => getComputedStyle(a).outlineStyle)).toBe('solid');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await play.evaluate(a => getComputedStyle(a, '::before').transitionDuration)).toBe('0s');
});

test('chat success, sources, loading and recoverable failure', async ({ page }) => {
    let failed = false;
    await page.route('**/api/askGPT', async route => {
        if (failed) return route.fulfill({ status: 503, json: { error: 'temporarily unavailable' } });
        await new Promise(resolve => setTimeout(resolve, 500));
        return route.fulfill({ json: { answer: 'PPO trains on the GPU.', sources: [{ project: 'Project 1, CudaRL-Arena', file: 'src/rl/ppo.cpp', lines: '1-10', url: 'https://github.com/life423/CudaRL-Arena/blob/main/src/rl/ppo.cpp#L1-L10' }] } });
    });
    await ready(page);
    const expand = page.getByRole('button', { name: 'Expand chat', exact: true });
    if (await expand.isVisible()) await expand.click();
    await page.getByRole('button', { name: 'How does CudaRL-Arena train agents directly on the GPU?', exact: true }).click();
    await expect(page.locator('#project-chat button[type=submit]')).toBeDisabled();
    await expect(page.getByText('PPO trains on the GPU.', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'ppo.cpp', exact: true })).toBeVisible();
    failed = true;
    await page.locator('#project-chat input').fill('Another question');
    await page.getByRole('button', { name: 'Ask', exact: true }).click();
    await expect(page.getByText('Sorry, something went wrong on my end. Please try again in a moment.', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ask', exact: true })).toBeEnabled();
});

test('mobile menu, contact dialog, escape and focus recovery', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await ready(page);
    await page.getByRole('button', { name: 'Open Menu', exact: true }).click();
    await expect(page.getByRole('button', { name: /Close/ }).first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Open Menu', exact: true })).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.getByRole('button', { name: 'Contact', exact: true }).click();
    const contact = page.getByRole('dialog', { name: 'Get in Touch', exact: true });
    await expect(contact).toBeVisible();
    await expect(contact.getByPlaceholder('Your name')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(contact).toBeHidden();
});

test('touch navigation survives rotation and desktop resizing', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: 'reduce' });
    const page = await context.newPage();
    try {
        await ready(page);
        await page.getByRole('button', { name: projects[0].title, exact: true }).tap();
        const next = page.getByRole('button', { name: /^Next project:/ });
        await next.tap();
        await page.setViewportSize({ width: 844, height: 390 });
        await expect(page.getByRole('heading', { name: projects[1].title, level: 2, exact: true })).toBeVisible();
        await next.tap();
        await noOverflow(page);
        await page.setViewportSize({ width: 1280, height: 800 });
        await expect(page.getByRole('heading', { name: projects[2].title, level: 2, exact: true })).toBeVisible();
        await page.getByRole('button', { name: 'Next Project', exact: true }).tap();
        await expect(page.getByRole('heading', { name: projects[3].title, level: 2, exact: true })).toBeVisible();
        await page.setViewportSize({ width: 390, height: 844 });
        await expect(page.getByRole('heading', { name: projects[3].title, level: 2, exact: true })).toBeVisible();
        await page.getByRole('button', { name: /^Next project:/ }).tap();
        await expect(page.getByRole('heading', { name: projects[0].title, level: 2, exact: true })).toBeVisible();
        await noOverflow(page);
    } finally {
        await context.close();
    }
});
