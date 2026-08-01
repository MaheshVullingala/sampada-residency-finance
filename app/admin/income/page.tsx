'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import TopBar from '@/components/TopBar'
import { money, ym } from '@/lib/money'

type Income={id:string,income_date:string,income_type:string,description:string|null,amount:number}
const TYPES=['Bank Interest','Refund','Penalty','Donation','Other Income']

export default function IncomePage(){
 const [month,setMonth]=useState(ym())
 const [rows,setRows]=useState<Income[]>([])
 const [total,setTotal]=useState(0)
 const [err,setErr]=useState('')
 const [editing,setEditing]=useState<Income|null>(null)
 async function load(){
  const r=await fetch(`/api/admin/income?month=${month}`)
  const j=await r.json()
  if(r.ok){setRows(j.income||[]);setTotal(j.total||0)} else setErr(j.error||'Failed to load income')
 }
 useEffect(()=>{load()},[month])
 async function save(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setErr('')
  const body=Object.fromEntries(new FormData(e.currentTarget).entries())
  const r=await fetch('/api/admin/income',{method:editing?'PATCH':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(editing?{...body,id:editing.id}:body)})
  const j=await r.json().catch(()=>({}))
  if(!r.ok){setErr(j.error||'Unable to save income');return}
  ;(e.currentTarget as HTMLFormElement).reset();setEditing(null);load()
 }
 async function del(id:string){
  if(!confirm('Delete this income entry? This cannot be undone.')) return
  const r=await fetch(`/api/admin/income?id=${id}`,{method:'DELETE'})
  if(!r.ok){const j=await r.json().catch(()=>({}));setErr(j.error||'Unable to delete income');return}
  load()
 }
 return <><TopBar admin/><main className="wrap"><div className="header"><div><h1>Other Income / Deposits</h1><p className="muted">Add bank interest, refunds, penalties, donations, or any income not linked to flat maintenance.</p></div><Link className="btn secondary" href="/admin">Back</Link></div>
  <div className="card"><h2>{editing?'Edit Income':'Add Income'}</h2>{err&&<p style={{color:'crimson'}}>{err}</p>}<form onSubmit={save} className="grid form-grid"><label>Date</label><input name="income_date" type="date" defaultValue={editing?.income_date || new Date().toISOString().slice(0,10)} required/><label>Income Type</label><select name="income_type" defaultValue={editing?.income_type||'Bank Interest'}>{TYPES.map(t=><option key={t}>{t}</option>)}</select><label>Description</label><input name="description" placeholder="Example: Quarterly bank interest" defaultValue={editing?.description||''}/><label>Amount</label><input name="amount" type="number" step="0.01" placeholder="0" defaultValue={editing?.amount||''} required/><button className="btn">{editing?'Update Income':'Add Income'}</button>{editing&&<button type="button" className="btn secondary" onClick={()=>setEditing(null)}>Cancel</button>}</form></div>
  <div className="card"><div className="header small"><div><h2>Income Entries</h2><p className="muted">Selected month total: <b>{money(total)}</b></p></div><input type="month" value={month} onChange={e=>setMonth(e.target.value)}/></div>{rows.length===0?<p className="muted">No other income entries for this month.</p>:<div className="table-wrap"><table className="table"><thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Amount</th><th>Actions</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.income_date}</td><td>{r.income_type}</td><td>{r.description||'-'}</td><td>{money(r.amount)}</td><td><div className="row-actions"><button className="mini-btn" onClick={()=>setEditing(r)}>Edit</button><button className="mini-btn danger" onClick={()=>del(r.id)}>Delete</button></div></td></tr>)}</tbody></table></div>}</div>
 </main></>
}
