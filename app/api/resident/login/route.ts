import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sign } from '@/lib/auth'
export async function POST(req:NextRequest){
 const {flat_no,pin}=await req.json()
 const {data,error}=await supabaseAdmin().from('flats').select('*').eq('flat_no',String(flat_no||'').toUpperCase()).eq('status','active').single()
 if(error||!data) return NextResponse.json({error:'Invalid flat number or PIN'},{status:401})
 const ok=await bcrypt.compare(String(pin||''),data.pin_hash)
 if(!ok) return NextResponse.json({error:'Invalid flat number or PIN'},{status:401})
 const res=NextResponse.json({ok:true})
 res.cookies.set('resident_session',sign(data.flat_no),{httpOnly:true,sameSite:'lax',secure:true,path:'/',maxAge:60*60*6})
 return res
}
