# Package upgrades, test suite repair, executable-SQL output

-- kimi k3, 2026-08-13

## What was done

- **Dependencies**: mysql2 3.23.2 → 3.23.3, vitest 3.0.5 → 4.1.10 (dotenv, nodemon already latest).
- **AGENTS.md is now the source of truth.** It was a symlink to CLAUDE.md (which is why the two were identical). The symlink was replaced with a real file; CLAUDE.md is a short pointer to it.
- **Test suite repaired** (was red before the upgrade, two unrelated causes):
  - `replacePlaceholders` was used but never imported.
  - Tests expected a `categories` table that existed nowhere. The suite now self-seeds it in `beforeAll` (matching `test.sql`) and drops it in `afterAll`, plus calls `db.end()` so vitest no longer hangs at exit.
  - Coverage added: multi-row INSERT termination, DELETE `AND`-joins, UPDATE SET-before-WHERE, `t4s_session` drop, table-name validation, `parseLogFile` end-to-end through a stream. 8/8 green.
- **Parser bug: swallowed schema blocks.** A `CREATE TABLE`/`ALTER TABLE` directly after a `### ` query block was consumed by the block-end case and never processed. The line that ends a query block is now re-processed (`processLine` recursion in `parseLogFile`).
- **Output is now executable SQL.** Previously the reconstructed statements were not runnable: no commas between SET assignments, no `AND` between WHERE conditions, UPDATE printed WHERE before SET, and multi-row events were merged into one unterminated blob. New `toExecutableSql()` in `lib.js` normalizes each row event into a properly terminated statement.
- **dotenv 17 stdout pollution fixed**: `dotenv.config({ quiet: true })` in `db.js` — v17 prints a tip line to stdout, which corrupted piped SQL output.
- Removed dead export `replaceAtOffset` (nothing used it).
- `getColumnMap` now owns the cache lookup and validates table names (`/^\w+$/`) before interpolating into `DESCRIBE`.
- README sample output updated to the new (valid) format.

## Verification

- `pnpm vitest run`: 8/8 pass.
- End-to-end: seeded `test` DB with schema.sql + test.sql, parsed `pseudo.sql`, reset with schema.sql, piped the parser output into `mysql test` — every statement executed with no syntax errors.

## Known limitation (deliberately not changed)

DELETE/UPDATE WHERE clauses contain the full before-image of the row. Against a schema that has since evolved, conditions may silently match 0 rows: e.g. a `price` stored as DECIMAL becomes FLOAT after the replayed ALTER, so `price=14.49` no longer matches; a column added by the replayed ALTER gets a current timestamp, so the recorded value never matches. Filtering WHERE to primary-key columns only (standard for row-based replay) would fix replayability but loses the full before-image, which has audit value. Tradeoff left for a future decision.

## Follow-ups

- Documentation ideas not yet applied: `.env.example`, a "regenerating pseudo.sql" walkthrough, README note on the `t4s_session` drop.
- A `test` database (from schema.sql/test.sql) is left on the local MySQL server from verification; drop it if unwanted.
