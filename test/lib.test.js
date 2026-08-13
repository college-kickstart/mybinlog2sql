import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { Readable } from 'stream'

import db from '../db.js'
import { getColumnMap, replacePlaceholders, parseLogFile } from '../lib.js'

beforeAll(async () => {
	// Self-seed the table the tests rely on, matching test.sql
	await db.execute('DROP TABLE IF EXISTS categories')
	await db.execute(`
		CREATE TABLE categories (
			id INT AUTO_INCREMENT PRIMARY KEY,
			category_name VARCHAR(50)
		)
	`)
})

afterAll(async () => {
	await db.execute('DROP TABLE IF EXISTS categories')
	// The open connection keeps the process alive otherwise
	await db.end()
})

describe('getColumnMap', () => {
	it('returns the column names of a table', async () => {
		expect(await getColumnMap('categories')).toEqual(['id', 'category_name'])
	})

	it('rejects invalid table names', async () => {
		await expect(getColumnMap('categories; DROP TABLE categories')).rejects.toThrow('invalid table name')
	})
})

describe('replacePlaceholders', () => {
	it('resolves @N placeholders to column names and strips the schema qualifier', async () => {
		const sql = "INSERT INTO `test`.`categories`\nSET\n  @1=1\n  @2='Electronics';"
		const expected = "INSERT INTO `categories`\nSET\n  `id`=1,\n  `category_name`='Electronics';"
		expect(await replacePlaceholders(sql)).toEqual(expected)
	})

	it('terminates each row event as its own statement', async () => {
		const sql =
			"INSERT INTO `test`.`categories`\nSET\n  @1=1\n  @2='Books'\n" +
			"INSERT INTO `test`.`categories`\nSET\n  @1=2\n  @2='Clothing';"
		const expected =
			"INSERT INTO `categories`\nSET\n  `id`=1,\n  `category_name`='Books';\n" +
			"INSERT INTO `categories`\nSET\n  `id`=2,\n  `category_name`='Clothing';"
		expect(await replacePlaceholders(sql)).toEqual(expected)
	})

	it('joins DELETE conditions with AND', async () => {
		const sql = "DELETE FROM `test`.`categories`\nWHERE\n  @1=1\n  @2='Books';"
		const expected = "DELETE FROM `categories`\nWHERE\n  `id`=1 AND\n  `category_name`='Books';"
		expect(await replacePlaceholders(sql)).toEqual(expected)
	})

	it('puts SET before WHERE for UPDATE', async () => {
		const sql = "UPDATE `test`.`categories`\nWHERE\n  @1=1\n  @2='Books'\nSET\n  @1=1\n  @2='Magazines';"
		const expected =
			"UPDATE `categories`\nSET\n  `id`=1,\n  `category_name`='Magazines'\n" +
			"WHERE\n  `id`=1 AND\n  `category_name`='Books';"
		expect(await replacePlaceholders(sql)).toEqual(expected)
	})

	it('drops events for the t4s_session table', async () => {
		const sql = 'DELETE FROM `ck`.`t4s_session`\nWHERE\n  @1=123;'
		expect(await replacePlaceholders(sql)).toEqual('')
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

		expect(entries).toEqual([
			"INSERT INTO `categories`\nSET\n  `id`=1,\n  `category_name`='Electronics';",
			'CREATE TABLE `foo` (\n  `id` int\n) ENGINE=InnoDB;',
		])
	})
})
