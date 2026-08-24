'use client'
import Link from 'next/link'
import TopBar from '@/components/TopBar'

export default function Ganesh(){
 const cards=[
  ['🙏','Donations','Contribute to the festival fund and view confirmed donation amounts.','/ganesh/donations'],
  ['🏆','Games Participation','Explore games and enroll yourself or your family members.','/ganesh/games'],
  ['🧾','Event Expenses','View festival expenses and bills for complete transparency.','/ganesh/expenses'],
  ['🍛','Prasadam Donation','Donate prasadam for morning or evening on any day of the festival.','/ganesh/prasadam']
 ]
 return <><TopBar/><main className="wrap ganesh-home">
  <section className="card ganesh-hero">
   <div className="ganesh-hero-art" aria-hidden="true">ॐ</div>
   <div className="ganesh-kicker">Sampada Residency Celebrations</div>
   <h1 className="ganesh-title">Ganesh Chaturthi 2026</h1>
   <div className="ganesh-dates">14–20 September 2026</div>
   <p className="ganesh-blessing">ॐ गं गणपतये नमः · Join our community celebrations, seva, games and prasadam offerings.</p>
  </section>
  <div className="ganesh-cards">{cards.map(([icon,title,text,href])=><Link href={href} key={href} className="card ganesh-card" style={{textDecoration:'none',color:'inherit'}}><div className="ganesh-icon-badge"><span className="ganesh-card-icon">{icon}</span></div><h2>{title}</h2><p className="muted">{text}</p><b className="ganesh-card-open">Open <span>→</span></b></Link>)}</div>
 </main></>
}
