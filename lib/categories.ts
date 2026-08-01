export const EXPENSE_CATEGORIES = [
  'Security Salary',
  'Electricity Bill',
  'BWSSB Kaveri Bill',
  'Diesel',
  'BBMP Garbage',
  'Misc (Floor Cleaners, Brooms.. etc)',
  'Plumbing Maintenance',
  'Electrical Maintenance',
  'Motor Maintenance',
  'New Equipment',
  'Water Tankers',
  'Lift Maintenance',
  'Lift Equipment Purchase',
  'STP Maintenance',
  'CCTV Maintenance',
  'Mobile Bill',
] as const

const aliases: Record<string, string> = {
  'bwss kaveri bill': 'BWSSB Kaveri Bill',
  'bwssb kaveri bill': 'BWSSB Kaveri Bill',
  'bwssb water bill': 'BWSSB Kaveri Bill',
  'kaveri bill': 'BWSSB Kaveri Bill',
  'cavery bill': 'BWSSB Kaveri Bill',
  'diseal': 'Diesel',
  'diesel': 'Diesel',
  'bbmp garbage ': 'BBMP Garbage',
  'bbmp garbage': 'BBMP Garbage',
  'misc': 'Misc (Floor Cleaners, Brooms.. etc)',
  'miscellaneous': 'Misc (Floor Cleaners, Brooms.. etc)',
  'misc (floor cleaners, brooms.. etc)': 'Misc (Floor Cleaners, Brooms.. etc)',
  'plumbing maintainance': 'Plumbing Maintenance',
  'plumbing maintenance': 'Plumbing Maintenance',
  'electrical maintainance': 'Electrical Maintenance',
  'electrical maintenance': 'Electrical Maintenance',
  'motor maintainance': 'Motor Maintenance',
  'motor maintenance': 'Motor Maintenance',
  'new equipments': 'New Equipment',
  'new equipment': 'New Equipment',
  'new equipments/ furniture': 'New Equipment',
  'new equipments/ furniture / boards': 'New Equipment',
  'water tankers ': 'Water Tankers',
  'water tankers': 'Water Tankers',
  'lift maintainance': 'Lift Maintenance',
  'lift maintenance': 'Lift Maintenance',
  'lift equipment purchase ': 'Lift Equipment Purchase',
  'lift equipment purchase': 'Lift Equipment Purchase',
  'stp maintainance': 'STP Maintenance',
  'stp maintenance': 'STP Maintenance',
  'cctv maintainence': 'CCTV Maintenance',
  'cctv maintenance': 'CCTV Maintenance',
  'mobile bill': 'Mobile Bill',
  'security salary': 'Security Salary',
  'electricity bill': 'Electricity Bill',
}

export function normalizeExpenseCategory(value: unknown) {
  const raw = String(value ?? '').trim()
  if (!raw) return 'Misc (Floor Cleaners, Brooms.. etc)'
  const key = raw.toLowerCase().replace(/\s+/g, ' ').trim()
  return aliases[key] || raw
}
