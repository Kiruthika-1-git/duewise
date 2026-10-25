import { pool } from './db.js'

async function testDatabase() {
  try {
    const result = await pool.query(
      'SELECT current_database() AS database, NOW() AS server_time'
    )

    console.log('Database connection successful!')
    console.log('Database:', result.rows[0].database)
    console.log('Server time:', result.rows[0].server_time)
  } catch (error) {
    console.error('Database connection failed:', error)
  } finally {
    await pool.end()
  }
}

testDatabase()