/* global document, window, innerWidth, getComputedStyle, localStorage */
const { test, expect } = require('@playwright/test');
const projects = require('../../app/src/data/projects.json');

async function ready(page, index = 0) {
    await page.goto('/');
    const open = page.getByRole('button', { name: 'Read case study: ' + projects[index].title, exact: true });
    await expect(open).toBeVisible();
    await expect(page.locator('#hero-cta')).toHaveClass(/pe-visible/);
    await open.click();
    await expect(page.getByRole('heading', { name: projects[index].title, level: 2, exact: true })).toBeVisible();
}

async function noOverflow(page) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

async function noSidebarOverflow(page) {
    expect(await page.locator('.case-chat-dialog').evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
    expect(await page.locator('.case-build-explorer').evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
}

async function rightHandDrawer(page) {
    const bounds = await page.locator('.case-chat-dialog').evaluate(node => {
        const rect = node.getBoundingClientRect();
        return { rightGap: window.innerWidth - rect.right, left: rect.left, top: rect.top, bottomGap: window.innerHeight - rect.bottom };
    });
    expect(Math.abs(bounds.rightGap)).toBeLessThan(2);
    expect(bounds.left).toBeGreaterThanOrEqual(15);
    expect(Math.abs(bounds.top)).toBeLessThan(2);
    expect(Math.abs(bounds.bottomGap)).toBeLessThan(2);
    await noSidebarOverflow(page);
}

test('all case studies offer three contextual questions in a calm desktop sidebar', async ({ page }, info) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await ready(page);
    const chat = page.locator('.case-build-explorer');
    for (let index = 0; index < projects.length; index++) {
        await expect(chat).toBeVisible();
        await expect(chat.locator('.case-build-prompts button')).toHaveCount(3);
        await expect(chat.getByRole('combobox')).toHaveCount(0);
        await expect(chat.getByText(/\d+\s*\/\s*500\s+characters/)).toHaveCount(0);
        const prompts = await chat.locator('.case-build-prompts button').allTextContents();
        expect(new Set(prompts.map(text => text.trim())).size).toBe(3);
        const targets = await chat.locator('.case-build-prompts button, button[type=submit], textarea').evaluateAll(nodes => nodes.map(node => ({
            height: node.getBoundingClientRect().height,
            fontSize: parseFloat(getComputedStyle(node).fontSize),
        })));
        expect(targets.every(target => target.height >= 44)).toBe(true);
        expect(targets.every(target => target.fontSize >= 14)).toBe(true);
        const [reading, sidebar] = await page.evaluate(() => ['[data-testid="case-study-summary"]', '.case-build-explorer']
            .map(selector => document.querySelector(selector).getBoundingClientRect().toJSON()));
        expect(sidebar.left).toBeGreaterThanOrEqual(reading.right + 16);
        await noOverflow(page);
        await page.screenshot({ path: info.outputPath(`case-build-${projects[index].id}-desktop.png`) });
        if (index < projects.length - 1) await page.getByRole('button', { name: /^Next project:/ }).click();
    }
    for (const width of [988, 1070, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await noSidebarOverflow(page);
        await noOverflow(page);
    }
});

test('contextual questions and multiline input stay scoped and recover after failure', async ({ page }) => {
    const calls = [];
    let releaseFirst;
    const firstGate = new Promise(resolve => { releaseFirst = resolve; });
    const codeLink = 'https://github.com/life423/CudaRL-Arena/blob/0123456789012345678901234567890123456789/src/rl/ppo.cpp#L1-L10';
    await page.route('**/api/askGPT', async route => {
        calls.push(route.request().postDataJSON());
        if (calls.length === 1) {
            await firstGate;
            return route.fulfill({ json: { answer: 'Scoped source-backed answer.', sources: [
                { project: projects[0].title, file: 'src/rl/ppo.cpp', lines: '1-10', url: codeLink },
            ] } });
        }
        if (calls.length === 2) return route.fulfill({ status: 503, json: { error: 'temporarily unavailable' } });
        return route.fulfill({ json: { answer: 'Recovered scoped answer.', sources: [] } });
    });
    try {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await ready(page);
        const chat = page.locator('.case-build-explorer');
        const prompt = chat.locator('.case-build-prompts button').first();
        const question = (await prompt.innerText()).trim();
        await prompt.press('Enter');
        await expect.poll(() => calls.length).toBe(1);
        expect(calls[0]).toEqual({ question, projectId: projects[0].id });
        await expect(chat.getByRole('log')).toBeFocused();
        await expect(chat.locator('button[type=submit]')).toBeDisabled();
        releaseFirst();
        await expect(chat.getByText('Scoped source-backed answer.', { exact: true })).toBeVisible();
        await expect(chat.getByRole('link', { name: 'ppo.cpp', exact: true })).toHaveAttribute('href', codeLink);

        const input = chat.getByRole('textbox', { name: 'Question for Project Chat' });
        await input.fill('First line');
        await input.press('Enter');
        await expect(input).toHaveValue('First line\n');
        await input.press('Shift+Enter');
        await expect(input).toHaveValue('First line\n\n');
        expect(calls).toHaveLength(1);
        await input.fill('First line\nSecond line');
        await chat.getByRole('button', { name: 'Ask', exact: true }).click();
        await expect.poll(() => calls.length).toBe(2);
        expect(calls[1]).toEqual({ question: 'First line\nSecond line', projectId: projects[0].id });
        await expect(chat.getByText('Sorry, something went wrong on my end. Please try again in a moment.', { exact: true })).toBeVisible();
        await input.fill('Try that again');
        await expect(chat.locator('button[type=submit]')).toBeEnabled();
        await chat.getByRole('button', { name: 'Ask', exact: true }).click();
        await expect(chat.getByText('Recovered scoped answer.', { exact: true })).toBeVisible();
        expect(calls[2]).toEqual({ question: 'Try that again', projectId: projects[0].id });
        await noOverflow(page);
    } finally {
        releaseFirst();
    }
});

test('send control has clear orange interaction states and a distinct disabled loading state', async ({ page }, info) => {
    let releaseAnswer;
    const answerGate = new Promise(resolve => { releaseAnswer = resolve; });
    const calls = [];
    await page.route('**/api/askGPT', async route => {
        calls.push(route.request().postDataJSON());
        await answerGate;
        return route.fulfill({ json: { answer: 'The build answer is ready.', sources: [] } });
    });
    try {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await ready(page);
        const chat = page.locator('.case-build-explorer');
        const input = chat.getByRole('textbox', { name: 'Question for Project Chat' });
        const send = chat.locator('.case-build-send');
        await expect(send).toBeEnabled();
        await expect(input).toHaveAttribute('required', '');
        await send.click();
        await expect(input).toBeFocused();
        expect(calls).toHaveLength(0);
        await input.fill('How is this built?');
        await page.mouse.move(0, 0);
        await expect(send).toHaveCSS('background-color', 'rgb(255, 122, 51)');

        await send.hover();
        await expect(send).toHaveCSS('background-color', 'rgb(255, 155, 102)');
        await page.screenshot({ path: info.outputPath('case-build-send-hover.png') });
        await page.mouse.down();
        await expect(send).toHaveCSS('background-color', 'rgb(230, 96, 0)');
        await expect(send).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 1)');
        await page.screenshot({ path: info.outputPath('case-build-send-pressed.png') });
        await page.mouse.move(0, 0);
        await page.mouse.up();
        await input.focus();
        await input.press('Tab');
        await expect(send).toBeFocused();
        await expect(send).toHaveCSS('outline-style', 'solid');
        await expect(send).toHaveCSS('outline-color', 'rgb(255, 155, 102)');
        await page.screenshot({ path: info.outputPath('case-build-send-keyboard-focus.png') });

        await page.emulateMedia({ reducedMotion: 'reduce' });
        expect(await send.evaluate(node => getComputedStyle(node).transitionDuration.split(',').every(value => parseFloat(value) === 0))).toBe(true);
        await send.hover();
        await page.mouse.down();
        await expect(send).toHaveCSS('transform', 'none');
        await page.mouse.move(0, 0);
        await page.mouse.up();
        await send.press('Space');
        await expect.poll(() => calls.length).toBe(1);
        await expect(send).toBeDisabled();
        await expect(send).toHaveAccessibleName('Generating answer');
        await expect(send).toHaveCSS('background-color', 'rgb(63, 63, 70)');
        await expect(chat.getByRole('status')).toBeVisible();
        await send.hover();
        await expect(send).toHaveCSS('background-color', 'rgb(63, 63, 70)');
        await page.screenshot({ path: info.outputPath('case-build-send-pending.png') });
        releaseAnswer();
        await expect(chat.getByText('The build answer is ready.', { exact: true })).toBeVisible();
        await expect(send).toBeEnabled();
        await noSidebarOverflow(page);
    } finally {
        releaseAnswer();
    }
});

test('project histories stay isolated and clearing removes only the current conversation', async ({ page }) => {
    await page.addInitScript(projects => {
        localStorage.setItem('unified_project_chat', JSON.stringify([
            { role: 'assistant', content: 'Saved global conversation', timestamp: Date.now() },
            { role: 'assistant', content: 'Saved first project conversation', projectId: projects[0].id, timestamp: Date.now() },
            { role: 'assistant', content: 'Saved second project conversation', projectId: projects[1].id, timestamp: Date.now() },
        ]));
    }, projects);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await ready(page);
    const chat = page.locator('.case-build-explorer');
    await expect(chat.getByText('Saved first project conversation', { exact: true })).toBeVisible();
    await expect(chat.getByText('Saved global conversation', { exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: /^Next project:/ }).click();
    await expect(chat.getByText('Saved second project conversation', { exact: true })).toBeVisible();
    await expect(chat.getByText('Saved first project conversation', { exact: true })).toHaveCount(0);
    await chat.getByRole('button', { name: 'Clear chat history', exact: true }).click();
    await chat.getByRole('button', { name: 'Yes', exact: true }).click();
    await expect(chat.getByText('Saved second project conversation', { exact: true })).toHaveCount(0);
    await expect(chat.getByRole('textbox', { name: 'Question for Project Chat' })).toBeFocused();
    await expect(chat.locator('.case-build-prompts button')).toHaveCount(3);
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('unified_project_chat')));
    expect(stored.map(message => message.content)).toEqual(['Saved global conversation', 'Saved first project conversation']);
    await page.getByRole('button', { name: `View ${projects[0].title} details`, exact: true }).click();
    await expect(chat.getByText('Saved first project conversation', { exact: true })).toBeVisible();
});

test('global questions use an explicit scope and preserve the current project draft', async ({ page }, info) => {
    const calls = [];
    await page.route('**/api/askGPT', route => {
        const call = route.request().postDataJSON();
        calls.push(call);
        return route.fulfill({ json: { answer: 'Global answer for ' + call.question, sources: [] } });
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await ready(page);
    const chat = page.locator('.case-build-explorer');
    const input = chat.getByRole('textbox', { name: 'Question for Project Chat' });
    await input.fill('Draft for the current build');
    const scopeAction = chat.getByRole('button', { name: 'Ask across projects', exact: true });
    await page.mouse.move(0, 0);
    // Its purpose must be recognizable before hover, including on touch screens.
    await expect(scopeAction).toHaveCSS('text-decoration-line', 'underline');
    await expect(scopeAction).toHaveCSS('color', 'rgb(167, 243, 208)');
    expect(await scopeAction.evaluate(node => parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(14);
    expect((await scopeAction.boundingBox()).height).toBeGreaterThanOrEqual(44);
    await scopeAction.scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath('scope-action-desktop.png') });
    await scopeAction.click();
    await expect(chat.getByText('All portfolio projects', { exact: true })).toBeVisible();
    await input.fill('Compare the projects');
    await chat.getByRole('button', { name: 'Ask', exact: true }).click();
    await expect.poll(() => calls.length).toBe(1);
    expect(calls[0]).toEqual({ question: 'Compare the projects' });
    await expect(chat.getByText('Global answer for Compare the projects', { exact: true })).toBeVisible();
    const returnAction = chat.getByRole('button', { name: 'Return to this project', exact: true });
    await page.mouse.move(0, 0);
    await expect(returnAction).toHaveCSS('text-decoration-line', 'underline');
    await returnAction.click();
    await expect(input).toHaveValue('Draft for the current build');
    await expect(chat.locator('.case-build-prompts button')).toHaveCount(3);

    await page.evaluate(() => {
        window.sessionStorage.setItem('drawer_question', 'Question from the global drawer');
        window.sessionStorage.setItem('drawer_question_timestamp', String(Date.now()));
    });
    await expect.poll(() => calls.length).toBe(2);
    expect(calls[1]).toEqual({ question: 'Question from the global drawer' });
    await expect(chat.getByText('All portfolio projects', { exact: true })).toBeVisible();
    await expect(chat.getByText('Global answer for Question from the global drawer', { exact: true })).toBeVisible();
    await chat.getByRole('button', { name: 'Return to this project', exact: true }).click();
    await expect(input).toHaveValue('Draft for the current build');
    await noOverflow(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('.case-chat-launcher').click();
    await scopeAction.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    await expect(scopeAction).toHaveCSS('text-decoration-line', 'underline');
    await page.screenshot({ path: info.outputPath('scope-action-phone.png') });
    await noSidebarOverflow(page);
});

test('phone drawer preserves reading position and draft through rotation with usable focus', async ({ browser }, info) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: 'reduce' });
    try {
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await ready(page, 1);
        const launcher = page.locator('.case-chat-launcher');
        const dialog = page.locator('.case-chat-dialog');
        const close = dialog.locator('.case-chat-close');
        const chat = dialog.locator('.case-build-explorer');
        const input = chat.getByRole('textbox', { name: 'Question for Project Chat' });
        await expect(launcher).toHaveAccessibleName('Open project chat');
        await expect(launcher).toHaveText('Open project chat');
        await expect(launcher.locator('svg')).toBeVisible();
        await page.getByRole('heading', { name: 'Project details', exact: true }).evaluate(node => node.scrollIntoView({ block: 'start' }));
        const readingAt = await page.evaluate(() => window.scrollY);
        await launcher.press('Enter');
        await expect(close).toHaveAccessibleName('Close build explorer');
        await expect(close).toHaveText('');
        await expect(close.locator('svg')).toBeVisible();
        const closeTarget = await close.boundingBox();
        expect(closeTarget.width).toBeGreaterThanOrEqual(44);
        expect(closeTarget.height).toBeGreaterThanOrEqual(44);
        expect(Math.abs(closeTarget.width - closeTarget.height)).toBeLessThan(1);
        await expect(dialog).toHaveAccessibleName('Build explorer');
        await expect(close).toBeFocused();
        await rightHandDrawer(page);
        expect(await dialog.evaluate(node => getComputedStyle(node).transitionDuration.split(',').every(value => parseFloat(value) === 0))).toBe(true);
        await expect(chat.locator('.case-build-prompts button')).toHaveCount(3);
        await input.fill('A draft about this build');
        await page.screenshot({ path: info.outputPath('case-build-phone-drawer.png') });
        await page.keyboard.press('Escape');
        await expect(launcher).toBeFocused();
        expect(Math.abs(await page.evaluate(() => window.scrollY) - readingAt)).toBeLessThan(3);
        await page.getByRole('button', { name: 'Open Menu', exact: true }).click();
        const menu = page.getByRole('dialog', { name: 'Navigation Menu', exact: true });
        await expect(menu).toBeVisible();
        await expect.poll(async () => Math.abs((await menu.boundingBox()).x)).toBeLessThan(2);
        await expect(dialog).toBeHidden();
        expect(await launcher.evaluate(node => Boolean(node.closest('[inert]')))).toBe(true);
        await page.keyboard.press('Escape');
        await expect(menu).toBeHidden();
        await launcher.tap();
        await expect(input).toHaveValue('A draft about this build');
        await expect(page.getByRole('dialog', { name: 'Navigation Menu', exact: true })).toHaveCount(0);
        await input.focus();
        await page.setViewportSize({ width: 844, height: 390 });
        await expect(input).toHaveValue('A draft about this build');
        await expect(dialog).toBeVisible();
        await rightHandDrawer(page);
        await noOverflow(page);
        await page.screenshot({ path: info.outputPath('case-build-landscape-dialog.png') });
        await page.setViewportSize({ width: 1440, height: 900 });
        await expect(dialog).toHaveCSS('position', 'sticky');
        await expect(input).toBeFocused();
        await expect(input).toHaveValue('A draft about this build');
        expect(await dialog.evaluate(node => node.matches(':modal'))).toBe(false);
        await page.setViewportSize({ width: 768, height: 1024 });
        await expect(launcher).toBeFocused();
        await launcher.click();
        await expect(input).toHaveValue('A draft about this build');
        await rightHandDrawer(page);
        await noOverflow(page);
        await page.screenshot({ path: info.outputPath('case-build-tablet-dialog.png') });
        expect(errors).toEqual([]);
    } finally {
        await context.close();
    }
});

test('drawer motion and resize or clear actions keep keyboard focus on visible controls', async ({ page }, info) => {
    await page.addInitScript(project => {
        localStorage.setItem('unified_project_chat', JSON.stringify([
            { role: 'assistant', content: 'A saved build conversation', projectId: project.id, timestamp: Date.now() },
        ]));
        window.__buildMotionRecords = [];
        window.__captureBuildMotion = true;
        window.__buildMotionSupported = window.CSS.supports('transition-behavior', 'allow-discrete')
            && 'CSSStartingStyleRule' in window;
        window.__buildExitMotionSupported = window.__buildMotionSupported && window.CSS.supports('overlay', 'auto');
        for (const [method, phase] of [['showModal', 'entry'], ['close', 'exit']]) {
            const native = window.HTMLDialogElement.prototype[method];
            window.HTMLDialogElement.prototype[method] = function (...args) {
                const result = native.apply(this, args);
                if (this.matches('.case-chat-dialog') && window.__captureBuildMotion && window.__buildMotionSupported) {
                    const dialog = this;
                    window.requestAnimationFrame(() => {
                        const animations = dialog.getAnimations();
                        animations.forEach(animation => { animation.pause(); animation.currentTime = 100; });
                        const matrix = new window.DOMMatrix(getComputedStyle(dialog).transform);
                        window.__buildMotionRecords.push({
                            phase,
                            animations: animations.map(animation => ({
                                property: animation.transitionProperty,
                                duration: animation.effect.getTiming().duration,
                                currentTime: animation.currentTime,
                            })),
                            translateX: matrix.m41,
                            width: dialog.getBoundingClientRect().width,
                            runningViewTransitions: document.getAnimations().filter(animation =>
                                (animation.effect?.pseudoElement?.includes('view-transition') || animation.animationName?.includes('view-transition'))
                                && animation.playState === 'running'
                                && getComputedStyle(document.documentElement, animation.effect?.pseudoElement).display !== 'none').length,
                            viewTransitionDetails: document.getAnimations().filter(animation =>
                                (animation.effect?.pseudoElement?.includes('view-transition') || animation.animationName?.includes('view-transition'))
                                && animation.playState === 'running').map(animation => ({
                                name: animation.animationName, pseudo: animation.effect?.pseudoElement, time: animation.currentTime,
                                target: animation.effect?.target?.className, active: document.documentElement.className,
                                display: getComputedStyle(document.documentElement, animation.effect?.pseudoElement).display,
                            })),
                        });
                        window.__resumeBuildMotion = () => animations.forEach(animation => animation.play());
                    });
                }
                return result;
            };
        }
    }, projects[0]);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await ready(page);
    const launcher = page.locator('.case-chat-launcher');
    const dialog = page.locator('.case-chat-dialog');
    const close = dialog.getByRole('button', { name: 'Close build explorer', exact: true });
    const chat = dialog.locator('.case-build-explorer');
    const supportsMotion = await page.evaluate(() => window.__buildMotionSupported);
    const supportsExitMotion = await page.evaluate(() => window.__buildExitMotionSupported);
    await launcher.press('Enter');
    await expect(close).toBeFocused();
    if (supportsMotion) {
        await expect.poll(() => page.evaluate(() => window.__buildMotionRecords.length)).toBe(1);
        const entry = await page.evaluate(() => window.__buildMotionRecords[0]);
        expect(entry.runningViewTransitions, JSON.stringify(entry.viewTransitionDetails)).toBe(0);
        expect(entry.animations.some(animation => animation.property === 'transform' && animation.duration === 200)).toBe(true);
        expect(entry.translateX).toBeGreaterThan(0);
        expect(entry.translateX).toBeLessThan(entry.width);
        await page.screenshot({ path: info.outputPath('case-build-drawer-entry-midpoint.png') });
        await page.evaluate(() => window.__resumeBuildMotion());
    }
    await expect.poll(() => dialog.evaluate(node => node.getAnimations().some(animation => ['running', 'paused'].includes(animation.playState)))).toBe(false);
    await rightHandDrawer(page);

    await page.evaluate(() => { window.__captureBuildMotion = false; });
    // Close is focused when the layout changes, then disappears in the rail.
    // The visible collapse control becomes the keyboard continuation point.
    await page.setViewportSize({ width: 1440, height: 900 });
    const collapse = chat.locator('.case-build-collapse');
    await expect(close).toBeHidden();
    await expect(collapse).toBeFocused();
    await collapse.press('Tab');
    const input = chat.getByRole('textbox', { name: 'Question for Project Chat' });
    await expect(input).toBeFocused();
    await expect(chat.locator('.case-build-composer')).toHaveCSS('outline-style', 'solid');
    await expect(input).toHaveCSS('outline-style', 'none');
    const clear = chat.getByRole('button', { name: 'Clear chat history', exact: true });
    await clear.press('Enter');
    await expect(chat.getByRole('button', { name: 'Yes', exact: true })).toBeFocused();
    await chat.getByRole('button', { name: 'No', exact: true }).press('Enter');
    await expect(clear).toBeFocused();
    await expect(chat.getByText('A saved build conversation', { exact: true })).toBeVisible();
    await clear.press('Enter');
    await expect(chat.getByRole('button', { name: 'Yes', exact: true })).toBeFocused();
    await chat.getByRole('button', { name: 'Yes', exact: true }).press('Enter');
    await expect(input).toBeFocused();
    await expect(chat.getByText('A saved build conversation', { exact: true })).toHaveCount(0);

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(launcher).toBeFocused();
    await launcher.press('Enter');
    await expect.poll(() => dialog.evaluate(node => node.getAnimations().some(animation => ['running', 'paused'].includes(animation.playState)))).toBe(false);
    await rightHandDrawer(page);
    await page.evaluate(() => { window.__captureBuildMotion = true; });
    await close.press('Enter');
    if (supportsExitMotion) {
        await expect.poll(() => page.evaluate(() => window.__buildMotionRecords.length)).toBe(2);
        const exit = await page.evaluate(() => window.__buildMotionRecords[1]);
        expect(exit.phase).toBe('exit');
        expect(exit.animations.some(animation => animation.property === 'transform' && animation.duration === 200)).toBe(true);
        expect(exit.translateX).toBeGreaterThan(0);
        expect(exit.translateX).toBeLessThan(exit.width);
        await page.screenshot({ path: info.outputPath('case-build-drawer-exit-midpoint.png') });
        await page.evaluate(() => window.__resumeBuildMotion());
    }
    await expect(dialog).toBeHidden();
    await expect(launcher).toBeFocused();
    await info.attach('drawer-native-motion', {
        body: JSON.stringify(await page.evaluate(() => ({ supported: window.__buildMotionSupported, exitSupported: window.__buildExitMotionSupported, records: window.__buildMotionRecords })), null, 2),
        contentType: 'application/json',
    });
    await noOverflow(page);
});

test('desktop explorer docks once at the reading inset without replaying on conversation changes', async ({ page }, info) => {
    await page.addInitScript(() => {
        window.__buildDockAnimations = 0;
        document.addEventListener('animationstart', event => {
            if (event.animationName === 'case-build-dock' && event.target.matches('.case-build-header')) {
                window.__buildDockAnimations++;
            }
        }, true);
    });
    await page.route('**/api/askGPT', route => route.fulfill({ json: { answer: 'A short docked answer.', sources: [] } }));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await ready(page);
    const dialog = page.locator('.case-chat-dialog');
    const chat = page.locator('.case-build-explorer');
    const input = chat.getByRole('textbox', { name: 'Question for Project Chat' });
    const startScroll = await page.evaluate(() => window.scrollY);
    const anchor = await page.locator('.case-chat-anchor').boundingBox();
    const initialInset = await dialog.evaluate(node => parseFloat(getComputedStyle(node).top));
    expect(anchor.y).toBeGreaterThan(initialInset);
    await expect(dialog).not.toHaveAttribute('data-docked', 'true');
    expect(await chat.evaluate(node => getComputedStyle(node, '::before').height)).toBe('56px');
    expect(await page.evaluate(() => window.__buildDockAnimations)).toBe(0);

    const details = page.getByRole('heading', { name: 'Project details', exact: true });
    await details.evaluate(node => node.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await expect(dialog).toHaveAttribute('data-docked', 'true');
    await expect.poll(() => page.evaluate(() => window.__buildDockAnimations)).toBe(1);
    await expect.poll(() => chat.evaluate(node => getComputedStyle(node, '::before').height)).toBe('80px');
    expect(await chat.evaluate(node => getComputedStyle(node, '::before').backgroundColor)).toBe('rgb(52, 211, 153)');
    await expect.poll(() => chat.locator('.case-build-header').evaluate(node => node.getAnimations().some(animation => animation.playState === 'running'))).toBe(false);
    // Navbar compaction changes its measured height. Compare the panel with
    // the settled current inset rather than a height captured before scrolling.
    await expect.poll(() => page.getByRole('banner').getByRole('navigation').evaluate(node => node.getAnimations({ subtree: true }).some(animation => animation.playState === 'running'))).toBe(false);
    const inset = await dialog.evaluate(node => parseFloat(getComputedStyle(node).top));
    const dockedTop = (await dialog.boundingBox()).y;
    expect(Math.abs(dockedTop - inset)).toBeLessThan(2);
    const advance = await page.evaluate(() => {
        const article = document.querySelector('.work-studio-case').getBoundingClientRect();
        const sidebar = document.querySelector('.case-chat-dialog').getBoundingClientRect();
        return Math.min(120, Math.max(0, article.bottom - sidebar.bottom - 24));
    });
    expect(advance).toBeGreaterThan(24);
    await page.evaluate(distance => window.scrollBy({ top: distance, behavior: 'instant' }), advance);
    expect(Math.abs((await dialog.boundingBox()).y - dockedTop)).toBeLessThan(2);
    await page.screenshot({ path: info.outputPath('case-build-docked-desktop.png') });

    await input.fill('Question while reading');
    expect(await page.evaluate(() => window.__buildDockAnimations)).toBe(1);
    await chat.getByRole('button', { name: 'Ask', exact: true }).click();
    await expect(chat.getByText('A short docked answer.', { exact: true })).toBeVisible();
    await input.fill('A follow-up draft');
    expect(await page.evaluate(() => window.__buildDockAnimations)).toBe(1);
    await expect(dialog).toHaveAttribute('data-docked', 'true');
    await noSidebarOverflow(page);

    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    await expect.poll(() => page.evaluate(() => document.querySelector('.case-chat-dialog').getBoundingClientRect().bottom
        <= document.querySelector('footer').getBoundingClientRect().top + 1)).toBe(true);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(chat).toHaveCSS('animation-name', 'none');
    await expect(chat.locator('.case-build-header')).toHaveCSS('animation-name', 'none');
    expect(await chat.evaluate(node => getComputedStyle(node, '::before').transitionDuration.split(',').every(value => parseFloat(value) === 0))).toBe(true);
    await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), startScroll);
    await expect(dialog).not.toHaveAttribute('data-docked', 'true');
    await details.evaluate(node => node.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await expect(dialog).toHaveAttribute('data-docked', 'true');
    await expect(chat).toHaveCSS('animation-name', 'none');
    expect(await chat.evaluate(node => getComputedStyle(node, '::before').height)).toBe('80px');
    expect(await page.evaluate(() => window.__buildDockAnimations)).toBe(1);

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(dialog).not.toHaveAttribute('data-docked', 'true');
    await page.locator('.case-chat-launcher').press('Enter');
    await rightHandDrawer(page);
    expect(await chat.evaluate(node => getComputedStyle(node, '::before').display)).toBe('none');
    await expect(input).toHaveValue('A follow-up draft');
    await noOverflow(page);
});

test('docking cannot flash an outer scrollbar and short explorers retain wheel and keyboard scrolling', async ({ page }) => {
    await page.addInitScript(() => {
        window.__pausedBuildHeader = false;
        document.addEventListener('animationstart', event => {
            if (event.animationName !== 'case-build-dock' || !event.target.matches('.case-build-header')) return;
            const animations = event.target.getAnimations().filter(animation => animation.animationName === 'case-build-dock');
            animations.forEach(animation => { animation.pause(); animation.currentTime = 0; });
            window.__pausedBuildHeader = animations.length > 0;
            window.__resumeBuildHeader = () => animations.forEach(animation => animation.play());
        }, true);
    });
    const longAnswer = Array.from({ length: 30 }, (_, index) =>
        `Paragraph ${index + 1}: The build keeps its project state and rendering work separate, with checks before each update.`).join('\n\n');
    await page.route('**/api/askGPT', route => route.fulfill({ json: { answer: longAnswer, sources: [] } }));
    await page.setViewportSize({ width: 1070, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await ready(page);
    const dialog = page.locator('.case-chat-dialog');
    const chat = dialog.locator('.case-build-explorer');
    const input = chat.getByRole('textbox', { name: 'Question for Project Chat' });
    await page.getByRole('heading', { name: 'Project details', exact: true }).evaluate(node => node.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await expect(dialog).toHaveAttribute('data-docked', 'true');
    await expect.poll(() => page.evaluate(() => window.__pausedBuildHeader)).toBe(true);
    await expect(chat).toHaveCSS('transform', 'none');
    expect(await dialog.evaluate(node => node.scrollHeight <= node.clientHeight)).toBe(true);
    await expect.poll(() => dialog.evaluate(node => Math.abs(node.getBoundingClientRect().top
        - document.querySelector('nav').getBoundingClientRect().bottom - 24))).toBeLessThan(2);
    await noSidebarOverflow(page);
    await page.evaluate(() => window.__resumeBuildHeader());

    await page.setViewportSize({ width: 1070, height: 700 });
    await expect(dialog).toHaveCSS('position', 'sticky');
    expect(await dialog.evaluate(node => node.scrollHeight > node.clientHeight)).toBe(true);
    expect(await dialog.evaluate(node => getComputedStyle(node).scrollbarWidth === 'none'
        || getComputedStyle(node, '::-webkit-scrollbar').display === 'none')).toBe(true);
    await chat.locator('.case-build-header').hover();
    await page.mouse.wheel(0, 400);
    await expect.poll(() => dialog.evaluate(node => node.scrollTop)).toBeGreaterThan(0);
    await input.focus();
    await input.press('Tab');
    await page.keyboard.press('Tab');
    const tools = chat.getByRole('button', { name: 'Ask across projects', exact: true });
    await expect(tools).toBeFocused();
    await expect(tools).toBeInViewport();
    expect(await tools.evaluate(node => {
        const button = node.getBoundingClientRect();
        const panel = node.closest('dialog').getBoundingClientRect();
        return button.top >= panel.top && button.bottom <= panel.bottom + 1;
    })).toBe(true);

    await input.fill('Explain the longer build');
    await chat.getByRole('button', { name: 'Ask', exact: true }).click();
    const transcript = chat.getByRole('log');
    await expect(chat.locator('.case-build-message--assistant')).toHaveCount(1);
    await expect(transcript).toHaveCSS('overflow-y', 'auto');
    expect(await transcript.evaluate(node => node.scrollHeight > node.clientHeight)).toBe(true);
    expect(await transcript.evaluate(node => getComputedStyle(node).scrollbarWidth)).not.toBe('none');
    await transcript.evaluate(node => { node.scrollTop = 0; });
    await transcript.hover();
    await page.mouse.wheel(0, 300);
    await expect.poll(() => transcript.evaluate(node => node.scrollTop)).toBeGreaterThan(0);

    await page.setViewportSize({ width: 390, height: 568 });
    await page.locator('.case-chat-launcher').press('Enter');
    await expect(dialog).toBeVisible();
    expect(await dialog.evaluate(node => node.scrollHeight > node.clientHeight)).toBe(true);
    expect(await dialog.evaluate(node => getComputedStyle(node).scrollbarWidth)).not.toBe('none');
    await dialog.evaluate(node => { node.scrollTop = 0; });
    await dialog.getByRole('button', { name: 'Close build explorer', exact: true }).hover();
    await page.mouse.wheel(0, 300);
    await expect.poll(() => dialog.evaluate(node => node.scrollTop)).toBeGreaterThan(0);
    await noSidebarOverflow(page);
    await noOverflow(page);
});
