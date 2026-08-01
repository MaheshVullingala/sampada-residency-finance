-- Run once in Supabase to consolidate all income into monthly_income.
-- Final allowed categories: Monthly Maintenance, Emergency Fund, Other Income.

update public.monthly_income
set income_type = 'Other Income', updated_at = now()
where income_type in ('Other Collections', 'Bank Interest', 'Refund', 'Penalty', 'Donation');

insert into public.monthly_income (month, income_type, amount, notes, created_at, updated_at)
select
  to_char(income_date, 'YYYY-MM'),
  'Other Income',
  amount,
  concat_ws(' - ', income_type, description),
  created_at,
  now()
from public.other_income oi
where not exists (
  select 1 from public.monthly_income mi
  where mi.month = to_char(oi.income_date, 'YYYY-MM')
    and mi.income_type = 'Other Income'
    and mi.amount = oi.amount
    and coalesce(mi.notes, '') = concat_ws(' - ', oi.income_type, oi.description)
);

-- Optional after verifying migrated rows:
-- drop table public.other_income;
