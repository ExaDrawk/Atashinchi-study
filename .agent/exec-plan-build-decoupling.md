# Build pipeline decoupling and reusable case index generator

This ExecPlan is a living document and must be maintained in accordance with `.agent/PLANS.md`.

## Purpose / Big Pictureんpm

`npm run build` should become a predictable, short-lived command that only prepares static assets (notably `public/cases/index.js`) and completes successfully in CI/CD environments that do not allow long-running resident servers. Today the only available generator is `scripts/build-case-index.js`, which mixes library logic with a self-invoking CLI, so every import executes the generation immediately. Express routes reuse this file through dynamic imports, which couples server behavior to the build script and makes it difficult to reuse the generator independently. The goal is to factor the case-index builder into a reusable module, add an explicit CLI entry point, and wire `npm run build` (and auxiliary scripts) to the new entry point so the build step produces all required artifacts without touching the server or waiting on background jobs. After this change, Render.com (or any CI) can set `Build Command: npm run build` and expect it to finish without attempting to start Express, download laws, or keep a server alive.

## Progress

- [x] (2024-11-24 04:45Z) Captured current behavior and drafted ExecPlan.
- [ ] (TBD) Implement shared case index generator module and update build CLI.
- [ ] (TBD) Update package scripts/docs/startup helpers and verify build + server flows.

## Surprises & Discoveries

- Case modules are imported at build time; many contain Mermaid-style snippets that currently throw syntax errors. The existing script logs these errors and still writes `public/cases/index.js`, so the build finishes but with noisy output.
- `scripts/build-case-index.js` executes `generateIndex()` at module load. Server endpoints that do `await import('./scripts/build-case-index.js')` therefore re-run the build immediately, even before calling exported helpers.
- `start.bat` manually runs `npm run build` followed by `node server.js`, demonstrating the need for a deterministic build artifact before server boot.

## Decision Log

- Decision: Extract `findJsFiles`, `tryReadTxt`, and `generateCaseIndex` into a dedicated module (e.g., `scripts/lib/caseIndexGenerator.js`) that has no side effects when imported.  Rationale: Allows both the CLI and Express route to call the same logic without unintended builds. Date/Author: 2024-11-24 / Copilot.
- Decision: Introduce a thin CLI wrapper (`scripts/build-case-index.js`) that only runs `generateCaseIndex` when the file is executed directly (checked via `import.meta.url`).  Rationale: Keeps the current entry point but prevents automatic execution during imports. Date/Author: 2024-11-24 / Copilot.
- Decision: Update `package.json` scripts so `npm run build` calls the dedicated CLI (optionally via a new `build:cases` alias) and document that `npm start` no longer regenerates the index implicitly.  Rationale: Gives CI a single, reliable build command. Date/Author: 2024-11-24 / Copilot.

## Outcomes & Retrospective

(To be completed after implementation.)

## Context and Orientation

- `scripts/build-case-index.js` currently defines helper functions and immediately invokes `generateIndex()`, writing `public/cases/index.js` and exporting helper utilities for other modules. Any import re-runs the build.
- `server.js` exposes `/api/regenerate-case-index` and imports the build script dynamically, unintentionally triggering the CLI each time. The server itself starts law loaders and long-running update jobs that are irrelevant for `npm run build`.
- `package.json` defines `build: node scripts/build-case-index.js` and `start: node server.js`. CI cannot easily reuse the generator without the side effects.
- `start.bat` and `npm run start:local` run the build before launching the server to ensure `public/cases/index.js` exists.

## Plan of Work

1. Create a side-effect-free module (e.g., `scripts/lib/caseIndexGenerator.js`) that exports the existing helpers plus a new `runCaseIndexBuild({ rootDir, outputPath, silent })` convenience function. The module must not execute code when imported.
2. Refactor `scripts/build-case-index.js` into a thin CLI wrapper that imports the helper module, parses optional CLI arguments (e.g., `--root`, `--out`, `--quiet`), and runs the generator only when the file is executed directly. Provide clear exit codes and user-friendly logging.
3. Update `server.js` to import the helper module instead of the CLI. The `/api/regenerate-case-index` handler should call `generateCaseIndex` directly, eliminating duplicate builds on import. Add error handling and status logging consistent with existing UX.
4. Refresh `package.json` scripts: add `"build:cases": "node scripts/build-case-index.js"` and change `"build"` to call that alias (or invoke the new CLI directly). Adjust `start:local` and `start.bat` to call the alias for clarity.
5. Document the new workflow in `README.md`, explaining that CI should run `npm run build` and operators can still call `npm run build:cases` manually. Mention that the server no longer regenerates the index implicitly.
6. Run `npm run build` and `npm start` to verify: build should finish without launching Express or law updates; server should boot and serve API routes, relying on the pre-generated index.
7. Capture any residual Mermaid parse warnings as known limitations (these already existed). Optionally, improve logging in the helper module to summarize skipped files without failing the build.

## Concrete Steps

1. Add `scripts/lib/caseIndexGenerator.js` (ES module) containing the shared logic. Export at least `findJsFiles`, `tryReadTxt`, `generateCaseIndex`, and `runCaseIndexBuild`.
2. Rewrite `scripts/build-case-index.js` to import from the new helper module, parse CLI options (via minimal manual parsing to avoid new dependencies), and call `runCaseIndexBuild`. Ensure the script prints the output path and number of processed cases, then exits with code `0` on success or `1` on failure.
3. Modify `/api/regenerate-case-index` in `server.js` to `import('./scripts/lib/caseIndexGenerator.js')` (with cache busting if desired) and call the exported generator. Remove the previous dynamic import of the CLI file.
4. Update `package.json` scripts:
    - Add `"build:cases": "node scripts/build-case-index.js"`.
    - Change `"build"` to `"npm run build:cases"` (or call the node command directly).
    - (Optional) Update `start:local` to `"npm run build:cases && node server.js"` for readability.
5. Update `start.bat` (and any other helper scripts) to call `npm run build:cases` instead of hard-coding the node binary.
6. Add a short "Build & Deploy" section to `README.md` describing the new build command and clarifying that the server no longer regenerates the index automatically.
7. Verify locally:
    - `npm run build` → should log summary and exit quickly (no Express logs).
    - `npm start` → should boot Express, log law loader status, and rely on the already-generated `public/cases/index.js`.
    - Optionally call `curl http://localhost:3000/api/regenerate-case-index` to ensure the API still works and uses the new helper.

## Validation and Acceptance

- Running `npm run build` in a clean repo must succeed without spawning the Express server or hitting `lawLoader.js`. Success criteria: command exits with code `0`, logs the output path, processed count, and writes `public/cases/index.js`.
- Running `npm start` after the build must start the server without attempting to rebuild the index automatically (no duplicate "相対パスID方式」 logs unless the API endpoint is called).
- The `/api/regenerate-case-index` endpoint must still regenerate the index on demand and respond with JSON describing `casesCount`, `categories`, and `subfolders`.
- Documentation (`README.md`, `start.bat`) must reflect the new command structure.

## Idempotence and Recovery

- The new helper module should overwrite `public/cases/index.js` atomically so repeated builds are safe.
- `npm run build` can be rerun any time; if it fails, rerun after fixing the reported file errors.
- Server start no longer depends on the build script, but operators can run `npm run build:cases` manually if they suspect the index is stale.

## Artifacts and Notes

- `scripts/lib/caseIndexGenerator.js` (new shared helper module).
- Updated `scripts/build-case-index.js`, `server.js`, `package.json`, `start.bat`, and `README.md`.
- Optional logging message summarizing skipped modules due to syntax issues.

## Interfaces and Dependencies

- `scripts/lib/caseIndexGenerator.js` should export:
    - `async function generateCaseIndex(casesRootDirectory, outputFilePath)` returning `{ casesCount, categories, subfolders, summaries }` (same shape as today).
    - `function findJsFiles(dir)` and `function tryReadTxt(path)` for reuse/testing.
    - `async function runCaseIndexBuild(options)` that wraps argument parsing and logging for the CLI.
- `scripts/build-case-index.js` must detect CLI invocation via `if (import.meta.url === pathToFileURL(process.argv[1]).href)` to avoid running during imports.
- `server.js` must import only the helper module to avoid accidental builds at import time.
