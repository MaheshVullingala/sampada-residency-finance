'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import TopBar from '@/components/TopBar'
import { money, ym } from '@/lib/money'

type Income = { id: string; month: string; income_type: string; amount: number; notes: string | null }
type BankStatement = { id: string; month: string; file_name: string; file_url: string; updated_at: string }
const TYPES = ['Monthly Maintenance', 'Emergency Fund', 'Other Income']

export default function CollectionsPage() {
  const [month, setMonth] = useState(ym())
  const [rows, setRows] = useState<Income[]>([])
  const [total, setTotal] = useState(0)
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState<Income | null>(null)
  const [formKey, setFormKey] = useState(0)
  const [statement, setStatement] = useState<BankStatement | null>(null)
  const [statementMessage, setStatementMessage] = useState('')

  async function load() {
    const [collectionsResponse, statementResponse] = await Promise.all([
      fetch(`/api/admin/collections?month=${month}`),
      fetch(`/api/admin/bank-statement?month=${month}`)
    ])
    const collectionsJson = await collectionsResponse.json()
    const statementJson = await statementResponse.json()
    if (collectionsResponse.ok) {
      setRows(collectionsJson.income || [])
      setTotal(Number(collectionsJson.total || 0))
    } else {
      setMessage(collectionsJson.error || 'Failed to load collection')
    }
    if (statementResponse.ok) setStatement(statementJson.statement || null)
    else setStatementMessage(statementJson.error || 'Failed to load bank statement')
  }

  useEffect(() => { load() }, [month])

  function resetForm() {
    setEditing(null)
    setFormKey(value => value + 1)
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('Saving...')
    const body = Object.fromEntries(new FormData(event.currentTarget).entries())
    const response = await fetch('/api/admin/collections', {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing ? { ...body, id: editing.id } : body)
    })
    const json = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage(json.error || 'Unable to save collection')
      return
    }
    setMessage(editing ? 'Collection updated' : 'Collection added')
    resetForm()
    await load()
  }


  async function saveStatement(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatementMessage('Saving...')
    const body = Object.fromEntries(new FormData(event.currentTarget).entries())
    const response = await fetch('/api/admin/bank-statement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const json = await response.json().catch(() => ({}))
    if (!response.ok) {
      setStatementMessage(json.error || 'Unable to save bank statement')
      return
    }
    setStatement(json.statement)
    setStatementMessage('Bank statement saved')
  }

  async function removeStatement() {
    if (!confirm('Remove the bank statement link for this month?')) return
    const response = await fetch(`/api/admin/bank-statement?month=${month}`, { method: 'DELETE' })
    const json = await response.json().catch(() => ({}))
    if (!response.ok) {
      setStatementMessage(json.error || 'Unable to remove bank statement')
      return
    }
    setStatement(null)
    setStatementMessage('Bank statement removed')
  }

  async function remove(id: string) {
    if (!confirm('Delete this collection entry?')) return
    const response = await fetch(`/api/admin/collections?id=${id}`, { method: 'DELETE' })
    const json = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage(json.error || 'Unable to delete collection')
      return
    }
    setMessage('Collection deleted')
    resetForm()
    await load()
  }

  return <><TopBar admin /><main className="wrap">
    <div className="header"><div><h1>Collections</h1><p className="muted">Enter the actual amount collected for each month. Flat Paid/Pending status remains separate and is used only for pending-dues tracking.</p></div><Link className="btn secondary" href="/admin">Back</Link></div>
    <div className="card"><h2>{editing ? 'Edit Collection' : 'Add Collection'}</h2>
      <form key={formKey} onSubmit={save} className="grid form-grid">
        <label>Month</label><input name="month" type="month" defaultValue={editing?.month || month} required />
        <label>Collection Type</label><select name="income_type" defaultValue={editing?.income_type || 'Monthly Maintenance'}>{TYPES.map(type => <option key={type}>{type}</option>)}</select>
        <label>Amount</label><input name="amount" type="number" min="0" step="0.01" defaultValue={editing?.amount ?? ''} required />
        <label>Notes</label><input name="notes" defaultValue={editing?.notes || ''} placeholder="Optional note" />
        <button className="btn">{editing ? 'Update Collection' : 'Add Collection'}</button>
        {editing && <button className="btn secondary" type="button" onClick={resetForm}>Cancel</button>}
      </form>
      {message && <p className="muted">{message}</p>}
    </div>
    <div className="card"><div className="header small"><div><h2>Bank Statement</h2><p className="muted">Add one view/download link for the selected month.</p></div></div>
      <form key={`${month}-${statement?.id || 'new'}`} onSubmit={saveStatement} className="grid form-grid">
        <input name="month" type="hidden" value={month} />
        <label>File Name</label><input name="file_name" defaultValue={statement?.file_name || `Bank Statement - ${month}`} placeholder="June 2026 Bank Statement" />
        <label>File Link</label><input name="file_url" type="url" defaultValue={statement?.file_url || ''} placeholder="Paste Google Drive or Supabase file URL" required />
        <button className="btn">{statement ? 'Update Statement' : 'Save Statement'}</button>
        {statement && <button className="btn secondary" type="button" onClick={removeStatement}>Remove</button>}
      </form>
      {statement && <div className="row-actions statement-actions"><a className="mini-btn" href={statement.file_url} target="_blank" rel="noreferrer">View</a><a className="mini-btn" href={statement.file_url} download>Download</a></div>}
      {statementMessage && <p className="muted">{statementMessage}</p>}
    </div>
    <div className="card"><div className="header small"><div><h2>Collection Entries</h2><p className="muted">Selected month total: <b>{money(total)}</b></p></div><input type="month" value={month} onChange={event => setMonth(event.target.value)} /></div>
      {rows.length === 0 ? <p className="muted">No collection entries for this month.</p> : <div className="table-wrap"><table className="table"><thead><tr><th>Type</th><th>Notes</th><th>Amount</th><th>Actions</th></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td>{row.income_type}</td><td>{row.notes || '-'}</td><td>{money(row.amount)}</td><td><div className="row-actions"><button className="mini-btn" onClick={() => { setEditing(row); setFormKey(value => value + 1) }}>Edit</button><button className="mini-btn danger" onClick={() => remove(row.id)}>Delete</button></div></td></tr>)}</tbody></table></div>}
    </div>
  </main></>
}
