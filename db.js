import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

// Load env variables
dotenv.config()

const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_PORT = process.env.DB_PORT || 3308
const DB_USER = process.env.DB_USER || 'root'
const DB_PASS = process.env.DB_PASS || 'secret'
const DB_NAME = process.env.DB_NAME || 'ck_test'

// Connect to MySQL
const db = await mysql.createConnection({
	host: DB_HOST,
	port: DB_PORT,
	user: DB_USER,
	password: DB_PASS,
	database: DB_NAME,
})

export default db
