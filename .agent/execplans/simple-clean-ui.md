# Simple, stable UI/UX refresh

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This plan must be maintained in accordance with `.agent/PLANS.md` in the repository root.

## Purpose / Big Picture

Learners should experience a calm, professional interface that feels reliable on every screen size. After this refresh ships, the app will load with a neutral background, simple typography, and consistent spacing. Primary actions, tabs, and cards will use a limited palette and restrained motion so the legal content stays in focus. Users can observe the change by running `npm start`, opening `http://localhost:3000`, and noting the simplified layout, predictable buttons, and absence of stray panels.

## Progress

- [x] (2025-11-16 06:30Z) Audit existing CSS/JS to map the components driving current visual noise and note required removals. *Done while drafting the minimalist theme and memo refresh; notes captured in repo history.*
- [x] (2025-11-16 06:30Z) Define the new design tokens (colors, typography, spacing), document them in `modern-design.css`, and ensure dark-mode counterparts exist. *Implemented via the new minimalist stylesheet (currently `modern-design-new.css`) with mirrored dark-mode tokens.*
- [x] (2025-11-16 06:30Z) Rebuild base layout sections (`body`, `.main-container`, header blocks) to remove clouds/background images and apply the new tokens. *Minimal theme is now live via `modern-design-new.css`, and the home hero/header was rewritten to match it.*
- [ ] (2025-11-16 06:30Z) Simplify key interactive components (cards, tabs, buttons, chat bubbles, memo panel) with consistent padding, border radii, and hover states.
- [ ] (2025-11-16 06:30Z) Remove unused/duplicative styles and verify no component references missing classes.
- [ ] (2025-11-16 06:30Z) Run `npm run build` (accepting known data-file failures) and `npm start`, then manually confirm the UI across desktop/mobile widths.
- [ ] (2025-11-16 06:30Z) Document validation notes and outstanding polish items in this plan’s Outcomes section.

## Surprises & Discoveries

- Observation: `npm run build` currently fails because multiple `public/cases/**` files contain invalid syntax (Unexpected token `|`, etc.).
  Evidence: Build log emitted on 2025-11-16 listing specific case file paths. These failures are outside the scope of the UI refresh; treat a failing build as expected until those data files are corrected.

## Decision Log

- Decision: Replace animated cloud/gradient background with a flat neutral surface and optional subtle texture provided via CSS variables, to reduce layout jank and keep focus on content.
  Rationale: The current `modern-design.css` animates backgrounds and injects multiple absolutely positioned layers that complicate scrolling performance; removing them aligns with the “simple and stable” requirement.
  Date/Author: 2025-11-16 / Copilot

- Decision: Keep the existing manual dark-mode toggle but restyle it using the new token palette so light/dark share the same component geometry.
  Rationale: Dark mode is already wired through JS and localStorage; reusing that logic reduces risk while still delivering the visual refresh.
  Date/Author: 2025-11-16 / Copilot

## Outcomes & Retrospective

_To be completed after implementation._

## Context and Orientation

The public frontend lives under `public/`. `public/index.html` includes Tailwind, dark-mode toggling logic, and links to `css/modern-design.css`, `css/answerOverlay.css`, and (after the latest memo fix) `css/memo.css`. All case-page behaviors are orchestrated by `public/pages/casePage.js`, while `public/pages/homePage.js` renders the home dashboard.

`public/css/modern-design.css` defines nearly all global and component styles, including background animations, cards, chat bubbles, and custom widgets. It currently spans ~1,200 lines with many gradients, shadows, and animations. The memo drawer uses `public/css/memo.css` plus dynamic markup from `public/memoSystem.js`. Simplifying the experience therefore centers on pruning and rewriting `modern-design.css`, along with small HTML or JS tweaks when markup needs new classes.

## Plan of Work

1. **Inventory current selectors.** Read `public/css/modern-design.css` (especially the first 500 lines) to note globals, components, and redundant rules. Note any JS modules that toggle CSS classes (e.g., `.dark-mode`, `.tab-button.active`).
2. **Define design tokens.** Introduce a minimal palette via `:root` variables: background, surface, border, primary/secondary text, accent, success/warning, spacing scale, and shadow tokens. Mirror them inside `body.dark-mode`. Remove unused tokens.
3. **Reset base layout.** Update `body`, `html`, `.main-container`, `.cloud-layer`, etc., to eliminate background images and animation keyframes. Use a simple solid or subtle gradient background and standard fonts. Ensure global typography (headings, paragraphs, lists) inherits from tokens.
4. **Rebuild shared components.** Simplify `.case-card`, `.tab-button`, `.btn`, `.chat-bubble`, `.ranking-card`, `.qa-panel`, `.answer-entry-section`, memo drawer classes, etc. Each should share consistent border radii (e.g., 16px), spacing (8/12/16/24px), and reduced shadow. Remove shimmer or animated pseudo-elements.
5. **Prune unused styles.** Delete animation keyframes, custom folder color utilities, or other selectors no longer referenced after the redesign. Cross-check by searching the codebase for each class before removing.
6. **HTML/JS alignment.** If any structural class names change, update `public/index.html`, `public/pages/homePage.js`, `public/pages/casePage.js`, and any other module that injects markup. Keep functionality identical (no feature removal) while ensuring markup uses available classes.
7. **Memo drawer restyle.** Update `public/css/memo.css` to match the new palette (or merge parts into `modern-design.css` if appropriate) so the memo UI feels native and unobtrusive.
8. **Validation.** Run `npm run build` (noting known failures) to ensure node-based tooling still runs. Then `npm start` and browse key pages at 1440px and 375px widths to confirm layout stability, button focus states, and dark-mode parity. Record any issues.

## Concrete Steps

1. `cd C:\Users\PC_User\Desktop\Atashinchi-study`
2. `npm run build` (expect case-file syntax errors; confirm no new UI-related errors appear).
3. Edit `public/css/modern-design.css`, `public/css/memo.css`, and any affected JS/HTML modules according to the plan.
4. `npm start` to launch the Express server. Visit `http://localhost:3000` (or the port shown in the console) to manually inspect the UI.
5. Use browser dev tools to toggle device widths and dark mode. Ensure focus outlines are visible and there are no console errors tied to the CSS/JS changes.

## Validation and Acceptance

- After `npm start`, navigating to the home page should reveal a neutral background, tidy cards, and simplified buttons without animated clouds or shimmering effects.
- Switching tabs and opening a case detail page should keep typography and spacing consistent; chat bubbles and QA panels must render with the new palette.
- The memo drawer should remain hidden until toggled and then slide in with the same styling language.
- Dark mode must preserve contrasts (WCAG AA for text on surfaces) and reuse identical spacing/border radii.
- Console and server logs should remain free of new warnings/errors.

## Idempotence and Recovery

Edits are confined to CSS and markup. Changes can be reapplied safely because the plan rewrites styles declaratively; re-running the steps overwrites the same sections. If a style regression occurs, revert the modified CSS/JS files (`git checkout -- public/css/modern-design.css ...`) and redo the edits following this plan. No data migrations or irreversible commands are involved.

## Artifacts and Notes

Capture before/after screenshots (desktop + mobile) and note them here once the refresh is complete. If specific selectors are removed, list them to aid future grep checks.

## Interfaces and Dependencies

No new npm packages are required. Continue using vanilla JS and CSS. Tailwind remains loaded globally, but this refresh focuses on custom CSS in `public/css/modern-design.css` and `public/css/memo.css`. Components manipulated in JS include:

    public/pages/homePage.js – renders dashboard cards, tabs, buttons.
    public/pages/casePage.js – constructs chat bubbles, QA panels, memo toggles.
    public/memoSystem.js – injects memo panel markup matching CSS classes.

Ensure any renamed classes stay in sync with these modules.
