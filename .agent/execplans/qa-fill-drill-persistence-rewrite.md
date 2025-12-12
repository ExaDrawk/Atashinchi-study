# Rebuild QA fill-drill persistence system

This ExecPlan is a living document. Maintain every section (Progress, Surprises & Discoveries, Decision Log, Outcomes & Retrospective) exactly as required by `.agent/PLANS.md`.

## Purpose / Big Picture

Learners need their Q&A statuses, blank-check flags, and fill-drill attempts to persist without corrupting the source case modules under `public/cases/`. Today the client rewrites each module file through `/api/update-qa-status`, which frequently mangles the `questionsAndAnswers` array and breaks imports. We will move all mutable Q&A state into a dedicated JSON progress store under `data/qa-progress/`, expose clean APIs to read/write it, migrate any surviving data out of the modules, and update the front-end to merge progress at runtime. After this change, completing a fill drill, toggling blank checks, or changing Q&A status will update the JSON store only, and reloading a case will faithfully restore the state without touching the module source.

## Progress

- [x] (2025-11-17 06:05Z) Captured initial ExecPlan describing the new persistence architecture and migration strategy.
- [ ] Introduce `qaProgressStore` server helper and JSON-on-disk format with tests.
- [ ] Replace `/api/update-qa-status` with JSON-backed endpoints plus GET accessors; add validation and logging.
- [ ] Migrate front-end (`qaStatusSystem`, `qaFillDrillSystem`, case loader) to fetch/merge/save progress via the new APIs.
- [ ] Build a one-off migration script that scans `public/cases/**.js`, extracts any `fillDrill`/status/check data, and seeds the JSON store.
- [ ] Run migration on sample modules, smoke-test template generation, grading, and persistence (`npm start` + manual flow), and record results here.

## Surprises & Discoveries

- None yet. Document file-format edge cases, migration findings, or API behaviors as they surface.

## Decision Log

- Decision: Store all mutable Q&A state in `data/qa-progress/<slug>.json` files (one per module) instead of rewriting the module JS.
  Rationale: Editing the authored module sources has repeatedly introduced syntax errors; a sidecar JSON store isolates user state and keeps authored content read-only.
  Date/Author: 2025-11-17 / Copilot

## Outcomes & Retrospective

Populate after implementation to summarize what worked, what remains, and key lessons.

## Context and Orientation

- Case content lives under `public/cases/<カテゴリ>/<ファイル>.js` and is dynamically imported by `public/pages/casePage.js`, which assigns the exported object to `window.currentCaseData`.
- Client persistence currently goes through `public/qaStatusSystem.js` (`saveQADataToFile`) which POSTs to `/api/update-qa-status` inside `server.js`. That endpoint uses brittle regex/bracket parsing to splice `questionsAndAnswers`, causing corruption (see `public/cases/刑法/8.*` files).
- Fill-drill UI state is handled in `public/qaFillDrillSystem.js`, which expects `qa.fillDrill` fields to already exist inside each QA item.
- There is no dedicated progress data file today; everything is jammed into the module exports. We will introduce `data/qa-progress/` to hold JSON documents mapping `relativePath + qaId` to progress records.

## Plan of Work

Describe **in prose** how to get from the current state to the desired one:

1. **Design the JSON progress schema and helper module.** Create `server/qaProgressStore.js` (or similar) that exposes `loadQAProgress(relativePath)`, `saveQAProgress(relativePath, updater)`, and `mergeProgressIntoCase(caseData, progress)` utilities. Define the schema:
    - Root keys: `relativePath`, `updatedAt`, `qa` (object keyed by QA ID strings).
    - Each QA entry may contain `status`, `check`, `fillDrill`, `notes`, `lastUpdated`, etc. `fillDrill` should match what the client already uses (`clearedLevels`, `templates`, `attempts`, `history`). Document each field inside the file header comment.
    - The helper must normalize relative paths (reuse `normalizeRelativeCasePath`) and map them to safe filenames, e.g., replace `/` with `__` and append `.json`.
    - Handle concurrent writes by writing to a temp file then renaming, and ensure directories exist.

2. **Replace `/api/update-qa-status` with JSON-first endpoints.** In `server.js`:
    - Introduce `GET /api/qa-progress` (query `relativePath`). Load progress JSON (or an empty shell) and return it.
    - Introduce `POST /api/qa-progress/save` that accepts `{ relativePath, qaData: Array<PartialQA> }`. For each entry, merge provided fields (status/check/fillDrill/metadata) into the JSON store. Strip oversized strings (feedback truncation) before persisting.
    - Deprecate the old module-splicing logic entirely; route the previous `/api/update-qa-status` path to the new saver for backward compatibility, but ignore module rewriting.
    - Update log messages to confirm writes and include error diagnostics if JSON parsing fails.

3. **Load progress when rendering cases.** Update `public/pages/casePage.js` (after loading a module) to fetch `/api/qa-progress?relativePath=<caseId>` using the same relative path the server expects (already available via `caseId`/`getCurrentCaseRelativePath`). Merge the returned `qa` map into `window.currentCaseData.questionsAndAnswers` by matching IDs:
    - `qa.status` override.
    - `qa.check` override.
    - `qa.fillDrill` deep-merge (keep template caches, attempts, etc.).
    - Provide helper `applyQAProgress(caseData, progress)` inside `qaStatusSystem` or a new utility to keep responsibilities centralized.
    - Ensure downstream consumers (status chips, blank checks, fill drills) see the merged data before rendering UI.

4. **Rewrite client save paths.** In `public/qaStatusSystem.js`:
    - Change `saveQADataToFile` to call the new `/api/qa-progress/save` endpoint with only the mutated fields (rather than entire QA list). Provide helper `buildQASavePayload(qaList, fields)` to convert arrays into minimal objects.
    - When the user toggles a blank check, only send `{ id, check }`. When fill-drill progress changes, send `{ id, fillDrill: {...} }`. Maintain batching ability so multiple QAs can be persisted in one request.
    - Retain local state updates so the UI stays responsive even if the network is briefly unavailable, but log/save errors for later retries.

5. **Adapt `qaFillDrillSystem` to rely on the new persistence contract.** Ensure the system calls into `window.qaStatusSystem.saveQAData` with minimal payloads after grading, level clearing, or template regeneration. Remove any code that expected module files to mutate inline.

6. **Build a migration script.** Add `scripts/migrate-qa-progress.js` that:
    - Recursively scans `public/cases/**/.js`.
    - `import()`s each module, iterates `questionsAndAnswers`, and extracts `status`, `check`, and `fillDrill` if present.
    - Writes them into the new JSON format (one file per module) via the helper module (reusing its normalization to avoid divergence).
    - Optionally strips the dynamic fields from the JS output (or at least logs which modules still contain dynamic fields so a future cleanup can remove them manually).
    - Document how to run it in the script header and ExecPlan `Concrete Steps`.

7. **Testing and validation.** After implementation, run the migration on a subset (e.g., all `刑法/8.*` modules), then:
    - `npm start` and load a case.
    - Verify that level clears persist after refresh and that `public/cases` files remain untouched (confirm via `git status`).
    - Inspect the generated JSON file to ensure values match the UI.
    - Update documentation/README if needed to explain the new persistence folder.

## Concrete Steps

1. In PowerShell from repo root: ensure the new directory exists.
       mkdir data/qa-progress
2. Implement `server/qaProgressStore.js` and export helpers; add Jest-style unit tests if the project has a harness (otherwise, add a `node scripts/test-qa-progress-store.js` smoke script that serializes/deserializes sample data).
3. Modify `server.js` to import the helper, define the new GET/POST endpoints, and remove the module-splicing code.
4. Update `public/qaStatusSystem.js` and `public/qaFillDrillSystem.js` to consume the new API, including `applyProgressToCase(caseData, progress)` logic.
5. Create `scripts/migrate-qa-progress.js`. Document usage near the top (e.g., `node scripts/migrate-qa-progress.js --write`), and support dry-run vs write modes.
6. Run the migration for affected modules: `node scripts/migrate-qa-progress.js --write --filter=刑法/8.` Record results.
7. Start the dev server `npm start`, complete a fill drill, reload, and confirm persistence. Capture logs in the `Artifacts` section.

## Validation and Acceptance

- After running the migration and new server, `git status` should show **no** edits under `public/cases/` when completing drills or toggling statuses; instead, only files under `data/qa-progress/` should change.
- Loading a case triggers a background fetch to `/api/qa-progress` (verify via browser devtools). The merged data should populate `qa.fillDrill` before the UI renders; clearing a level and refreshing the tab must show the cleared state immediately.
- GET + POST endpoints return JSON with HTTP 200 for valid inputs, 400 for missing `relativePath`, and 500 for disk issues, with clear error messages.
- `scripts/migrate-qa-progress.js` logs the number of modules scanned and the path of each generated JSON file; rerunning it without `--write` performs a dry-run and reports potential diffs only.

## Idempotence and Recovery

- JSON saves are append-free; each POST rewrites the entire per-module JSON using atomic rename so power loss leaves either the old or new file intact.
- If two save requests overlap, the helper should re-read the file on each call to avoid overwriting unrelated fields. Document that the client batches updates per interaction to reduce races.
- The migration script can be rerun safely; it overwrites JSON files with consistent content and keeps a timestamped backup (e.g., `.bak` extension) before writing when `--write` is used.
- If `/api/qa-progress/save` fails, the client logs the error and retries on the next interaction; local UI state remains until a successful sync occurs.

## Artifacts and Notes

- Capture sample JSON from `data/qa-progress/刑法__8.23-32.json` showing a populated `fillDrill` entry once the system works.
- Include a short server log excerpt demonstrating a successful GET + POST cycle without touching module files.
- Save the migration script output (counts of modules, fields extracted) for reference.

## Interfaces and Dependencies

- **Server helper (`server/qaProgressStore.js`):**
      loadQAProgress(relativePath: string) -> Promise<{ relativePath: string, qa: Record<string, QAProgressEntry>, updatedAt: string }>
      saveQAProgress(relativePath: string, mutator: (current: ProgressDoc) => ProgressDoc) -> Promise<ProgressDoc>
      mergeProgressIntoCase(caseData: ModuleExport, progress: ProgressDoc) -> ModuleExport
- **API contracts:**
      GET /api/qa-progress?relativePath=<string>
          Response: { success: true, relativePath, qa: { [qaId]: QAProgressEntry }, updatedAt }
      POST /api/qa-progress/save
          Body: { relativePath: string, qaData: Array<{ id: string|number, status?, check?, fillDrill?, notes?, meta? }> }
          Response: { success: true, updatedQaIds: string[], filePath }
- **Client helpers:**
      QAStatusSystem.applyProgressToCurrentCase(progress)
      QAStatusSystem.saveQAData(relativePath, partials: Array<PartialQAProgress>)
      qaFillDrillSystem.persistFillDrill(relativePath, qaId, fillDrillState)
- **Migration script options:**
      node scripts/migrate-qa-progress.js --write [--filter="刑法/8."]
      node scripts/migrate-qa-progress.js --dry-run

Keep this plan updated as implementation proceeds; every completed milestone must move to `[x]` with a timestamp, surprises must be logged, and final outcomes must summarize validation evidence.
