import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const TYPES = ['Monthly Maintenance', 'Emergency Fund', 'Other Collections']

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const month = req.nextUrl.searchParams.get('month') || new Date().toISOString().slice(0, 7)
  const { data, error } = await supabaseAdmin()
    .from('monthly_income')
    .select('*')
    .eq('income_month', month)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const total = (data || []).reduce((sum, row) => sum + Number(row.amount || 0), 0)
  return NextResponse.json({ income: data || [], total, income_types: TYPES })
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const income_month = String(body.income_month || '')
  const income_type = String(body.income_type || '')
  const amount = Number(body.amount || 0)
  if (!/^\d{4}-\d{2}$/.test(income_month)) return NextResponse.json({ error: 'Month must be in YYYY-MM format' }, { status: 400 })
  if (!income_type) return NextResponse.json({ error: 'Income type is required' }, { status: 400 })
  if (amount < 0) return NextResponse.json({ error: 'Amount cannot be negative' }, { status: 400 })
  const { data, error } = await supabaseAdmin().from('monthly_income').insert({
    income_month,
    income_type,
    amount,
    notes: body.notes || null,
    updated_at: new Date().toISOString()
  }).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, income: data })
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const id = String(body.id || '')
  if (!id) return NextResponse.json({ error: 'Income id is required' }, { status: 400 })
  const amount = Number(body.amount || 0)
  const { data, error } = await supabaseAdmin().from('monthly_income').update({
    income_month: String(body.income_month || ''),
    income_type: String(body.income_type || ''),
    amount,
    notes: body.notes || null,
    updated_at: new Date().toISOString()
  }).eq('id', id).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, income: data })
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = req.nextUrl.searchParams.get('id') || ''
  if (!id) return NextResponse.json({ error: 'Income id is required' }, { status: 400 })
  const { error } = await supabaseAdmin().from('monthly_income').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
