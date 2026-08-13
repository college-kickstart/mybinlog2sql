import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import { Readable } from 'stream'

import db from '../db.js'
import { getColumnMap, replacePlaceholders, parseLogFile } from '../lib.js'

before(async () => {
	// Self-seed the table the tests rely on, matching test.sql
	await db.execute('DROP TABLE IF EXISTS categories')
	await db.execute(`
		CREATE TABLE categories (
			id INT AUTO_INCREMENT PRIMARY KEY,
			category_name VARCHAR(50)
		)
	`)
})

after(async () => {
	await db.execute('DROP TABLE IF EXISTS categories')
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

	it('drops events for the t4s_session table', async () => {
		const sql = 'DELETE FROM `ck`.`t4s_session`\nWHERE\n  @1=123;'
		assert.equal(await replacePlaceholders(sql), '')
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
