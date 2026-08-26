import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = supabaseAdmin()
  const [{ data: flats, error: flatsError }, { data: access, error: accessError }] = await Promise.all([
    db.from('flats').select('flat_no').order('flat_no'),
    db.from('resident_report_access').select('id,flat_no,viewed_at').order('viewed_at', { ascending: false })
  ])

  if (flatsError) return NextResponse.json({ error: flatsError.message }, { status: 500 })
  if (accessError) return NextResponse.json({ error: accessError.message }, { status: 500 })

  const rows = access || []
  const stats = new Map<string, { flat_no: string; total_visits: number; last_viewed: string }>()
  for (const row of rows) {
    const flat = String(row.flat_no || '').trim().toUpperCase()
    if (!flat) continue
    const current = stats.get(flat)
    if (current) current.total_visits += 1
    else stats.set(flat, { flat_no: flat, total_visits: 1, last_viewed: row.viewed_at })
  }

  const allFlats = (flats || []).map(row => String(row.flat_no || '').trim().toUpperCase()).filter(Boolean)
  const flatStats = allFlats.map(flat => stats.get(flat) || { flat_no: flat, total_visits: 0, last_viewed: '' })
  const viewedCount = flatStats.filter(row => row.total_visits > 0).length

  return NextResponse.json({
    total_flats: allFlats.length,
    flats_viewed: viewedCount,
    flats_not_viewed: Math.max(0, allFlats.length - viewedCount),
    total_visits: rows.length,
    flats: flatStats.sort((a, b) => b.total_visits - a.total_visits || a.flat_no.localeCompare(b.flat_no)),
    recent: rows.slice(0, 100)
  })
}
