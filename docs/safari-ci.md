# Safari checks

`Portfolio browser checks` runs on pull requests, pushes to `main` and manual dispatch. Its Ubuntu job retains Chrome, Edge and Firefox. A separate `macos-15` job runs:

- The complete Playwright WebKit suite, including phone/tablet/desktop layouts, header clearance, resizing, enlarged text, project navigation and mocked chat behavior.
- A focused check in the runner's actual Safari browser through its bundled SafariDriver. This checks header clearance, return to top, narrow/short windows, 200% text, mobile menu behavior and portfolio/Blog link destinations.

The Safari check records the browser version, measured viewport dimensions, screenshots and driver/server logs in the `safari-test-results` artifact. Safari's desktop minimum window size means this is **desktop Safari coverage**. Playwright WebKit supplies exact mobile viewports; it is not the shipping Safari browser. Neither check replaces a physical iPhone test with mobile browser chrome or an embedded browser such as Telegram.

The macOS job avoids the Ubuntu font/media dependency downloads that previously timed out. It installs only the WebKit build associated with the repository's pinned Playwright version. Safari and its matching driver are supplied by the hosted runner. Tests run an isolated local server with OpenAI and MongoDB configuration cleared; chat tests mock the API, and the Safari smoke check never sends chat messages or opens external/download links.

## Footer keyboard navigation

Safari's default Tab policy can skip links. The macOS WebKit footer test uses
Option+Tab (`Alt+Tab` in Playwright) to assert the complete native sequence:
Twitter → GitHub → copy-email. Chrome, Edge and Firefox use plain Tab. This
matches [Apple's keyboard-navigation guidance](https://support.apple.com/guide/safari/keyboard-shortcuts-and-gestures-cpsh003/mac)
and [the Playwright maintainers' recommended gesture](https://github.com/microsoft/playwright/issues/5609).

The Windows Playwright WebKit port also skips native links with Tab, but does
not provide the Mac's Option+Tab alternative. That behavior reproduces with
bare HTML, without React or the site's styles. Its test explicitly verifies
the native Twitter → copy-email traversal. A separate test runs on every
browser and checks all three controls' visible focus rings, both links'
Enter-key activation through intercepted popup destinations, and copy-email's
Enter-key action and feedback. No footer elements receive artificial tabindex
attributes, and no keyboard assertions are skipped.

Full three-control traversal is therefore covered by WebKit on macOS, where
shipping Safari runs, rather than inferred from the Windows test engine. OS
keyboard-navigation preferences also affect buttons in WebKit; the runner's
macOS job explicitly enables them with
`defaults write org.webkit.Playwright AppleKeyboardUIMode -int 2`, scoped to
the test browser on the disposable runner. Application markup is unchanged.
[Playwright's platform-preference discussion](https://github.com/microsoft/playwright/issues/41808)
explains this Safari-aligned behavior and the test-browser setting.

## Run locally

To run the real Safari check on a Mac with Node dependencies and the production frontend build available:

```sh
safaridriver --enable
node scripts/check-safari.cjs
```

Enabling Safari automation may require administrator privileges. The script owns ports 3202 and 4444 and stops its child processes afterward. `npm run test:ui -- --project=webkit --workers=1` runs the WebKit checks separately. These browser jobs run alongside the existing deployment workflow; deployment gating is not changed here.

Sources: [Playwright CI guidance](https://playwright.dev/docs/ci), [Apple's SafariDriver setup](https://developer.apple.com/documentation/safari-developer-tools/macos-enabling-webdriver), [Apple's Safari WebDriver commands](https://developer.apple.com/documentation/webkit/macos-webdriver-commands-for-safari-12-and-later), and [GitHub's macOS runner inventory](https://github.com/actions/runner-images/tree/main/images/macos).
