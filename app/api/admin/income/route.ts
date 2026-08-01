import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req:NextRequest){
  if(!(await isAdmin())) return NextResponse.json({error:'Unauthorized'},{status:401})
  const month=req.nextUrl.searchParams.get('month') || new Date().toISOString().slice(0,7)
  const start=`${month}-01`
  const [y,m]=month.split('-').map(Number)
  const end=new Date(Date.UTC(y,m,1)).toISOString().slice(0,10)
  const {data,error}=await supabaseAdmin()
    .from('other_income')
    .select('*')
    .gte('income_date',start)
    .lt('income_date',end)
    .order('income_date',{ascending:false})
  if(error) return NextResponse.json({error:error.message},{status:500})
  const total=(data||[]).reduce((s:any,x:any)=>s+Number(x.amount||0),0)
  return NextResponse.json({income:data||[], total})
}

export async function POST(req:NextRequest){
  if(!(await isAdmin())) return NextResponse.json({error:'Unauthorized'},{status:401})
  const body=await req.json()
  const income_date=String(body.income_date||'')
  const income_type=String(body.income_type||'').trim()
  const amount=Number(body.amount||0)
  if(!income_date) return NextResponse.json({error:'Income date is required'},{status:400})
  if(!income_type) return NextResponse.json({error:'Income type is required'},{status:400})
  if(amount<=0) return NextResponse.json({error:'Amount must be greater than zero'},{status:400})
  const {data,error}=await supabaseAdmin().from('other_income').insert({
    income_date,
    income_type,
    description:body.description||null,
    amount
  }).select('*').single()
  if(error) return NextResponse.json({error:error.message},{status:500})
  return NextResponse.json({ok:true,income:data})
}

export async function PATCH(req:NextRequest){
  if(!(await isAdmin())) return NextResponse.json({error:'Unauthorized'},{status:401})
  const body=await req.json()
  const id=String(body.id||'')
  if(!id) return NextResponse.json({error:'Income id is required'},{status:400})
  const amount=Number(body.amount||0)
  if(amount<=0) return NextResponse.json({error:'Amount must be greater than zero'},{status:400})
  const {data,error}=await supabaseAdmin().from('other_income').update({
    income_date:String(body.income_date||''),
    income_type:String(body.income_type||'').trim(),
    description:body.description||null,
    amount,
    updated_at:new Date().toISOString()
  }).eq('id',id).select('*').single()
  if(error) return NextResponse.json({error:error.message},{status:500})
  return NextResponse.json({ok:true,income:data})
}

export async function DELETE(req:NextRequest){
  if(!(await isAdmin())) return NextResponse.json({error:'Unauthorized'},{status:401})
  const id=req.nextUrl.searchParams.get('id')||''
  if(!id) return NextResponse.json({error:'Income id is required'},{status:400})
  const {error}=await supabaseAdmin().from('other_income').delete().eq('id',id)
  if(error) return NextResponse.json({error:error.message},{status:500})
  return NextResponse.json({ok:true})
}
