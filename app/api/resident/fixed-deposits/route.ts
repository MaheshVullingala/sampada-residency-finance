import { NextRequest, NextResponse } from 'next/server'
import { verify } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

function nextMonth(month:string){
  const [year,value]=month.split('-').map(Number)
  return new Date(Date.UTC(year,value,1)).toISOString().slice(0,7)
}

export async function GET(req:NextRequest){
  const token=req.cookies.get('resident_session')?.value
  if(!verify(token)) return NextResponse.json({error:'Unauthorized'},{status:401})

  const month=req.nextUrl.searchParams.get('month')||new Date().toISOString().slice(0,7)
  const monthEnd=`${nextMonth(month)}-01`
  const {data,error}=await supabaseAdmin()
    .from('fixed_deposits')
    .select('id,bank_name,fd_reference,amount,start_date,maturity_date,interest_rate')
    .lt('start_date',monthEnd)
    .order('start_date',{ascending:false})

  // Keep resident view working even before the optional FD migration is run.
  if(error){
    const message=String(error.message||'')
    if(message.includes('fixed_deposits')||String((error as any).code||'').startsWith('PGRST')){
      return NextResponse.json({total:0,fixed_deposits:[]})
    }
    return NextResponse.json({error:error.message},{status:500})
  }

  const active=(data||[]).filter(row=>!row.maturity_date||String(row.maturity_date)>=monthEnd)
  const total=active.reduce((sum,row)=>sum+Number(row.amount||0),0)
  return NextResponse.json({total,fixed_deposits:active})
}
