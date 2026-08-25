'use client'

import {useEffect,useRef,useState} from 'react'

export default function GlobalLoading(){
 const [loading,setLoading]=useState(false)
 const active=useRef(0)
 const hideTimer=useRef<ReturnType<typeof setTimeout>|null>(null)

 useEffect(()=>{
  const originalFetch=window.fetch.bind(window)

  const start=()=>{
   active.current+=1
   if(hideTimer.current){clearTimeout(hideTimer.current);hideTimer.current=null}
   setLoading(true)
  }
  const finish=()=>{
   active.current=Math.max(0,active.current-1)
   if(active.current===0){
    hideTimer.current=setTimeout(()=>setLoading(false),180)
   }
  }

  window.fetch=async (...args:Parameters<typeof fetch>)=>{
   start()
   try{return await originalFetch(...args)}finally{finish()}
  }

  return ()=>{
   window.fetch=originalFetch
   if(hideTimer.current)clearTimeout(hideTimer.current)
  }
 },[])

 if(!loading)return null
 return <>
  <div className="global-loading-overlay" role="status" aria-live="polite" aria-label="Loading">
   <div className="global-loading-box">
    <span className="global-loading-spinner"/>
    <span>Loading...</span>
   </div>
  </div>
  <style>{`
   .global-loading-overlay{position:fixed;inset:0;z-index:99999;background:rgba(255,255,255,.38);backdrop-filter:blur(1.5px);display:grid;place-items:center;pointer-events:auto}
   .global-loading-box{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #d9e3dd;border-radius:999px;padding:10px 16px;box-shadow:0 10px 28px rgba(0,0,0,.14);font-weight:700;color:#173c2d}
   .global-loading-spinner{width:20px;height:20px;border:3px solid #dce8e1;border-top-color:#16834f;border-radius:50%;animation:globalSpin .7s linear infinite}
   @keyframes globalSpin{to{transform:rotate(360deg)}}
   @media(prefers-reduced-motion:reduce){.global-loading-spinner{animation:none;border-top-color:#16834f}}
  `}</style>
 </>
}
