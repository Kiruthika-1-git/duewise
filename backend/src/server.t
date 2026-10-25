
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { pool } from './db.js'

const app = express()
const PORT = Number(process.env.PORT) || 3000

app.use(cors())
app.use(express.json())

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({
      status: 'ok',
      service: 'DueWise API',
      database: 'connected',
    })
  } catch {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
    })
  }
})

app.get('/api/bills', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM bills ORDER BY due_date ASC, id ASC'
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Failed to fetch bills:', error)
    res.status(500).json({ error: 'Failed to fetch bills' })
  }
})

app.post('/api/bills', async (req, res) => {
  const { title, amount, due_date, category, reminder_email } = req.body

  if (
    typeof title !== 'string' ||
    !title.trim() ||
    !Number.isFinite(Number(amount)) ||
    Number(amount) < 0 ||
    typeof due_date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(due_date)
  ) {
    res.status(400).json({
      error: 'Valid title, non-negative amount, and due date are required',
    })
    return
  }

  try {
    const result = await pool.query(
      `INSERT INTO bills
        (title, amount, due_date, category, reminder_email)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        title.trim(),
        Number(amount),
        due_date,
        typeof category === 'string' && category.trim()
          ? category.trim()
          : 'Other',
        typeof reminder_email === 'string' && reminder_email.trim()
          ? reminder_email.trim()
          : null,
      ]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Failed to create bill:', error)
    res.status(500).json({ error: 'Failed to create bill' })
  }
})

app.patch('/api/bills/:id/pay', async (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'Invalid bill ID' })
    return
  }

  try {
    const result = await pool.query(
      `UPDATE bills
       SET status = 'paid', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    )

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Bill not found' })
      return
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Failed to update bill:', error)
    res.status(500).json({ error: 'Failed to update bill' })
  }
})

app.listen(PORT, () => {
  console.log(`DueWise API running at http://localhost:${PORT}`)
})
