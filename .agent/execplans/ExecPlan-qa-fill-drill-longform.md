# Enforce long-form Lv3 drills and clickable law references

This ExecPlan must be maintained according to `.agent/PLANS.md`. It explains how to remove the "学習のヒント" tips, ensure every law citation renders as a story-style button, and upgrade Level 3 fill-drill inputs so learners must write long-form answers.

## Purpose / Big Picture

Learners complained that Level 3 fill-drill prompts still show tiny blanks and that the feedback area shows informal character tips instead of law citations. After this work, the evaluation card will omit "学習のヒント", any text like "刑法238条" will auto-wrap as `【刑法238条】` and open the inline statute modal just like the story tab, and Level 3 blanks will become true long-form text areas with validation that enforces at least ~80 characters per blank before AI grading. This makes the fill-drill feature match the spec from ExecPlan remove-essay-and-lv3-upgrade.

## Progress

- [x] (2025-11-18 05:20Z) Drafted this plan, reviewed `public/qaFillDrillSystem.js`, and mapped the tip/evaluation/input hotspots.
- [x] (2025-11-18 05:32Z) Removed the "学習のヒント" suggestions block from `buildEvaluationBlock()` so only the summary card remains.
- [x] (2025-11-18 05:40Z) Added the loose-law auto-wrapper in `renderArticleRichText()` and kept `setupArticleRefButtons()` wiring intact.
- [x] (2025-11-18 05:48Z) Converted Level 3 blanks into textarea blocks with helper copy, `data-min-chars`, and opt-out of auto-resize.
- [x] (2025-11-18 05:55Z) Added the long-form validator that blocks grading when Lv3 answers are under the threshold.
- [ ] Run `npm run build` to ensure bundling still succeeds and update this plan+PR summary accordingly.

## Surprises & Discoveries

- None yet.

## Decision Log

- Decision: Auto-wrap loose text like "刑法238条" on the client before passing it to `processArticleReferences` so any fill-drill text automatically becomes a clickable law button even if Gemini forgets the `【】` delimiters.
	Rationale: Content authors and AI templates often omit brackets; wrapping them centrally ensures consistency without touching every data source.
	Date/Author: 2025-11-18 / Copilot Agent.

## Outcomes & Retrospective

- Pending implementation.

## Context and Orientation

Fill-drill UI lives in `public/qaFillDrillSystem.js`, which renders inline blanks (via `renderInlineWorksheet`), evaluation cards (`buildEvaluationBlock`), and hooks article buttons by calling `setupArticleRefButtons`. `renderArticleRichText` currently just escapes text and passes it to `processArticleReferences`, so it only buttonizes citations already wrapped in `【】`. The tips data is in `attempt.evaluation.suggestions`. Level 3 blanks reuse the same `<input>` elements as other levels, so they appear short even when instructions demand paragraphs. The backend template prompt already stresses long-form answers, but we need a frontend safety net. Validation occurs in `gradeLevel`, which posts to `/api/qa-fill/grade` via `ApiService`.

## Plan of Work

1. Remove the tips block from `buildEvaluationBlock` so the 🎉/🧠 summary only shows the avatar and summary paragraph. Confirm no other reference renders the suggestions array; if it does, strip or hide those as well. The data can remain in responses; we simply do not render it.
2. Enhance `renderArticleRichText` with a helper that detects loose strings such as "刑法238条" and wraps them in brackets before escaping. Build the candidate law list from `window.SUPPORTED_LAWS` or falling back to known defaults (民法, 刑法, etc.). Skip wrapping text already inside `【】`. Then call `processArticleReferences` so those tokens become `.article-ref-btn` buttons. Keep `setupArticleRefButtons(container)` invocation after renders so the new buttons behave exactly like the story tab.
3. Update `renderInlineWorksheet` so when `level === 3` (or when a blank signals `longForm: true`), it renders a full-width `<textarea>` with helper text, `data-require-longform="true"`, and `data-min-chars` (default 80). Remove `data-auto-resize="true"` for these controls and add a new class such as `inline-blank-textarea`. Wrap them in a block-level container with the label and optional evaluation indicator above the textarea.
4. Teach `autoResizeInlineInput`, `syncInlineInputWidths`, and `handleInput` to respect `data-auto-resize="true"` instead of assuming every `.inline-blank-input` needs width adjustments. This prevents textareas from being force-sized.
5. Add a method (e.g., `validateLevelRequirements`) that, when grading Level 3, checks every `[data-require-longform="true"]` input and blocks grading if `trim().length < data-min-chars`. Surface a concise Japanese notification that indicates which blank is short. Call this validator at the start of `gradeLevel` after collecting answers but before toggling the grading spinner.
6. Document a quick manual validation path (open any case, expand Q&A, run Level 3, ensure textareas and law buttons work) plus the automated `npm run build` command. Record results in `Validation and Acceptance`.

## Concrete Steps

1. Work inside `public/qaFillDrillSystem.js` to remove the suggestions markup and introduce the law-wrapping helper, textarea rendering, auto-resize guard, and validator method. Keep changes small and well-commented for future maintainers.
2. If additional shared utilities are needed, define them near `renderArticleRichText` for reuse. Avoid touching other files unless absolutely necessary.
3. After code edits, run `npm run build` from the repo root (`C:\Users\PC_User\Desktop\Atashinchi-study`). Observe that the case-index builder finishes successfully.

## Validation and Acceptance

- Manual: `npm start`, open any case, expand a Q&A item, click "Lv3" → expect textarea-style blanks with helper text. Enter fewer than 80 chars and click "AIで採点する" to see a notification blocking grading. Once 80+ chars are entered, the request should proceed and show normal evaluation without the tips block.
- Automated: `npm run build` should succeed with the usual "ケース件数" summary. No linter/test suite is available, so build + manual smoke serve as gates.

## Idempotence and Recovery

Edits are confined to the front-end JS module. Re-running the build or restarting the dev server is safe at any point. If a template or grading request fails, the UI already shows toasts; no persisted data is mutated during rendering, so refreshing the page restores the previous stable state.

## Artifacts and Notes

- To be populated with key diffs or output snippets once work progresses.

## Interfaces and Dependencies

- `public/qaFillDrillSystem.js` exports `qaFillDrillSystem`; maintain ES module syntax.
- `renderArticleRichText(value: string): string` must continue returning HTML with `.article-ref-btn` markup when `processArticleReferences` detects tokens. The new helper should not mutate existing markup outside those references.
- `<textarea>` controls should carry `data-blank-id` and `data-level` so existing handlers (`handleInput`, `collectAnswers`) continue working unchanged.
