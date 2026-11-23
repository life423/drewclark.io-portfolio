# Case-study navigation - November 23, 2026

The user annotated All projects and Next and requested a more polished
implementation. Both keep their familiar outlined pill, native button behavior
and the established mint/charcoal palette. This branch is not a release.

## Behavior

- One shared stylesheet gives both controls a 48px minimum height, 16px side
  padding, 8px icon spacing and the same typography and focus treatment.
- Outlines continue to match visible text through `currentColor`, including
  hover and press. Hover brightens the text and introduces a quiet green fill;
  pressing gives a darker fill and a small inset shadow. The targets stay still.
- Only the direction icon moves, by 1.5px, on fine-pointer hover. Reduced motion
  removes icon movement and transitions. Touch needs one tap and no hover state.
- The visible labels, Next destination's accessible name, native activation,
  current-card return and existing navigation focus ownership are preserved.
  Both actions are always available; no artificial disabled/loading state is added.
- Navigation wraps naturally when text is enlarged instead of clipping labels.
  Other page buttons, image treatments and Explorer behavior are unchanged.

## Verification

The production build passes. The final focused run passed **24/24** in installed
Chrome, installed Edge and Playwright WebKit, against the production build at
localhost:3203. This includes 15 dedicated cases and nine existing checks for
outline/text color consistency, touch rotation/resizing and action feedback.

Dedicated coverage checks 320x568, 768x1024 and 1440x900 layouts; 48px targets;
icon alignment; all four projects and wraparound; Enter/Space and current-card
focus restoration; hover/press/focus feedback without target movement; touch;
reduced motion; and 200% root text size on a 320px phone. Rendered phone, tablet,
desktop, pressed and keyboard-focus screenshots were inspected, including
Chrome and WebKit layouts. Artifacts are in ignored
`data/case-study-navigation-final/`.

Scoped ESLint has no errors, with existing component prop-validation warnings.
Whitespace checks pass. This is not a whole-site accessibility audit or a
physical-phone test. No field performance claim is made.

Internal review heuristics: usability 9, hierarchy 9, consistency 9,
responsiveness 9, feedback 9, accessibility 8, performance 8. Prioritized
follow-ups are physical screen-reader/device review of the complete navigation
flow, then hosted performance measurements. These are review judgments, not
measured quality scores or a claim of top-percentile ranking.
