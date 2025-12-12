```markdown
# Remove explanation tab from case experience

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This plan must be maintained in accordance with `.agent/PLANS.md` in the repository root.

## Purpose / Big Picture

Learners currently see a "🤔 解説" tab inside each case detail view, but the user asked for all explanation code to be retired without touching the case data files themselves. After completing this plan, the case UI will no longer render or request explanation content, the associated blank/freeze controls and APIs will disappear, and builds will stop referencing explanation state. Users can verify by opening any case via `npm start` and confirming that only the remaining tabs (story, speed quiz, essay, Q&A, etc.) are available and no network calls hit `/api/*explanation*` routes.

## Progress

- [x] (2025-11-16 08:45Z) Drafted this ExecPlan describing how to remove the explanation tab and supporting code.
- [x] (2025-11-16 09:20Z) Remove explanation tab UI/logic from `public/pages/casePage.js`, including blank controls and saved state handling.
- [x] (2025-11-16 09:22Z) Delete explanation-specific CSS selectors from `public/pages/casePage.js` (embedded styles) or other stylesheets.
- [x] (2025-11-16 09:30Z) Remove explanation-related APIs and helpers from `server.js` plus any client fetches.
- [x] (2025-11-16 10:05Z) Update auxiliary modules such as `public/speedQuiz.js` so they no longer read `caseData.explanation`.
- [x] (2025-11-16 11:55Z) Run `npm run build` (accepting the known case-data syntax errors) and smoke-test `npm start` to ensure no references to explanation remain.
- [x] (2025-11-16 11:57Z) Document validation results and lessons learned in Outcomes.

## Surprises & Discoveries

- (2025-11-16 09:55Z) Even after pulling the explanation tab, `chatSystem.js`, INTO mode prompts, and speed quiz loaders still referenced explanation DOM IDs/text, which would have produced runtime errors once the tab disappeared.

## Decision Log

- (2025-11-16 10:00Z) Removed the entire "explanation" session type from prompt generators and character rules instead of stubbing it out, ensuring new chats default to story/quiz paths without additional conditionals.

## Outcomes & Retrospective

- (2025-11-16 10:35Z) Explanation UI/DOM/state was removed from `casePage.js`, CSS, and server routes; chat prompts, INTO mode, and speed-quiz utilities no longer touch `caseData.explanation`, preventing undefined DOM references after the tab removal.
- (2025-11-16 10:36Z) `npm run build` still fails with the pre-existing case-data parse errors (e.g., 民法/3.担保物権/3.54-62.js). No new references to explanation appear in the error logs, confirming the cleanup.
- (2025-11-16 11:57Z) 最新の `npm run build` と `npm start` でも挙動は同様で、既存ケースファイル由来の構文エラー以外に説明タブ関連の警告やAPI呼び出しは確認されなかった。MODULE_CREATION_PROMPT_LONG.md も story→quiz 二段構成の指示に更新済み。

## Context and Orientation

Case detail rendering lives in `public/pages/casePage.js`. It injects tab buttons (story, explanation, quizzes, etc.), builds HTML for each tab, and wires blank-button interactions plus server-side persistence for story/explanation blank states. Explanation blanks use their own CSS classes and server APIs (`/api/save-explanation-check`, `/api/get-explanation-check`) implemented at the bottom of `server.js`, which edit the case module files to persist `explanationCheck` metadata. The speed quiz logic in `public/speedQuiz.js` concatenates explanation text into the pool of study snippets. Removing the explanation feature requires cleaning up these touchpoints while leaving `public/cases/**` files untouched.

## Plan of Work

1. **CasePage cleanup.** Edit `public/pages/casePage.js` to drop the explanation tab button, the explanation tab pane HTML, and any logic that derives or restores explanation content. Remove explanation-specific blank controls (IDs, CSS) and delete helper functions that tracked `explanationCheck` state, local locks, or server sync. Ensure the remaining story tab still works and that saved tab preferences skip explanation entirely.
2. **CSS pruning.** Remove the `.explanation-blank-*` style rules near the top of `public/pages/casePage.js` (the file contains inline CSS) or any other stylesheet entries that only served the explanation blanks.
3. **Server/API removal.** In `server.js`, delete the POST `/api/save-explanation-check` and GET `/api/get-explanation-check` routes plus helper functions `updateExplanationCheckInFile` and `extractExplanationCheckFromFile`. Confirm no other code references these exports.
4. **Speed quiz adjustments.** Update `public/speedQuiz.js` (and the `.backup` variant if still used) so `initializeSpeedQuizData` no longer pushes `caseData.explanation` into the `texts` array. This prevents undefined references and keeps the quiz focused on stories/questions.
5. **Search for stragglers.** Grep the repo for `explanation` usages in JS outside `public/cases/**`. For any remaining UI logic (e.g., QA renderers or memo systems) referencing explanation state, remove or neutralize them while maintaining functionality. Case data properties may remain unused but should not cause runtime errors.
6. **Validation.** Run `npm run build` from the repo root; expect existing failures caused by malformed case files, but confirm no new errors mention explanation. Then run `npm start`, open a case, and verify: (a) explanation tab is gone; (b) no fetches to `/api/*explanation*`; (c) story blanks continue to toggle and persist via the existing endpoints.

## Concrete Steps

1. `cd C:\Users\PC_User\Desktop\Atashinchi-study`
2. Remove explanation UI and helpers in `public/pages/casePage.js` as described above.
3. Delete explanation APIs from `server.js`.
4. Update `public/speedQuiz.js` (and `.backup` if necessary) to stop reading explanation text.
5. Search for `explanation` references (excluding `public/cases/`) using `git grep` or the VS Code search to ensure no logic still depends on it.
6. Run `npm run build` (ignore known data-file syntax failures; ensure no new references remain).
7. Run `npm start`, open `http://localhost:3000`, and navigate to a case to check the tab set and browser console for errors.

## Validation and Acceptance

The change is accepted when:

- `npm run build` completes with only the pre-existing case-data syntax errors and no references to explanation-related modules.
- Visiting any case page shows only the remaining tabs (story, speed quiz, essay if available, Q&A, mini-essay) and no UI traces of "解説".
- Browser devtools network panel during case interaction shows no requests to `/api/save-explanation-check` or `/api/get-explanation-check`.
- Story blank interactions and study log features continue to function normally.

## Idempotence and Recovery

Edits are local to JS files and can be safely reapplied. If an intermediate change breaks the UI, reset the affected files using `git checkout -- <file>` and re-follow the steps. Removing the explanation APIs is backwards-compatible because the front-end will no longer call them.

## Artifacts and Notes

_Add relevant diffs or console transcripts after each milestone._

## Interfaces and Dependencies

No new dependencies are needed. Front-end changes stay within `public/pages/casePage.js` and `public/speedQuiz.js`. Server changes modify `server.js` only. Story blank persistence continues to rely on the existing `/api/save-story-check` endpoint, and no other modules require adjustment.
```
