'use client'
import { useEffect, useMemo, useState } from 'react'
import { money, ym } from '@/lib/money'

type Expense={id:string,expense_date:string,category:string,vendor_name:string,amount:number,payment_mode:string,paid_by:string,description:string,bill_url:string,status:string}
type Category={id:number,name:string}

const emptyForm={id:'',expense_date:'',category:'',vendor_name:'',amount:'',payment_mode:'UPI',paid_by:'',description:'',bill_url:'',status:'approved'}

export default function Expenses(){
 const [month,setMonth]=useState(ym())
 const [items,setItems]=useState<Expense[]>([])
 const [categories,setCategories]=useState<Category[]>([])
 const [msg,setMsg]=useState('')
 const [form,setForm]=useState<any>(emptyForm)
 const [isEditing,setIsEditing]=useState(false)

 async function load(){
  const r=await fetch(`/api/admin/expenses?month=${month}`)
  const j=await r.json()
  setItems(j.expenses||[])
 }
 async function loadCategories(){
  const r=await fetch('/api/admin/expense-categories')
  const j=await r.json()
  if(r.ok){
   const list:Category[]=j.categories||[]
   setCategories(list)
   setForm((f:any)=>({...f,category:f.category||list[0]?.name||''}))
  } else setMsg(j.error||'Could not load expense categories')
 }
 useEffect(()=>{load()},[month])
 useEffect(()=>{loadCategories()},[])

 function updateField(name:string,value:string){setForm((f:any)=>({...f,[name]:value}))}
 function resetForm(){setForm({...emptyForm,category:categories[0]?.name||''}); setIsEditing(false); setMsg('')}
 function editExpense(x:Expense){
  setForm({...x, amount:String(x.amount||'')})
  setIsEditing(true)
  window.scrollTo({top:0,behavior:'smooth'})
 }

 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault()
  setMsg(isEditing?'Updating...':'Saving...')
  const method=isEditing?'PUT':'POST'
  const r=await fetch('/api/admin/expenses',{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
  if(r.ok){
   setIsEditing(false)
   setForm({...emptyForm,category:categories[0]?.name||''})
   setMsg(isEditing?'Expense updated':'Expense saved')
   load()
  } else {const j=await r.json().catch(()=>({})); setMsg(j.error||'Could not save')}
 }

 async function deleteExpense(x:Expense){
  const ok=window.confirm(`Delete this expense?\n\n${x.category} - ${money(Number(x.amount))}\nThis cannot be undone.`)
  if(!ok) return
  setMsg('Deleting...')
  const r=await fetch(`/api/admin/expenses?id=${encodeURIComponent(x.id)}`,{method:'DELETE'})
  if(r.ok){setMsg('Expense deleted'); load()} else {const j=await r.json().catch(()=>({})); setMsg(j.error||'Could not delete')}
 }

 const total=items.reduce((s,x)=>s+Number(x.amount),0)
 const csv='Date,Category,Vendor,Amount,Payment Mode,Paid By,Description,Status\n'+items.map(x=>[x.expense_date,x.category,x.vendor_name,x.amount,x.payment_mode,x.paid_by,x.description,x.status].map(v=>`"${String(v||'').replaceAll('"','""')}"`).join(',')).join('\n')
 const categoryTotals=useMemo(()=>{
   const map:Record<string,number>={}
   items.forEach(x=>map[x.category]=(map[x.category]||0)+Number(x.amount||0))
   return Object.entries(map).sort((a,b)=>b[1]-a[1])
 },[items])

 return <main className="wrap">
  <div className="header"><div><h1>Expenses</h1><p className="muted">Add, edit, and delete monthly expenses.</p></div><a className="btn secondary" href="/admin">Back</a></div>

  <div className="card">
   <h2>{isEditing?'Edit Expense':'Add Expense'}</h2>
   <form onSubmit={submit} className="grid">
    <div className="grid2"><div><label>Date</label><input name="expense_date" type="date" value={form.expense_date} onChange={e=>updateField('expense_date',e.target.value)} required/></div><div><label>Amount</label><input name="amount" type="number" min="0" step="0.01" value={form.amount} onChange={e=>updateField('amount',e.target.value)} required/></div></div>
    <div className="grid2"><div><label>Category</label><select name="category" value={form.category} onChange={e=>updateField('category',e.target.value)} required disabled={categories.length===0}>{categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}</select>{categories.length===0&&<small className="muted">Loading categories...</small>}</div><div><label>Payment Mode</label><select name="payment_mode" value={form.payment_mode} onChange={e=>updateField('payment_mode',e.target.value)}><option>UPI</option><option>Bank Transfer</option><option>Cash</option><option>Cheque</option></select></div></div>
    <div className="grid2"><div><label>Vendor Name</label><input name="vendor_name" value={form.vendor_name||''} onChange={e=>updateField('vendor_name',e.target.value)} placeholder="Vendor / shop name"/></div><div><label>Paid By</label><input name="paid_by" value={form.paid_by||''} onChange={e=>updateField('paid_by',e.target.value)} placeholder="Treasurer / committee member"/></div></div>
    <label>Description</label><textarea name="description" value={form.description||''} onChange={e=>updateField('description',e.target.value)} placeholder="Short note"></textarea>
    <label>Bill URL</label><input name="bill_url" value={form.bill_url||''} onChange={e=>updateField('bill_url',e.target.value)} placeholder="Paste Google Drive / invoice link for now"/>
    <div className="mobile-actions"><button className="btn" disabled={categories.length===0}>{isEditing?'Update Expense':'Save Expense'}</button>{isEditing&&<button type="button" className="btn secondary" onClick={resetForm}>Cancel Edit</button>}</div>
    <p className="muted">{msg}</p>
   </form>
  </div>

  <div className="card"><div className="header"><div><h2>Monthly Expenses</h2><p><b>Total:</b> {money(total)}</p></div><div className="mobile-actions"><input type="month" value={month} onChange={e=>setMonth(e.target.value)}/><a className="btn secondary" download={`expenses-${month}.csv`} href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`}>Download CSV</a></div></div>
   {categoryTotals.length>0&&<div className="category-pills">{categoryTotals.slice(0,6).map(([cat,amt])=><span key={cat}>{cat}: <b>{money(amt)}</b></span>)}</div>}
   <table className="table"><thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Actions</th></tr></thead><tbody>{items.map(x=><tr key={x.id}><td>{x.expense_date}</td><td><b>{x.category}</b><br/><small className="muted">{x.description||x.vendor_name}</small></td><td>{money(Number(x.amount))}</td><td><div className="row-actions"><button className="mini-btn" onClick={()=>editExpense(x)}>Edit</button><button className="mini-btn danger" onClick={()=>deleteExpense(x)}>Delete</button></div></td></tr>)}</tbody></table>
  </div>
 </main>
}
