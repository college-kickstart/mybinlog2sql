import fs from 'fs'
import db from './db.js'
import { parseLogFile } from './lib.js'

// Main
if (process.argv.length < 3) {
	console.error('Usage: node parse-log.js <log_file>')
	process.exit(1)
}
const stream = fs.createReadStream(process.argv[2])
let queries = await parseLogFile(stream)
queries.forEach(q => console.log(q + '\n'))
// console.log(queries)

// Close connection
await db.end()
