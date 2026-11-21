# One-shot hero tagline — November 21, 2026

The user approved a local preview of one sentence that types once and remains
visible. Mobile copy is “Software that solves real problems.” The existing
desktop copy remains “Building elegant solutions to complex problems.”
The existing 768px breakpoint controls which copy is displayed.

Both copies use the same character progression. Cursor movement no longer
selects sentences, and resizing or rotation never resets that progression.
Typing pauses offscreen and when the document becomes hidden. Reduced motion
reveals the complete sentence; turning motion back on does not replay it.
An invisible copy reserves final wrapping before typing begins, and assistive
technology receives the complete sentence separately from the animated text.
The caret disappears when typing finishes.

The Play button has no orange accent or play icon. Its resting outline remains
green, and its fill transitions from green through teal to blue. The single
shine is preserved.

## Verification

- Production build passes.
- 21 new behavior cases passed across Chrome, Edge and WebKit, covering phone
  and desktop copy, 60-second completed dwell, pointer movement, stable action
  positions, offscreen pause/resume, partial/completed resizing and reduced motion.
- The existing 81 cases passed across the same browsers, including five rerun
  after parallel runs collided in their report directory. Outputs were isolated;
  those failures were trace-file cleanup errors rather than failed page assertions.
- Three real background-tab cases were skipped because these headless engines
  report both tabs as visible. No synthetic visibility state was substituted.
  Real hidden-tab behavior remains a manual follow-up; its listener is implemented.
- Rendered review covered 320px and 390px phones, a 768px tablet and a 1280px
  desktop. The copy remained complete across resizing with no horizontal overflow.
  Final screenshots are in the ignored `data/hero-type-once/` directory.
- Scoped source/test lint and whitespace checks pass, with the existing Hero
  function-length warning. Existing whole-hero entrance and parallax effects
  remain; reduced-motion claims here apply to the tagline and button.

This document records the approved local preview. CI and release results are
recorded on the pull request.
Windows WebKit coverage does not certify physical iPhone Safari behavior.

## Review

Internal review heuristics: usability 9, hierarchy 9, consistency 9,
responsiveness 9, feedback 9, accessibility 8, performance 8. These are review
judgments, not measured quality scores. Follow up first with real screen-reader
and browser-tab visibility checks, then physical Safari review. Measure hosted
Core Web Vitals after release before making performance claims.
