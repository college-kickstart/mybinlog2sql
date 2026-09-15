import readline from 'readline'
import db from './db.js'

const describeCache = {}

async function describe(table) {
	if (!/^\w+$/.test(table)) throw new Error(`invalid table name: ${table}`)
	if (describeCache[table]) return describeCache[table]
	const [rows] = await db.execute(`DESCRIBE ${table}`)
	describeCache[table] = rows
	return rows
}

export async function getColumnMap(table) {
	return (await describe(table)).map(row => row.Field)
}

export async function getPrimaryKey(table) {
	return (await describe(table)).filter(row => row.Key === 'PRI').map(row => row.Field)
}

// Read lazily, not at import time: ESM hoists imports, so a caller cannot set
// these before this module is evaluated.
function envTables(name) {
	return new Set((process.env[name] || '').split(/\s+/).filter(Boolean))
}

function toExecutableSql(block, pkCols = []) {
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
	// `col`=NULL never matches in MySQL, the before-image needs `col` IS NULL
	const nullSafe = line => line.replace(/^(`[^`]+`)=NULL$/, '$1 IS NULL')
	const narrow = lines => {
		if (!pkCols.length) return lines
		const kept = lines.filter(line => pkCols.includes(line.match(/^`([^`]+)`=/)?.[1]))
		return kept.length ? kept : lines
	}
	const render = ({ header, SET, WHERE }) => {
		const parts = [header]
		if (SET.length) parts.push('SET\n  ' + SET.join(',\n  '))
		const where = narrow(WHERE).map(nullSafe)
		if (where.length) parts.push('WHERE\n  ' + where.join(' AND\n  '))
		return parts.join('\n')
	}
	return statements.map(render).join(';\n') + ';'
}

export async function replacePlaceholders(sql) {
	const query = /(INSERT INTO|UPDATE|DELETE FROM) (`[^`]+`\.)`([^`]+)`/i
	const match = sql.match(query)
	if (!match) return sql
	const [, action, schema, table] = match
	if (envTables('TABLE_EXCLUDE').has(table)) return ''
	sql = sql.replaceAll(schema, '')
	const cols = await getColumnMap(table)
	const placeholders = /(?<=^  )@(\d+)(?==)/gm
	sql = sql.replaceAll(placeholders, (m, i) => {
		return '`' + cols[i - 1] + '`'
	})
	const pkCols = envTables('TABLE_WHERE_PK').has(table) ? await getPrimaryKey(table) : []
	return toExecutableSql(sql, pkCols)
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
				delete describeCache[table]
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
