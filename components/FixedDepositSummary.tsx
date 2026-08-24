'use client'
import { useEffect, useState } from 'react'
import { money } from '@/lib/money'

type FixedDeposit={id:string,bank_name:string,fd_reference:string,amount:number,start_date:string,maturity_date:string|null,interest_rate:number|null}

export default function FixedDepositSummary({month,totalFunds}:{month:string,totalFunds:number}){
 const [items,setItems]=useState<FixedDeposit[]>([])
 const [fdTotal,setFdTotal]=useState(0)

 useEffect(()=>{
  let active=true
  fetch(`/api/resident/fixed-deposits?month=${month}`).then(async r=>{
   if(!r.ok) return
   const j=await r.json()
   if(active){setItems(j.fixed_deposits||[]);setFdTotal(Number(j.total||0))}
  }).catch(()=>{})
  return()=>{active=false}
 },[month])

 const available=Number(totalFunds||0)-fdTotal

 return <div style={{marginTop:18}}>
  <h3 style={{marginBottom:10}}>Where the funds are</h3>
  <div className="grid2">
   <div className="stat blue"><span>🏦 Bank Balance + Petty Cash</span><br/><b>{money(available)}</b></div>
   <div className="stat green"><span>🔒 Fixed Deposits</span><br/><b>{money(fdTotal)}</b></div>
  </div>
  {items.length>0&&<div className="expense-category-list" style={{marginTop:10}}>{items.map(x=><div className="expense-category-row" key={x.id}><span><b>{x.bank_name}</b>{x.maturity_date&&<small className="muted" style={{display:'block'}}>Matures {x.maturity_date}</small>}</span><b>{money(Number(x.amount))}</b></div>)}</div>}
 </div>
}
