# Responsive header clearance — November 21, 2026

## Observed defect

The iPhone screenshot showed the top of Drew Clark's name underneath a straight
band of navbar blur. The previous `h-18` class did not exist in this Tailwind
configuration, so the expanded header had a natural height of 84px on phones.
Hero top padding was only 64px when content determined the section height.
The regression reproduced a -20.2px gap at 390×664: the title was under the bar.
This is a layout overlap; the evidence does not establish a Safari compositor bug.

## Final behavior

The user requested responsive sizing rather than assumed header dimensions.
Navbar now keeps its content-driven height. A layout effect measures its actual
expanded height before paint, including any safe-area padding, and ResizeObserver
updates that measurement when the header's dimensions change. Hero top padding
uses that measurement plus a 1.5rem spacing token. There are no phone/desktop
header-height tables. The spacing scales with root text size.

The expanded reservation stays stable while scrolling compacts the navbar, to
avoid moving page content in response to the fixed bar's scroll state. Returning
to the top measures the expanded bar again. The drawer hides the entire bar with
a relative translation. The mobile menu keeps a minimum 44px target instead of
shrinking to 38px when scrolled. Existing visuals and project artwork are retained.

## Evidence

- Production build passes.
- The complete 81-case suite passed locally across Chrome, Edge and WebKit,
  covering existing project/chat/menu interactions and 13 header cases per
  browser. Header sizes: 320×480, 375×600, 390×550, 390×664,
  390×844, 667×375, 767×800, 768×600, 1280×480 and 1280×800.
- Checks enforce at least 16px of heading clearance, before and after the reveal
  sequence, after scrolling back to the top, and during shortened browser viewports.
- Coverage includes rotation through portrait, landscape and the tablet
  breakpoint; natural header growth without a viewport change; project keyboard
  navigation; mobile menu/contact behavior; and touch navigation through rotation.
- After the final contrast adjustment, nine focused cases passed across the
  same browsers: phone/desktop header clearance and the outline action's hover,
  press, keyboard fill, scrolled foreground opacity and reduced-motion behavior.
- No added JSX lint errors relative to the existing baseline with JSX usage
  recognized. The new regression test passes ESLint and the diff passes whitespace checks.

Local WebKit tests run on Windows and do not reproduce physical iPhone Safari
hardware or the embedded browser's native toolbars. A macOS CI job now adds
WebKit and actual desktop Safari coverage; see `safari-ci.md`. The friend's
actual device should be rechecked after deployment. These changes have not been
deployed to the live site.

## Related requested updates

The Play Ascend-Avoid hero action retains its green outline at rest. A gradient
fills upward through green and teal into blue over 420ms, followed by a single
subtle shine. Dark lettering is clipped to match the rising fill so both sides
of the transition remain readable. Hover, keyboard focus and press share the
fill; reduced motion removes the fill transition and shine. The old scroll fade
now affects the decorative background rather than fading the text and controls.
Dark text against the blue gradient's darkest stop has approximately 6.4:1
contrast at full opacity.

CudaRL's overview and details now link to `https://cudarl.drewclark.io` and the
Windows `v0.1.0-preview.2` Tadpole Pond installer. The website and installer HEAD
requests returned HTTP 200. The installer was not downloaded or executed.
The preview includes CPU learning with optional NVIDIA acceleration.

Rendered visual review covered 390px phone, 768px tablet and 1280px desktop
heroes. CudaRL actions were inspected at 320px and 768px with no horizontal
overflow; overview and detail actions have 44px minimum touch targets. Local
screenshots are saved under the ignored `data/ios-header-review/` directory.

## Review

Internal heuristics for this fix: usability 9, hierarchy 9, consistency 9,
responsiveness 9, feedback 9, accessibility 8, performance 8. These are not
measured design-quality scores or a full-site accessibility certification.

Prioritized follow-ups: check actual iPhone Safari and the embedded browser's
portrait/landscape, browser-toolbar and text-size behavior; finish the broader
drawer focus-trap/return-focus audit; measure hosted rendering and Core Web Vitals
before making performance claims. Existing text/compositing effects can be
investigated separately if visual defects persist after the confirmed overlap fix.
