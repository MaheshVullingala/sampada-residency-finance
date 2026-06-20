import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const DEFAULT_SETTINGS = {
  id: 1,
  start_date: '2025-02-06',
  opening_balance: 0,
  notes: 'Opening balance from the date treasurer took charge'
}

export async function GET(){
  try{
    if(!(await isAdmin())) return NextResponse.json({error:'Unauthorized'},{status:401})
    const {data,error}=await supabaseAdmin().from('app_settings').select('*').eq('id',1).maybeSingle()
    if(error) return NextResponse.json({error:error.message},{status:500})
    return NextResponse.json({settings:data||DEFAULT_SETTINGS})
  }catch(e:any){
    return NextResponse.json({error:e.message || 'Setup load failed'},{status:500})
  }
}

export async function POST(req:NextRequest){
  try{
    if(!(await isAdmin())) return NextResponse.json({error:'Unauthorized'},{status:401})
    const b=await req.json()
    const row={
      id:1,
      start_date: b.start_date || '2025-02-06',
      opening_balance: Number(b.opening_balance||0),
      notes: b.notes || '',
      updated_at: new Date().toISOString()
    }
    const {data,error}=await supabaseAdmin().from('app_settings').upsert(row,{onConflict:'id'}).select().single()
    if(error) return NextResponse.json({error:error.message},{status:500})
    return NextResponse.json({settings:data})
  }catch(e:any){
    return NextResponse.json({error:e.message || 'Setup save failed'},{status:500})
  }
}
