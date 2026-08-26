'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
import TopBar from '@/components/TopBar'

type Notice={title:string,message:string,active:boolean}

export default function ResidentNoticeAdmin(){
 const [notice,setNotice]=useState<Notice>({title:'Important Notice',message:'',active:false})
 const [msg,setMsg]=useState('')
 async function load(){const r=await fetch('/api/admin/resident-notice');const j=await r.json();if(r.ok)setNotice(j.notice);else setMsg(j.error||'Could not load notice')}
 useEffect(()=>{load()},[])
 async function save(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setMsg('Saving...');const fd=new FormData(e.currentTarget);const payload={title:String(fd.get('title')||''),message:String(fd.get('message')||''),active:fd.get('active')==='on'};const r=await fetch('/api/admin/resident-notice',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const j=await r.json().catch(()=>({}));if(r.ok){setNotice(j.notice);setMsg(j.notice.active?'Notice saved and activated':'Notice saved and deactivated')}else setMsg(j.error||'Could not save notice')}
 return <><TopBar admin/><main className="wrap"><div className="header"><div><h1>Resident Login Notice</h1><p className="muted">Show an important popup to residents after they sign in.</p></div><Link className="btn secondary" href="/admin">Back</Link></div><div className="card"><form onSubmit={save} className="grid"><label>Popup Title</label><input name="title" defaultValue={notice.title} placeholder="Important Notice" required/><label>Notice Message</label><textarea name="message" defaultValue={notice.message} rows={7} placeholder="Enter the note residents should see after login" required/><label style={{display:'flex',alignItems:'center',gap:10,color:'var(--text)'}}><input name="active" type="checkbox" defaultChecked={notice.active} style={{width:20,height:20}}/> Activate this popup for residents</label><button className="btn">Save Notice</button>{msg&&<p className="muted">{msg}</p>}</form></div><div className="card"><h2>Status</h2><p>{notice.active?'🟢 Active — residents will see the popup after login.':'⚪ Inactive — residents will not see the popup.'}</p></div></main></>}
