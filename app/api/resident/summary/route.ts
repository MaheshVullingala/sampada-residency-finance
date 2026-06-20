import { NextRequest, NextResponse } from 'next/server'
import { verify } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
function nextMonth(m:string){const [y,mo]=m.split('-').map(Number); const d=new Date(Date.UTC(y,mo,1)); return d.toISOString().slice(0,7)}
function prevMonth(m:string, back:number){const [y,mo]=m.split('-').map(Number); const d=new Date(Date.UTC(y,mo-1-back,1)); return d.toISOString().slice(0,7)}
function monthsBetween(start:string,end:string){const out:string[]=[]; let [y,m]=start.split('-').map(Number); const [ey,em]=end.split('-').map(Number); while(y<ey || (y===ey && m<=em)){out.push(`${y}-${String(m).padStart(2,'0')}`); m++; if(m===13){m=1;y++}} return out}
export async function GET(req:NextRequest){
 const token=req.cookies.get('resident_session')?.value
 if(!verify(token)) return NextResponse.json({error:'Unauthorized'},{status:401})
 const month=req.nextUrl.searchParams.get('month')||new Date().toISOString().slice(0,7)
 const sb=supabaseAdmin()
 const {data:settings}=await sb.from('app_settings').select('*').eq('id',1).maybeSingle()
 const startDate=String(settings?.start_date||'2025-02-06')
 const startMonth=startDate.slice(0,7)
 const startBalance=Number(settings?.opening_balance||0)

 // Do not show carried-forward or dummy data for months before the treasurer start date.
 // Example: if the start date is 2025-02-06, Jan-2025 must show "No data".
 if (month < startMonth) {
   return NextResponse.json({
     month,
     start_date:startDate,
     has_data:false,
     message:`Records start from ${startDate}. No data is available for ${month}.`,
     opening_balance:0,
     maintenance_collected:0,
     other_income:0,
     total_expenses:0,
     closing_balance:0,
     expenses:[],
     trend:[]
   })
 }

 const start=`${month}-01`, end=`${nextMonth(month)}-01`
 const {data:expenses,error}=await sb.from('expenses').select('expense_date,category,vendor_name,amount,payment_mode,description,bill_url').eq('status','approved').gte('expense_date',start).lt('expense_date',end).order('expense_date',{ascending:false})
 if(error) return NextResponse.json({error:error.message},{status:500})
 const {data:balances}=await sb.from('monthly_balances').select('*').gte('month',startMonth).lte('month',month)
 const balanceByMonth=new Map((balances||[]).map((b:any)=>[b.month,b]))
 const {data:allExpenses}=await sb.from('expenses').select('expense_date,amount').eq('status','approved').gte('expense_date',startDate).lt('expense_date',end)
 let running=startBalance
 let opening=startBalance
 const months=monthsBetween(startMonth, month)
 for(const m of months){
   opening=running
   const b:any=balanceByMonth.get(m) || {}
   const exp=(allExpenses||[]).filter((x:any)=>String(x.expense_date).slice(0,7)===m).reduce((s:any,x:any)=>s+Number(x.amount),0)
   running = opening + Number(b.maintenance_collected||0) + Number(b.other_income||0) - exp
 }
 const balance:any=balanceByMonth.get(month) || {}
 const total=(expenses||[]).reduce((s:any,x:any)=>s+Number(x.amount),0)
 const collected=Number(balance?.maintenance_collected||0), other=Number(balance?.other_income||0)
 const trendStart=prevMonth(month,5)
 const {data:trendExpenses}=await sb.from('expenses').select('expense_date,amount').eq('status','approved').gte('expense_date',`${trendStart}-01`).lt('expense_date',end)
 const trend:Array<{month:string,total_expenses:number}>=[]
 for(let i=5;i>=0;i--){const m=prevMonth(month,i); const sum=(trendExpenses||[]).filter((x:any)=>String(x.expense_date).slice(0,7)===m).reduce((s:any,x:any)=>s+Number(x.amount),0); trend.push({month:m,total_expenses:sum})}
 return NextResponse.json({month,start_date:startDate,opening_balance:opening,maintenance_collected:collected,other_income:other,total_expenses:total,closing_balance:opening+collected+other-total,expenses,trend})
}
