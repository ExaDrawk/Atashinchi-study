```md
# Calendar visibility, layout breathing room, speed-quiz cleanup, and mini-essay removal

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must stay up to date throughout implementation. Maintain this plan in accordance with `.agent/PLANS.md` in the repository root.

## Purpose / Big Picture

Learners need a reliable way to review prior study sessions, launch the speed-quiz without duplicated logic, and focus on the remaining core training modes. Today the calendar never finishes rendering, case content stretches across the entire viewport, duplicated quiz code drifts out of sync, and the deprecated "ミニ論文" (mini essay) feature plus its prompt instructions confuse both the UI and the module generator. After these changes, users can click 📅 on the home page to see a responsive calendar backed by a single API call per month, the case detail view leaves comfortable side margins so the 📖条文 panel does not overlap, both home and page-speed quiz flows reuse the same helpers, the mini-essay UI/pipeline disappears (including prompt text), and today's speed-quiz history compresses into two grouped summaries (correct vs incorrect). Verification happens by running `npm run build` (accepting known case-data parse errors), `npm start`, and exercising the updated flows in the browser.

## Progress

- [x] (2025-02-15 11:05Z) Drafted this ExecPlan covering calendar fixes, layout padding, speed-quiz deduplication, mini-essay removal, prompt cleanup, and quiz-history aggregation.
- [ ] (🟡 Pending) Implement calendar aggregation API + front-end rendering that loads once per month and restores the modal (server.js + public/pages/homePage.js).
- [ ] (🟡 Pending) Expand horizontal padding/max-width for case detail shells and ensure article panel + content no longer overlap (public/pages/casePage.js + shared styles if needed).
- [ ] (🟡 Pending) Introduce shared speed-quiz helpers (likely in public/speedQuiz.js) and refactor public/speedQuizMain.js plus consumers to reuse them.
- [ ] (🟡 Pending) Remove mini-essay tab/UI/back-end hooks plus related chat/event logic, and update the module generator prompt accordingly.
- [ ] (🟡 Pending) Rework "今日の学習記録" quiz history into correct/incorrect aggregations while preserving regular module records.
- [ ] (🟡 Pending) Run build + smoke `npm start`, capture outcomes, and update this plan's Outcomes & Retrospective section.

## Surprises & Discoveries

- Observation: `renderCalendarGrid` currently invokes `getStudyRecordsForDate` for every cell, and that helper dynamically imports every case module per date. Rendering one month therefore triggers hundreds of module loads and dozens of `/api/quiz-results` fetches, which likely explains the "calendar does not display" complaint because the UI stays busy for minutes.
  Evidence: `public/pages/homePage.js` lines 399-520 (per-file dynamic imports within each calendar cell) and the `Promise.all` inside `renderCalendarGrid`.
- Observation: Mini-essay support is woven through `casePage.js`, `answerOverlay.js`, `eventHandler.js`, `chatSystem.js`, and `public/data/characters.js`, so removal must consider those dependencies to avoid dangling selectors.
  Evidence: repo-wide grep for "ミニ論文" and `.quiz` buttons shows shared button IDs and QA references.

## Decision Log

- Decision: Add a new server endpoint that returns study-record summaries grouped by date for a given month, and have the calendar call it once instead of N×cases dynamic imports.
  Rationale: Pulling every module file on the client is both slow and impossible to cache; centralizing on the server keeps rendering deterministic and fast.
  Date/Author: 2025-02-15 / Copilot
- Decision: Remove the mini-essay tab entirely (UI, buttons, character prompts, answer overlay) instead of stubbing it, because the user explicitly wants the feature gone and keeping dead toggles confuses operations.
  Rationale: Partial stubs would leave ghost buttons and prompt text that conflict with the updated mandate.
  Date/Author: 2025-02-15 / Copilot
- Decision: Create a shared quiz-launch helper exported from `public/speedQuiz.js` (e.g., `launchSpeedQuizFromArticles` + filter utilities) and make `public/speedQuizMain.js` call those instead of its own `startSpeedQuiz`/`window.startQuiz` fallback.
  Rationale: Having one implementation of question-building and navigation prevents desync between the homepage filters and the actual quiz runtime.
  Date/Author: 2025-02-15 / Copilot

## Outcomes & Retrospective

- _(Pending completion – fill in after validation.)_

## Context and Orientation

- `public/pages/homePage.js` renders the dashboard, including 今日の学習記録, the calendar modal (`openCalendar`, `renderCalendarGrid`, etc.), and the embedded speed-quiz teaser. It currently issues per-date module imports, builds a grid synchronously, and formats quiz results inline.
- `server.js` already exposes `/api/get-all-study-records` (latest per case) plus quiz-result endpoints, but nothing delivers per-date aggregates. We'll extend it with a calendar-friendly endpoint that returns all records for a specific YYYY-MM range plus quiz breakdowns.
- `public/pages/casePage.js` builds the case UI, tab headers, and inline styles. The content container spans the full width, leaving no margin for the floating 📖条文 panel anchored near the viewport edge. It also owns the entire mini-essay tab (data-tab="quiz") and numerous helper functions.
- `public/speedQuiz.js` contains the actual game UI, article extraction, and `startFilteredSpeedQuiz`. `public/speedQuizMain.js` duplicates filtering/start logic for the home page. `public/speedQuizPage.js` bridges to the dedicated quiz route. We must share helpers across these files.
- `MODULE_CREATION_PROMPT_LONG.md` still demands mini-essay content and references the removed explanation tab. Cleaning it keeps generator output aligned with the simplified UI.
- Other supporting files referencing mini-essays: `public/answerOverlay.js` (answer sheets), `public/eventHandler.js` (buttons), `public/chatSystem.js` and `public/data/characters.js` (chat prompts). Removing the feature requires touching each.

## Plan of Work

1. **Calendar data pipeline**
   - In `server.js`, add `GET /api/calendar-study-records?year=YYYY&month=MM` that iterates case files once, filters `studyRecords` belonging to the requested month, and returns a map of `date -> { cases: [...], quizzes: [...] }`. Cache results per month for a short TTL to avoid repeated disk scans.
   - In `public/pages/homePage.js`, replace `renderCalendarGrid`'s per-cell dynamic imports with a single fetch to the new endpoint every time `currentCalendarDate` changes. Precompute a map of days with counts, render synchronously, and lazy-load detailed records only when the user clicks a day (using the already fetched payload). Ensure the modal toggles reliably (`hidden` class removal, ESC handling) and that the `Promise.all` footgun disappears.

2. **Case layout padding**
   - Wrap the main case content (`renderCaseDetail`) inside a responsive container (`max-w-5xl mx-auto px-4 lg:px-8`) and add left/right padding on the root `#app` wrapper so the floating article panel (fixed to the left) does not overlap. Update any inline styles or tailwind classes (including tab bars) so content width remains constrained even on xl screens.
   - Verify the "show article" button row still aligns, and adjust `articlePanel` width/position if necessary so both elements can coexist.

3. **Speed-quiz deduplication**
   - In `public/speedQuiz.js`, expose a helper such as `export function prepareQuizSession(articles, options)` that sets `window.speedQuizArticles`, applies optional filters, and (optionally) navigates to `#/speed-quiz`. Also expose a reusable `filterArticlesForSettings(settings)` if needed.
   - Update `public/speedQuizMain.js` to import the helper instead of building its own `startSpeedQuiz`/`startQuizWithSettings` wrappers. The homepage "start" button should call the shared helper (which handles navigation to `#/speed-quiz`). Remove the legacy `window.startQuiz` fallback and redundant filtering logic where feasible.
   - Ensure `speedQuizPage.js` and case tabs still function by reusing the same exported helpers (e.g., `startFilteredSpeedQuiz`). Document the expected data contract (articles -> {lawName, articleNumber, paragraph}).

4. **Mini-essay removal**
   - Delete the mini-essay tab button, tab content (`#tab-quiz-content`), and rendering helpers from `public/pages/casePage.js`, along with any calls to `setupPastAnswersButtons`, `setupNewAnswerModeButtons`, etc., that exist solely for that tab.
   - Purge related handlers in `public/eventHandler.js`, `public/answerOverlay.js`, `public/chatSystem.js`, and `public/data/characters.js`, ensuring no UI references to "ミニ論文" or `problem-type="quiz"` remain. Adjust chat prompts so only supported modes (story, essay, Q&A, speed-quiz) remain. Remove any server/API hooks that persist quiz answers if they become unused.
   - Update `MODULE_CREATION_PROMPT_LONG.md` to eliminate instructions about mini-essays and the explanation tab so the generator stops emitting those sections.

5. **Today’s study record aggregation**
   - In `public/pages/homePage.js`, split `todayRecords` into two collections: case studies (unchanged grid) and quiz results. Render the quiz portion as two cards (correct vs incorrect) containing compact lists (e.g., law name buttons) sourced from the aggregated data. Provide counts and quick jump buttons for each article. Ensure the new layout de-duplicates repeated entries and still links to the calendar.

6. **Validation + documentation**
   - Run `npm run build` (expecting the known case-data syntax failures) to confirm no new errors referencing the touched files. Then run `npm start`, load the home page, open the calendar, verify grouping, open a case to inspect spacing, run the speed-quiz, and confirm no mini-essay traces remain. Capture observations in this plan’s Outcomes section.

## Concrete Steps

1. From the repo root (`c:\Users\PC_User\Desktop\Atashinchi-study`), edit `server.js` to add the new `/api/calendar-study-records` route plus helper utilities (date filtering, caching).
2. Update `public/pages/homePage.js`:
   - Consume the new API inside `renderCalendarGrid`, keep one in-memory cache of the fetched month, and update `showDateDetails` to read from that map instead of reloading modules.
   - Restructure `generateTodayStudyRecordsHTML` to split quiz results and render the two aggregated buckets.
3. Adjust case layout by editing `public/pages/casePage.js` (and any shared CSS if needed) to wrap the content container with additional padding and fixed max-width.
4. In `public/speedQuiz.js`, extract/export a helper for launching quizzes with a provided article list. Refactor `public/speedQuizMain.js` to import and call it, deleting the legacy `startSpeedQuiz` plus `window.startQuiz` usage. Ensure `speedQuizPage.js` still works with the new API.
5. Purge mini-essay traces:
   - Remove the tab and rendering functions from `public/pages/casePage.js`.
   - Delete associated logic in `public/eventHandler.js`, `public/answerOverlay.js`, `public/chatSystem.js`, `public/data/characters.js`, and any other files referencing "ミニ論文" outside of historical case data.
   - Edit `MODULE_CREATION_PROMPT_LONG.md` to drop all mini-essay and explanation-tab instructions.
6. Re-run `npm run build` and `npm start` for smoke testing, documenting console output and observed behaviors.

## Validation and Acceptance

- `npm run build` completes with only the pre-existing case-data parse errors (document any new ones). No stack traces should mention the calendar endpoint, case layout, speed-quiz helpers, or mini-essay references.
- Visiting the home page shows the 今日の学習記録 grid (modules) plus two additional cards summarizing speed-quiz results, and the 📅 button opens a calendar immediately populated for the current month with day-level badges.
- Clicking any date with records opens the detail modal without triggering additional long-running fetches and lists both module study records and quiz entries sourced from the pre-fetched payload.
- Opening any case shows wider side margins, no mini-essay tab, and no errors in the console. The 📖条文 panel can open without covering the content.
- Starting the speed-quiz from the home page or dedicated route uses the shared helper (verify by checking the console logs and ensuring only the new helper executes). Game play still records quiz results and updates 今日の学習記録.
- `MODULE_CREATION_PROMPT_LONG.md` no longer mentions mini-essays or explanation tabs.

## Idempotence and Recovery

- The new calendar endpoint is additive; re-running the server registers the route idempotently. The front-end changes rely on feature flags stored locally (no migrations), so reverting is as simple as resetting the touched files if something fails.
- When editing large files such as `public/pages/casePage.js`, work in logical chunks and keep backups via git (e.g., `git checkout -- public/pages/casePage.js` to reset unintended changes).
- The mini-essay removal deletes UI only; underlying case data fields remain, so reintroducing the feature later would require re-adding the tab and handlers.

## Artifacts and Notes

- Capture console logs or short diffs after each milestone, especially for the new server endpoint and the calendar fetch logic, so future maintainers can see expected payloads.

## Interfaces and Dependencies

- New server interface: `GET /api/calendar-study-records?year=YYYY&month=MM`
    - Returns `{ success: true, year, month, days: { 'YYYY-MM-DD': { studyRecords: [...], quizResults: [...] } } }`.
    - Internally depends on file scanning similar to `/api/get-all-study-records` but filters by date range.
- Front-end helper: `import { launchSpeedQuizSession } from '../speedQuiz.js'` (exact name TBD in implementation). Signature:
    - `launchSpeedQuizSession({ articles, navigate = true, settings })` sets `window.speedQuizArticles`, optionally applies filtering, and navigates to `#/speed-quiz` when `navigate` is true.
    - Existing `startFilteredSpeedQuiz` and `initializeSpeedQuizGame` continue to live in `public/speedQuiz.js` and should be reused rather than reimplemented.
- Removed interfaces: mini-essay DOM hooks (buttons with `data-tab="quiz"`, `view-past-answers-btn` for `problem-type="quiz"`, Chat "📝 ミニ論文添削" prompts). Any code referencing those IDs/classes should be deleted or updated to target supported tabs only.
```
