# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, OpenCode, Codex, etc.) when working with code in this repository. It is the source of truth — `CLAUDE.md` only points here.

## What this is

mybinlog2sql converts the output of `mysqlbinlog --verbose` back into executable SQL. Under row-based replication the binlog records row events, which the dump renders as `### `-prefixed pseudo-SQL with positional placeholders (`@1=`, `@2=`, …). This tool resolves those placeholders to real column names by querying a live MySQL server.

## Commands

pnpm is the package manager.

- `pnpm install` — install dependencies
- `pnpm parse <log_file>` — parse a binlog dump and print reconstructed SQL to stdout (e.g. `pnpm parse pseudo.sql`)
- `pnpm dev <log_file>` — same, restarting on file changes (nodemon)
- `pnpm test` — run tests with Node's built-in test runner
- `pnpm test --test-name-pattern='resolves @N placeholders'` — run a single test by name

Tests hit a real database (`getColumnMap` executes `DESCRIBE`), so a reachable MySQL server is required — there are no mocks. The suite self-seeds `categories` (with a primary key) and `visits` (without one) in the configured database, drops both afterwards, and closes the connection via `db.end()` in `after` so Node can exit. One test spawns a child `node` importing `db.js` from an empty temp directory to check the missing-configuration error.

## Database connection

`db.js` opens a mysql2 connection at import time via top-level await, so importing `lib.js` (directly or through the tests) requires a reachable MySQL server. Configuration comes from `.env` via dotenv and there are no code defaults: `db.js` throws listing every missing `DB_HOST`/`DB_PORT`/`DB_USER`/`DB_PASS`/`DB_NAME` before it tries to connect. `.env` is gitignored; `.env.example` is the committed template. The process hangs at exit unless `db.end()` is called — `parse-log.js` does this after parsing.

Two optional variables shape the output, both space separated lists of exact table names read lazily inside `lib.js` (not at import time, so tests can set them):

- `TABLE_EXCLUDE` — row events for these tables are dropped entirely.
- `TABLE_WHERE_PK` — the `WHERE` clause for these tables keeps only primary key columns, from `Key === 'PRI'` in the `DESCRIBE` rows. A table with no primary key falls back to the full `WHERE`.

## Architecture

Pipeline: `parse-log.js` (CLI entry) streams the log file → `parseLogFile()` in `lib.js` walks it line-by-line as a state machine → returns an array of SQL statements.

`parseLogFile()` recognizes two block types:

- **Query blocks** — consecutive lines starting with `### ` (row events). When the block ends, `replacePlaceholders()` rewrites it: the schema qualifier is stripped, each `@N` placeholder is replaced with the table's Nth column name, and the pseudo-SQL is normalized into executable statements (comma-separated assignments, `AND`-joined conditions, `SET` before `WHERE` for UPDATE, one terminated statement per row event). Tables listed in `TABLE_EXCLUDE` are dropped (empty string returned), tables listed in `TABLE_WHERE_PK` get a primary-key-only `WHERE`, and any `` `col`=NULL `` in a `WHERE` becomes `` `col` IS NULL `` since the former never matches in MySQL. The line that ends a query block is re-processed, since it may itself start a schema block.
- **Schema blocks** — lines from a `CREATE TABLE`/`ALTER TABLE` up to the `/*!*/;` terminator, passed through verbatim. An `ALTER TABLE` also invalidates that table's entry in the column cache.

`DESCRIBE <table>` rows are fetched from the live DB and cached per-table in the module-level `describeCache` in `lib.js` (inside `describe()`); `getColumnMap` derives column names from them and `getPrimaryKey` the primary key columns.

## Sample data workflow

- `schema.sql` — seeds a `test` database with sample tables
- `test.sql` — DDL/DML changes that generate binlog events
- `pseudo.sql` — checked-in example of the resulting `mysqlbinlog --verbose` output; usable directly as parser input (point `DB_NAME=test` at the seeded database)
