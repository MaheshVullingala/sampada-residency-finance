import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const TYPES = ['Monthly Maintenance', 'Emergency Fund', 'Other Income']
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const month = req.nextUrl.searchParams.get('month') || new Date().toISOString().slice(0, 7)
  const { data, error } = await supabaseAdmin()
    .from('monthly_income')
    .select('*')
    .eq('month', month)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const total = (data || []).reduce((sum, row) => sum + Number(row.amount || 0), 0)
  return NextResponse.json({ income: data || [], total, income_types: TYPES })
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const month = String(body.month || '')
  const income_type = String(body.income_type || '')
  const amount = Number(body.amount)
  if (!MONTH_RE.test(month)) return NextResponse.json({ error: 'Month must be in YYYY-MM format' }, { status: 400 })
  if (!TYPES.includes(income_type)) return NextResponse.json({ error: 'Invalid collection type' }, { status: 400 })
  if (!Number.isFinite(amount) || amount < 0) return NextResponse.json({ error: 'Amount must be zero or more' }, { status: 400 })
  const { data, error } = await supabaseAdmin().from('monthly_income').insert({
    month, income_type, amount, notes: body.notes || null, updated_at: new Date().toISOString()
  }).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, income: data })
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const id = String(body.id || '')
  const month = String(body.month || '')
  const income_type = String(body.income_type || '')
  const amount = Number(body.amount)
  if (!id) return NextResponse.json({ error: 'Collection id is required' }, { status: 400 })
  if (!MONTH_RE.test(month)) return NextResponse.json({ error: 'Month must be in YYYY-MM format' }, { status: 400 })
  if (!TYPES.includes(income_type)) return NextResponse.json({ error: 'Invalid collection type' }, { status: 400 })
  if (!Number.isFinite(amount) || amount < 0) return NextResponse.json({ error: 'Amount must be zero or more' }, { status: 400 })
  const { data, error } = await supabaseAdmin().from('monthly_income').update({
    month, income_type, amount, notes: body.notes || null, updated_at: new Date().toISOString()
  }).eq('id', id).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, income: data })
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = req.nextUrl.searchParams.get('id') || ''
  if (!id) return NextResponse.json({ error: 'Collection id is required' }, { status: 400 })
  const { error } = await supabaseAdmin().from('monthly_income').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
