import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(){
  if(!(await isAdmin())) return NextResponse.json({error:'Unauthorized'},{status:401})
  const {data,error}=await supabaseAdmin()
    .from('fixed_deposits')
    .select('*')
    .order('start_date',{ascending:false})
  if(error) return NextResponse.json({error:error.message},{status:500})
  return NextResponse.json({fixed_deposits:data||[]})
}

export async function POST(req:NextRequest){
  if(!(await isAdmin())) return NextResponse.json({error:'Unauthorized'},{status:401})
  const body=await req.json()
  const amount=Number(body.amount||0)
  if(!body.bank_name) return NextResponse.json({error:'Bank name is required'},{status:400})
  if(!body.start_date) return NextResponse.json({error:'Start date is required'},{status:400})
  if(!Number.isFinite(amount)||amount<=0) return NextResponse.json({error:'Amount must be greater than zero'},{status:400})

  const {data,error}=await supabaseAdmin().from('fixed_deposits').insert({
    bank_name:String(body.bank_name),
    fd_reference:String(body.fd_reference||''),
    amount,
    start_date:String(body.start_date),
    maturity_date:body.maturity_date?String(body.maturity_date):null,
    interest_rate:body.interest_rate?Number(body.interest_rate):null,
    notes:String(body.notes||''),
    updated_at:new Date().toISOString()
  }).select().single()
  if(error) return NextResponse.json({error:error.message},{status:500})
  return NextResponse.json({fixed_deposit:data})
}

export async function PUT(req:NextRequest){
  if(!(await isAdmin())) return NextResponse.json({error:'Unauthorized'},{status:401})
  const body=await req.json()
  if(!body.id) return NextResponse.json({error:'Fixed deposit ID is required'},{status:400})
  const amount=Number(body.amount||0)
  if(!body.bank_name) return NextResponse.json({error:'Bank name is required'},{status:400})
  if(!body.start_date) return NextResponse.json({error:'Start date is required'},{status:400})
  if(!Number.isFinite(amount)||amount<=0) return NextResponse.json({error:'Amount must be greater than zero'},{status:400})

  const {data,error}=await supabaseAdmin().from('fixed_deposits').update({
    bank_name:String(body.bank_name),
    fd_reference:String(body.fd_reference||''),
    amount,
    start_date:String(body.start_date),
    maturity_date:body.maturity_date?String(body.maturity_date):null,
    interest_rate:body.interest_rate?Number(body.interest_rate):null,
    notes:String(body.notes||''),
    updated_at:new Date().toISOString()
  }).eq('id',String(body.id)).select().single()
  if(error) return NextResponse.json({error:error.message},{status:500})
  return NextResponse.json({fixed_deposit:data})
}

export async function DELETE(req:NextRequest){
  if(!(await isAdmin())) return NextResponse.json({error:'Unauthorized'},{status:401})
  const id=req.nextUrl.searchParams.get('id')
  if(!id) return NextResponse.json({error:'Fixed deposit ID is required'},{status:400})
  const {error}=await supabaseAdmin().from('fixed_deposits').delete().eq('id',id)
  if(error) return NextResponse.json({error:error.message},{status:500})
  return NextResponse.json({ok:true})
}
