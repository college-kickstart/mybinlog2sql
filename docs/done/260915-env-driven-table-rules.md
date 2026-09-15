# Env-driven table rules and no config defaults in git

-- claude opus 5, 2026-09-15

## What was done

Three related changes to how the parser is configured and what it emits.

**`TABLE_EXCLUDE`** replaces the hardcoded `if (table === 't4s_session') return ''` in `lib.js`. Space separated list of exact table names, read from `.env`, row events for those tables are dropped.

**`TABLE_WHERE_PK`** narrows the `WHERE` clause of `UPDATE` and `DELETE` to primary key columns for the listed tables. `SET` is untouched, `INSERT` is untouched. A table with no primary key falls back to the full `WHERE`.

**`IS NULL` fix** (all tables, no config). `mysqlbinlog --verbose` renders a NULL before-image as `@N=NULL`, which became `` `col`=NULL `` in the output. That never matches a row in MySQL, so every such `DELETE`/`UPDATE` was silently a no-op. `WHERE` lines of that exact shape now render as `` `col` IS NULL ``. A quoted `'NULL'` string value is left alone, and `SET` keeps `=NULL` since that is a valid assignment.

**Configuration.** `db.js` no longer carries `|| 'localhost'` style defaults. It throws listing every missing `DB_*` variable before attempting to connect. `.env` is now gitignored, `.env.example` is the committed template, and a local `.env` was created with the values that used to be the code defaults.

## Key decisions

| Decision | Reason |
| --- | --- |
| Env vars read lazily inside `lib.js`, not at import time | ESM hoists imports, so tests cannot set `process.env` before the module evaluates |
| `getColumnMap` keeps returning `string[]` | Two callers and an existing test depend on the shape; the cache now holds full `DESCRIBE` rows and `getPrimaryKey` reads `Key === 'PRI'` from the same entry |
| No-PK table falls back to full `WHERE` | User's call: no crash mid-parse over a config that cannot apply |
| `IS NULL` unconditional, not behind a flag | It is a bugfix, the old output could not match rows |
| Exact table names, no globs | Nothing asked for patterns |

`ALTER TABLE` cache invalidation still works unchanged - same cache key, now on `describeCache`.

## Testing

TDD throughout, 8 tests before this session, 21 after. New coverage: `getPrimaryKey` with and without a PK, `TABLE_EXCLUDE` (single, multi, unlisted, unset), `TABLE_WHERE_PK` (DELETE, UPDATE, no-PK fallback, unlisted), `IS NULL` rewrite plus the quoted-`'NULL'` and `SET`-assignment counter-cases, and a child-process check that `db.js` names the missing variables. The suite now also seeds a `visits` table (no primary key) alongside `categories`.

Verified end to end against `pseudo.sql`: `DELETE FROM products` goes from three `AND`-joined conditions to `` WHERE `id`=4 `` when `products` is listed.

## Follow-ups

- No CI test workflow exists, so nothing needed updating there. If one is added it must set the `DB_*` variables explicitly now that defaults are gone.
- `pseudo.sql` contains no NULL before-image, so the `IS NULL` path is only covered by unit tests. Worth regenerating the sample with a nullable column some day.
