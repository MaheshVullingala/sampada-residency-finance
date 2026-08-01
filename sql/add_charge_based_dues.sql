-- Charge-based maintenance dues migration.
-- Safe to run after v10. It keeps old monthly_dues/flat_dues tables untouched,
-- and creates the new charge model used from v11 onward.

create table if not exists charges (
  id uuid primary key default gen_random_uuid(),
  month text not null, -- YYYY-MM
  charge_type text not null,
  amount_per_flat numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(month, charge_type)
);

create table if not exists flat_charge_payments (
  id uuid primary key default gen_random_uuid(),
  charge_id uuid not null references charges(id) on delete cascade,
  flat_no text not null,
  amount_due numeric(12,2) not null default 0,
  amount_paid numeric(12,2) not null default 0,
  status text not null default 'Pending', -- Paid / Partial / Pending
  paid_date date,
  updated_at timestamptz not null default now(),
  unique(charge_id, flat_no)
);

alter table charges enable row level security;
alter table flat_charge_payments enable row level security;

create index if not exists idx_charges_month on charges(month);
create index if not exists idx_flat_charge_payments_charge_id on flat_charge_payments(charge_id);
create index if not exists idx_flat_charge_payments_flat_no on flat_charge_payments(flat_no);

-- Migrate old monthly maintenance rows into charge records.
insert into charges (month, charge_type, amount_per_flat, notes, updated_at)
select month, 'Monthly Maintenance', maintenance_amount, notes, now()
from monthly_dues
where coalesce(maintenance_amount,0) > 0
on conflict (month, charge_type) do update set
  amount_per_flat = excluded.amount_per_flat,
  notes = excluded.notes,
  updated_at = now();

-- Migrate old emergency fund rows into charge records.
insert into charges (month, charge_type, amount_per_flat, notes, updated_at)
select month, 'Emergency Fund', emergency_fund_amount, notes, now()
from monthly_dues
where coalesce(emergency_fund_amount,0) > 0
on conflict (month, charge_type) do update set
  amount_per_flat = excluded.amount_per_flat,
  notes = excluded.notes,
  updated_at = now();

-- Migrate old other charge rows into charge records.
insert into charges (month, charge_type, amount_per_flat, notes, updated_at)
select month, 'Others', other_amount, notes, now()
from monthly_dues
where coalesce(other_amount,0) > 0
on conflict (month, charge_type) do update set
  amount_per_flat = excluded.amount_per_flat,
  notes = excluded.notes,
  updated_at = now();

-- Create per-flat payment rows for monthly maintenance.
insert into flat_charge_payments (charge_id, flat_no, amount_due, amount_paid, status, paid_date, updated_at)
select c.id, fd.flat_no, fd.maintenance_amount, coalesce(fd.maintenance_paid_amount,0),
  case
    when coalesce(fd.maintenance_paid_amount,0) <= 0 then 'Pending'
    when coalesce(fd.maintenance_paid_amount,0) >= coalesce(fd.maintenance_amount,0) then 'Paid'
    else 'Partial'
  end,
  case when coalesce(fd.maintenance_paid_amount,0) > 0 then fd.paid_date else null end,
  now()
from flat_dues fd
join charges c on c.month = fd.month and c.charge_type = 'Monthly Maintenance'
where coalesce(fd.maintenance_amount,0) > 0
on conflict (charge_id, flat_no) do update set
  amount_due = excluded.amount_due,
  amount_paid = excluded.amount_paid,
  status = excluded.status,
  paid_date = excluded.paid_date,
  updated_at = now();

-- Create per-flat payment rows for emergency fund.
insert into flat_charge_payments (charge_id, flat_no, amount_due, amount_paid, status, paid_date, updated_at)
select c.id, fd.flat_no, fd.emergency_fund_amount, coalesce(fd.emergency_fund_paid_amount,0),
  case
    when coalesce(fd.emergency_fund_paid_amount,0) <= 0 then 'Pending'
    when coalesce(fd.emergency_fund_paid_amount,0) >= coalesce(fd.emergency_fund_amount,0) then 'Paid'
    else 'Partial'
  end,
  case when coalesce(fd.emergency_fund_paid_amount,0) > 0 then fd.paid_date else null end,
  now()
from flat_dues fd
join charges c on c.month = fd.month and c.charge_type = 'Emergency Fund'
where coalesce(fd.emergency_fund_amount,0) > 0
on conflict (charge_id, flat_no) do update set
  amount_due = excluded.amount_due,
  amount_paid = excluded.amount_paid,
  status = excluded.status,
  paid_date = excluded.paid_date,
  updated_at = now();

-- Create per-flat payment rows for other charges.
insert into flat_charge_payments (charge_id, flat_no, amount_due, amount_paid, status, paid_date, updated_at)
select c.id, fd.flat_no, fd.other_amount, coalesce(fd.other_paid_amount,0),
  case
    when coalesce(fd.other_paid_amount,0) <= 0 then 'Pending'
    when coalesce(fd.other_paid_amount,0) >= coalesce(fd.other_amount,0) then 'Paid'
    else 'Partial'
  end,
  case when coalesce(fd.other_paid_amount,0) > 0 then fd.paid_date else null end,
  now()
from flat_dues fd
join charges c on c.month = fd.month and c.charge_type = 'Others'
where coalesce(fd.other_amount,0) > 0
on conflict (charge_id, flat_no) do update set
  amount_due = excluded.amount_due,
  amount_paid = excluded.amount_paid,
  status = excluded.status,
  paid_date = excluded.paid_date,
  updated_at = now();
