# Remove Essay Training Feature and Enforce Long-Form Level 3 Fill-Drill

This ExecPlan is a living document and must stay in sync with `.agent/PLANS.md` at every edit. Update the sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` the moment something changes so a brand-new contributor can resume work using only this plan and the repo.

## Purpose / Big Picture

Learners should focus on interactive Q&A drills instead of the legacy "✍️ 論文トレーニング" mode, and Level 3 fill-drill blanks must require almost the entire answer to be rewritten in the learner's own words. After this work the case page will only surface story, QA list, and speed quiz content, and selecting Level 3 in the fill-drill UI will expose large textarea-style blanks plus backend prompts that demand long-form grading and template generation. Running the server (`npm start`) and opening any case will show the absence of essay tabs and the expanded Level 3 experience.

## Progress

- [x] (2025-02-15 03:40Z) Collected repo context and confirmed scope (current state only, no edits yet).
- [ ] Milestone 1 — Remove all essay training UI/backend artifacts.
- [ ] Milestone 2 — Enforce long-form Level 3 templates, inputs, and grading.
- [ ] Milestone 3 — Documentation tidy-up and validation passes (build + smoke test).

## Surprises & Discoveries

- None yet; populate as work proceeds with evidence (logs, screenshots, test output) when unexpected behavior appears.

## Decision Log

- Decision: Keep historical `caseData.essay` fields in module files untouched and simply ignore them in the app.
  Rationale: Avoid mass-editing hundreds of case modules while still fulfilling the requirement of "removing" the feature from runtime behavior.
  Date/Author: 2025-02-15 / GitHub Copilot

## Outcomes & Retrospective

Fill this in once milestones close to summarize net wins, open questions, and lessons.

## Context and Orientation

The Express backend (`server.js`) generates fill-drill templates, grades answers, and persists study progress via `/api/qa-progress`. The main UI for cases lives in `public/pages/casePage.js`, which renders tabs for story, QA, speed quiz, and the soon-to-be-removed essay mode. Essay submissions currently flow through `public/pages/answerOverlay.js` and `public/chatSystem.js`. Fill-drill rendering and interactions reside in `public/qaFillDrillSystem.js`, with supporting UI in `public/qaRenderer.js`. Documentation in `README.md` and `AGENTS.md` still references the essay feature. No automated tests exercise these paths, so manual browser smoke tests plus `npm run build` are our acceptance gates.

## Plan of Work

Milestone 1 removes essay traces end-to-end. Update `public/pages/casePage.js` to drop any `essay` tab markup, initialization hooks, and routing logic so tab switching ignores essay entirely. Delete or neutralize `initializeEssayContent`, essay-specific DOM containers, and buttons (both ✏️ and ✍️ variants). In `public/pages/answerOverlay.js` and `public/chatSystem.js`, rip out essay-only overlays, fetches, and prompt builders; ensure any shared helpers gracefully handle `currentCaseData.essay` being undefined. On the backend, strip essay-related prompt handlers (e.g., `systemRole === 'legal_essay_corrector'`) and storage glue that assumed `essay: null` placeholders so saving study records no longer touches essay blocks. Confirm that no user-facing strings mention "論文トレーニング" or "essay" afterward, apart from historical data structures intentionally left untouched.

Milestone 2 focuses on Level 3 rigor. In `server.js`'s `getLevelGuidance`, `buildTemplatePrompt`, and grading prompt logic, strengthen wording so Level 3 templates must consolidate blanks into two or three 30–120 character blocks that cover entire reasoning chains and forbid short blanks. In `public/qaFillDrillSystem.js`, detect `level === 3` when rendering blanks: switch to multiline `<textarea>` inputs with enforced minimum length (e.g., 80 characters) and optional word-count hints. Add client-side validation before grading to require each Level 3 blank to exceed the minimum; surface friendly error chips otherwise. Enhance any inline hints (e.g., `LEVEL_PRESETS`) to describe the new expectation, and expose a character counter per blank. Update `public/qaRenderer.js` if it mirrors the presets or instructions shown elsewhere. Finally, ensure grading requests include the richer context so AI feedback remains aligned with the stricter prompt.

Milestone 3 tidies documentation and verifies behavior. Sweep `README.md`, `AGENTS.md`, and any module creation guides for essay references, replacing them with Level 3 guidance blurbs as needed. Run `npm run build` from the repo root to rebuild case indexes and ensure there are no lint/runtime issues. Start the server with `npm start`, open a representative case in the browser, confirm the essay tab is gone, and interact with Level 3 to see long-form blanks plus validation. Record findings in `Outcomes & Retrospective` along with any follow-up bugs.

## Concrete Steps

1. Remove essay UI in `public/pages/casePage.js`:
    * Delete all `data-tab="essay"` buttons, `tab-essay-content` DOM nodes, and `initializeEssayContent` references.
    * Collapse essay-related helper functions and ensure default tab selection skips essay.
2. Prune essay overlays:
    * In `public/pages/answerOverlay.js`, delete essay modal builders, event listeners, and submission wiring.
    * Remove associated CSS classes if they only served the essay feature.
3. Drop essay chat backends:
    * Strip `essay` cases from `public/chatSystem.js` (no essay prompts, no `type === 'essay'`).
    * In `server.js`, delete essay prompt builders, AI role handling, and storage insertions tied to `essay: null` markers.
4. Enforce Level 3 long-form server logic:
    * Update `getLevelGuidance` and `buildTemplatePrompt` to explicitly demand 2–3 large blanks, each 30–120 characters, with structured introductions.
    * Ensure `buildGradingPrompt` references the stricter rubric, highlighting minimum length expectations for Level 3.
5. Enforce Level 3 long-form client logic:
    * In `public/qaFillDrillSystem.js`, render Level 3 blanks as auto-growing textareas, attach per-blank counters, and block grading until each meets length constraints.
    * Surface inline warnings near offending blanks.
    * Adjust `LEVEL_PRESETS` captions and any onboarding text to mention the new requirement.
6. Documentation + validation:
    * Update `README.md` (and module-building guides like `MODULE_CREATION_PROMPT_LONG.md`) to remove essay mentions and describe Level 3 behavior.
    * Run `npm run build` then start the app via `npm start` to smoke test removal and Level 3 flows.
    * Capture observations in `Progress` and `Surprises`.

## Validation and Acceptance

Validation requires two manual checks plus the build script:

1. From the repo root, run `npm run build`. Expect it to finish without errors; the script prints "✅ Case index generated" today.
2. Run `npm start`, open `http://localhost:3000`, navigate to any case (e.g., the first entry under ブックマーク). Confirm only story/QA/speed-quiz tabs remain and no "論文トレーニング" copy exists.
3. Within the QA section, open a fill-drill card, switch to Level 3, and verify that:
    * Inputs are multiline textareas with character counters.
    * Attempting to grade with fewer than the minimum characters raises a clear error without hitting the server.
    * After satisfying the limits, grading proceeds and returns feedback referencing the stricter rubric.

Acceptance criteria are satisfied when all three checks pass and no source file references the essay feature outside of legacy data structures.

## Idempotence and Recovery

UI removals are pure deletions guarded by feature detection, so re-running any script or reloading the page is safe. If Level 3 validation becomes too strict, adjust the constants in `public/qaFillDrillSystem.js` and `buildTemplatePrompt`—both will pick up changes on reload. Backend prompt edits are stateless; restarting `npm start` reloads them. If `npm run build` fails after edits, revert the last change or inspect newly-added syntax errors reported in the terminal.

## Artifacts and Notes

Record the following once available:

    npm run build
    # ...expected success log...

    npm start
    # ...server listening on port...

    Browser log or screenshot summary proving Level 3 validation and essay removal

## Interfaces and Dependencies

The plan touches only first-party modules:

- `server.js` expresses HTTP routes and AI prompt builders. Functions to modify include `getLevelGuidance`, `buildTemplatePrompt`, `buildGradingPrompt`, and any essay-specific helpers.
- `public/pages/casePage.js` controls tab rendering and initialization. Expect to edit `renderTabs`, `initializeTabContent`, and delete `initializeEssayContent`.
- `public/pages/answerOverlay.js` currently uses `currentCaseData.essay` to build overlays; this file should retain only QA/speed overlays.
- `public/chatSystem.js` dispatches chat prompts by `session.type`; remove the `essay` branch so only supported types remain.
- `public/qaFillDrillSystem.js` renders the inline worksheet and manages grading. Introduce textarea input rendering and validation thresholds here.
- Documentation lives in `README.md` and `MODULE_CREATION_PROMPT_LONG.md`; edit relevant paragraphs to reflect the new Level 3 expectations.
