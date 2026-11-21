/* global document, innerWidth, getComputedStyle, localStorage, sessionStorage */
const { test, expect } = require('@playwright/test');
const { setTimeout: delay } = require('node:timers/promises');
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
        await expect(play).toHaveAttribute('href', 'https://ascendavoid.com');
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
                return r?.height || 0;
            }).toBeGreaterThanOrEqual(44);
            const navigation = page.getByRole('navigation', { name: 'Case study navigation' });
            await expect(navigation).toHaveCount(1);
            await expect(next).toHaveCount(1);
            const chat = page.locator('#project-chat');
            await expect(chat).toHaveCount(1);
            await expect(chat.getByRole('textbox', { name: 'Question for Project Chat' })).toBeVisible();
            // A single read avoids mismatched y coordinates while the page scrolls.
            const [summary, panel, media, details, related] = await page.evaluate(() => [
                '[data-testid="case-study-summary"]', '#project-chat', '[aria-labelledby="case-study-title"] figure a',
                '#case-study-details', '#related-projects-title',
            ].map(selector => document.querySelector(selector).getBoundingClientRect().toJSON()));
            if (width >= 1024) {
                expect(panel.x).toBeGreaterThanOrEqual(summary.x + summary.width);
                expect(Math.abs(panel.y - summary.y)).toBeLessThan(2);
                expect(panel.x).toBeGreaterThanOrEqual(media.x + media.width);
            } else {
                expect(panel.y).toBeGreaterThanOrEqual(summary.y + summary.height);
                expect(media.y).toBeGreaterThanOrEqual(panel.y + panel.height);
            }
            expect(details.y).toBeGreaterThanOrEqual(media.y + media.height);
            expect(related.y).toBeGreaterThan(details.y);
            await expect(page.getByRole('button', { name: /^View .+ details$/ })).toHaveCount(projects.length - 1);
            await next.click();
        }
        await expect(page.getByRole('heading', { name: projects[0].title, level: 2, exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Next Project', exact: true })).toHaveCount(0);
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
    await expect.poll(() => play.evaluate(a => getComputedStyle(a, '::before').transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
    const filledLabel = play.locator('.hero-action__filled-label');
    await expect(filledLabel).toHaveCSS('color', 'rgb(24, 24, 27)');
    await expect(filledLabel).toHaveCSS('clip-path', /inset\(0px(?: 0px){0,3}\)/);
    const gradient = await play.evaluate(a => getComputedStyle(a, '::before').backgroundImage);
    expect(gradient).toContain('rgb(52, 211, 153)');
    expect(gradient).toContain('rgb(14, 165, 233)');
    expect(await play.evaluate(a => getComputedStyle(a, '::after').animationName)).toBe('hero-action-shine');
    await page.mouse.down();
    await expect(play).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 1)');
    await page.mouse.move(0, 0);
    await page.mouse.up();
    await page.keyboard.press('Tab');
    await play.focus();
    await expect(play).toBeFocused();
    expect(await play.evaluate(a => getComputedStyle(a).outlineStyle)).toBe('solid');
    await expect.poll(() => play.evaluate(a => getComputedStyle(a, '::before').transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
    await expect(filledLabel).toHaveCSS('clip-path', /inset\(0px(?: 0px){0,3}\)/);
    // Scrolling fades only the decorative background, keeping both labels legible.
    await page.mouse.wheel(0, 300);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollTop)).toBeGreaterThan(100);
    await expect(play.locator('xpath=ancestor::section')).toHaveCSS('opacity', '1');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await play.evaluate(a => getComputedStyle(a, '::before').transitionDuration)).toBe('0s');
    expect(await play.evaluate(a => getComputedStyle(a, '::after').animationName)).toBe('none');
});

test('chat success, sources, loading and recoverable failure', async ({ page }) => {
    let failed = false;
    await page.route('**/api/askGPT', async route => {
        if (failed) return route.fulfill({ status: 503, json: { error: 'temporarily unavailable' } });
        await delay(500);
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
        await next.tap();
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

test('overview chat comes before project browsing; late answers stay scoped', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
        localStorage.setItem('unified_project_chat', JSON.stringify([{ role: 'assistant', content: 'Legacy global history' }]));
    });
    const calls = [];
    let releaseFirst;
    const firstGate = new Promise(resolve => { releaseFirst = resolve; });
    const codeLink = 'https://github.com/life423/CudaRL-Arena/blob/0123456789012345678901234567890123456789/src/rl/ppo.cpp#L1-L10';
    await page.route('**/api/askGPT', async route => {
        const call = route.request().postDataJSON();
        calls.push(call);
        if (call.question === 'Question for A') {
            await firstGate;
            return route.fulfill({ json: { answer: 'Delayed first case-study answer', sources: [
                { project: projects[0].title, file: 'src/rl/ppo.cpp', lines: '1-10', url: codeLink }
            ] } });
        }
        return route.fulfill({ json: { answer: 'Description-based answer', sources: [] } });
    });
    try {
        await ready(page);
        const chat = page.locator('#project-chat');
        await expect(chat.getByRole('textbox', { name: 'Question for Project Chat' })).toBeVisible();
        const introChat = await chat.boundingBox();
        const firstProject = await page.getByRole('button', { name: projects[0].title, exact: true }).boundingBox();
        expect(introChat.y + introChat.height).toBeLessThan(firstProject.y);
        await page.getByRole('button', { name: projects[0].title, exact: true }).click();
        await expect(chat.getByRole('combobox', { name: 'Chat scope' })).toHaveValue('project');
        await expect(chat.getByRole('option', { name: projects[0].title })).toHaveCount(1);
        await chat.getByRole('textbox').fill('Question for A');
        await chat.getByRole('button', { name: 'Ask', exact: true }).click();
        await expect.poll(() => calls.length).toBe(1);
        expect(calls[0]).toEqual({ question: 'Question for A', projectId: projects[0].id });
        await chat.getByRole('textbox').fill('Draft for A');
        await page.getByRole('button', { name: /^Next project:/ }).click();
        await expect(chat.getByRole('option', { name: projects[1].title })).toHaveCount(1);
        await expect(chat.getByText('Question for A', { exact: true })).toHaveCount(0);
        await expect(chat.getByRole('textbox')).toHaveValue('');
        await chat.getByRole('textbox').fill('Question for B');
        await chat.getByRole('button', { name: 'Ask', exact: true }).click();
        await expect(chat.getByText('No matching code excerpts were returned for this answer.')).toBeVisible();
        expect(calls[1]).toEqual({ question: 'Question for B', projectId: projects[1].id });
        releaseFirst();
        await expect.poll(() => page.evaluate(() => localStorage.getItem('unified_project_chat'))).toContain('Delayed first case-study answer');
        await expect(chat.getByText('Delayed first case-study answer')).toHaveCount(0);
        await page.getByRole('button', { name: 'View ' + projects[0].title + ' details', exact: true }).click();
        await expect(chat.getByText('Delayed first case-study answer')).toBeVisible();
        await expect(chat.getByRole('link', { name: 'ppo.cpp' })).toHaveAttribute('href', codeLink);
        await expect(chat.getByRole('textbox')).toHaveValue('Draft for A');
        await chat.getByRole('combobox').selectOption('all');
        await expect(chat.getByText('Legacy global history')).toBeVisible();
        await chat.getByRole('textbox').fill('Across all projects');
        await chat.getByRole('button', { name: 'Ask', exact: true }).click();
        await expect.poll(() => calls.length).toBe(3);
        expect(calls[2]).toEqual({ question: 'Across all projects' });
        await expect(chat.getByRole('button', { name: 'Ask', exact: true })).toBeEnabled();
        await chat.getByRole('combobox').selectOption('project');
        await page.evaluate(() => {
            sessionStorage.setItem('drawer_question', 'Question from global drawer');
            sessionStorage.setItem('drawer_question_timestamp', String(Date.now()));
        });
        await expect.poll(() => calls.length).toBe(4);
        expect(calls[3]).toEqual({ question: 'Question from global drawer' });
        await expect(chat.getByRole('combobox')).toHaveValue('all');
        await page.getByRole('button', { name: 'All projects', exact: false }).click();
        await expect(page.getByRole('heading', { name: 'My Portfolio Projects' })).toBeVisible();
    } finally {
        releaseFirst();
    }
});
