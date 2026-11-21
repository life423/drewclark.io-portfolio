/* global window, document, innerWidth, getComputedStyle, localStorage, sessionStorage */
const { test, expect } = require('@playwright/test');
const { setTimeout: delay } = require('node:timers/promises');
const projects = require('../../app/src/data/projects.json');

const sizes = [
    [320, 568], [390, 844], [844, 390], [768, 1024],
    [930, 820], [1099, 768], [1100, 768], [1126, 900], [1280, 800], [1440, 900], [1920, 1080],
];

async function ready(page) {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Read case study: ' + projects[0].title, exact: true })).toBeVisible();
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
            const card = page.getByRole('button', { name: 'Read case study: ' + project.title, exact: true }).locator('xpath=ancestor::article');
            const image = card.getByRole('img');
            await image.scrollIntoViewIfNeeded();
            await imageLoaded(image);
            await expect(image).toHaveAttribute('src', project.cardImage?.src || project.image);
        }
        await page.getByRole('button', { name: 'Read case study: ' + projects[0].title, exact: true }).click();
        for (let index = 0; index < projects.length; index++) {
            const project = projects[index];
            await expect(page.getByRole('heading', { name: project.title, level: 2, exact: true })).toBeVisible();
            const art = page.locator('.work-studio-media img');
            await expect(art).toHaveAttribute('src', project.image);
            await imageLoaded(art);
            await expect(page.getByRole('link', { name: /View the full .* image/ })).toHaveCount(0);
            const sizing = await art.evaluate(i => {
                const r = i.getBoundingClientRect(), parentWidth = i.parentElement.clientWidth;
                return Math.abs(r.width - parentWidth) < 1 && Math.abs(r.width / r.height - i.naturalWidth / i.naturalHeight) < 0.01;
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
            await expect(chat.getByRole('textbox', { name: 'Question for Project Chat' }))[width < 1100 || height < 850 ? 'toBeHidden' : 'toBeVisible']();
            // Measure the fixed layout rail rather than the child chat that can stick during scrolling.
            const [summary, panel, media, details, related] = await page.evaluate(() => [
                '[data-testid="case-study-summary"]', '[aria-label="Ask about this case study"]', '[aria-labelledby="case-study-title"] figure img',
                '#case-study-details', '#related-projects-title',
            ].map(selector => document.querySelector(selector).getBoundingClientRect().toJSON()));
            if (width >= 1100) {
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
    await page.getByRole('button', { name: 'Read case study: ' + projects[0].title, exact: true }).press('Enter');
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
    await page.locator('#project-chat textarea').fill('Another question');
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
        await page.getByRole('button', { name: 'Read case study: ' + projects[0].title, exact: true }).tap();
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
        await expect(chat.getByRole('textbox', { name: 'Question for Project Chat' })).toBeHidden();
        const introChat = await chat.boundingBox();
        const firstProject = await page.getByRole('button', { name: 'Read case study: ' + projects[0].title, exact: true }).boundingBox();
        expect(introChat.y + introChat.height).toBeLessThan(firstProject.y);
        await page.getByRole('button', { name: 'Read case study: ' + projects[0].title, exact: true }).click();
        await page.getByRole('button', { name: 'Ask about the code', exact: true }).click();
        await expect(chat.getByRole('combobox', { name: 'Chat scope' })).toHaveValue('project');
        await expect(chat.getByRole('option', { name: projects[0].title })).toHaveCount(1);
        await chat.getByRole('textbox').fill('Question for A');
        await chat.getByRole('button', { name: 'Ask', exact: true }).click();
        await expect.poll(() => calls.length).toBe(1);
        expect(calls[0]).toEqual({ question: 'Question for A', projectId: projects[0].id });
        await chat.getByRole('textbox').fill('Draft for A');
        await page.setViewportSize({ width: 1280, height: 900 });
        await expect(chat).toHaveCount(1);
        await expect(chat.locator('button[type=submit]')).toBeDisabled();
        await page.setViewportSize({ width: 390, height: 844 });
        await page.getByRole('button', { name: /^Next project:/ }).click();
        await page.getByRole('button', { name: 'Ask about the code', exact: true }).click();
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
        await page.getByRole('button', { name: 'Close Code Explorer' }).click();
        await page.getByRole('button', { name: 'View ' + projects[0].title + ' details', exact: true }).click();
        await page.getByRole('button', { name: 'Ask about the code', exact: true }).click();
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
        await page.getByRole('button', { name: 'Close Code Explorer' }).click();
        await page.getByRole('button', { name: 'All projects', exact: false }).click();
        await expect(page.getByRole('heading', { name: 'My Portfolio Projects' })).toBeVisible();
    } finally {
        releaseFirst();
    }
});

test('balanced four-card gallery beneath a full-width top Explorer at 1440px', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 940 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await ready(page);
    const getLayout = () => page.evaluate(() => {
        const rect = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
        return {
            intro: rect('[data-testid="work-gallery-intro"]'), rail: rect('#project-chat'),
            composer: rect('#project-chat textarea'), cards: [...document.querySelectorAll('.work-gallery-card')]
                .map(card => card.getBoundingClientRect().toJSON()), viewport: innerWidth,
        };
    });
    const { intro, rail, composer, cards, viewport } = await getLayout();
    expect(cards).toHaveLength(4);
    expect(cards.every(card => Math.abs(card.width - cards[0].width) < 1 && Math.abs(card.height - cards[0].height) < 1)).toBe(true);
    expect(Math.abs(cards[0].y - cards[1].y)).toBeLessThan(1);
    expect(Math.abs(cards[2].y - cards[3].y)).toBeLessThan(1);
    expect(cards[2].y).toBeGreaterThan(cards[0].bottom);
    expect(cards[0].x).toBe(cards[2].x);
    expect(cards[1].x).toBe(cards[3].x);
    expect(Math.abs(rail.x - cards[0].x)).toBeLessThan(1);
    expect(Math.abs(rail.right - cards[1].right)).toBeLessThan(1);
    expect(Math.abs(intro.x - (viewport - rail.right))).toBeLessThan(1);
    expect(rail.y).toBeGreaterThan(intro.bottom);
    expect(cards[0].y).toBeGreaterThan(rail.bottom);
    expect(rail.height).toBeLessThan(300);
    expect(composer.y - rail.y).toBeLessThan(160);

    await page.locator('#projects').evaluate(region => window.scrollTo(0, region.getBoundingClientRect().top + window.scrollY - 160));
    const ownsBoundary = await page.locator('#projects').evaluate(region => {
        const seam = region.getBoundingClientRect().top;
        return region.contains(document.elementFromPoint(innerWidth / 2, seam + 4));
    });
    expect(ownsBoundary).toBe(true);
});

test('case-study Explorer stays alongside all four desktop articles', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 940 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await ready(page);
    await page.getByRole('button', { name: 'Read case study: ' + projects[0].title }).click();
    for (const [index, project] of projects.entries()) {
        const dialog = page.locator('.case-chat-dialog');
        await expect(dialog).toHaveCSS('position', 'sticky');
        await expect(dialog.getByRole('option', { name: project.title })).toHaveCount(1);
        await page.getByRole('heading', { name: 'Project details' }).evaluate(el => el.scrollIntoView({ block: 'start' }));
        await expect(dialog.getByRole('button', { name: 'Ask', exact: true })).toBeInViewport();
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await expect.poll(() => dialog.evaluate(el => el.getBoundingClientRect().bottom <=
            document.querySelector('footer').getBoundingClientRect().top)).toBe(true);
        if (index < projects.length - 1) await page.getByRole('button', { name: /^Next project:/ }).click();
    }
});

test('case-study Explorer drawer preserves reading position, focus, and draft on phones and short windows', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await ready(page);
    const launcher = page.getByRole('button', { name: 'Ask about the code', exact: true });
    await expect(launcher).toHaveCount(0);
    await page.getByRole('button', { name: 'Read case study: ' + projects[1].title }).click();
    const dialog = page.locator('.case-chat-dialog');
    const close = dialog.getByRole('button', { name: 'Close Code Explorer' });
    await page.getByRole('heading', { name: 'Project details' }).evaluate(el => el.scrollIntoView({ block: 'start' }));
    const readAt = await page.evaluate(() => window.scrollY);
    await expect(launcher).toBeInViewport();
    await launcher.press('Enter');
    await expect(close).toBeFocused();
    await expect(dialog.getByRole('option', { name: projects[1].title })).toHaveCount(1);
    await dialog.getByRole('textbox').fill('draft survives the drawer');
    await page.keyboard.press('Escape');
    await expect(launcher).toBeFocused();
    expect(Math.abs(await page.evaluate(() => window.scrollY) - readAt)).toBeLessThan(3);
    await launcher.click();
    await expect(dialog.getByRole('textbox')).toHaveValue('draft survives the drawer');
    await close.click();
    await expect(launcher).toBeFocused();
    await page.setViewportSize({ width: 1440, height: 700 });
    await expect(launcher).toBeInViewport();
    await launcher.click();
    await expect(dialog.getByRole('textbox')).toHaveValue('draft survives the drawer');
    await noOverflow(page);
});

test('wide case studies keep the reading column close to their roomy Explorer', async ({ page }) => {
    await page.setViewportSize({ width: 1656, height: 940 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await ready(page);
    await page.getByRole('button', { name: 'Read case study: ' + projects[1].title, exact: true }).click();
    const { left, right, chat, art, input, heading, reading } = await page.evaluate(() => {
        const rect = select => document.querySelector(select).getBoundingClientRect().toJSON();
        const shell = rect('.work-studio-shell');
        return {
            left: shell.left, right: innerWidth - shell.right, chat: rect('#project-chat'),
            art: rect('.work-studio-media'), input: rect('#project-chat textarea'), heading: rect('.work-studio-intro'),
            reading: rect('.work-studio-depth .prose'),
        };
    });
    expect(left).toBeGreaterThanOrEqual(40);
    expect(Math.abs(left - right)).toBeLessThan(1);
    expect(chat.width).toBeGreaterThanOrEqual(520);
    expect(chat.width).toBeLessThanOrEqual(545);
    expect(reading.width).toBeGreaterThan(550);
    expect(reading.width).toBeLessThanOrEqual(608);
    expect(chat.left - reading.right).toBeCloseTo(32, 0);
    expect(art.right).toBeCloseTo(reading.right, 0);
    expect(Math.abs(heading.y - chat.y)).toBeLessThan(1);
    expect(input.width).toBeGreaterThan(400);
    await expect(page.getByRole('navigation', { name: 'Case study navigation' }).getByRole('button')).toHaveCount(2);
    await expect(page.getByRole('link', { name: 'View the ' + projects[1].title + ' source code on GitHub (opens in a new tab)' }))
        .toHaveAttribute('href', 'https://github.com/' + projects[1].repo);
});

test('wrapped case-study title keeps its curved underline clear of the summary', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await ready(page);
    await page.getByRole('button', { name: 'Read case study: ' + projects[1].title, exact: true }).click();
    const title = page.getByRole('heading', { name: projects[1].title, level: 2, exact: true });
    const mark = await title.evaluate(node => {
        const pseudo = getComputedStyle(node, '::after');
        const style = getComputedStyle(node);
        return {
            lines: node.getBoundingClientRect().height / parseFloat(style.lineHeight),
            margin: parseFloat(pseudo.marginTop), markHeight: parseFloat(pseudo.height),
            image: pseudo.backgroundImage, widthRatio: parseFloat(pseudo.width) / node.getBoundingClientRect().width, summaryTop: node.nextElementSibling.getBoundingClientRect().top,
            headingBottom: node.getBoundingClientRect().bottom,
        };
    });
    expect(mark.lines).toBeGreaterThan(2);
    expect(mark.margin).toBeGreaterThan(0);
    expect(mark.markHeight).toBeGreaterThan(0);
    expect(mark.image).toContain('image/svg+xml');
    expect(mark.image).toContain('FF6B00');
    expect(mark.widthRatio).toBeCloseTo(0.93, 2);
    expect(mark.summaryTop).toBeGreaterThan(mark.headingBottom);
    await noOverflow(page);
});

test('gallery lift respects input mode, keyboard focus, and reduced motion', async ({ page, browser }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await ready(page);
    const card = page.locator('.work-gallery-card').first();
    const baseShadow = await card.evaluate(element => getComputedStyle(element).boxShadow);
    await card.hover();
    await expect(card).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -3)');
    await expect.poll(() => card.evaluate(element => getComputedStyle(element).boxShadow)).not.toBe(baseShadow);
    const action = card.getByRole('link', { name: /Visit the site/ });
    const baseAction = await action.evaluate(element => getComputedStyle(element).backgroundColor);
    await action.hover();
    await expect.poll(() => action.evaluate(element => getComputedStyle(element).backgroundColor)).not.toBe(baseAction);

    await page.mouse.move(0, 0);
    const open = card.getByRole('button', { name: 'Read case study: ' + projects[0].title, exact: true });
    await open.focus();
    await expect(open).toBeFocused();
    await expect(card).toHaveCSS('box-shadow', 'rgb(117, 211, 174) 0px 0px 0px 2px');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await card.hover();
    await expect(card).toHaveCSS('transform', 'none');
    await expect(card).toHaveCSS('transition-duration', '0s');

    const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    try {
        const phone = await touch.newPage();
        await ready(phone);
        const touchCard = phone.locator('.work-gallery-card').first();
        await expect(touchCard).toHaveCSS('transform', 'none');
        expect(await phone.evaluate(() => window.matchMedia('(pointer: fine)').matches)).toBe(false);
    } finally {
        await touch.close();
    }
});

test('the studio explains source grounding and Cryptography actions fit on 1126px', async ({ page }) => {
    await page.setViewportSize({ width: 1126, height: 900 });
    await ready(page);
    const chat = page.locator('#project-chat');
    await expect(chat.getByRole('textbox')).toHaveAccessibleDescription(/GitHub code.*exact files and lines/);
    const crypto = page.getByRole('button', { name: 'Read case study: ' + projects[1].title, exact: true }).locator('xpath=ancestor::article');
    const cuda = page.getByRole('button', { name: 'Read case study: ' + projects[0].title, exact: true }).locator('xpath=ancestor::article');
    await expect(crypto.getByText('Download', { exact: true })).toHaveCount(0);
    const actions = await crypto.locator('.work-gallery-actions a').evaluateAll(links => links.map(link => {
        const rect = link.getBoundingClientRect();
        return { y: rect.y, bottom: rect.bottom, href: link.getAttribute('href') };
    }));
    expect(actions).toHaveLength(3);
    expect(actions.map(link => link.href)).toEqual([
        ...projects[1].downloads.map(item => item.url), 'https://github.com/' + projects[1].repo,
    ]);
    expect(actions.every(link => Math.abs(link.y - actions[0].y) < 1)).toBe(true);
    const margins = await Promise.all([crypto, cuda].map(card => card.evaluate(el => {
        const cardRect = el.getBoundingClientRect(), actionRect = el.querySelector('.work-gallery-actions').getBoundingClientRect();
        return cardRect.bottom - actionRect.bottom;
    })));
    expect(Math.abs(margins[0] - margins[1])).toBeLessThan(1);
    await page.setViewportSize({ width: 390, height: 844 });
    await noOverflow(page);
    await expect(crypto.locator('.work-gallery-actions a')).toHaveCount(3);
});

test('CUDA preview and source stay together as the card actions wrap', async ({ page }) => {
    await ready(page);
    const actions = page.getByRole('button', { name: 'Read case study: ' + projects[0].title, exact: true })
        .locator('xpath=ancestor::article').locator('.work-gallery-actions a');
    for (const width of [320, 390, 768, 1126, 1280, 1440, 1810]) {
        await page.setViewportSize({ width, height: 900 });
        const links = await actions.evaluateAll(links => links.map(link => ({
            href: link.getAttribute('href'), y: link.getBoundingClientRect().y,
        })));
        expect(links).toHaveLength(3);
        expect(links[1].href).toBe(projects[0].downloads[0].url);
        await expect(actions.nth(1)).toHaveText('Windows');
        await expect(actions.nth(1)).toHaveCSS('background-color', 'rgb(52, 211, 153)');
        expect(links[2].href).toBe('https://github.com/' + projects[0].repo);
        expect(Math.abs(links[1].y - links[2].y)).toBeLessThan(1);
    }
});

test('composer supports multiline questions and reflects the real limit', async ({ page }) => {
    await page.setViewportSize({ width: 1126, height: 900 });
    let payload;
    await page.route('**/api/askGPT', route => {
        payload = route.request().postDataJSON();
        return route.fulfill({ json: { answer: 'Test response', sources: [] } });
    });
    await ready(page);
    const chat = page.locator('#project-chat');
    const composer = chat.getByRole('textbox', { name: 'Question for Project Chat' });
    const send = chat.getByRole('button', { name: 'Ask', exact: true });
    await expect(composer).toHaveJSProperty('tagName', 'TEXTAREA');
    await expect(composer).toHaveAttribute('maxlength', '500');
    await expect(composer).toHaveAccessibleDescription(/500 characters/);
    const geometry = await composer.evaluate(input => {
        const r = input.getBoundingClientRect(), form = input.form.getBoundingClientRect();
        const button = input.form.querySelector('button').getBoundingClientRect();
        return { width: r.width, height: r.height, formWidth: form.width, inputBottom: r.bottom, buttonTop: button.top, buttonRight: button.right, inputRight: r.right };
    });
    expect(geometry.height).toBeGreaterThanOrEqual(90);
    expect(Math.abs(geometry.width - geometry.formWidth)).toBeLessThan(1);
    expect(geometry.buttonTop).toBeGreaterThan(geometry.inputBottom);
    expect(Math.abs(geometry.buttonRight - geometry.inputRight)).toBeLessThan(1);

    await composer.fill('How is the game state synchronized?');
    await composer.press('End');
    await composer.press('Enter');
    await composer.pressSequentially('Which code handles reconnects?');
    const question = 'How is the game state synchronized?\nWhich code handles reconnects?';
    await expect(composer).toHaveValue(question);
    expect(payload).toBeUndefined();
    await send.click();
    await expect(chat.getByText('Test response', { exact: true })).toBeVisible();
    expect(payload).toEqual({ question });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Read case study: ' + projects[2].title, exact: true }).click();
    await expect(composer).toBeHidden();
    await page.getByRole('button', { name: 'Ask about the code', exact: true }).click();
    await expect(composer).toBeVisible();
    await expect(composer).toHaveValue('');
    await expect(chat.getByRole('option', { name: projects[2].title })).toHaveCount(1);
    await noOverflow(page);
});

test('wide and medium desktop Explorer and gallery share one centered shell', async ({ page }) => {
    await ready(page);
    for (const width of [1095, 1126, 1810]) {
        await page.setViewportSize({ width, height: 1031 });
        const layout = await page.evaluate(() => {
            const r = select => document.querySelector(select).getBoundingClientRect();
            const gallery = r('.work-studio-gallery'), studio = r('#project-chat');
            const field = r('#project-chat textarea'), card = r('.work-gallery-card');
            return { sides: Math.abs(studio.left - (innerWidth - studio.right)),
                edge: Math.abs(studio.left - gallery.left) + Math.abs(studio.right - gallery.right),
                gap: gallery.top - studio.bottom, field: field.width, card: card.width };
        });
        expect(layout.sides).toBeLessThan(1);
        expect(layout.edge).toBeLessThan(1);
        expect(layout.gap).toBeGreaterThan(10);
        expect(layout.field).toBeGreaterThan(500);
        expect(layout.card).toBeGreaterThan(475);
        await noOverflow(page);
    }
});

test('overview title uses the orange arc without repeating it on project card headings', async ({ page }) => {
    await page.setViewportSize({ width: 1126, height: 900 });
    await ready(page);
    for (const width of [1126, 390]) {
        await page.setViewportSize({ width, height: 900 });
        const mark = await page.getByRole('heading', { name: 'My Portfolio Projects' }).evaluate(node => {
            const arc = getComputedStyle(node, '::after');
            const heading = node.getBoundingClientRect();
            return {
                ratio: parseFloat(arc.width) / heading.width, image: arc.backgroundImage,
                summaryGap: node.nextElementSibling.getBoundingClientRect().top - heading.bottom,
            };
        });
        expect(mark.ratio).toBeCloseTo(0.93, 2);
        expect(mark.image).toContain('FF6B00');
        expect(mark.summaryGap).toBeGreaterThan(0);
        expect(await page.locator('.work-gallery-card h3').first().evaluate(node => getComputedStyle(node, '::after').backgroundImage)).toBe('none');
        await noOverflow(page);
    }
});

test('gallery artwork stays clipped to smaller full-card-width frames through responsive transitions', async ({ page }) => {
    await ready(page);
    for (const width of [390, 639, 640, 719, 720, 768, 930, 1099, 1100, 1126]) {
        await page.setViewportSize({ width, height: 900 });
        const boxes = await page.locator('.work-gallery-card').evaluateAll(cards => cards.map(card => {
            const rect = node => node.getBoundingClientRect().toJSON();
            return { card: rect(card), frame: rect(card.querySelector('.work-gallery-art')),
                image: { width: card.querySelector('img').clientWidth, height: card.querySelector('img').clientHeight }, fit: getComputedStyle(card.querySelector('img')).objectFit, corner: getComputedStyle(card.querySelector('.work-gallery-art')).borderTopLeftRadius };
        }));
        expect(boxes).toHaveLength(4);
        for (const { card, frame, image, corner } of boxes) {
            expect(Math.abs(frame.width - card.width)).toBeLessThan(1);
            expect(Math.abs(image.width - frame.width)).toBeLessThan(1);
            expect(Math.abs(image.height - frame.height)).toBeLessThan(1);
            expect(frame.height).toBeGreaterThanOrEqual(145);
            expect(frame.height).toBeLessThanOrEqual(224);
            expect(corner).toBe('16px');
        }
        expect(boxes[1].fit).toBe('contain');
        if (width >= 720) {
            expect(Math.abs(boxes[0].card.y - boxes[1].card.y)).toBeLessThan(1);
            expect(boxes[1].card.x).toBeGreaterThan(boxes[0].card.x);
        } else {
            expect(boxes[1].card.y).toBeGreaterThan(boxes[0].card.bottom);
            expect(Math.abs(boxes[1].card.x - boxes[0].card.x)).toBeLessThan(1);
        }
        await noOverflow(page);
    }
});

test('overview heading is flat mint, case-study gradient stays, and Explorer has an explicit purpose', async ({ page }) => {
    await page.setViewportSize({ width: 1126, height: 900 });
    await ready(page);
    const overview = page.getByRole('heading', { name: 'My Portfolio Projects' });
    await expect(overview).toHaveCSS('color', 'rgb(167, 243, 208)');
    await expect(overview).toHaveCSS('background-image', 'none');
    await expect(overview.locator('xpath=..').getByText('Portfolio', { exact: true })).toHaveCount(0);
    const chat = page.locator('#project-chat');
    await expect(chat.getByRole('heading', { name: 'Project Code Explorer' })).toBeVisible();
    await expect(chat.getByText('Ask me a question', { exact: true })).toBeVisible();
    await expect(chat.getByRole('textbox')).toHaveAccessibleDescription(/actual GitHub code.*exact files and lines/);
    await page.getByRole('button', { name: 'Read case study: ' + projects[0].title, exact: true }).click();
    const detail = page.getByRole('heading', { name: projects[0].title, level: 2, exact: true });
    const gradient = await detail.locator('span').evaluate(span => getComputedStyle(span).backgroundImage);
    expect(gradient).toContain('rgb(110, 231, 183)');
    expect(gradient).toContain('rgb(56, 189, 248)');
    await page.emulateMedia({ forcedColors: 'active' });
    await expect(detail.locator('span')).toHaveCSS('background-image', 'none');
    await expect(detail.locator('span')).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
});

test('the in-flow bottom shortcut returns keyboard focus to the only Explorer', async ({ page }) => {
    for (const width of [1126, 390]) {
        await page.setViewportSize({ width, height: 844 });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await ready(page);
        const studio = page.locator('#project-chat');
        await expect(studio).toHaveCount(1);
        await expect(studio).toHaveCSS('position', 'static');
        const shortcut = page.getByRole('button', { name: 'Back to Code Explorer' });
        await expect(shortcut).toHaveAttribute('aria-controls', 'project-chat');
        await shortcut.scrollIntoViewIfNeeded();
        expect((await shortcut.boundingBox()).height).toBeGreaterThanOrEqual(44);
        await shortcut.press('Enter');
        await expect(studio.getByRole('textbox')).toBeFocused();
        await expect(studio.getByRole('textbox')).toBeInViewport();
        await expect.poll(() => studio.evaluate(e => e.getBoundingClientRect().top -
            document.querySelector('header nav').getBoundingClientRect().bottom)).toBeGreaterThanOrEqual(8);
        await expect(page.getByRole('contentinfo').getByText(new RegExp('© '+new Date().getFullYear()+' Drew Clark'))).toHaveCount(1);
    }
});

test('mobile hero jump clears the fixed header and keeps chat compact until expanded', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await ready(page);
    await page.getByRole('link', { name: 'Featured Projects' }).click();
    await expect.poll(() => page.evaluate(() => {
        const headline = document.querySelector('.work-studio-title').getBoundingClientRect();
        return headline.top - document.querySelector('header nav').getBoundingClientRect().bottom;
    })).toBeGreaterThanOrEqual(12);
    const chat = page.locator('#project-chat');
    await expect(chat.getByRole('textbox')).toBeHidden();
    expect((await chat.boundingBox()).height).toBeLessThan(135);
    await expect(page.locator('.work-gallery-card').first()).toBeInViewport({ ratio: 0.3 });
    const disclosure = chat.getByRole('button', { name: 'Expand chat' });
    await expect(disclosure).toHaveAttribute('aria-expanded', 'false');
    await disclosure.press('Enter');
    await expect(chat.getByRole('button', { name: 'Collapse chat' })).toHaveAttribute('aria-expanded', 'true');
    await expect(chat.getByRole('textbox')).toBeVisible();
});

test('each card has one visible case-study button and its artwork remains a mouse target', async ({ page }) => {
    await page.setViewportSize({ width: 1126, height: 900 });
    await ready(page);
    for (const project of projects) {
        const cta = page.getByRole('button', { name: 'Read case study: ' + project.title, exact: true });
        await expect(cta).toHaveCount(1);
        await expect(cta).toHaveText('Read case study');
        const card = cta.locator('xpath=ancestor::article');
        await expect(card.getByRole('heading', { name: project.title })).toBeVisible();
        const description = card.getByText(project.tagline, { exact: true });
        await expect(description).toHaveCSS('font-size', '16px');
        await expect(description).toHaveCSS('line-height', '24px');
    }
    const art = page.locator('.work-gallery-art').first();
    await art.scrollIntoViewIfNeeded();
    const r = await art.boundingBox();
    await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2);
    await expect(page.getByRole('heading', { name: projects[0].title, level: 2 })).toBeVisible();
});

test('emerald band stays exactly halfway between Explorer and footer', async ({ page }) => {
    for (const width of [320, 390, 600, 719, 720, 768, 899, 900, 1024, 1095, 1280, 1440, 1810, 2560]) {
        await page.setViewportSize({ width, height: 1000 });
        await ready(page);
        const explorer = page.locator('#project-chat');
        for (let state = 0; state < 2; state++) {
            const geometry = await page.locator('.work-studio-after-chat').evaluate(e => {
                const band = getComputedStyle(e, '::before');
                const mid = e.getBoundingClientRect().top + parseFloat(band.top);
                const chat = document.querySelector('#project-chat').getBoundingClientRect().bottom;
                const footer = document.querySelector('footer').getBoundingClientRect().top;
                return { diff: Math.abs(mid - (chat + footer) / 2), fill: band.backgroundImage,
                    pointer: band.pointerEvents, width: parseFloat(band.width), shape: band.clipPath };
            });
            expect(geometry.diff, 'Band midpoint error at ' + width + 'px').toBeLessThan(1);
            expect(geometry.fill).toMatch(/linear-gradient\(85deg, rgb\(6, 78, 59\)(?: 0%)?, rgb\(16, 185, 129\) 70%, rgb\(52, 211, 153\)(?: 100%)?\)/);
            expect(geometry.pointer).toBe('none');
            expect(geometry.width).toBe(width);
            expect(geometry.shape).toContain('polygon');
            await noOverflow(page);
            if (!state) await explorer.getByRole('button', { name: /^(Expand|Collapse) chat$/ }).click();
        }
    }
});

test('all four case studies cycle green, blue and orange technology tags', async ({ page }) => {
    await page.setViewportSize({ width: 1126, height: 900 });
    await ready(page);
    await page.getByRole('button', { name: 'Read case study: ' + projects[0].title }).click();
    const tones = ['rgb(167, 243, 208)', 'rgb(167, 216, 240)', 'rgb(255, 193, 153)'];
    for (const [index, project] of projects.entries()) {
        const items = page.getByRole('list', { name: 'Technology stack' }).getByRole('listitem');
        await expect(items).toHaveText(project.stack);
        expect(await items.evaluateAll(tags => tags.map(tag => getComputedStyle(tag).color)))
            .toEqual(project.stack.map((_, j) => tones[j % tones.length]));
        if (index < projects.length - 1) await page.getByRole('button', { name: /^Next project:/ }).click();
    }
});

test('case-study navigation outlines match their visible text colors', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 940 });
    await ready(page);
    await page.getByRole('button', { name: 'Read case study: ' + projects[0].title }).click();
    const nav = page.getByRole('navigation', { name: 'Case study navigation' });
    for (const action of [nav.getByRole('button', { name: 'All projects' }), nav.getByRole('button', { name: /^Next project:/ })]) {
        const colors = () => action.evaluate(e => {
            const style = getComputedStyle(e);
            return { text: style.color, border: style.borderTopColor };
        });
        let state = await colors();
        expect(state.border).toBe(state.text);
        await action.hover();
        state = await colors();
        expect(state.border).toBe(state.text);
    }
});
