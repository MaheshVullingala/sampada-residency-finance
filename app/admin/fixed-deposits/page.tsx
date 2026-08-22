'use client'
import { useEffect, useMemo, useState } from 'react'
import { money } from '@/lib/money'

type FixedDeposit={id:string,bank_name:string,fd_reference:string,amount:number,start_date:string,maturity_date:string|null,interest_rate:number|null,notes:string}

const emptyForm={id:'',bank_name:'',fd_reference:'',amount:'',start_date:'',maturity_date:'',interest_rate:'',notes:''}

export default function FixedDeposits(){
 const [items,setItems]=useState<FixedDeposit[]>([])
 const [form,setForm]=useState<any>(emptyForm)
 const [msg,setMsg]=useState('')
 const [isEditing,setIsEditing]=useState(false)

 async function load(){
  const r=await fetch('/api/admin/fixed-deposits')
  const j=await r.json()
  if(r.ok) setItems(j.fixed_deposits||[])
  else setMsg(j.error||'Could not load fixed deposits')
 }
 useEffect(()=>{load()},[])

 function updateField(name:string,value:string){setForm((f:any)=>({...f,[name]:value}))}
 function resetForm(){setForm(emptyForm);setIsEditing(false)}
 function editItem(x:FixedDeposit){setForm({...x,amount:String(x.amount||''),interest_rate:x.interest_rate==null?'':String(x.interest_rate),maturity_date:x.maturity_date||''});setIsEditing(true);window.scrollTo({top:0,behavior:'smooth'})}

 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setMsg(isEditing?'Updating...':'Saving...')
  const r=await fetch('/api/admin/fixed-deposits',{method:isEditing?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
  const j=await r.json().catch(()=>({}))
  if(r.ok){setMsg(isEditing?'Fixed deposit updated':'Fixed deposit saved');resetForm();load()}
  else setMsg(j.error||'Could not save fixed deposit')
 }

 async function remove(x:FixedDeposit){
  if(!window.confirm(`Delete fixed deposit of ${money(Number(x.amount))} at ${x.bank_name}?`)) return
  const r=await fetch(`/api/admin/fixed-deposits?id=${encodeURIComponent(x.id)}`,{method:'DELETE'})
  const j=await r.json().catch(()=>({}))
  if(r.ok){setMsg('Fixed deposit deleted');load()} else setMsg(j.error||'Could not delete fixed deposit')
 }

 const total=useMemo(()=>items.reduce((sum,x)=>sum+Number(x.amount||0),0),[items])

 return <main className="wrap">
  <div className="header"><div><h1>Fixed Deposits</h1><p className="muted">Track association funds moved into fixed deposits. These are investments, not expenses.</p></div><a className="btn secondary" href="/admin">Back</a></div>
  <div className="card"><h2>{isEditing?'Edit Fixed Deposit':'Add Fixed Deposit'}</h2><form onSubmit={submit} className="grid">
   <div className="grid2"><div><label>Bank Name</label><input value={form.bank_name} onChange={e=>updateField('bank_name',e.target.value)} required placeholder="Bank name"/></div><div><label>FD / Reference No.</label><input value={form.fd_reference} onChange={e=>updateField('fd_reference',e.target.value)} placeholder="Optional"/></div></div>
   <div className="grid2"><div><label>Amount</label><input type="number" min="0" step="0.01" value={form.amount} onChange={e=>updateField('amount',e.target.value)} required/></div><div><label>Interest Rate %</label><input type="number" min="0" step="0.001" value={form.interest_rate} onChange={e=>updateField('interest_rate',e.target.value)} placeholder="Optional"/></div></div>
   <div className="grid2"><div><label>Start Date</label><input type="date" value={form.start_date} onChange={e=>updateField('start_date',e.target.value)} required/></div><div><label>Maturity Date</label><input type="date" value={form.maturity_date} onChange={e=>updateField('maturity_date',e.target.value)}/></div></div>
   <label>Notes</label><textarea value={form.notes||''} onChange={e=>updateField('notes',e.target.value)} placeholder="Optional note"></textarea>
   <div className="mobile-actions"><button className="btn">{isEditing?'Update Fixed Deposit':'Save Fixed Deposit'}</button>{isEditing&&<button className="btn secondary" type="button" onClick={resetForm}>Cancel Edit</button>}</div><p className="muted">{msg}</p>
  </form></div>
  <div className="card"><div className="header"><div><h2>Fixed Deposit Register</h2><p><b>Total:</b> {money(total)}</p></div></div>
   {items.length===0?<p className="muted">No fixed deposits added yet.</p>:<table className="table"><thead><tr><th>Bank</th><th>Amount</th><th>Start</th><th>Maturity</th><th>Actions</th></tr></thead><tbody>{items.map(x=><tr key={x.id}><td><b>{x.bank_name}</b><br/><small className="muted">{x.fd_reference||x.notes}</small></td><td>{money(Number(x.amount))}</td><td>{x.start_date}</td><td>{x.maturity_date||'—'}</td><td><div className="row-actions"><button className="mini-btn" onClick={()=>editItem(x)}>Edit</button><button className="mini-btn danger" onClick={()=>remove(x)}>Delete</button></div></td></tr>)}</tbody></table>}
  </div>
 </main>
}
