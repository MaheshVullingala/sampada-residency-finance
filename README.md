# Sampada Residency Expense App — V19 Clean

This release cleanly separates accounting from flat payment tracking.

## Accounting
Financial summary uses only:

Opening Balance + Collections + Other Income - Expenses = Closing Balance

Collections are entered manually under **Admin → Collections** and stored in `monthly_income` using `month` in `YYYY-MM` format.

## Flat payment tracking
Charge Management keeps existing flat-wise Paid/Pending statuses. These records are used only to show pending dues and do not calculate collections or income.

## Database
Your existing `monthly_income` table with columns `month`, `income_type`, `amount`, `notes`, `created_at`, and `updated_at` is supported.

The month index you already created is correct:

```sql
CREATE INDEX IF NOT EXISTS monthly_income_month_idx
ON public.monthly_income (month);
```

No migration override columns are required.

## V20 income cleanup
Run `sql/unify_income_categories.sql` once. All income is then stored in `monthly_income` under only:
- Monthly Maintenance
- Emergency Fund
- Other Income

The resident financial summary uses `Opening Balance + Total Collections - Expenses`.
