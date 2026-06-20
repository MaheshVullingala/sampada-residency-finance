import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
function nextMonth(m:string){const [y,mo]=m.split('-').map(Number); const d=new Date(Date.UTC(y,mo,1)); return d.toISOString().slice(0,7)}
export async function GET(req:NextRequest){
  if(!(await isAdmin())) return NextResponse.json({error:'Unauthorized'},{status:401})
  const month = req.nextUrl.searchParams.get('month') || new Date().toISOString().slice(0,7)
  const {data,error}=await supabaseAdmin().from('expenses').select('*').gte('expense_date',`${month}-01`).lt('expense_date',`${nextMonth(month)}-01`).order('expense_date',{ascending:false})
  if(error) return NextResponse.json({error:error.message},{status:500})
  return NextResponse.json({expenses:data})
}
export async function POST(req:NextRequest){
  if(!(await isAdmin())) return NextResponse.json({error:'Unauthorized'},{status:401})
  const body = await req.json()
  const {data,error}=await supabaseAdmin().from('expenses').insert({expense_date: body.expense_date,category: body.category,vendor_name: body.vendor_name,amount: Number(body.amount),payment_mode: body.payment_mode,paid_by: body.paid_by,description: body.description,bill_url: body.bill_url,status: body.status || 'approved'}).select().single()
  if(error) return NextResponse.json({error:error.message},{status:500})
  return NextResponse.json({expense:data})
}
