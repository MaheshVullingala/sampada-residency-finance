import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
export async function GET(req:NextRequest){
 if(!(await isAdmin())) return NextResponse.json({error:'Unauthorized'},{status:401})
 const month=req.nextUrl.searchParams.get('month')||new Date().toISOString().slice(0,7)
 const {data,error}=await supabaseAdmin().from('monthly_balances').select('*').eq('month',month).maybeSingle()
 if(error) return NextResponse.json({error:error.message},{status:500})
 return NextResponse.json({balance:data||{month,opening_balance:0,maintenance_collected:0,other_income:0,notes:''}})
}
export async function POST(req:NextRequest){
 if(!(await isAdmin())) return NextResponse.json({error:'Unauthorized'},{status:401})
 const b=await req.json()
 const row={month:b.month,opening_balance:Number(b.opening_balance||0),maintenance_collected:Number(b.maintenance_collected||0),other_income:Number(b.other_income||0),notes:b.notes||'',updated_at:new Date().toISOString()}
 const {data,error}=await supabaseAdmin().from('monthly_balances').upsert(row,{onConflict:'month'}).select().single()
 if(error) return NextResponse.json({error:error.message},{status:500})
 return NextResponse.json({balance:data})
}
