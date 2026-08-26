import {NextRequest,NextResponse} from 'next/server'
import {verify} from '@/lib/auth'
import {supabaseAdmin} from '@/lib/supabaseAdmin'

export async function GET(req:NextRequest){
 const token=req.cookies.get('resident_session')?.value
 if(!verify(token)) return NextResponse.json({error:'Unauthorized'},{status:401})
 const {data,error}=await supabaseAdmin().from('app_settings').select('resident_notice_title,resident_notice_message,resident_notice_active').eq('id',1).maybeSingle()
 if(error) return NextResponse.json({error:error.message},{status:500})
 return NextResponse.json({notice:{title:data?.resident_notice_title||'Important Notice',message:data?.resident_notice_message||'',active:Boolean(data?.resident_notice_active)}})
}
