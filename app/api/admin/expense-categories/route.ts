import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(){
  if(!(await isAdmin())) return NextResponse.json({error:'Unauthorized'},{status:401})

  const {data,error}=await supabaseAdmin()
    .from('expense_categories')
    .select('id,name')
    .eq('is_active',true)
    .order('name',{ascending:true})

  if(error) return NextResponse.json({error:error.message},{status:500})
  return NextResponse.json({categories:data||[]})
}
