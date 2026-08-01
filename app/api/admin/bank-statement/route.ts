import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const month = req.nextUrl.searchParams.get('month') || new Date().toISOString().slice(0, 7)
  if (!MONTH_RE.test(month)) return NextResponse.json({ error: 'Month must be in YYYY-MM format' }, { status: 400 })

  const { data, error } = await supabaseAdmin()
    .from('bank_statements')
    .select('id,month,file_name,file_url,updated_at')
    .eq('month', month)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ statement: data || null })
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const month = String(body.month || '')
  const file_name = String(body.file_name || '').trim()
  const file_url = String(body.file_url || '').trim()

  if (!MONTH_RE.test(month)) return NextResponse.json({ error: 'Month must be in YYYY-MM format' }, { status: 400 })
  if (!file_url) return NextResponse.json({ error: 'Bank statement link is required' }, { status: 400 })
  try { new URL(file_url) } catch { return NextResponse.json({ error: 'Enter a valid bank statement URL' }, { status: 400 }) }

  const { data, error } = await supabaseAdmin()
    .from('bank_statements')
    .upsert({
      month,
      file_name: file_name || `Bank Statement - ${month}`,
      file_url,
      updated_at: new Date().toISOString()
    }, { onConflict: 'month' })
    .select('id,month,file_name,file_url,updated_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, statement: data })
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const month = req.nextUrl.searchParams.get('month') || ''
  if (!MONTH_RE.test(month)) return NextResponse.json({ error: 'Month must be in YYYY-MM format' }, { status: 400 })

  const { error } = await supabaseAdmin().from('bank_statements').delete().eq('month', month)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
