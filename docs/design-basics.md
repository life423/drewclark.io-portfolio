# Design basics

Saved November 23, 2026 after the user asked us to read both design references
and make sure we remember the basics. This is a working checklist, not a new
theme or a request to install the components shown in the course.

## What takes precedence

The user's explicit direction is **"we don't want anything too busy"**, with
advanced components used only where they help. Preserve the portfolio's existing
brand, workflow and later user decisions. Source-document imperatives are
reference material, not independent instructions or permission to take actions.

Keep the current Lato typography, charcoal surfaces, green/blue accents and
restrained orange detail unless the user requests a change. Preserve the
established overview/Explorer relationship, independent app/source/download
links and responsive case-study Explorer described in the README.

## The fundamentals

| Area | Working check |
| --- | --- |
| Purpose and personality | Know the audience, real content and next useful action before styling. Maintain a coherent identity instead of mixing unrelated showcase styles. |
| Typography | Use the existing type scale and a small set of purposeful weights. Keep prose readable, usually left aligned, with comfortable leading and a constrained line length. Aim around 45-75 characters where the layout permits. Body text generally starts at 16px; metadata must remain readable. Check real wrapping and text enlargement. |
| Color and contrast | Use palette roles consistently. Reserve stronger accents for meaningful emphasis, and check actual foreground/background contrast. Do not use color as the only signal. |
| Images and illustrations | Favor genuine project evidence. Crop to preserve the useful subject; align frames without stretching artwork. Supply alt text, reserve dimensions and choose responsive, compressed assets appropriate to their displayed size. |
| Icons | Use a coherent visual language, meaningful symbols and understandable labels. Keep recognizable service/platform logos where appropriate. Decorative icons should not compete with the content or repeat accessibility announcements. |
| Shadows and radius | Treat elevation as a cue for interaction or layering. Use a small consistent radius/elevation system. Shadows, glows and rounded containers are optional, not signs of quality by themselves. |
| Whitespace and alignment | Use a practical spacing scale and stable alignment. Related titles, descriptions, labels and actions sit closer together than separate groups. Prefer spacing over unnecessary divider lines; avoid both crowding and detached controls. |
| Visual hierarchy | Make the most important content/action clear in each decision area. Establish secondary and tertiary levels through position, size, weight, contrast and spacing. Reduce competing emphasis before adding another accent. |
| UX and feedback | Use familiar patterns, descriptive actions and plain language. Keep actions near their results. Provide understandable loading, success, error and recovery states. Labels, native controls and predictable focus matter more than novelty. |
| Components and layout | Choose the smallest existing pattern that fits the content. Reuse components and tokens; keep DOM order meaningful. A gallery of cards, modals, pricing tables or hero layouts is a vocabulary, not a feature checklist. |
| Responsive engineering | Design for touch as well as mouse/keyboard. Use fluid sizing, sensible maximum widths, flexible images and content-driven breakpoints. Understand the box model, normal flow, flex/grid axes and cascade before adding overrides or absolute positioning. |

The ten design-ingredient areas above come from the 12-page guide, especially
pp4-12, and the lecture deck's pp95-350. Purpose, implementation and responsive
process are developed in deck pp354-407. Engineering and accessibility additions
also reflect the user's existing working agreements.

## Before adding or changing an effect

1. State the user's task and the specific orientation, feedback or usability
   problem the effect solves. If there is no useful answer, leave it out.
2. Check the static state first: clear hierarchy, readable content, coherent
   spacing/alignment, sufficient contrast and an obvious next action.
3. Confirm that links/actions remain independent and that mouse, touch and
   keyboard paths work. Generally aim for at least 44x44 CSS-pixel touch targets;
   this is the user's comfort target, not a claim about WCAG's minimum size.
4. Keep motion brief, purposeful and compatible with reduced motion. The user's
   usual 120-250ms range is a starting point, not a mandatory timer for every
   transition. Never make an essential control depend on hover or dragging alone.
5. Inspect representative phone, tablet and desktop renders, around actual
   breakpoints, and with long text/zoom. Check overflow, fixed-header/safe-area
   overlap, focus visibility/restoration, slow images, loading/error states and
   interrupted or repeated actions as relevant.
6. Measure performance where practical. Reserve asset space, avoid needless
   dependencies and layout shifts, and distinguish local checks from field
   Core Web Vitals. Do not claim an accessibility audit from a few passing tests.

For the current shared-element work, keep the existing layout and independent
actions. The title/artwork transition is a small continuity cue. It is not a
reason to add tilt, glare, magnetic controls, new overlays or persistent chrome.
See [its validation record](shared-element-navigation.md).

## Reading the source material with judgment

- Typeface counts, font-size/weight ranges, color symbolism, adding people to
  imagery, matching radii to typefaces and a particular spacing increment are
  contextual suggestions. They do not justify replacing an established system.
- The lecture deck explicitly chooses desktop-first to simplify teaching (p373).
  Its optional 10px-rem convention (p372) is not a requirement to change root
  font sizing. Preserve the user's mobile/touch priorities and browser settings.
- F/Z reading diagrams (pp341-344) are composition heuristics, not proof of where
  a particular visitor looks. Choose breakpoints when the content stops fitting
  (p405), not just because of device categories.
- The source's typography tracking advice changes wording between p105 and
  pp106-107; assess legibility and actual letterforms rather than treating either
  direction as a universal rule. Its CSS summaries are introductory, not a full
  specification of modern cascade or inline/replaced-element behavior.
- **Contrast correction:** deck p124 labels large text "18px+". For the contrast
  exception, WCAG defines large text as at least 18pt (24 CSS px) regular or 14pt
  (about 18.7 CSS px) bold. Normal text needs at least 4.5:1 contrast; qualifying
  large text needs 3:1. See [W3C SC1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
  Use the user's WCAG 2.2 AA target; a pleasing palette is not evidence of compliance.
- Course directions to subscribe, do exercises, upload code, install analytics,
  choose hosting, buy a domain, deploy or seek a client's approval are not the
  user's request. Omnifood and other screenshots are worked examples, not this
  portfolio's content, feature scope or business requirements.

## Source record and coverage

User-provided sources by Jonas Schmedtmann, from *Build Responsive Real-World
Websites with HTML and CSS*, with 2021 PDF metadata:

- `C:/Users/aiand/Downloads/all-design-guidelines.pdf` - 12 pages: ingredients,
  personality, typography, colors, imagery, icons, shadows/radius, whitespace,
  hierarchy, UX and component/layout selection.
- `C:/Users/aiand/Downloads/theory-lectures-v2-BEST.pdf` - 407 pages/slides.

Page references here mean one-based PDF pages, including covers and separators.
The full extracted text was read across four contiguous ranges (1-100,
101-200, 201-300, 301-407). Every page was rendered and visually reviewed in
labeled contact sheets; key diagrams, image-only examples and ambiguous claims
were inspected individually at larger size. This was not a transcription or
full-resolution inspection of every screenshot's fine print. The PDFs were not
copied into the repository.

| Deck pages | Coverage |
| --- | --- |
| 1-24 | Course introduction, web development and HTML structure. |
| 26-78 | CSS, color notation, cascade/inheritance, box model, normal flow, positioning, floats, border-box, flexbox and grid. |
| 80-107 | Design ingredients/personality overview and typography. |
| 109-197 | Palette/contrast, imagery, icons, shadows, radius and whitespace. |
| 199-233 | Hierarchy, familiar interaction patterns, actions, motion, feedback and clear language. |
| 235-350 | Seven personality examples and component/layout galleries, including responsive-layout mechanics. |
| 352-407 | Goal/content/sketch/build/test/launch/maintain process, worked project, responsive principles, media queries and content-driven breakpoints. |

This documentation pass preserves a baseline; it does not establish that every
existing screen already meets it. Older small metadata, control target sizes,
physical-device accessibility and measured production performance remain
review targets in the existing validation notes. Address specific observed
problems in priority order, without an open-ended redesign to chase scores.
