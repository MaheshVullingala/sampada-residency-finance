'use client'
import Link from 'next/link'
import TopBar from '@/components/TopBar'

const GANESHA_IMAGE='https://jrtolflejposlvzxoygm.supabase.co/storage/v1/object/sign/imagesforganesh/pngtree-ganesha-the-embodiment-of-prosperity-and-joy-png-image_15287837.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMDA1ZmE2Yy1kYWVjLTRhYjctOTc3My01YzY3NWI2N2I4ZmEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXNmb3JnYW5lc2gvcG5ndHJlZS1nYW5lc2hhLXRoZS1lbWJvZGltZW50LW9mLXByb3NwZXJpdHktYW5kLWpveS1wbmctaW1hZ2VfMTUyODc4MzcucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NzU5NzkxMiwiZXhwIjoxOTQ1Mjc3OTEyfQ.lX7V3hH69ewDbyob-T0tXxI7HvC69uHndMW2iMSCo7U'

export default function Ganesh(){
 const cards=[
  ['🙏','Donations','Contribute to the festival fund and view confirmed donation amounts.','/ganesh/donations'],
  ['🏆','Games Participation','Explore games and enroll yourself or your family members.','/ganesh/games'],
  ['🧾','Event Expenses','View festival expenses and bills for complete transparency.','/ganesh/expenses'],
  ['🍛','Prasadam Donation','Donate prasadam for morning or evening on any day of the festival.','/ganesh/prasadam']
 ]
 return <><TopBar/><main className="wrap ganesh-home">
  <section className="card ganesh-hero">
   <img className="ganesh-hero-image" src={GANESHA_IMAGE} alt="Lord Ganesha"/>
   <div className="ganesh-kicker">Sampada Residency Celebrations</div>
   <h1 className="ganesh-title">Ganesh Chaturthi 2026</h1>
   <div className="ganesh-dates">14–20 September 2026</div>
   <p className="ganesh-blessing">ॐ गं गणपतये नमः · Join our community celebrations, seva, games and prasadam offerings.</p>
  </section>
  <div className="ganesh-cards">{cards.map(([icon,title,text,href])=><Link href={href} key={href} className="card ganesh-card" style={{textDecoration:'none',color:'inherit'}}><div className="ganesh-icon-badge"><span className="ganesh-card-icon">{icon}</span></div><h2>{title}</h2><p className="muted">{text}</p></Link>)}</div>
 </main></>
}
