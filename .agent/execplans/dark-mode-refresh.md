# Dark mode refresh and background fixes

This ExecPlan is a living document and must be maintained in accordance with `.agent/PLANS.md`. Update the `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` sections as work advances.

## Purpose / Big Picture

Bring back the intended airy sky aesthetic with animated clouds, restore comfortable horizontal spacing around the main UI, and rebuild dark mode so the interface stays consistent while retaining existing subject/rank color cues. After these changes, loading `public/index.html` via `npm start` will show (1) clouds that feel like a backdrop instead of a giant block, (2) side gutters that keep content centered on large screens, and (3) a dark-mode toggle that yields a cohesive palette across panels, overlays, and inputs while badges keep their legacy colors.

## Progress

- [x] (2024-11-24 05:30Z) Captured requirements and authored this ExecPlan with repo orientation and implementation outline.
- [x] (2024-11-24 06:10Z) Reworked background gradient, fixed-positioned the cloud layer, and reset body spacing so the sky elements stay behind the UI.
- [x] (2024-11-24 06:15Z) Reintroduced responsive side gutters via `.main-container` width constraints and padding clamps.
- [x] (2024-11-24 06:25Z) Defined shared light/dark tokens in `public/css/modern-design.css` and refactored cards, inputs, overlays, and inline CSS to consume them.
- [ ] (—) Verify in the browser (or via screenshots) that light + dark themes meet the acceptance criteria; document evidence and update Outcomes.

## Surprises & Discoveries

- Observation: The inline stylesheet inside `public/index.html` contained several hundred lines of hard-coded dark-mode overrides with mojibake characters, which caused syntax issues when partially removed.
    Evidence: Required deleting the legacy block en masse and replacing it with a compact token-driven section to satisfy the linter.

## Decision Log

- Decision: Centralize all theme tokens and dark-mode palettes inside `public/css/modern-design.css`, leaving only essential component tweaks in `public/index.html`.
    Rationale: Ensures both light/dark styles stay in sync, avoids duplicate overrides, and keeps subject/rank badge colors untouched by scoping tokens to neutral surfaces.
    Date/Author: 2024-11-24 / GitHub Copilot

## Outcomes & Retrospective

Summarize the observed results once validation is complete. Note any regressions or follow-up tasks.

## Context and Orientation

The entry point lives at `public/index.html`, which loads Tailwind via CDN, injects inline styles, and toggles dark mode by adding `dark-mode` to `<body>`. Background visuals and layout polish come from `public/css/modern-design.css`, while animated clouds originate from `public/cloudSystem.js`. The main application renders into `#app`, and many UI fragments (answer sheets, overlays, article references) inherit styles from both Tailwind utility classes and bespoke CSS. Existing dark-mode overrides inside `index.html` became unwieldy, so the goal is to centralize palette tokens and drastically reduce selector duplication.

## Plan of Work

Describe the intended sequence of edits:

1. Inspect `public/css/modern-design.css` to understand current background, `.cloud-layer`, and `.main-container` styles. Adjust positioning, height, and padding so clouds never obstruct content and the body regains horizontal gutters on wide displays.
2. In `public/index.html`, keep only the CSS that truly needs to live inline (e.g., toggle placement). Migrate general-purpose styling into `public/css/modern-design.css` for maintainability.
3. Introduce CSS custom properties (color tokens) at the `:root` level, paired with dark-mode overrides on `body.dark-mode`. Tokenize backgrounds, surfaces, borders, and text colors used by answer sheets, overlays, forms, chat bubbles, embed cards, and modals. Preserve subject/rank badge colors by scoping tokens only to neutral surfaces.
4. Refactor component classes (answer areas, correction comments, overlays, article reference buttons, embed containers, modals) to consume the tokens instead of hard-coded values. Remove redundant `body.dark-mode` selectors that are superseded by the token system.
5. Ensure `.main-container` (and any wrappers defined in JS) apply the new padding/margin rules so the user sees restored side margins even before the SPA renders content.
6. Validate visually by running the dev server (`npm start`) and toggling dark mode. Confirm clouds remain in the background, gutters exist, and all major components pick up the new palette without altering subject/rank colors. Capture notes/screenshots for the Outcomes section.

## Concrete Steps

1. From the repo root `c:\Users\PC_User\Desktop\Atashinchi-study`, install dependencies if not already done:

    npm install

2. Start the dev server to preview changes:

    npm start

3. With the server running, open the app in a browser (default is usually `http://localhost:3000/`). Toggle dark mode and inspect the main container, answer sheets, overlays, and embed cards while scrolling to ensure clouds stay behind content.

Update this section if additional scripts or linters become necessary.

## Validation and Acceptance

Acceptance requires verifying these behaviors manually in the browser:

- Light mode shows the sky gradient plus animated clouds as a subtle backdrop; no giant white block covers the UI, and the main container keeps consistent left/right padding on desktop.
- Dark mode toggling results in cohesive panel, input, and overlay colors taken from the new tokens, while subject/rank badge colors remain unchanged.
- Article reference buttons, blank buttons, and modals look legible in both themes without losing their brand gradients.
- There are no layout shifts or console errors when switching themes or resizing the viewport.

Document the verification steps and observations in the Outcomes section once completed.

## Idempotence and Recovery

CSS and HTML edits are idempotent; rerunning the steps replaces the same blocks safely. If a change causes regressions, restore the branch from version control or revert individual files using `git checkout -- <path>`. The dev server can be stopped with `Ctrl+C` and restarted anytime.

## Artifacts and Notes

Add short diffs, screenshots, or log snippets here once available—for example, the snippet showing token definitions or the console output from `npm start`.

## Interfaces and Dependencies

No new third-party libraries are required. The work relies on standard CSS features (custom properties, pseudo-elements) and the existing Tailwind CDN bundle already referenced in `public/index.html`. The dark-mode toggle script adds/removes a `dark-mode` class on `<body>`, so all theme-specific rules must key off that class or consume the defined tokens.

_Updated 2024-11-24 06:30Z: Logged completed background/gutter/token work and the decision to keep them in `modern-design.css`._
