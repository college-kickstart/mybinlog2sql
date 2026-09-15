import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import { execFile } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { Readable } from 'stream'

import db from '../db.js'
import { getColumnMap, getPrimaryKey, replacePlaceholders, parseLogFile } from '../lib.js'

before(async () => {
	// Self-seed the table the tests rely on, matching test.sql
	await db.execute('DROP TABLE IF EXISTS categories')
	await db.execute(`
		CREATE TABLE categories (
			id INT AUTO_INCREMENT PRIMARY KEY,
			category_name VARCHAR(50)
		)
	`)
	// A table without a primary key, for the TABLE_WHERE_PK fallback
	await db.execute('DROP TABLE IF EXISTS visits')
	await db.execute(`
		CREATE TABLE visits (
			path VARCHAR(50),
			seen_at DATETIME
		)
	`)
})

after(async () => {
	await db.execute('DROP TABLE IF EXISTS categories')
	await db.execute('DROP TABLE IF EXISTS visits')
	// The open connection keeps the process alive otherwise
	await db.end()
})

describe('getColumnMap', () => {
	it('returns the column names of a table', async () => {
		assert.deepEqual(await getColumnMap('categories'), ['id', 'category_name'])
	})

	it('rejects invalid table names', async () => {
		await assert.rejects(getColumnMap('categories; DROP TABLE categories'), /invalid table name/)
	})
})

describe('replacePlaceholders', () => {
	it('resolves @N placeholders to column names and strips the schema qualifier', async () => {
		const sql = "INSERT INTO `test`.`categories`\nSET\n  @1=1\n  @2='Electronics';"
		const expected = "INSERT INTO `categories`\nSET\n  `id`=1,\n  `category_name`='Electronics';"
		assert.equal(await replacePlaceholders(sql), expected)
	})

	it('terminates each row event as its own statement', async () => {
		const sql =
			"INSERT INTO `test`.`categories`\nSET\n  @1=1\n  @2='Books'\n" +
			"INSERT INTO `test`.`categories`\nSET\n  @1=2\n  @2='Clothing';"
		const expected =
			"INSERT INTO `categories`\nSET\n  `id`=1,\n  `category_name`='Books';\n" +
			"INSERT INTO `categories`\nSET\n  `id`=2,\n  `category_name`='Clothing';"
		assert.equal(await replacePlaceholders(sql), expected)
	})

	it('joins DELETE conditions with AND', async () => {
		const sql = "DELETE FROM `test`.`categories`\nWHERE\n  @1=1\n  @2='Books';"
		const expected = "DELETE FROM `categories`\nWHERE\n  `id`=1 AND\n  `category_name`='Books';"
		assert.equal(await replacePlaceholders(sql), expected)
	})

	it('puts SET before WHERE for UPDATE', async () => {
		const sql = "UPDATE `test`.`categories`\nWHERE\n  @1=1\n  @2='Books'\nSET\n  @1=1\n  @2='Magazines';"
		const expected =
			"UPDATE `categories`\nSET\n  `id`=1,\n  `category_name`='Magazines'\n" +
			"WHERE\n  `id`=1 AND\n  `category_name`='Books';"
		assert.equal(await replacePlaceholders(sql), expected)
	})

	it('rewrites a NULL comparison in WHERE as IS NULL', async () => {
		const sql = 'DELETE FROM `test`.`categories`\nWHERE\n  @1=1\n  @2=NULL;'
		const expected = 'DELETE FROM `categories`\nWHERE\n  `id`=1 AND\n  `category_name` IS NULL;'
		assert.equal(await replacePlaceholders(sql), expected)
	})

	it('leaves a NULL assignment in SET alone', async () => {
		const sql = 'UPDATE `test`.`categories`\nWHERE\n  @1=1\nSET\n  @1=1\n  @2=NULL;'
		const expected = 'UPDATE `categories`\nSET\n  `id`=1,\n  `category_name`=NULL\nWHERE\n  `id`=1;'
		assert.equal(await replacePlaceholders(sql), expected)
	})

	it('leaves a quoted NULL string value alone', async () => {
		const sql = "DELETE FROM `test`.`categories`\nWHERE\n  @1=1\n  @2='NULL';"
		const expected = "DELETE FROM `categories`\nWHERE\n  `id`=1 AND\n  `category_name`='NULL';"
		assert.equal(await replacePlaceholders(sql), expected)
	})
})

describe('getPrimaryKey', () => {
	it('returns the primary key columns of a table', async () => {
		assert.deepEqual(await getPrimaryKey('categories'), ['id'])
	})

	it('returns an empty array for a table without a primary key', async () => {
		assert.deepEqual(await getPrimaryKey('visits'), [])
	})
})

describe('TABLE_EXCLUDE', () => {
	const original = process.env.TABLE_EXCLUDE
	after(() => {
		// assigning undefined would store the string 'undefined'
		if (original === undefined) delete process.env.TABLE_EXCLUDE
		else process.env.TABLE_EXCLUDE = original
	})

	it('drops events for a listed table', async () => {
		process.env.TABLE_EXCLUDE = 't4s_session'
		const sql = 'DELETE FROM `ck`.`t4s_session`\nWHERE\n  @1=123;'
		assert.equal(await replacePlaceholders(sql), '')
	})

	it('drops events for every table in a space separated list', async () => {
		process.env.TABLE_EXCLUDE = 't4s_session  categories'
		const sql = "INSERT INTO `test`.`categories`\nSET\n  @1=1\n  @2='Books';"
		assert.equal(await replacePlaceholders(sql), '')
	})

	it('leaves unlisted tables alone', async () => {
		process.env.TABLE_EXCLUDE = 't4s_session'
		const sql = "INSERT INTO `test`.`categories`\nSET\n  @1=1\n  @2='Books';"
		const expected = "INSERT INTO `categories`\nSET\n  `id`=1,\n  `category_name`='Books';"
		assert.equal(await replacePlaceholders(sql), expected)
	})

	it('excludes nothing when unset', async () => {
		delete process.env.TABLE_EXCLUDE
		const sql = 'DELETE FROM `ck`.`t4s_session`\nWHERE\n  @1=123;'
		assert.notEqual(await replacePlaceholders(sql), '')
	})
})

describe('TABLE_WHERE_PK', () => {
	const original = process.env.TABLE_WHERE_PK
	after(() => {
		// assigning undefined would store the string 'undefined'
		if (original === undefined) delete process.env.TABLE_WHERE_PK
		else process.env.TABLE_WHERE_PK = original
	})

	it('narrows a DELETE WHERE to the primary key columns', async () => {
		process.env.TABLE_WHERE_PK = 'categories'
		const sql = "DELETE FROM `test`.`categories`\nWHERE\n  @1=1\n  @2='Books';"
		const expected = 'DELETE FROM `categories`\nWHERE\n  `id`=1;'
		assert.equal(await replacePlaceholders(sql), expected)
	})

	it('narrows an UPDATE WHERE but leaves SET complete', async () => {
		process.env.TABLE_WHERE_PK = 'categories'
		const sql = "UPDATE `test`.`categories`\nWHERE\n  @1=1\n  @2='Books'\nSET\n  @1=1\n  @2='Magazines';"
		const expected =
			"UPDATE `categories`\nSET\n  `id`=1,\n  `category_name`='Magazines'\n" +
			'WHERE\n  `id`=1;'
		assert.equal(await replacePlaceholders(sql), expected)
	})

	it('falls back to the full WHERE for a table without a primary key', async () => {
		process.env.TABLE_WHERE_PK = 'visits'
		const sql = "DELETE FROM `test`.`visits`\nWHERE\n  @1='/home'\n  @2='2026-01-01 00:00:00';"
		const expected = "DELETE FROM `visits`\nWHERE\n  `path`='/home' AND\n  `seen_at`='2026-01-01 00:00:00';"
		assert.equal(await replacePlaceholders(sql), expected)
	})

	it('leaves unlisted tables with a full WHERE', async () => {
		process.env.TABLE_WHERE_PK = 'something_else'
		const sql = "DELETE FROM `test`.`categories`\nWHERE\n  @1=1\n  @2='Books';"
		const expected = "DELETE FROM `categories`\nWHERE\n  `id`=1 AND\n  `category_name`='Books';"
		assert.equal(await replacePlaceholders(sql), expected)
	})
})

describe('parseLogFile', () => {
	it('parses query and schema blocks from a binlog dump', async () => {
		const dump = [
			'### INSERT INTO `test`.`categories`',
			'### SET',
			'###   @1=1',
			"###   @2='Electronics'",
			'CREATE TABLE `foo` (',
			'  `id` int',
			') ENGINE=InnoDB',
			'/*!*/;',
		].join('\n')

		const entries = await parseLogFile(Readable.from([dump]))

		assert.deepEqual(entries, [
			"INSERT INTO `categories`\nSET\n  `id`=1,\n  `category_name`='Electronics';",
			'CREATE TABLE `foo` (\n  `id` int\n) ENGINE=InnoDB;',
		])
	})
})

describe('db.js configuration', () => {
	it('names the missing DB_ variables instead of failing to connect', async () => {
		const env = { ...process.env }
		for (const key of ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASS', 'DB_NAME']) delete env[key]
		// A directory with no .env, so dotenv cannot fill the gaps back in
		const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'mybinlog2sql-'))
		const url = new URL('../db.js', import.meta.url).href
		try {
			await promisify(execFile)(process.execPath, ['--input-type=module', '-e', `import('${url}')`], { cwd, env, timeout: 20000 })
			assert.fail('importing db.js should have failed')
		} catch (err) {
			assert.match(err.stderr, /DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME/)
		} finally {
			fs.rmSync(cwd, { recursive: true, force: true })
		}
	})
})
