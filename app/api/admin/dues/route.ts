import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const PAID = 'Paid'
const UNPAID = 'Unpaid'

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sb = supabaseAdmin()
  const selectedChargeId = req.nextUrl.searchParams.get('charge_id')
  const { data: charges, error: chargeError } = await sb.from('charges').select('*').order('month', { ascending: false }).order('created_at', { ascending: false })
  if (chargeError) return NextResponse.json({ error: chargeError.message }, { status: 500 })
  if (!selectedChargeId) return NextResponse.json({ charges: charges || [], payments: [], totals: { total_due: 0, total_paid: 0, total_pending: 0 } })

  const { data: payments, error } = await sb.from('flat_charge_payments').select('*').eq('charge_id', selectedChargeId).order('flat_no')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const rows = payments || []
  return NextResponse.json({
    charges: charges || [],
    payments: rows,
    totals: {
      total_due: rows.reduce((sum, row) => sum + Number(row.amount_due || 0), 0),
      total_paid: rows.reduce((sum, row) => sum + (String(row.status) === PAID ? Number(row.amount_due || 0) : 0), 0),
      total_pending: rows.reduce((sum, row) => sum + (String(row.status) === PAID ? 0 : Number(row.amount_due || 0)), 0)
    }
  })
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const month = String(body.month || '')
  const charge_type = String(body.charge_type || '')
  const amount = Number(body.amount || 0)
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return NextResponse.json({ error: 'Month must be in YYYY-MM format' }, { status: 400 })
  if (!charge_type) return NextResponse.json({ error: 'Charge type is required' }, { status: 400 })
  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: 'Amount must be greater than zero' }, { status: 400 })

  const sb = supabaseAdmin()
  const { data: charge, error: chargeError } = await sb.from('charges').insert({ month, charge_type, amount, notes: body.notes || null }).select('*').single()
  if (chargeError) return NextResponse.json({ error: chargeError.message }, { status: 500 })

  const { data: flats, error: flatsError } = await sb.from('flats').select('flat_no').order('flat_no')
  if (flatsError) return NextResponse.json({ error: flatsError.message }, { status: 500 })
  const rows = (flats || []).map(flat => ({ charge_id: charge.id, flat_no: flat.flat_no, amount_due: amount, amount_paid: 0, status: UNPAID, paid_date: null, updated_at: new Date().toISOString() }))
  const { error: paymentError } = await sb.from('flat_charge_payments').upsert(rows, { onConflict: 'charge_id,flat_no' })
  if (paymentError) return NextResponse.json({ error: paymentError.message }, { status: 500 })
  return NextResponse.json({ ok: true, charge })
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const chargeId = String(body.charge_id || '')
  const flats = Array.isArray(body.flat_nos) ? body.flat_nos.map(String) : []
  const mode = String(body.mode || '')
  if (!chargeId || flats.length === 0) return NextResponse.json({ error: 'Select at least one flat' }, { status: 400 })
  if (!['paid', 'unpaid'].includes(mode)) return NextResponse.json({ error: 'Status must be paid or unpaid' }, { status: 400 })

  const sb = supabaseAdmin()
  const { data: rows, error: getError } = await sb.from('flat_charge_payments').select('id,amount_due').eq('charge_id', chargeId).in('flat_no', flats)
  if (getError) return NextResponse.json({ error: getError.message }, { status: 500 })
  const now = new Date().toISOString()
  for (const row of rows || []) {
    const paid = mode === 'paid'
    const { error } = await sb.from('flat_charge_payments').update({
      status: paid ? PAID : UNPAID,
      amount_paid: paid ? Number(row.amount_due || 0) : 0,
      paid_date: paid ? now.slice(0, 10) : null,
      updated_at: now
    }).eq('id', row.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = req.nextUrl.searchParams.get('id') || ''
  if (!id) return NextResponse.json({ error: 'Charge id is required' }, { status: 400 })
  const { error } = await supabaseAdmin().from('charges').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
