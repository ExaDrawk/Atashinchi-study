# Rename mini essay label to 論文トレーニング

This ExecPlan is a living document and must be maintained according to `.agent/PLANS.md`.

## Purpose / Big Picture

Learners currently see the phrase "ミニ論文" throughout the case detail experience (tab buttons, empty states, chat overlays, tutor prompts). Product wants to standardize on the new label "論文トレーニング" while keeping the underlying functionality unchanged. After this change, every user-facing surface should display the new term, and the chat tutor should also verbally refer to the updated label when guiding essay practice.

## Progress

- [x] (2025-02-15 04:20Z) Documented every user-visible location that said "ミニ論文" (UI tabs, chat prompts, authoring docs) via recursive search.
- [x] (2025-02-15 04:45Z) Updated the case page tabs, fallback titles, and empty-state copy so all visible labels read "論文トレーニング".
- [x] (2025-02-15 05:05Z) Updated chat/tutor prompts (`public/chatSystem.js`, `public/data/characters.{js,txt}`, `public/eventHandler.js`) to use the new terminology.
- [x] (2025-02-15 05:25Z) Refreshed authoring docs/scripts (`MODULE_CREATION_PROMPT_LONG.md`, `js_to_txt_converter.py`, module settings) with the new vocabulary.
- [x] (2025-02-15 06:25Z) Re-ran the repo-wide search (excluding `public/cases/**`) and confirmed all remaining hits are intentionally scoped to case data/plan docs, then smoke-tested the server by launching `node server.js` for 10s (npm unavailable) with no boot errors.

## Surprises & Discoveries

- `npm` isn't available/valid in this Windows environment, so validation used `node server.js` directly (wrapped in a short-lived background job) to confirm the server still boots.

## Decision Log

- Decision: Leave `public/cases/**` comment banners ("// === ミニ論文問題") untouched for now because they are developer-only scaffolding and not rendered in the UI; rewriting hundreds of case files would add risk without user impact.
    Rationale: The runtime UI gets its labels from `casePage.js`/overlay/prompts, which we updated; case data comments would require bulk edits that may destabilize content generation scripts while providing no learner-visible benefit.
    Date/Author: 2025-02-15 / Copilot

## Outcomes & Retrospective

- ✅ All UI/prompt/doc surfaces now say "論文トレーニング" while schema fields like `miniEssayPrompt` stay untouched.
- ✅ Repo-wide search shows only developer-only `public/cases/**` and planning docs still mention the legacy term for context; no learner-facing surfaces do.
- ✅ Server boot smoke-test (10s run) succeeded using `node server.js`, giving confidence that the rename touched no runtime-critical logic.

## Context and Orientation

The feature spans the learner-facing SPA in `public/pages`, the shared chat system (`public/chatSystem.js`), and the character prompt definitions (`public/data/characters.js` & `.txt`). Essay answers use an overlay defined in `public/pages/answerOverlay.js`. Authoring documentation that module writers rely on lives in `MODULE_CREATION_PROMPT_LONG.md`, while `js_to_txt_converter.py` mirrors naming when converting authoring assets. All of these currently hard-code "ミニ論文" strings. We want to ensure learners, mentors, and authors see "論文トレーニング" everywhere, without changing data schema fields such as `miniEssayPrompt`.

`casePage.js` builds the tabs and fallback text. `answerOverlay.js` shows the heading "ミニ論文問題" when a quiz group lacks a title. `chatSystem.js` labels the chat session "📝 ミニ論文添削". Characters enforce special instructions that mention "ミニ論文" during scoring. We will update these strings and any related comments that tutors see (but we will leave code comments alone unless they leak into the UI).

## Plan of Work

1. **Inventory & validation**: use `Get-ChildItem -Recurse -File | Select-String` from the repo root to list files containing "ミニ論文". Categorize the hits into learner-facing UI, tutor prompts, and authoring docs. Clarify that case data files mostly contain developer comments, so we can defer editing them unless they display text directly.
2. **Case page UI**: in `public/pages/casePage.js`, update every string that displays "ミニ論文": the top-level tab button, the saved-tab reconstruction, the default quiz group title (`'ミニ論文問題'`), and the empty-state copy. Rename helper comments and logs if they show up in the UI to avoid confusion. Ensure both the main tab row and the dynamic row (when tabs are rebuilt) show "論文トレーニング".
3. **Answer overlay**: in `public/pages/answerOverlay.js`, switch the fallback label in `show()` to `論文トレーニング問題` so the overlay header matches the new vocabulary.
4. **Chat/tutor UX**: update `public/chatSystem.js` so `chatTitle` becomes "📝 論文トレーニング添削" (aligns icon + new term). In `public/eventHandler.js`, rename inline comments or tooltip text if visible. Ensure any user-facing alerts that mention "ミニ論文" now reference "論文トレーニング".
5. **Character prompt rules**: edit `public/data/characters.js` and `.txt` in the "特別指示（ミニ論文添削）" sections. Change section headings and instructional lines (e.g., "ミニ論文の場合のみ点数") to the new term so AI prompts stay consistent. Keep variable names intact unless exposed to authors.
6. **Docs/scripts**: `MODULE_CREATION_PROMPT_LONG.md` instructs content creators to avoid gaps in "ミニ論文"; rewrite those lines with "論文トレーニング". Similarly ensure `js_to_txt_converter.py` only references the new name in any user messages.
7. **Validation**: run the same repo-wide search for "ミニ論文" to confirm only schema identifiers (like `miniEssayPrompt`) remain. Start the dev server (`npm start`) or a quicker smoke script if available to ensure no runtime errors stem from the string changes.

## Concrete Steps

1. From `c:\Users\PC_User\Desktop\Atashinchi-study`, run `Get-ChildItem -Recurse -File | Select-String -Pattern "ミニ論文" -List` to capture the file list (already verified earlier but repeat after edits). Document the categorized results inside this plan if necessary.
2. Edit the following files with precise replacements:
    - `public/pages/casePage.js`: change the two tab button labels, `ミニ論文タブ` log/comment if user-visible, `quizGroup.title || 'ミニ論文問題'`, and both empty-state paragraphs.
    - `public/pages/answerOverlay.js`: fallback title string.
    - `public/chatSystem.js`: `chatTitle` plus any helper text referencing "ミニ論文".
    - `public/eventHandler.js`: adjust descriptive strings, especially around the "ミニ論文" chat start instructions if they surface in the UI.
    - `public/data/characters.js` & `.txt`: rename headings and bullet points so tutors mention "論文トレーニング".
    - `MODULE_CREATION_PROMPT_LONG.md`: replace user-facing instructions to mention "論文トレーニング".
    - `js_to_txt_converter.py`: rename any prompt or console output (if shown to authors).
3. After each file edit, lint for accidental syntax issues. Once code updates finish, re-run the repo-wide search to ensure only intentional schema names remain.
4. Run `npm start` (or an equivalent lightweight command if available) to confirm the UI loads and the case page renders the new label. Capture screenshots or textual observations for the validation section.

## Validation and Acceptance

- Success criteria: Navigating to any case detail page shows the tab labelled "論文トレーニング"; the quiz tab default heading says "論文トレーニング問題"; the chat overlay uses the new label; tutor prompts mention "論文トレーニング" when giving scoring directions; authoring docs instruct creators accordingly.
- Validation steps: (1) run `npm start`, open the app, load a case, verify the tab and chat overlays. (2) Use browser devtools or console logs to ensure no `ミニ論文` string remains in rendered HTML. (3) Confirm `Get-ChildItem ... Select-String` only finds `miniEssayPrompt` keys or other internal field names.

## Idempotence and Recovery

The updates are pure string replacements. If a replacement accidentally touched the wrong area, revert via version control or re-run the specific edit. The validation search is idempotent. Starting/stopping `npm start` is safe and repeatable.

## Artifacts and Notes

- Capture before/after screenshots or console output when verifying the tabs and chat overlay once available.

## Interfaces and Dependencies

No third-party dependencies change. We only adjust literal strings in existing modules. Keep field names like `miniEssayPrompt` untouched because downstream scripts rely on them; only UI text and prompt prose should change.
