import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { normalizeExpenseCategory } from '@/lib/categories'
function n(v:any){return Number(String(v ?? '0').replace(/[^0-9.-]/g,'')) || 0}
function clean(v:any){return String(v ?? '').trim()}
function pad(v:number){return String(v).padStart(2,'0')}
function twoDigitYear(y:number){return y < 100 ? 2000 + y : y}
const monthMap:Record<string,string>={jan:'01',january:'01',feb:'02',february:'02',mar:'03',march:'03',apr:'04',april:'04',may:'05',jun:'06',june:'06',jul:'07',july:'07',aug:'08',august:'08',sep:'09',sept:'09',september:'09',oct:'10',october:'10',nov:'11',november:'11',dec:'12',december:'12'}
function excelSerialToDate(v:number){const ms=Math.round((v-25569)*86400*1000); const d=new Date(ms); if(isNaN(d.getTime())) return ''; return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`}
function parseDate(v:any){
 if(v instanceof Date && !isNaN(v.getTime())) return `${v.getFullYear()}-${pad(v.getMonth()+1)}-${pad(v.getDate())}`
 if(typeof v==='number' && v>20000 && v<80000) return excelSerialToDate(v)
 const s=clean(v).replace(/\s+00:00:00$/,'')
 if(!s) return ''
 let m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
 if(m) return `${m[1]}-${pad(Number(m[2]))}-${pad(Number(m[3]))}`
 m=s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/)
 if(m){const d=Number(m[1]), mo=Number(m[2]), y=twoDigitYear(Number(m[3])); return `${y}-${pad(mo)}-${pad(d)}`}
 m=s.match(/^(\d{1,2})[-\s]([A-Za-z]{3,9})[-\s](\d{2,4})$/)
 if(m){const mo=monthMap[m[2].toLowerCase()]; if(mo){const y=twoDigitYear(Number(m[3])); return `${y}-${mo}-${pad(Number(m[1]))}`}}
 const d=new Date(s); if(!isNaN(d.getTime())) return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
 return s
}
function monthFrom(v:any){const s=clean(v); if(/^\d{4}-\d{2}$/.test(s)) return s; if(/^[A-Za-z]{3}-\d{4}$/.test(s)){const [mon,yr]=s.split('-'); return `${yr}-${monthMap[mon.toLowerCase()]}`} const d=parseDate(s); return /^\d{4}-\d{2}-/.test(d)?d.slice(0,7):s}
export async function POST(req:NextRequest){
 if(!(await isAdmin())) return NextResponse.json({error:'Unauthorized'},{status:401})
 const body=await req.json(); const type=body.type; const rows=Array.isArray(body.rows)?body.rows:[]; const sb=supabaseAdmin()
 if(type==='expenses'){
  const mapped=rows.map((r:any)=>({expense_date:parseDate(r.expense_date||r.date||r['Expense Date']||r['Date']),category:normalizeExpenseCategory(r.category||r['Expense Category']||r['Category']),description:clean(r.description||r['Expense Description']||r['Description']),amount:n(r.amount||r['Expense Amount']||r['Amount']),vendor_name:clean(r.vendor_name||r.vendor||r['Vendor Name']||r['Vendor']),payment_mode:clean(r.payment_mode||r['Payment Mode'])||'Bank Transfer',paid_by:clean(r.paid_by||r['Paid By']),bill_url:clean(r.bill_url||r['Bill URL']||r['Bill Link']),status:'approved'})).filter((r:any)=>r.expense_date&&r.amount>0)
  if(!mapped.length) return NextResponse.json({error:'No valid expense rows found'},{status:400})
  const {error}=await sb.from('expenses').insert(mapped); if(error) return NextResponse.json({error:error.message},{status:500}); return NextResponse.json({imported:mapped.length})
 }
 if(type==='collections'){
  const mapped=rows.map((r:any)=>({month:monthFrom(r.month||r['Month']),opening_balance:n(r.opening_balance||r['Opening Balance']),maintenance_collected:n(r.maintenance_collected||r['Maintenance Collected']||r['Maintenance Collection']),other_income:n(r.other_income||r['Other Income']),notes:clean(r.notes||r['Notes']),updated_at:new Date().toISOString()})).filter((r:any)=>/^\d{4}-\d{2}$/.test(r.month))
  if(!mapped.length) return NextResponse.json({error:'No valid monthly collection rows found. Month should be YYYY-MM.'},{status:400})
  const {error}=await sb.from('monthly_balances').upsert(mapped,{onConflict:'month'}); if(error) return NextResponse.json({error:error.message},{status:500}); return NextResponse.json({imported:mapped.length})
 }
 return NextResponse.json({error:'Invalid import type'},{status:400})
}
