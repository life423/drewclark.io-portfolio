const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests/ui',
    timeout: 45000,
    expect: { timeout: 10000 },
    fullyParallel: true,
    workers: 3,
    reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
    use: {
        baseURL: process.env.UI_TEST_URL || 'http://127.0.0.1:3201',
        headless: true,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [
        { name: 'chrome', use: { browserName: 'chromium', channel: 'chrome' } },
        { name: 'edge', use: { browserName: 'chromium', channel: 'msedge' } },
        { name: 'firefox', use: { browserName: 'firefox' } },
        { name: 'webkit', use: { browserName: 'webkit' } },
    ],
    webServer: process.env.UI_TEST_URL ? undefined : {
        command: 'node server.js',
        url: 'http://127.0.0.1:3201/api/health',
        reuseExistingServer: false,
        env: { PORT: '3201', APP_VERSION: 'ui-test', OPENAI_API_KEY: '', MONGODB_URI: '' },
    },
});
