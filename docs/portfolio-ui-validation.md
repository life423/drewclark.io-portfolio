# Portfolio UI release review — October 27, 2026

## Final behavior

- Natural image proportions at full detail width, with image links in a separate
  footer so they never cover the artwork. Source dimensions reserve image space.
- Full-color BEST poster in Ascend-Avoid details; simplified emerald/teal artwork
  in overview and compact cards. An unused complete emerald poster is retained
  in `artwork/` for future review.
- Selected details, a short row of other projects and chat follow one vertical
  flow on desktop, avoiding the previous tall sidebar/empty column.
- Header Next control cycles all four projects, wrapping last to first. Bottom
  navigation remains available, with at least 44px-high targets.
- One selected project survives responsive breakpoint changes. Hero actions stack
  on narrow phones; the hero grows when needed on short landscape screens.
- Outlined Play Ascend-Avoid action fills on hover/focus/press and respects reduced
  motion. The overview introduction is one sentence.

## Verification

The reproducible Playwright suite is `tests/ui/portfolio.spec.cjs` and runs against
the Express server serving the production build, not the Vite development server.
It covers 320×568, 390×844, 844×390, 768×1024, 1023×768, 1024×768,
1280×800, 1440×900 and 1920×1080.

Local Windows checks use installed Chrome 156.0.8078.49, installed Edge
157.0.4341.16 and Playwright WebKit 27.2. Tests cover all four projects at every
size; keyboard Enter/Space/focus, last-to-first wrapping, natural image dimensions,
horizontal overflow, compact-row spacing, touch navigation and rotation, desktop
resizing, hero hover/press/reduced-motion states, chat success/source links/loading
and recoverable failure, and menu/contact-dialog Escape behavior. Chat responses
are controlled fixtures and do not validate the live AI service.

The Windows Firefox runtime fails before launch with a side-by-side assembly
error, including after reinstalling the runtime. The pull-request browser workflow
runs all four browser projects on Linux; merge must wait for that result.

Rendered phone, tablet and desktop screenshots were inspected. The production
build passes. Scoped ESLint comparison
against the base commit reports no added errors when JSX usage is recognized;
the repository-wide lint baseline has existing errors and is not a green check.

## Review limits and follow-ups

These are conservative design-review heuristics, not measured user-study scores:
usability 9, hierarchy 9, consistency 9, responsiveness 9, feedback 9,
accessibility 8, performance 8. Remaining recommendations, in order:

1. Audit the older navigation/drawer/chat controls for consistent 44px touch
   targets and complete focus trapping/restoration. This pass verifies the new
   project control and the tested keyboard paths, not full WCAG 2.2 AA compliance.
2. Generate smaller responsive encodings for the new PNG artwork while retaining
   the full-size originals. The current card master is about 2.2 MB and the detail
   poster about 2.4 MB; they are lazy-loaded, but slower connections still benefit
   from derivatives. No field LCP/INP/CLS claim is made from local tests.
3. Check Safari on physical iOS/macOS hardware and Android browser/keyboard behavior
   on real devices. WebKit and touch emulation do not prove every device/browser.

The local HTTP WebKit issue found in this pass was caused by CSP's
upgrade-insecure-requests directive. It is now disabled for local development;
the production container retains it under NODE_ENV=production.
