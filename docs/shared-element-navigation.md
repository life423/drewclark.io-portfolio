# Project navigation review — November 23, 2026

The user asked to study the [Lovable shared-element reference](https://lovable.dev/projects/fc2a0780-bd84-49f7-a350-8dab73021999)
and apply advanced components only where useful. Their follow-up was explicit:
**"we don't want anything too busy."** Preserve this restraint in future work.

## Scope and current status

Work is on `codex/shared-element-project-details`, branched from `bf12fe7`
on `codex/project-card-expand`. This branch is not a production release.

| Interaction | Decision |
| --- | --- |
| Existing card hover lift | Retained, with fine-pointer and reduced-motion gating. |
| Gallery to case study | Added a 240 ms shared title/artwork-frame transition, reversed by All projects. |
| Next and related projects | Direct navigation, with deliberate keyboard focus. |
| 3D tilt and cursor glare | Omitted: practical project text/actions benefit from a steady surface. |
| Other showcase effects | No added dock, magnetic controls, text scrambling, or persistent decoration. |

The reference's useful idea is continuity. The existing case-study layout and
responsive Explorer remain the destination; this change does not introduce an
additional project modal or redesign the page. The title retains identity while
the artwork frame expands. Different overview/detail assets may crossfade; they
are not presented as one identical bitmap. Offscreen parts and unloaded
destination images are excluded from the moving destination snapshots.

## Behavior and implementation

- Native View Transitions are an enhancement, with no new dependency. Reduced
  motion and unsupported browsers use immediate navigation with the same focus
  and scroll handling. The implementation follows the
  [same-document transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using).
- The rest of the page switches directly. It does not join a page-wide fade.
- Opening focuses the case-study heading; Next keeps its own focus. All projects
  restores focus to the **current** project's card, including after cycling.
  The heading's visible focus ring is reserved for keyboard navigation; pointer
  activation still transfers focus without adding an outline to the title.
- Return restores the gallery's scroll position at the same viewport size when
  the current action is still visible. Rotation or selecting another project
  brings the current card's action into view instead.
- Scrolling occurs inside the DOM-update callback, before the new snapshot;
  there is no competing smooth-scroll animation.
- Resize or motion-preference changes skip active motion. New navigation
  supersedes pending callbacks. Cleanup is guarded by navigation ownership so
  a prior finished promise cannot erase the next transition's shared names.
- Live/source/download links retain their independent native behavior.

Source: `app/src/hooks/useProjectViewTransition.js`, `ProjectsContainer.jsx`,
`ProjectOverviewRow.jsx`, `ProjectCaseStudy.jsx`, and `work-studio.css`.

## Verification

The production build passes. Targeted real-browser checks cover all four
projects, phone/tablet/desktop sizes, Enter/Space, touch activation, return
position, Next focus, native snapshot uniqueness, reduced motion, an unavailable
native API, delayed detail artwork, rotation/resize, and interrupted navigation.
`tests/ui/project-transition.spec.cjs` also captures native motion paused at
120 ms and its settled result for a long phone title and desktop artwork.

Final focused run: **42/42 pass** in installed Chrome, installed Edge and
Playwright WebKit against the final production build. The preceding broader
portfolio regression run passed **108/108** across those three engines, including
11 responsive sizes from 320x568 through 1920x1080, artwork, gallery layout,
Explorer/chat success/loading/error fixtures, menu/contact dialogs and rotation.
That broader run preceded the final cleanup-ownership and pointer-focus refinements;
the final focused run covers both refinements. Earlier targeted coverage passed
33/33 before adding the midpoint/interruption cases. The midpoint capture harness
initially targeted an artwork child covered by the stretched native button; it
was corrected to click the card at the same artwork coordinates before the final
run. These were test-target timeouts, not application navigation failures.

Rendered 390x844 phone, 768x1024 tablet and 1440x900 desktop states were inspected,
as were actual native 120 ms snapshots and settled states at 320x568 and
1440x900. Long title wrapping, image framing and surrounding navigation remain
legible; the selected elements move without an additional modal, spotlight or
page-wide fade. No horizontal overflow or page errors occurred on the tested
paths. Keyboard and pointer focus cues were checked separately.

`git diff --check` and JavaScript syntax checks pass. Local Firefox was not run
in this pass; see the existing Windows runtime limitation in
`docs/portfolio-ui-validation.md`. Chat regression responses are fixtures; local
API credentials are absent, so neither the live AI service nor production
performance was validated. The local review server is `http://localhost:3203`.

## Design review and remaining limits

Conservative review heuristics for this bounded interaction: usability 9,
hierarchy 9, consistency 9, responsiveness 9, feedback 9, accessibility 8,
performance 8. These are not user-study measurements or full-site scores.

Prioritized follow-ups:

1. Check heading announcements and return navigation with physical-device screen
   readers and Safari/Android touch input. Automated focus checks and WebKit
   emulation do not establish full WCAG 2.2 AA compliance.
2. Measure production Core Web Vitals and frame timing on lower-powered phones.
   The local checks do not establish LCP, INP or CLS thresholds. Existing image
   optimization remains useful; animation must not wait for a heavy poster.

No additional effects are needed to address these verification limits.

The later [Build Explorer validation](build-explorer-validation.md) records the
current sidebar/drawer changes and final 51-case combined run. Opening its native
dialog safely ends and awaits active shared motion; modal CSS prevents stale
root snapshots from painting over the drawer.
