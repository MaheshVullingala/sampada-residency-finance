'use client'
import { useEffect, useState } from 'react'

export default function SetupPage(){
 const [settings,setSettings]=useState<any>(null)
 const [msg,setMsg]=useState('')
 async function load(){const r=await fetch('/api/admin/setup'); const j=await r.json(); if(!r.ok){setMsg(j.error||'Could not load setup'); return} setSettings(j.settings)}
 useEffect(()=>{load()},[])
 async function save(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault(); setMsg('Saving...')
  const fd=new FormData(e.currentTarget)
  const r=await fetch('/api/admin/setup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(fd.entries()))})
  const j=await r.json(); setMsg(r.ok?'Starting setup saved':(j.error||'Could not save'))
  if(r.ok) setSettings(j.settings)
 }
 return <main className="wrap"><div className="header"><div><h1>Starting Setup</h1><p className="muted">Add the opening balance from the date you took charge.</p></div><a className="btn secondary" href="/admin">Back</a></div><div className="card"><form onSubmit={save} className="grid"><div className="grid2"><div><label>Charge Taken Date</label><input name="start_date" type="date" defaultValue={settings?.start_date||'2025-02-06'} required/></div><div><label>Opening Balance on That Date</label><input name="opening_balance" type="number" step="0.01" defaultValue={settings?.opening_balance||0} required/></div></div><div><label>Notes</label><input name="notes" defaultValue={settings?.notes||''} placeholder="Example: Balance as per bank + cash on hand"/></div><button className="btn">Save Starting Setup</button><p className="muted">{msg}</p></form></div><div className="card"><h2>How monthly balances work</h2><p>February starts from this opening balance and date. After that:</p><p><b>Closing Balance = Opening Balance + Maintenance Collected + Other Income - Expenses</b></p><p className="muted">For later months, the previous month closing balance can be used as the next opening balance.</p></div></main>
}
