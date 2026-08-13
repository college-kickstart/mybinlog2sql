import readline from 'readline'
import db from './db.js'

const columnMapCache = {}

export async function getColumnMap(table) {
	if (!/^\w+$/.test(table)) throw new Error(`invalid table name: ${table}`)
	if (columnMapCache[table]) return columnMapCache[table]
	const [items] = await db.execute(`DESCRIBE ${table}`)
	const cols = items.map(row => row.Field)
	columnMapCache[table] = cols
	return cols
}

function toExecutableSql(block) {
	const lines = block.replace(/;\s*$/, '').split('\n')
	const statements = []
	let current = null
	let section = null
	for (const line of lines) {
		if (/^(INSERT INTO|UPDATE|DELETE FROM) /i.test(line)) {
			current = { header: line.trimEnd(), SET: [], WHERE: [] }
			statements.push(current)
			section = null
		} else if (line === 'SET' || line === 'WHERE') {
			section = line
		} else if (current && section) {
			current[section].push(line.trim())
		}
	}
	const render = ({ header, SET, WHERE }) => {
		const parts = [header]
		if (SET.length) parts.push('SET\n  ' + SET.join(',\n  '))
		if (WHERE.length) parts.push('WHERE\n  ' + WHERE.join(' AND\n  '))
		return parts.join('\n')
	}
	return statements.map(render).join(';\n') + ';'
}

export async function replacePlaceholders(sql) {
	const query = /(INSERT INTO|UPDATE|DELETE FROM) (`[^`]+`\.)`([^`]+)`/i
	const match = sql.match(query)
	if (!match) return sql
	const [, action, schema, table] = match
	if (table === 't4s_session') return ''
	sql = sql.replaceAll(schema, '')
	const cols = await getColumnMap(table)
	const placeholders = /(?<=^  )@(\d+)(?==)/gm
	sql = sql.replaceAll(placeholders, (m, i) => {
		return '`' + cols[i - 1] + '`'
	})
	return toExecutableSql(sql)
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

	async function processLine(line) {
		const inQueryBlock = line.startsWith('### ')
		const inSchemaBlock = isSchema && !line.startsWith('/*!*/;')
		switch (true) {
			case isQuery && !inQueryBlock:
				isQuery = false
				sql = sql.trimEnd() + ';'
				sql = await replacePlaceholders(sql)
				if (sql) entries.push(sql)
				sql = ''
				// The line that ended the query block may itself start a schema block
				await processLine(line)
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
				delete columnMapCache[table]
			case line.startsWith('CREATE TABLE'):
				isSchema = true
			case inSchemaBlock:
				sql += line + '\n'
				break
		}
	}

	for await (const line of data) {
		await processLine(line)
	}
	return entries
}
