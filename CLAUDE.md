# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

mybinlog2sql converts the output of `mysqlbinlog --verbose` back into executable SQL. Under row-based replication the binlog records row events, which the dump renders as `### `-prefixed pseudo-SQL with positional placeholders (`@1=`, `@2=`, …). This tool resolves those placeholders to real column names by querying a live MySQL server.

## Commands

pnpm is the package manager.

- `pnpm install` — install dependencies
- `pnpm parse <log_file>` — parse a binlog dump and print reconstructed SQL to stdout (e.g. `pnpm parse pseudo.sql`)
- `pnpm dev <log_file>` — same, restarting on file changes (nodemon)
- `pnpm test` — run vitest in watch mode
- `pnpm vitest run` — run tests once
- `pnpm vitest run -t 'should replace placeholders'` — run a single test by name

Tests hit a real database (`getColumnMap` executes `DESCRIBE`), so a reachable MySQL server with the expected tables is required — there are no mocks.

## Database connection

`db.js` opens a mysql2 connection at import time via top-level await, so importing `lib.js` (directly or through the tests) requires a reachable MySQL server. Configuration comes from `.env` via dotenv, with defaults: `DB_HOST` (localhost), `DB_PORT` (3308), `DB_USER` (root), `DB_PASS` (secret), `DB_NAME` (ck_test). The process hangs at exit unless `db.end()` is called — `parse-log.js` does this after parsing.

## Architecture

Pipeline: `parse-log.js` (CLI entry) streams the log file → `parseLogFile()` in `lib.js` walks it line-by-line as a state machine → returns an array of SQL statements.

`parseLogFile()` recognizes two block types:

- **Query blocks** — consecutive lines starting with `### ` (row events). When the block ends, `replacePlaceholders()` rewrites it: the schema qualifier is stripped and each `@N` placeholder is replaced with the table's Nth column name. Events for the `t4s_session` table are intentionally dropped (empty string returned).
- **Schema blocks** — lines from a `CREATE TABLE`/`ALTER TABLE` up to the `/*!*/;` terminator, passed through verbatim. An `ALTER TABLE` also invalidates that table's entry in the column cache.

Column names come from `DESCRIBE <table>` against the live DB and are cached per-table in the module-level `columnMapCache` in `lib.js`.

## Sample data workflow

- `schema.sql` — seeds a `test` database with sample tables
- `test.sql` — DDL/DML changes that generate binlog events
- `pseudo.sql` — checked-in example of the resulting `mysqlbinlog --verbose` output; usable directly as parser input
