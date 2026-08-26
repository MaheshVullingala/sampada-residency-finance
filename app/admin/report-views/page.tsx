'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type FlatStat = { flat_no: string; total_visits: number; last_viewed: string }
type Recent = { id: number; flat_no: string; viewed_at: string }
type Data = { total_flats: number; flats_viewed: number; flats_not_viewed: number; total_visits: number; flats: FlatStat[]; recent: Recent[] }

function when(value:string){if(!value)return 'Not viewed';return new Date(value).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}

export default function ReportViews(){
 const [data,setData]=useState<Data|null>(null),[msg,setMsg]=useState(''),[filter,setFilter]=useState<'all'|'viewed'|'not-viewed'>('all')
 async function load(){setMsg('Loading...');const r=await fetch('/api/admin/report-views');const j=await r.json().catch(()=>({}));if(!r.ok){setMsg(j.error||'Could not load report access');return}setData(j);setMsg('')}
 useEffect(()=>{load()},[])
 const flats=useMemo(()=>{const rows=data?.flats||[];if(filter==='viewed')return rows.filter(x=>x.total_visits>0);if(filter==='not-viewed')return rows.filter(x=>x.total_visits===0);return rows},[data,filter])
 return <main className="wrap"><div className="header"><div><h1>Resident Report Views</h1><p className="muted">Tracks successful Flat No + PIN logins to the financial report. PINs are never stored.</p></div><Link className="btn secondary" href="/admin">Back</Link></div>
 {msg&&<div className="card"><p className="muted">{msg}</p></div>}
 {data&&<><div className="grid2"><div className="stat blue"><span>Total Flats</span><br/><b>{data.total_flats}</b></div><div className="stat green"><span>Flats Viewed</span><br/><b>{data.flats_viewed}</b></div><div className="stat orange"><span>Not Viewed</span><br/><b>{data.flats_not_viewed}</b></div><div className="stat purple"><span>Total Logins</span><br/><b>{data.total_visits}</b></div></div>
 <div className="card"><div className="header small"><div><h2>Flat-wise Access</h2><p className="muted">See which flats have opened the report and how often.</p></div><button className="mini-btn" onClick={load}>Refresh</button></div><div className="section-tabs" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:14}}><button className={filter==='all'?'active':''} onClick={()=>setFilter('all')}>All</button><button className={filter==='viewed'?'active':''} onClick={()=>setFilter('viewed')}>Viewed</button><button className={filter==='not-viewed'?'active':''} onClick={()=>setFilter('not-viewed')}>Not Viewed</button></div>{flats.length===0?<p className="muted">No flats in this view.</p>:<div className="expense-category-list">{flats.map(x=><div className="expense-category-row" key={x.flat_no} style={{alignItems:'center'}}><span style={{minWidth:0}}><b style={{display:'block'}}>Flat {x.flat_no}</b><small className="muted" style={{display:'block',marginTop:3}}>{when(x.last_viewed)}</small></span><div style={{textAlign:'right',flex:'0 0 auto'}}><b>{x.total_visits}</b><small className="muted" style={{display:'block'}}>login{x.total_visits===1?'':'s'}</small></div></div>)}</div>}</div>
 <div className="card"><h2>Recent Access</h2>{data.recent.length===0?<p className="muted">No resident logins recorded yet.</p>:<div className="expense-category-list">{data.recent.slice(0,30).map(x=><div className="expense-category-row" key={x.id}><b>Flat {x.flat_no}</b><span className="muted" style={{textAlign:'right'}}>{when(x.viewed_at)}</span></div>)}</div>}</div></>}
 </main>
}
