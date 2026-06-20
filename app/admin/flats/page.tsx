'use client'
import { useEffect, useState } from 'react'
type Flat={id:string,flat_no:string,status:string,created_at:string}
export default function Flats(){
 const [flats,setFlats]=useState<Flat[]>([]); const [msg,setMsg]=useState('')
 async function load(){const r=await fetch('/api/admin/flats'); const j=await r.json(); setFlats(j.flats||[])}
 useEffect(()=>{load()},[])
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault(); setMsg('Saving...'); const fd=new FormData(e.currentTarget); const body=Object.fromEntries(fd.entries()); const r=await fetch('/api/admin/flats',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); const j=await r.json(); if(r.ok){setMsg('PIN saved / reset'); e.currentTarget.reset(); load()} else setMsg(j.error||'Could not save')}
 return <main className="wrap"><div className="header"><div><h1>Flat PINs</h1><p className="muted">Residents use Flat No + PIN. No name, phone, or email is stored.</p></div><a className="btn secondary" href="/admin">Back</a></div><div className="card"><form onSubmit={submit} className="grid"><div className="grid2"><div><label>Flat No</label><input name="flat_no" placeholder="A-204" required/></div><div><label>PIN</label><input name="pin" placeholder="4 to 6 digit PIN" required/></div></div><button className="btn">Create / Reset PIN</button><p className="muted">{msg}</p></form></div><div className="card"><h2>Registered Flats</h2><table className="table"><thead><tr><th>Flat No</th><th>Status</th><th>Created</th></tr></thead><tbody>{flats.map(f=><tr key={f.id}><td>{f.flat_no}</td><td>{f.status}</td><td>{new Date(f.created_at).toLocaleDateString('en-IN')}</td></tr>)}</tbody></table></div></main>
}
