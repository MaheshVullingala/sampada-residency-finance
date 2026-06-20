import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { isAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(){
 if(!(await isAdmin())) return NextResponse.json({error:'Unauthorized'},{status:401})
 const {data,error}=await supabaseAdmin().from('flats').select('id,flat_no,status,created_at').order('flat_no')
 if(error) return NextResponse.json({error:error.message},{status:500})
 return NextResponse.json({flats:data})
}
export async function POST(req:NextRequest){
 if(!(await isAdmin())) return NextResponse.json({error:'Unauthorized'},{status:401})
 const body=await req.json(); const pin=String(body.pin||'')
 if(pin.length<4) return NextResponse.json({error:'PIN must be at least 4 digits'},{status:400})
 const pin_hash=await bcrypt.hash(pin,10)
 const {data,error}=await supabaseAdmin().from('flats').upsert({flat_no:String(body.flat_no).toUpperCase(),pin_hash,status:body.status||'active'},{onConflict:'flat_no'}).select('id,flat_no,status,created_at').single()
 if(error) return NextResponse.json({error:error.message},{status:500})
 return NextResponse.json({flat:data})
}
