'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import TopBar from '@/components/TopBar'
import { money, ym } from '@/lib/money'

type Charge={id:string,month:string,charge_type:string,amount:number,notes:string|null}
type Payment={id:string,charge_id:string,flat_no:string,amount_due:number,status:string,paid_date:string|null}

export default function DuesPage(){
 const [charges,setCharges]=useState<Charge[]>([])
 const [selectedChargeId,setSelectedChargeId]=useState('')
 const [payments,setPayments]=useState<Payment[]>([])
 const [selected,setSelected]=useState<string[]>([])
 const [filter,setFilter]=useState<'all'|'pending'|'paid'>('all')
 const [message,setMessage]=useState('')
 const [formKey,setFormKey]=useState(0)

 async function load(chargeId=selectedChargeId){
  const query=chargeId?`?charge_id=${chargeId}`:''
  const r=await fetch(`/api/admin/dues${query}`); const j=await r.json()
  if(!r.ok){setMessage(j.error||'Unable to load charges'); return}
  setCharges(j.charges||[]); setPayments(j.payments||[])
  if(!chargeId && j.charges?.length){setSelectedChargeId(j.charges[0].id)}
 }
 useEffect(()=>{load('')},[])
 useEffect(()=>{if(selectedChargeId){load(selectedChargeId);setSelected([])}},[selectedChargeId])

 async function createCharge(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault(); setMessage('Saving...')
  const body=Object.fromEntries(new FormData(e.currentTarget).entries())
  const r=await fetch('/api/admin/dues',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
  const j=await r.json().catch(()=>({}))
  if(!r.ok){setMessage(j.error||'Unable to create charge');return}
  setMessage('Charge created'); setFormKey(k=>k+1); await load(''); setSelectedChargeId(j.charge.id)
 }
 async function mark(mode:'paid'|'unpaid', flats=selected){
  if(!selectedChargeId||flats.length===0){setMessage('Select at least one flat');return}
  const r=await fetch('/api/admin/dues',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({charge_id:selectedChargeId,flat_nos:flats,mode})})
  const j=await r.json().catch(()=>({}))
  if(!r.ok){setMessage(j.error||'Unable to update status');return}
  setMessage(mode==='paid'?'Marked as paid':'Marked as unpaid'); setSelected([]); await load(selectedChargeId)
 }
 async function deleteCharge(){
  if(!selectedChargeId||!confirm('Delete this charge and all its flat payment statuses?'))return
  const r=await fetch(`/api/admin/dues?id=${selectedChargeId}`,{method:'DELETE'}); const j=await r.json().catch(()=>({}))
  if(!r.ok){setMessage(j.error||'Unable to delete charge');return}
  setSelectedChargeId(''); setPayments([]); setMessage('Charge deleted'); await load('')
 }
 const visible=useMemo(()=>payments.filter(p=>filter==='all'||(filter==='paid'?p.status==='Paid':p.status!=='Paid')),[payments,filter])
 const allSelected=visible.length>0&&visible.every(p=>selected.includes(p.flat_no))
 function toggle(flat:string){setSelected(v=>v.includes(flat)?v.filter(x=>x!==flat):[...v,flat])}
 function toggleVisible(){setSelected(allSelected?selected.filter(x=>!visible.some(p=>p.flat_no===x)):[...new Set([...selected,...visible.map(p=>p.flat_no)])])}

 return <><TopBar admin/><main className="wrap">
  <div className="header"><div><h1>Charge Management</h1><p className="muted">Create charges and maintain Paid/Pending status. These statuses do not calculate financial income.</p></div><Link className="btn secondary" href="/admin">Back</Link></div>
  <div className="card"><h2>Create Charge</h2><form key={formKey} onSubmit={createCharge} className="grid form-grid"><label>Month</label><input name="month" type="month" defaultValue={ym()} required/><label>Charge Type</label><select name="charge_type"><option>Monthly Maintenance</option><option>Emergency Fund</option><option>Others</option></select><label>Amount per Flat</label><input name="amount" type="number" min="0.01" step="0.01" required/><label>Notes</label><input name="notes" placeholder="Optional"/><button className="btn">Create Charge</button></form>{message&&<p className="muted">{message}</p>}</div>
  <div className="card"><div className="grid2"><div><label>Select Charge</label><select value={selectedChargeId} onChange={e=>setSelectedChargeId(e.target.value)}><option value="">Choose a charge</option>{charges.map(c=><option key={c.id} value={c.id}>{c.month} — {c.charge_type} — {money(c.amount)}</option>)}</select></div><div><label>Filter</label><select value={filter} onChange={e=>setFilter(e.target.value as any)}><option value="all">All Flats</option><option value="pending">Pending Only</option><option value="paid">Paid Only</option></select></div></div></div>
  {selectedChargeId&&<div className="card"><div className="section-title"><h2>Flat Payment Status</h2><div className="mobile-actions"><button className="btn secondary" onClick={toggleVisible}>{allSelected?'Unselect Visible':'Select Visible'}</button><button className="btn" onClick={()=>mark('paid')}>Mark Paid</button><button className="btn secondary" onClick={()=>mark('unpaid')}>Mark Unpaid</button><button className="btn danger" onClick={deleteCharge}>Delete Charge</button></div></div><div className="table-wrap"><table className="table"><thead><tr><th></th><th>Flat</th><th>Due</th><th>Status</th><th>Action</th></tr></thead><tbody>{visible.map(p=><tr key={p.id}><td><input type="checkbox" checked={selected.includes(p.flat_no)} onChange={()=>toggle(p.flat_no)}/></td><td><b>{p.flat_no}</b></td><td>{money(Number(p.amount_due))}</td><td><span className={`status ${p.status.toLowerCase()}`}>{p.status==='Paid'?'Paid':'Pending'}</span></td><td><button className="mini-btn" onClick={()=>mark(p.status==='Paid'?'unpaid':'paid',[p.flat_no])}>{p.status==='Paid'?'Mark Pending':'Mark Paid'}</button></td></tr>)}</tbody></table></div>{!visible.length&&<p className="muted">No flats match this filter.</p>}</div>}
 </main></>
}
