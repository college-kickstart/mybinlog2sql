import readline from 'readline'
import db from './db.js'

let columnMapCache = {}

export async function getColumnMap(table) {
	const [items] = await db.execute(`DESCRIBE ${table}`)
	const cols = items.map(row => row.Field)
	columnMapCache[table] = cols
	return cols
}

export function replaceAtOffset(str, offset, replacement) {
  return str.slice(0, offset) + replacement + str.slice(offset + 2)
}

export async function replacePlaceholders(sql) {
	const query = /(INSERT INTO|UPDATE|DELETE FROM) (`[^`]+`\.)`([^`]+)`/i
	const [_, action, schema, table] = sql.match(query)
	if (table === 't4s_session') return ''
	sql = sql.replaceAll(schema, '')
	const cols = columnMapCache[table] || (await getColumnMap(table))
  const placeholders = /(?<=^  )@(\d+)(?==)/gm
  sql = sql.replaceAll(placeholders, (m, i) => {
    return '`' + cols[i - 1] + '`'
  })
	return sql
}

export async function parseLogFile(stream) {
	const data = readline.createInterface({
		input: stream,
		crlfDelay: Infinity,
	})
	let sql = ''
	let isSchema = false
	let isQuery = false
	let entries = []
	for await (const line of data) {
		const inQueryBlock = line.startsWith('### ')
		const inSchemaBlock = isSchema && !line.startsWith('/*!*/;')
		switch (true) {
			case isQuery && !inQueryBlock:
				isQuery = false
				sql = sql.trimEnd() + ';'
				sql = await replacePlaceholders(sql)
				if (sql) entries.push(sql)
				sql = ''
				break
			case inQueryBlock:
				isQuery = true
				sql += line.slice(4) + '\n'
				break
			case isSchema && !inSchemaBlock:
				isSchema = false
				sql = sql.trimEnd() + ';'
				entries.push(sql)
				sql = ''
				break
			case line.startsWith('ALTER TABLE'):
				const [_, table] = line.match(/ALTER TABLE `?(\w+)`?/i)
				columnMapCache[table] = undefined
			case line.startsWith('CREATE TABLE'):
				isSchema = true
			case inSchemaBlock:
				sql += line + '\n'
				break
		}
	}
	return entries
}
