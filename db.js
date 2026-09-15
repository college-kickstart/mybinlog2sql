import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

// quiet: dotenv 17 would otherwise print a tip line to stdout, corrupting piped SQL output
dotenv.config({ quiet: true })

const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASS', 'DB_NAME']
const missing = required.filter(name => !process.env[name])
if (missing.length) {
	throw new Error(`missing configuration: ${missing.join(', ')} - copy .env.example to .env and fill it in`)
}

// Connect to MySQL
const db = await mysql.createConnection({
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
})

export default db
