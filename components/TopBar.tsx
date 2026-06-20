export default function TopBar({admin=false}:{admin?:boolean}){
  return <div className="topbar">
    <div className="brand"><div className="brand-logo">⌂</div><div className="brand-title">Sampada Residency<small>Bangalore</small></div></div>
    <div className="top-title"><span>🏢</span> My Apartment: <b>Sampada Residency, Bangalore</b></div>
    {admin ? <div className="admin-chip"><div className="avatar">AM</div><div>Admin<small style={{display:'block',opacity:.8,fontWeight:500}}>Administrator</small></div></div> : <div className="admin-chip"><div className="avatar">SR</div><div>Resident<small style={{display:'block',opacity:.8,fontWeight:500}}>View only</small></div></div>}
  </div>
}
