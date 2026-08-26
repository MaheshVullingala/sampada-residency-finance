import {NextRequest,NextResponse} from 'next/server'
import {isAdmin} from '@/lib/auth'
import {supabaseAdmin} from '@/lib/supabaseAdmin'

export async function GET(){
 if(!(await isAdmin())) return NextResponse.json({error:'Unauthorized'},{status:401})
 const {data,error}=await supabaseAdmin().from('app_settings').select('resident_notice_title,resident_notice_message,resident_notice_active').eq('id',1).maybeSingle()
 if(error) return NextResponse.json({error:error.message},{status:500})
 return NextResponse.json({notice:{title:data?.resident_notice_title||'Important Notice',message:data?.resident_notice_message||'',active:Boolean(data?.resident_notice_active)}})
}

export async function POST(req:NextRequest){
 if(!(await isAdmin())) return NextResponse.json({error:'Unauthorized'},{status:401})
 const b=await req.json()
 const row={resident_notice_title:String(b.title||'Important Notice').trim(),resident_notice_message:String(b.message||'').trim(),resident_notice_active:Boolean(b.active),updated_at:new Date().toISOString()}
 const {data,error}=await supabaseAdmin().from('app_settings').update(row).eq('id',1).select('resident_notice_title,resident_notice_message,resident_notice_active').single()
 if(error) return NextResponse.json({error:error.message},{status:500})
 return NextResponse.json({notice:{title:data.resident_notice_title||'Important Notice',message:data.resident_notice_message||'',active:Boolean(data.resident_notice_active)}})
}
