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
  `id`=1
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

Configure the database connection in a `.env` file. Defaults:

| Variable  | Default     |
| --------- | ----------- |
| `DB_HOST` | `localhost` |
| `DB_PORT` | `3308`      |
| `DB_USER` | `root`      |
| `DB_PASS` | `secret`    |
| `DB_NAME` | `ck_test`   |

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
pnpm test        # vitest watch mode
pnpm vitest run  # single pass
```

Tests query a live database, so the MySQL server configured in `.env` must be running.
