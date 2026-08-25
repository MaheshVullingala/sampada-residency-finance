export default function Loading(){
 return <div style={{minHeight:'55vh',display:'grid',placeItems:'center'}} role="status" aria-label="Loading page">
  <div style={{display:'flex',alignItems:'center',gap:10,fontWeight:700,color:'#173c2d'}}>
   <span style={{width:20,height:20,border:'3px solid #dce8e1',borderTopColor:'#16834f',borderRadius:'50%',display:'inline-block'}}/>
   Loading...
  </div>
 </div>
}
