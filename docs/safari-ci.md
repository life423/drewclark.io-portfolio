# Safari checks

`Portfolio browser checks` runs on pull requests, pushes to `main` and manual dispatch. Its Ubuntu job retains Chrome, Edge and Firefox. A separate `macos-15` job runs:

- The complete Playwright WebKit suite, including phone/tablet/desktop layouts, header clearance, resizing, enlarged text, project navigation and mocked chat behavior.
- A focused check in the runner's actual Safari browser through its bundled SafariDriver. This checks header clearance, return to top, narrow/short windows, 200% text, mobile menu behavior and portfolio/Blog link destinations.

The Safari check records the browser version, measured viewport dimensions, screenshots and driver/server logs in the `safari-test-results` artifact. Safari's desktop minimum window size means this is **desktop Safari coverage**. Playwright WebKit supplies exact mobile viewports; it is not the shipping Safari browser. Neither check replaces a physical iPhone test with mobile browser chrome or an embedded browser such as Telegram.

The macOS job avoids the Ubuntu font/media dependency downloads that previously timed out. It installs only the WebKit build associated with the repository's pinned Playwright version. Safari and its matching driver are supplied by the hosted runner. Tests run an isolated local server with OpenAI and MongoDB configuration cleared; chat tests mock the API, and the Safari smoke check never sends chat messages or opens external/download links.

To run the real Safari check on a Mac with Node dependencies and the production frontend build available:

```sh
safaridriver --enable
node scripts/check-safari.cjs
```

Enabling Safari automation may require administrator privileges. The script owns ports 3202 and 4444 and stops its child processes afterward. `npm run test:ui -- --project=webkit --workers=1` runs the WebKit checks separately. These browser jobs run alongside the existing deployment workflow; deployment gating is not changed here.

Sources: [Playwright CI guidance](https://playwright.dev/docs/ci), [Apple's SafariDriver setup](https://developer.apple.com/documentation/safari-developer-tools/macos-enabling-webdriver), [Apple's Safari WebDriver commands](https://developer.apple.com/documentation/webkit/macos-webdriver-commands-for-safari-12-and-later), and [GitHub's macOS runner inventory](https://github.com/actions/runner-images/tree/main/images/macos).
