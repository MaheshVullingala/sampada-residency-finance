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
