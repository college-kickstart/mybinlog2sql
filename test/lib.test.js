import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import { getColumnMap } from '../lib.js'

beforeAll(async () => {})

afterAll(async () => {
})

describe('getColumnMap', () => {
	it('should return the correct column map for categories', async () => {
		const tableName = 'categories'
		const expectedColumns = ['id', 'category_name']
		const columns = await getColumnMap(tableName)
		expect(columns).toEqual(expectedColumns)
	})
})

describe('replacePlaceholders', () => {
	it('should replace placeholders with column names', async () => {
		const sql = 'INSERT INTO `categories` (`id`, `category_name`) VALUES (@1, @2);'
		const expectedSql = 'INSERT INTO `categories` (`id`, `category_name`) VALUES (id, category_name);'
		const result = await replacePlaceholders(sql)
		expect(result).toEqual(expectedSql)
	})
})
