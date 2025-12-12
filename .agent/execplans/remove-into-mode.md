# Remove INTO mode from the learner experience

This ExecPlan is a living document. Update every section (Progress, Surprises & Discoveries, Decision Log, Outcomes & Retrospective) as work proceeds. Maintain this file in accordance with `.agent/PLANS.md`.

## Purpose / Big Picture

Learners should no longer see or use the "INTO" story chase mode. After this change, the case detail page will only show the remaining study tools (story, quizzes, speed条文, Q&A, etc.), the global script bundle will not load the INTO runtime, and no background Gemini prompts for INTO will be constructed. Success means the UI has no 🧩 button, `window.startIntoMode` is gone, and the server/client bundles no longer reference the INTO modules while everything else continues to work.

## Progress

- [ ] (2025-11-16 05:10Z) Inventory all INTO-mode touchpoints (`public/intoMode.js`, `public/pages/casePage.js`, `public/app.js`, docs) and record anything else discovered.
- [ ] (2025-11-16 05:25Z) Remove the INTO launch UI and related event wiring from `public/pages/casePage.js` (buttons, listeners, null checks).
- [ ] (2025-11-16 05:35Z) Delete `public/intoMode.js` and its side effects, removing the import from `public/app.js` and any globals (`window.startIntoMode`, `window.intoModeState`).
- [ ] (2025-11-16 05:45Z) Search for residual "INTO" strings in `public/**` and documentation, eliminating stale references or noting case-data leftovers that are intentionally untouched.
- [ ] (2025-11-16 06:00Z) Run `npm run build` (accepting the known public/cases parse errors) and a quick `npm start` smoke test or script-level equivalent, documenting the expected errors/success criteria, then summarize impacts in README or release notes if needed.

## Surprises & Discoveries

None yet. Add entries if new behavior or constraints appear while implementing.

## Decision Log

- Decision: Fully remove INTO assets instead of hiding them behind a feature flag.
  Rationale: The user requested "完全に削除"; keeping dead code adds maintenance burden and risks regressions.
  Date/Author: 2025-11-16 / Copilot

## Outcomes & Retrospective

To be filled in after implementation to capture what changed and which follow-ups remain.

## Context and Orientation

The INTO mode currently lives entirely on the client. `public/intoMode.js` defines global state (`window.intoModeState`), prompt builders (`buildIntoInitialPrompt`, `buildIntoFollowUpPrompt`), UI panel rendering, and `window.startIntoMode`. The main client bundle (`public/app.js`) imports this file solely for its side effects. On the case detail view (`public/pages/casePage.js`), a "🧩 INTO" button in the story tab calls `window.startIntoMode(window.currentCaseData)` when clicked. There are no server endpoints dedicated to INTO mode, and no CSS files target the `into-` selectors except inline styles within `intoMode.js`. Documentation currently does not advertise INTO mode, but confirm during implementation. Case data modules may still reference "INTO" in narrative text; those do not affect functionality.

## Plan of Work

1. Perform a scoped text search for `INTO`, `intoMode`, and `start-into` within `public/**/*.js` plus README files to confirm the touchpoints listed above are the only runtime dependencies. Note any documentation hits that require removal.
2. Update `public/pages/casePage.js` to remove the INTO button markup and the event listener block. Ensure surrounding layout remains balanced (e.g., keep the "📖 条文表示" button properly aligned once the INTO button disappears).
3. Remove the side-effect import from `public/app.js`. Ensure no other modules reference `window.startIntoMode`; if they do, replace or delete those references.
4. Delete `public/intoMode.js` entirely since the feature is being retired. If other modules re-export anything from it (none expected), adjust them accordingly.
5. After code removal, run a repo-wide search for `INTO` or `intoMode` to verify no runtime code remains. Leave occurrences inside case study content if they are part of the educational material.
6. Validation: run `npm run build`. The `scripts/build-case-index.js` step currently reports pre-existing syntax errors inside `public/cases/**`; document that these errors persist and are unrelated. Optionally run `npm start` and load a case detail locally to visually confirm the "INTO" button and dialog are gone. Capture screenshots or textual confirmation in Outcomes.

## Concrete Steps

1. From the repo root, remove the INTO button markup and event wiring in `public/pages/casePage.js`. Verify the header action row still renders correctly by ensuring there is at least one button (📖) in the right-aligned container.
2. Delete the import line `import './intoMode.js';` from `public/app.js` and ensure no other references exist.
3. Delete `public/intoMode.js` (entire file) from source control.
4. Run `npm run build` in PowerShell (repo root). Expect it to fail on existing case file syntax issues; note the same errors before and after removal to show there is no regression caused by this work.
5. Optionally run `npm start` (or `npm run dev`) and navigate to a case page to confirm there is no 🧩 button and no console errors about missing `startIntoMode`.
6. Update README or release notes if any mention of INTO mode is found; otherwise, note that no doc changes were needed.

## Validation and Acceptance

- Visual acceptance: Start the dev server (`npm start`), open a case detail page, and confirm the story tab header no longer shows the 🧩 INTO button. Interacting with the story page should not log errors referencing `startIntoMode` or `intoMode`.
- Build acceptance: Run `npm run build`. Aside from the known `public/cases` syntax issues (documented in Outcomes), the script should complete identically to the pre-change behavior. No new errors should mention INTO or missing modules.
- Code hygiene acceptance: A search for `intoMode` and `start-into` should return zero hits in `public/**/*.js`. Any remaining `INTO` strings should only belong to story content files that are intentionally untouched.

## Idempotence and Recovery

These edits are file deletions and removals. Running them repeatedly is safe because the deleted `public/intoMode.js` is no longer referenced. If recovery is needed, restore the file and import via version control. To ensure the UI stays consistent, keep the flex container markup tidy so removing the button does not break layout when rerunning the steps.

## Artifacts and Notes

None yet. After validation, capture the relevant build logs (showing the same pre-existing case errors) and, if possible, a before/after description of the story tab header.

## Interfaces and Dependencies

Removing INTO mode affects the following interfaces:
- `public/app.js` no longer exports or relies on `window.startIntoMode`. Any future code must not assume that global exists.
- `public/pages/casePage.js` should operate with only the remaining buttons; ensure no other module queries `#start-into-btn`.
- External dependency on `@google/genai` remains unaffected; INTO mode previously called Gemini through other scripts, but since the entire feature is gone, there is no replacement call path required.
