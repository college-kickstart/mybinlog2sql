# mybinlog2sql

Convert MySQL binlog dumps (`mysqlbinlog --verbose` output) back into executable SQL.

Under row-based replication the binlog records row events instead of the original statements. `mysqlbinlog --verbose` renders those events as commented pseudo-SQL with positional placeholders:

```sql
### INSERT INTO `test`.`categories`
### SET
###   @1=1
###   @2='Electronics'
```

This tool reconstructs runnable statements from that output by resolving each `@N` placeholder to the real column name, looked up live from the database with `DESCRIBE`:

```sql
INSERT INTO `categories`
SET
  `id`=1,
  `category_name`='Electronics';
```

## Requirements

- Node.js 18+ (uses ES modules and top-level await)
- pnpm
- A running MySQL server containing the tables referenced in the binlog (needed to resolve column names)

## Setup

```sh
pnpm install
```

Copy `.env.example` to `.env` and fill it in - there are no built-in defaults, and the tool refuses to start while any `DB_*` variable is missing.

```sh
cp .env.example .env
```

| Variable         | Purpose                                                                    |
| ---------------- | -------------------------------------------------------------------------- |
| `DB_HOST`        | MySQL host                                                                  |
| `DB_PORT`        | MySQL port                                                                  |
| `DB_USER`        | MySQL user                                                                  |
| `DB_PASS`        | MySQL password                                                              |
| `DB_NAME`        | Database to resolve column names against                                    |
| `TABLE_EXCLUDE`  | Space separated table names whose row events are dropped from the output    |
| `TABLE_WHERE_PK` | Space separated table names whose `WHERE` is narrowed to primary key columns |

`TABLE_EXCLUDE` is for noise you never want to replay, such as a session table. `TABLE_WHERE_PK` keeps `UPDATE` and `DELETE` targeted by primary key instead of matching the full before-image row; a table with no primary key falls back to the full `WHERE`. Both match exact table names, no wildcards.

`NULL` values in a `WHERE` clause are always emitted as `` `col` IS NULL ``, not `` `col`=NULL `` - the latter is what the binlog dump implies but it never matches a row in MySQL.

## Usage

Dump a binlog in verbose mode, then parse it:

```sh
mysqlbinlog --verbose /var/lib/mysql/<binlog-file> > dump.sql
pnpm parse dump.sql
```

Reconstructed SQL is printed to stdout. A checked-in sample dump is included:

```sh
pnpm parse pseudo.sql
```

## Sample data

- `schema.sql` — seeds a `test` database with sample tables
- `test.sql` — DDL/DML changes that generate binlog events
- `pseudo.sql` — example `mysqlbinlog --verbose` output produced from those changes

## Tests

```sh
pnpm test
```

Tests query a live database, so the MySQL server configured in `.env` must be running. The suite creates and drops its own `categories` and `visits` tables in the configured database.
