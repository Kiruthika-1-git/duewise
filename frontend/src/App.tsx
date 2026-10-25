
import { useEffect, useState, type FormEvent } from 'react'
import './App.css'

const API_URL = 'http://127.0.0.1:3000/api'

type Bill = {
  id: number
  name: string
  category: string
  amount: number
  dueDate: string
  paid: boolean
}

type ApiBill = {
  id: number
  title: string
  amount: string | number
  due_date: string
  category: string
  status: string
}

function mapBill(bill: ApiBill): Bill {
  return {
    id: bill.id,
    name: bill.title,
    category: bill.category,
    amount: Number(bill.amount),
    dueDate: String(bill.due_date).slice(0, 10),
    paid: bill.status === 'paid',
  }
}

function App() {
  const [bills, setBills] = useState<Bill[]>([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadBills() {
    try {
      setError('')
      const response = await fetch(`${API_URL}/bills`)
      if (!response.ok) throw new Error('Could not load bills.')

      const data: ApiBill[] = await response.json()
      setBills(data.map(mapBill))
    } catch {
      setError('Could not connect to the API. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadBills()
  }, [])

  const unpaid = bills.filter((bill) => !bill.paid)
  const totalDue = unpaid.reduce((sum, bill) => sum + bill.amount, 0)

  async function addBill(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    try {
      const response = await fetch(`${API_URL}/bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: name.trim(),
          amount: Number(amount),
          due_date: dueDate,
          category: 'Other',
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Could not save the bill.')
      }

      setBills((current) => [...current, mapBill(data)].sort(
        (a, b) => a.dueDate.localeCompare(b.dueDate),
      ))
      setName('')
      setAmount('')
      setDueDate('')
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the bill.')
    }
  }

  async function togglePaid(id: number) {
    const bill = bills.find((item) => item.id === id)
    if (!bill || bill.paid) return

    setError('')

    try {
      const response = await fetch(`${API_URL}/bills/${id}/pay`, {
        method: 'PATCH',
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Could not update the bill.')
      }

      setBills((current) =>
        current.map((item) => item.id === id ? mapBill(data) : item),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the bill.')
    }
  }

  return (
    <main className="app">
      <aside className="sidebar">
        <div className="brand"><span>✦</span> DueWise</div>
        <p className="nav-label">WORKSPACE</p>
        <div className="nav-item active">▦ &nbsp; Dashboard</div>
        <div className="nav-item">▤ &nbsp; My bills</div>
        <div className="nav-item">◈ &nbsp; Renewals</div>
        <div className="nav-item">⚙ &nbsp; Settings</div>
        <div className="sidebar-bottom">
          <div className="avatar">DW</div>
          <div><strong>My Workspace</strong><small>Personal account</small></div>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <span>Personal finance / Dashboard</span>
          <span className="today">◷ &nbsp; Your money, organized</span>
        </header>

        <div className="page">
          <div className="welcome">
            <div>
              <p className="eyebrow">YOUR FINANCIAL OVERVIEW</p>
              <h1>Good day! 👋</h1>
              <p className="muted">Keep track of bills and never miss a renewal.</p>
            </div>
            <button className="primary" onClick={() => setShowForm(!showForm)}>
              + Add a bill
            </button>
          </div>

          {error && <p role="alert" className="muted">{error}</p>}

          {showForm && (
            <form className="bill-form" onSubmit={addBill}>
              <h2>Add a new bill</h2>
              <label>
                Bill name
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Electricity" />
              </label>
              <label>
                Amount (₹)
                <input required min="0.01" step="0.01" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1200" />
              </label>
              <label>
                Due date
                <input required type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </label>
              <button className="primary" type="submit">Save bill</button>
            </form>
          )}

          <div className="stats">
            <article className="stat-card">
              <div className="stat-top"><span>Total outstanding</span><span className="stat-icon purple">₹</span></div>
              <h2>₹{totalDue.toLocaleString('en-IN')}</h2>
              <p className="muted">{unpaid.length} bills awaiting payment</p>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span>Unpaid bills</span><span className="stat-icon orange">◈</span></div>
              <h2>{unpaid.length}</h2>
              <p className="muted">Across your bill list</p>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span>Paid bills</span><span className="stat-icon green">✓</span></div>
              <h2>{bills.filter((bill) => bill.paid).length}</h2>
              <p className="muted">Great job staying on track</p>
            </article>
          </div>

          <section className="bills-section">
            <div className="section-heading">
              <div><h2>Your bills</h2><p className="muted">Manage your upcoming payments</p></div>
              <span className="count">{bills.length} total</span>
            </div>
            <div className="bill-list">
              <div className="bill-row table-head">
                <span>BILL DETAILS</span><span>DUE DATE</span><span>AMOUNT</span><span>STATUS</span>
              </div>

              {loading && <p className="muted">Loading bills...</p>}

              {!loading && bills.length === 0 && (
                <p className="muted">No bills yet. Select "Add a bill" to get started.</p>
              )}

              {bills.map((bill) => (
                <div className="bill-row" key={bill.id}>
                  <div className="bill-name">
                    <div className="bill-icon">{bill.category === 'Subscription' ? '◈' : '▤'}</div>
                    <div><strong>{bill.name}</strong><small>{bill.category}</small></div>
                  </div>
                  <span className="date">{new Date(`${bill.dueDate}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <strong>₹{bill.amount.toLocaleString('en-IN')}</strong>
                  <button
                    className={bill.paid ? 'status paid' : 'status pending'}
                    onClick={() => void togglePaid(bill.id)}
                    disabled={bill.paid}
                  >
                    {bill.paid ? '✓ Paid' : '◷ Mark paid'}
                  </button>
                </div>
              ))}
            </div>
          </section>
          <p className="footer-note">DueWise · Your bills, under control.</p>
        </div>
      </section>
    </main>
  )
}

export default App
