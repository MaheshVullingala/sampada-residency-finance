# Association Expense Tracker

A mobile-first Next.js app for apartment association treasurers.

## Features

- Treasurer/admin login
- Add expenses from mobile
- Store category, description, vendor, amount, payment mode, paid by, and bill link
- Excel/CSV import for old expense data
- Excel/CSV import for monthly maintenance collection data
- Flat No + PIN resident access
- No resident name, phone, or email stored
- PINs are hashed before saving
- Resident graphical dashboard:
  - Opening balance
  - Maintenance collected
  - Other income
  - Total expenses
  - Closing balance
  - Category-wise visual breakdown
  - Monthly expense trend
  - Top expenses this month
  - Detailed expense list
- Monthly CSV export for upload into your existing web app

## Data model

### Expenses Excel columns

You can upload `.xlsx`, `.xls`, or `.csv`.

Accepted column names:

- `Expense Date` or `Date`
- `Expense Category` or `Category`
- `Expense Description` or `Description`
- `Expense Amount` or `Amount`
- Optional: `Vendor Name`, `Payment Mode`, `Paid By`, `Bill URL`

### Monthly collection Excel columns

One entry per month:

- `Month` in `YYYY-MM` format, example `2026-02`
- `Opening Balance`
- `Maintenance Collected`
- `Other Income`
- `Notes`

For your case, enter the opening balance for February based on the balance on the date you took charge. From March onward, you can use the previous month's closing balance as the next opening balance.

## Setup

1. Create a Supabase project.
2. Open Supabase SQL Editor and run `sql/schema.sql`.
3. Copy `.env.example` to `.env.local`.
4. Add your Supabase URL and service role key.
5. Set `ADMIN_PASSWORD` and `SESSION_SECRET`.
6. Run locally:

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Push this folder to GitHub.
2. Import the repo in Vercel.
3. Add the same environment variables in Vercel Project Settings.
4. Deploy.

## Pages

- `/admin` - Treasurer dashboard
- `/admin/expenses` - Add expenses and export CSV
- `/admin/import` - Import existing Excel/CSV details
- `/admin/flats` - Create or reset flat PINs
- `/resident` - Resident graphical statement view

## Important security notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` publicly.
- Keep resident dashboard view-only.
- Use strong `ADMIN_PASSWORD` and `SESSION_SECRET`.
- Current bill upload field accepts a link. Supabase Storage upload can be added later.


## Starting Setup

After running the schema, open:

http://localhost:3000/admin/setup

Set:
- Charge taken date: 2025-02-06
- Opening balance on that date

If you already ran the old schema before this update, run this extra SQL file once in Supabase SQL Editor:

sql/add_app_settings_if_existing_db.sql

Monthly collection Excel can have one row per month with columns:
- Month (YYYY-MM)
- Maintenance Collected
- Other Income
- Notes

Opening balance for each month is calculated from the starting setup + previous collections/income - expenses.
