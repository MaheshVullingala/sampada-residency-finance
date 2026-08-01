-- Split maintenance dues into separate payment heads.
-- Safe to run multiple times.

alter table flat_dues
  add column if not exists maintenance_paid_amount numeric(12,2) not null default 0,
  add column if not exists emergency_fund_paid_amount numeric(12,2) not null default 0,
  add column if not exists other_paid_amount numeric(12,2) not null default 0;

-- Backfill old combined paid_amount into the three heads in order:
-- Monthly Maintenance first, then Emergency Fund, then Other Charges.
update flat_dues
set
  maintenance_paid_amount = least(coalesce(paid_amount,0), coalesce(maintenance_amount,0)),
  emergency_fund_paid_amount = least(greatest(coalesce(paid_amount,0) - coalesce(maintenance_amount,0), 0), coalesce(emergency_fund_amount,0)),
  other_paid_amount = least(greatest(coalesce(paid_amount,0) - coalesce(maintenance_amount,0) - coalesce(emergency_fund_amount,0), 0), coalesce(other_amount,0))
where maintenance_paid_amount = 0
  and emergency_fund_paid_amount = 0
  and other_paid_amount = 0
  and coalesce(paid_amount,0) > 0;

-- Recalculate combined paid/pending/status from the split heads.
update flat_dues
set
  paid_amount = coalesce(maintenance_paid_amount,0) + coalesce(emergency_fund_paid_amount,0) + coalesce(other_paid_amount,0),
  pending_amount = greatest(coalesce(total_due,0) - (coalesce(maintenance_paid_amount,0) + coalesce(emergency_fund_paid_amount,0) + coalesce(other_paid_amount,0)), 0),
  status = case
    when coalesce(maintenance_paid_amount,0) + coalesce(emergency_fund_paid_amount,0) + coalesce(other_paid_amount,0) <= 0 then 'Pending'
    when coalesce(maintenance_paid_amount,0) + coalesce(emergency_fund_paid_amount,0) + coalesce(other_paid_amount,0) >= coalesce(total_due,0) then 'Paid'
    else 'Partial'
  end;
