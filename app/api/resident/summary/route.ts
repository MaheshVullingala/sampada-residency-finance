import { NextRequest, NextResponse } from 'next/server'
import { verify } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

function nextMonth(month: string) {
  const [year, value] = month.split('-').map(Number)
  return new Date(Date.UTC(year, value, 1)).toISOString().slice(0, 7)
}

function prevMonth(month: string, back: number) {
  const [year, value] = month.split('-').map(Number)
  return new Date(Date.UTC(year, value - 1 - back, 1)).toISOString().slice(0, 7)
}

function monthsBetween(start: string, end: string) {
  const months: string[] = []
  let [year, month] = start.split('-').map(Number)
  const [endYear, endMonth] = end.split('-').map(Number)
  while (year < endYear || (year === endYear && month <= endMonth)) {
    months.push(`${year}-${String(month).padStart(2, '0')}`)
    month += 1
    if (month === 13) { month = 1; year += 1 }
  }
  return months
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('resident_session')?.value
  if (!verify(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const selectedMonth = req.nextUrl.searchParams.get('month') || new Date().toISOString().slice(0, 7)
  const sb = supabaseAdmin()
  const { data: settings } = await sb.from('app_settings').select('*').eq('id', 1).maybeSingle()
  const startDate = String(settings?.start_date || '2026-02-06')
  const startMonth = startDate.slice(0, 7)
  const startBalance = Number(settings?.opening_balance || 0)

  if (selectedMonth < startMonth) {
    return NextResponse.json({
      month: selectedMonth, start_date: startDate, has_data: false,
      message: `Records start from ${startDate}. No data is available for ${selectedMonth}.`,
      opening_balance: 0, maintenance_collected: 0,
      total_expenses: 0, closing_balance: 0, expenses: [], trend: [],
      pending_dues: [], collections_by_type: []
    })
  }

  const start = `${selectedMonth}-01`
  const end = `${nextMonth(selectedMonth)}-01`

  const { data: expenses, error: expensesError } = await sb.from('expenses')
    .select('expense_date,category,vendor_name,amount,payment_mode,description,bill_url')
    .eq('status', 'approved').gte('expense_date', start).lt('expense_date', end)
    .order('expense_date', { ascending: false })
  if (expensesError) return NextResponse.json({ error: expensesError.message }, { status: 500 })

  const { data: allExpenses, error: allExpensesError } = await sb.from('expenses')
    .select('expense_date,amount').eq('status', 'approved')
    .gte('expense_date', startDate).lt('expense_date', end)
  if (allExpensesError) return NextResponse.json({ error: allExpensesError.message }, { status: 500 })

  const { data: allMonthlyIncome, error: monthlyIncomeError } = await sb.from('monthly_income')
    .select('month,income_type,amount').gte('month', startMonth).lte('month', selectedMonth)
  if (monthlyIncomeError) return NextResponse.json({ error: monthlyIncomeError.message }, { status: 500 })



  const monthlyIncomeByMonth = new Map<string, number>()
  const monthlyIncomeByType = new Map<string, Map<string, number>>()
  for (const row of allMonthlyIncome || []) {
    const month = String(row.month)
    const type = String(row.income_type || 'Monthly Income')
    const amount = Number(row.amount || 0)
    monthlyIncomeByMonth.set(month, (monthlyIncomeByMonth.get(month) || 0) + amount)
    if (!monthlyIncomeByType.has(month)) monthlyIncomeByType.set(month, new Map())
    const typeMap = monthlyIncomeByType.get(month)!
    typeMap.set(type, (typeMap.get(type) || 0) + amount)
  }

  let runningBalance = startBalance
  let openingBalance = startBalance
  for (const month of monthsBetween(startMonth, selectedMonth)) {
    openingBalance = runningBalance
    const monthlyExpenses = (allExpenses || []).filter(row => String(row.expense_date).slice(0, 7) === month).reduce((sum, row) => sum + Number(row.amount || 0), 0)
    const monthlyCollections = monthlyIncomeByMonth.get(month) || 0
    runningBalance = openingBalance + monthlyCollections - monthlyExpenses
  }

  const totalExpenses = (expenses || []).reduce((sum, row) => sum + Number(row.amount || 0), 0)
  const collected = monthlyIncomeByMonth.get(selectedMonth) || 0
  const currentTypeMap = monthlyIncomeByType.get(selectedMonth) || new Map<string, number>()
  const collectionsByType = Array.from(currentTypeMap.entries()).map(([charge_type, amount]) => ({ charge_type, amount })).sort((a, b) => b.amount - a.amount)



  const trendStart = prevMonth(selectedMonth, 5)
  const { data: trendExpenses } = await sb.from('expenses').select('expense_date,amount')
    .eq('status', 'approved').gte('expense_date', `${trendStart}-01`).lt('expense_date', end)
  const trend = []
  for (let index = 5; index >= 0; index -= 1) {
    const month = prevMonth(selectedMonth, index)
    const total = (trendExpenses || []).filter(row => String(row.expense_date).slice(0, 7) === month).reduce((sum, row) => sum + Number(row.amount || 0), 0)
    trend.push({ month, total_expenses: total })
  }

  // Flat payment records are intentionally used only for Paid/Pending tracking.
  const { data: chargeRows, error: duesError } = await sb.from('flat_charge_payments')
    .select('flat_no,amount_due,status,charges!inner(month,charge_type)')
    .lte('charges.month', selectedMonth).order('flat_no')
  if (duesError) return NextResponse.json({ error: duesError.message }, { status: 500 })

  const pendingMap: Record<string, any> = {}
  for (const row of chargeRows || []) {
    if (String(row.status) === 'Paid') continue
    const flat = String(row.flat_no)
    const chargeType = String((row as any).charges?.charge_type || '')
    const pending = Number(row.amount_due || 0)
    if (pending <= 0) continue
    if (!pendingMap[flat]) pendingMap[flat] = { flat_no: flat, maintenance_pending: 0, emergency_pending: 0, other_pending: 0, total_pending: 0 }
    if (chargeType === 'Monthly Maintenance') pendingMap[flat].maintenance_pending += pending
    else if (chargeType === 'Emergency Fund') pendingMap[flat].emergency_pending += pending
    else pendingMap[flat].other_pending += pending
  }
  const pendingDues = Object.values(pendingMap).map((row: any) => ({ ...row, total_pending: row.maintenance_pending + row.emergency_pending + row.other_pending })).filter((row: any) => row.total_pending > 0).sort((a: any, b: any) => String(a.flat_no).localeCompare(String(b.flat_no)))

  const { data: bankStatement, error: bankStatementError } = await sb.from('bank_statements')
    .select('file_name,file_url').eq('month', selectedMonth).maybeSingle()
  if (bankStatementError) return NextResponse.json({ error: bankStatementError.message }, { status: 500 })

  return NextResponse.json({
    month: selectedMonth,
    start_date: startDate,
    opening_balance: openingBalance,
    maintenance_collected: collected,
    total_expenses: totalExpenses,
    closing_balance: openingBalance + collected - totalExpenses,
    expenses: expenses || [], trend, pending_dues: pendingDues,
    collections_by_type: collectionsByType, bank_statement: bankStatement || null
  })
}
