create extension if not exists pgcrypto;

create table if not exists flats (
  id uuid primary key default gen_random_uuid(),
  flat_no text unique not null,
  pin_hash text not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  expense_date date not null,
  category text not null,
  vendor_name text,
  amount numeric(12,2) not null,
  payment_mode text not null,
  paid_by text,
  description text,
  bill_url text,
  status text not null default 'approved',
  created_at timestamptz not null default now()
);

create table if not exists app_settings (
  id int primary key default 1 check (id = 1),
  start_date date not null default '2025-02-06',
  opening_balance numeric(12,2) not null default 0,
  notes text,
  updated_at timestamptz not null default now()
);

create table if not exists monthly_balances (
  month text primary key, -- format YYYY-MM
  opening_balance numeric(12,2) not null default 0,
  maintenance_collected numeric(12,2) not null default 0,
  other_income numeric(12,2) not null default 0,
  notes text,
  updated_at timestamptz not null default now()
);

alter table flats enable row level security;
alter table expenses enable row level security;
alter table monthly_balances enable row level security;
alter table app_settings enable row level security;

create table if not exists monthly_dues (
  id uuid primary key default gen_random_uuid(),
  month text unique not null, -- format YYYY-MM
  maintenance_amount numeric(12,2) not null default 0,
  emergency_fund_amount numeric(12,2) not null default 0,
  other_amount numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists flat_dues (
  id uuid primary key default gen_random_uuid(),
  month text not null, -- format YYYY-MM
  flat_no text not null,
  maintenance_amount numeric(12,2) not null default 0,
  emergency_fund_amount numeric(12,2) not null default 0,
  other_amount numeric(12,2) not null default 0,
  total_due numeric(12,2) not null default 0,
  paid_amount numeric(12,2) not null default 0,
  pending_amount numeric(12,2) not null default 0,
  status text not null default 'Pending', -- Paid / Partial / Pending
  paid_date date,
  updated_at timestamptz not null default now(),
  unique(month, flat_no)
);

alter table monthly_dues enable row level security;
alter table flat_dues enable row level security;

-- Charge-based maintenance dues model, v11 onward.
create table if not exists charges (
  id uuid primary key default gen_random_uuid(),
  month text not null,
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
  status text not null default 'Pending',
  paid_date date,
  updated_at timestamptz not null default now(),
  unique(charge_id, flat_no)
);

alter table charges enable row level security;
alter table flat_charge_payments enable row level security;
