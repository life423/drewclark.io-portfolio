# Case-study build explorer - November 23, 2026

## User decisions and scope

The user selected the supplied "Explore the build / Follow your curiosity"
sidebar reference, with better brand colors and deliberate spacing. They then
requested removal of the horizontal scrollbar, a mobile drawer that is clearly
different from the global navigation drawer, complete Send-button feedback with
an accent color, and a more intentional feeling when the sidebar becomes sticky.
After reviewing an interactive drawing, the user approved the subtle mint
background parallax, explicitly keeping controls steady and preventing the
outer scrollbar from returning.

Their earlier direction still applies: keep the interface quiet and apply the
design fundamentals before effects. The CipherCraft picture's possible light
green tint is explicitly deferred; this pass does not change any project image.

Changes are on `codex/shared-element-project-details`, alongside the
shared-element navigation work. This is not a deployed release.

## Resulting behavior

- The case-study companion sits on the same neutral charcoal as the page, with
  a quiet structural rule and a short bright green leading segment. Mint marks
  exploration and focus; orange identifies Send. There is no enclosing card.
- The header shows the current project. Three questions grounded in each
  project's existing description appear before the composer. Once a conversation
  begins, the transcript takes their place. Source links remain conditional on
  actual matching code returned by the API.
- The form keeps a native multiline textarea and the 500-character limit, with
  accessible instructions instead of a visible counter. Enter/Shift+Enter add
  lines; Ask submits. A required field prevents empty requests. An all-projects
  question scope remains available through a quiet explicit action.
- Send uses the existing orange palette: #FF7A33 at rest, #FF9B66 on pointer
  hover, #E66000 and a 1px press on activation, and a visible orange keyboard
  outline. Pending requests disable the button, change its label/state and show
  a readable progress message. Reduced motion removes press displacement.
- The desktop rail is 20-25rem wide, keeping the existing reading column and
  responsive layout. The divider belongs to the column; the panel scrolls
  normally, pins 24px below the actual navigation, and leaves with the case
  study. A ResizeObserver measures the compact/enlarged navigation without
  changing the hero's expanded-height reservation. At the reading inset, a
  stationary IntersectionObserver sentinel marks the docked state. The small
  header changes opacity over 180ms once, and the green segment extends from
  56px to 80px. No header or control translation remains.
- A mint radial wash at 14% maximum opacity moves from 0 to at most 48px over the
  case-study reading progress. It sits behind the content in an absolute,
  stationary, paint-contained clip. The moving child contributes no size or
  scrollable overflow, including when the Explorer is collapsed. It is hidden
  in drawer/short-desktop layouts; reduced motion retains a static accent.
  The divider, questions, composer, focus rings and hit targets stay steady.
- `useCaseStudyDepth` schedules at most one pending animation frame after actual
  scroll/resize changes, reads article geometry, then writes one deduplicated CSS
  offset. It adds no React scroll state, easing, trailing drift or idle loop.
  Project changes, image/content resizing and navbar-height changes recalculate
  progress through the panel's full pinned interval. Motion preference, layout
  changes, visibility and unmount cancel
  pending frames; disabled modes reset the offset. Nested chat scrolling does
  not drive the parallax. In a short desktop scroll container, the localized
  wash naturally scrolls with its content.
- Below 900px, the Explorer is a right-hand drawer, up to 26rem wide and the
  dynamic viewport's full height. Its labeled chat trigger stays within thumb
  reach. The existing global Menu opens on the left and retains its own branding.
  Opening the Explorer dismisses the site Menu; the page is inert while that
  Menu is open. The Explorer has its own "Close build explorer" action.
- The opaque drawer moves with a transform-only 200ms transition where supported,
  following the
  [native dialog transition pattern](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog#animating_dialogs).
  Installed Chrome and Edge animate entry and exit. The tested Playwright WebKit
  animates entry but closes immediately because it lacks CSS overlay-transition
  support. Reduced motion uses immediate state changes. Short desktop windows
  retain a centered dialog; roomy windows use the reading-side companion.
- Opening during a shared-element transition skips that transition and awaits
  its finished promise before showing the native dialog. Modal CSS hides stale
  root snapshots so they cannot paint over the drawer. Request ownership,
  project identity, connection and layout checks prevent a delayed handoff from
  opening a superseded drawer.
- The same chat stays mounted between rail and drawer. Drafts, per-project/global
  history, pending requests and late-answer isolation are preserved. Escape
  restores launcher focus and reading position. If a focused Close button
  disappears on desktop resize, focus moves to a visible Explorer control.
- Keyboard starter activation moves focus into the conversation without opening
  a phone keyboard. Clear confirmation receives focus, cancellation restores
  Clear conversation, and clearing returns to the composer.

The horizontal overflow came from the header control's negative right margin.
That margin was removed and internal scroll dimensions are checked directly;
horizontal clipping is a final container guard, not a substitute for fitting
the content. Composer borders use #71717A against #202023 for a discernible
unfocused editable boundary. Textarea keyboard focus has one group outline.

The user subsequently reported an intermittent vertical bar at the outer edge.
This was reproduced in Chrome at 1070x900 and 1440x900: moving the entire panel
down 3px increased the dialog's scroll height by 3px. Moving only the header
removed that overflow; the approved parallax pass subsequently removes header
translation too. Short laptop windows can still legitimately need more
vertical room, so the desktop outer scroll container hides its scrollbar while
preserving wheel and keyboard scrolling. Transcript and mobile drawer scroll
indicators remain available. Do not replace this with `overflow: hidden`, which
would make lower controls unreachable. The browser checks below preceded this
follow-up; its focused verification is recorded separately.

The parallax pass also caught a collapsed-state overflow: the 80px docked green
marker exceeded a 56px collapsed panel. Its maximum height is now bounded by the
Explorer's height, preserving the normal 56-to-80px cue only where it fits.

## Verification

The production build passes. Before the scrollbar follow-up, the focused run passed **51/51** across
installed Chrome, installed Edge and Playwright WebKit: eight sidebar cases and
nine shared-transition cases per engine. It includes the final docking, focus,
opaque drawer and transition-handoff changes.

The preceding broader regression run passed 172/174. Its two WebKit failures
were test assumptions: exit animation was expected without CSS overlay support,
and a cold-image transition source was outside the viewport. The final run uses
the actual exit capability and scrolls the source into view, and passes both
paths. An earlier complete Chrome run passed 56/56 before the final refinements.
These counts describe separate runs, not a full final 174-case pass.

Rendered all four desktop sidebars, 390x844 phone, 768x1024 tablet, 844x390
landscape, docked desktop and native drawer motion midpoints were inspected.
Final captures confirm a stable reading column, a short green leading cue,
legible hierarchy and an opaque moving drawer. Send hover, press, keyboard focus
and pending states were inspected. No internal horizontal overflow or page
errors occurred on the tested paths; narrow desktop widths include 988 and
1070px. Reduced motion disables the docking and drawer animations.

`git diff --check` and relevant JavaScript syntax checks pass. Browser chat tests
use API fixtures; live AI service behavior is not validated without local
credentials. Physical devices, assistive technology and production Core Web
Vitals remain unverified. The local review server is `http://localhost:3203`.

Automated coverage lives in `tests/ui/case-study-sidebar.spec.cjs` with existing
portfolio, card-interaction and shared-transition regression suites. It covers
all four projects, scoped question payloads and history, sources, loading/error
recovery, clear behavior, Enter/Shift+Enter, native field validation, 44px targets,
internal horizontal overflow, input focus, menu/drawer separation, mobile
rotation, draft preservation, reduced motion and native motion snapshots.

### Scrollbar follow-up verification

The current build passes. The combined sidebar/transition run passed 51/54;
the remaining three instances of the existing docking test compared against
navbar height captured before its compaction finished. Its expectation now
waits for the real navbar to settle and reads the current inset. A rerun first
caught an ambiguous navigation selector, then the final **6/6** focused checks
passed in Chrome, Edge and WebKit with the selector scoped to the page banner.
No production code changed between these browser runs. All 54 combined cases
have passing coverage across these runs; this is not a single 54/54 final run.

The new regression pauses the actual header animation at its first frame and
checks that the outer dialog has no animation-induced overflow. It verifies the
24px navigation gap, unchanged full-panel transform, real wheel scrolling in a
1070x700 laptop viewport, keyboard access to lower tools, independent scrolling
of a long answer, and a scrollable 390x568 phone drawer. Phone/tablet/desktop
screenshots and the final docked desktop capture were inspected. The full-column
divider stays stable and the panel retains its width. Reduced-motion coverage
continues to pass. Syntax and whitespace checks pass.

The conservative review scores and physical-device/accessibility/performance
follow-ups below still apply. This fixes the observed local scrollbar defect;
it does not establish device-wide accessibility or production performance.

### Approved parallax implementation

Source: `app/src/hooks/useCaseStudyDepth.js`, `CaseStudyExplorer.jsx`,
`work-studio.css` and `case-study-chat.css`. The whole article supplies progress;
only the clipped decorative child receives the transform. The test contract in
`tests/ui/case-study-parallax.spec.cjs` checks computed transforms alongside
actual control rectangles and scroll dimensions, rather than trusting a CSS
variable alone.

The initial parallax build passed **54/54**
existing sidebar/shared-transition cases and **9/9** focused parallax cases in
installed Chrome, installed Edge and Playwright WebKit. The new tests verify all
four projects, less than 1px control-position change during pinned reading,
computed background movement bounded to the configured limit, collapsed-panel scroll dimensions,
1070x700 outer scrolling/keyboard access, loading and long answers, long source
filenames, reduced motion, drafts, phone/tablet drawers and layout changes.
Both the outer panel and the inner transcript are checked for horizontal
overflow. Initial test setup was corrected to wait for existing navbar/view
transitions to settle, and to exercise short-window outer scrolling while the
introductory panel actually exceeds the viewport; an answered panel can fit.

Phone, tablet, desktop, short-window scrolling and long-source renders were
inspected. The faint wash matches the approved drawing, stays behind readable
content and is absent from the drawer. The 135-character source filename wraps
inside its link without a horizontal bar. Final focused artifacts are under
ignored `data/case-study-depth-final/`; existing regression artifacts are in
`data/case-study-depth-regression/`.

At the wash's maximum 14% alpha over #18181B, the calculated contrast remains
5.03:1 for #A1A1AA secondary text and 8.73:1 for #D4D4D8 body text. This checks
this background treatment, not full-site accessibility. Scoped ESLint has zero
errors with existing component warnings; JavaScript syntax and whitespace
checks pass. Physical-device/assistive-technology and field-performance limits
below remain open. Chat tests still use API fixtures. No image asset is changed.

### Parallax visibility follow-up

The user could not perceive the initial effect. Inspection of their actual open
1071x1253 preview confirmed that the expected build was loaded, reduced motion
was off and the wash had already reached its 12px maximum. The original soft
wash moved too little, and using viewport height ended its progress before the
panel finished its pinned reading interval.

The first visibility adjustment capped travel at 32px with the same 9% tint. Progress uses article height
minus the actual panel height, continuing until the case-study end reaches the
panel's bottom. Controls, clip geometry, opacity and drawer/reduced-motion rules
are unchanged. The build passes; final focused runs pass **9/9** parallax cases
and **6/6** docking/scrollbar cases across Chrome, Edge and WebKit. Every project
now requires more than 1px of computed wash movement per tested 120px page scroll,
with less than 1px control drift and no trailing change after scrolling stops.
Artifacts are in `data/case-depth-visibility/` and
`data/case-depth-visibility-regression/`. Perceived subtlety still needs the
user's judgment; passing geometry checks alone do not establish visual impact.

### Clearer mint contour

The user still found that adjustment too difficult to see and explicitly asked
for a little more visibility while keeping controls still and the bar absent.
The current version uses 48px maximum travel, 14% maximum alpha and a narrower
soft ellipse (100% horizontal/36% vertical radii, 18% solid center fading to
transparent at 72%). This makes one existing contour easier to follow without
adding shapes, animated opacity, a moving border or moving controls. It remains
right weighted so most text stays over neutral charcoal.

The production build passes. The final focused runs pass **9/9** parallax cases
and **6/6** existing docking/scrollbar cases in Chrome, Edge and WebKit. The
parallax suite still checks all four projects' actual control rectangles,
computed background displacement, stopped motion, collapsed and short-window
overflow, source links, drafts, reduced motion and responsive drawers.
At the same half-way scroll position, before/after renders were compared at
1071x1253; current 900px and 1440px desktop widths, phone, tablet and long-source
states were also inspected. Panel scroll and client dimensions remain equal
when content fits. Evidence is under ignored `data/case-depth-emphasis/`,
`data/case-depth-emphasis-tests/` and `data/case-depth-emphasis-regression/`.
The contrast calculation above reflects this stronger treatment. It remains
local preview work; perceived strength awaits the user's review.

### Layer-visibility audit and scope affordance

The user suspected that another surface covered the parallax. The source audit
found no opaque full-panel cover: the roomy native dialog, chat root, header,
questions and transcript are transparent. The isolated dialog contains the
negative-z decorative layer above its own background. The composer and other
individual controls intentionally have opaque backgrounds.

Inspection of the user's actual open in-app browser found an older bundle,
`index-DXZ8gBhg.js`, with the broad 9% wash. It had not received the later 48px,
14% treatment being verified in fresh automated browser pages. The preview was
refreshed and the selected case study reopened; its computed opacity and
gradient then matched the current build. Reduced motion and forced colors were
off, and its 1071x1253 viewport qualified for the desktop effect. This was a
stale-view verification failure, not an identified opaque-cover code defect.
Future local-preview reviews must check the actual open tab after a rebuild.

An independent same-geometry Chrome pixel audit at 1071x1253 compared the real
sidebar with only the wash's visibility switched off. Of the 320x654 crop,
24,393 pixels showed a meaningful green-tinted difference (at least 3 green
levels), with a peak green-channel change of 30. A test-only opaque background
over the chat made the same comparison yield exactly zero changed pixels.
This establishes visible paint and confirms that the audit detects occlusion;
it does not establish that every visitor will perceive subtle motion. Raw
captures, computed styles and statistics are in ignored
`data/case-depth-paint-audit/`.

The new rendered-pixel regression passes **3/3** in Chrome, Edge and WebKit.
Their 345x643 crops contain respectively 26,545 / 26,517 / 27,463 green-tinted
pixels and a peak green-channel difference of 30. Restoring the wash reproduces
the measured contribution. A temporary opaque chat background yields exactly
zero changed pixels in all three engines, proving the test detects occlusion.
The test decodes actual PNG captures with a bounded browser-screenshot helper
using only Node's zlib; its result also matches the independent Pillow audit.
Current screenshots and statistics are in `data/case-depth-painted-pixels/`.

The user's additional request makes the scope-switch button visibly clickable
at rest: dedicated `case-build-scope` styling uses 14px mint text, a persistent
underline and the existing 44px target. Its native behavior, focus, labels and
draft preservation remain; Clear conversation retains its quiet styling. The
production build and **3/3** scope-flow checks pass in Chrome, Edge and WebKit;
desktop and phone renders were inspected under
`data/case-build-scope-affordance/`.

### Clearer mobile chat controls

The user clarified that the mobile launcher should communicate that it opens
chat. Its visible label is now **Open project chat**, with a message-circle
icon. At the user's subsequent request, only that icon uses the existing
orange accent (#FF7A33); the label and outline remain mint. The companion's
internal **Explore the build** heading and **Build
explorer** dialog name remain. The former visible Close label becomes a simple
20px X inside a 44px circular mint/charcoal control, consistent with the site's
hamburger treatment; its accessible name is still **Close build explorer**.

The close control stays sticky, with safe-area and focus-outline clearance.
Both controls retain native button behavior, visible keyboard focus and
restrained hover/press feedback. Reduced motion removes their transitions.
This changes labels and presentation, not drawer navigation or chat mechanics.
The coordinated production build passes. Final focused runs pass **39/39**
sidebar/parallax cases plus **12/12** affected portfolio/card cases across
Chrome, Edge and WebKit. They include the visible launcher name, icon-only
close control's accessible label and 44px square target, Escape and return focus,
drafts, rotation, short windows, reduced motion, painted pixels and overflow.
Current phone and tablet renders were inspected. Artifacts are in
`data/case-chat-explicit-controls/` and
`data/case-chat-explicit-controls-existing/`.

The actual open in-app preview was refreshed again after this rebuild and the
case study reopened. It reports `index-CD7vOWIu.js`, the 14% wash, the new launcher
label, empty visible close text with its accessible name preserved, and the
mint scope action with a persistent underline. This checks the user's open tab,
in addition to fresh automated browser contexts. No production deployment was
performed.

The orange-icon follow-up passes the production build. Fresh 393x852 touch-browser
captures show the closed launcher and open drawer; the icon computes to
rgb(255,122,51), the X remains 44x44px, and panel scroll width equals client
width. Tapping the X restores the launcher. This small color change was checked
with actual rendered captures rather than another full regression run.

The user then requested the hamburger's more pressable appearance for the X.
Its resting surface now matches the actual compact Menu: charcoal 700/90 to
800 gradient, gray 600/40 border, green 400 icon and a small outer shadow, with
a faint inset top highlight. Hover/press shadows provide feedback without
moving its 44px target. The production build, JSX-aware scoped lint (no errors)
and **6/6** focused phone/drawer-motion cases pass across Chrome, Edge and WebKit.
A fresh 393x852 touch render confirms matching Menu/X gradient and icon colors;
the updated drawer was visually inspected. Evidence is in
`data/case-chat-raised-close/`. Existing structural and prop-validation lint
warnings remain; the file-local JSX annotations recognize imports used in JSX.

### Pull-request browser corrections

The first PR #61 run exercised all four engines. It caught a spacing assertion
that measured the chat inside the new 1px divider instead of the column edge;
the test now checks the same strict 32px gap at the rail's border box. Firefox
also reported `scrollbar-width: none` on the inner transcript. The transcript
now explicitly uses `thin`, retaining its own scroll affordance while the outer
desktop panel keeps its hidden scrollbar and wheel/keyboard access.

The production build and **9/9** focused spacing, scrollbar and long-source
checks pass in Chrome, Edge and WebKit. Their rendered long-answer states were
inspected. The open responsive preview was refreshed to `index-DhqZB4oX.js` and
its selected CudaRL case study restored after confirming its drafts were empty.
The full Linux/macOS matrix, including Firefox and native Safari, is tracked in
[PR #61](https://github.com/life423/drewclark.io-portfolio/pull/61).

## Review and limits

Conservative internal heuristics for this bounded interface: usability 9,
hierarchy 9, consistency 9, responsiveness 9, feedback 9, accessibility 8,
performance 8. These are not measured user-study results or full-site scores.

Prioritized follow-ups for the sub-9 areas:

1. Verify physical iOS/Android keyboards, screen-reader announcements, text
   enlargement and drawer focus behavior. Browser emulation and local focus
   assertions do not establish full WCAG 2.2 AA compliance.
2. Measure field Core Web Vitals and lower-powered-device frame timing. The
   IntersectionObserver avoids per-scroll React updates, but local browser
   checks do not establish production performance or image-download quality.

Keep the CipherCraft tint as separate future work, with visual comparison before
changing that artwork's color treatment.
