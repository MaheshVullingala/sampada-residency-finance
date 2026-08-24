'use client'
import Link from 'next/link'
import TopBar from '@/components/TopBar'

export default function Ganesh(){
 const cards=[
  ['🙏','Donations','Contribute to the festival fund and view confirmed donation amounts.','/ganesh/donations'],
  ['🏆','Games Participation','Enroll yourself and family members in festival games.','/ganesh/games'],
  ['🧾','Event Expenses','View transparent Ganesh Chaturthi event expenses.','/ganesh/expenses'],
  ['🍛','Prasadam Donation','Choose a morning or evening slot from 14–20 September.','/ganesh/prasadam']
 ]
 return <><TopBar/><main className="wrap">
  <section className="card ganesh-hero">
   <div className="ganesh-hero-icon">🪔</div>
   <div className="ganesh-kicker">Sampada Residency Celebrations</div>
   <h1 className="ganesh-title">Ganesh Chaturthi 2026</h1>
   <div className="ganesh-dates">14–20 September 2026</div>
   <p className="ganesh-blessing">ॐ गं गणपतये नमः · Join our community celebrations, seva, games and prasadam offerings.</p>
  </section>
  <div className="grid2 ganesh-cards">{cards.map(([icon,title,text,href])=><Link href={href} key={href} className="card ganesh-card" style={{textDecoration:'none',color:'inherit'}}><div className="ganesh-card-icon">{icon}</div><h2>{title}</h2><p className="muted">{text}</p><b className="ganesh-card-open">Open <span>→</span></b></Link>)}</div>
 </main></>
}
