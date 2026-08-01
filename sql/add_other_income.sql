-- Other Income / Deposits module
-- Run this once in Supabase SQL Editor.

create table if not exists other_income (
  id uuid primary key default gen_random_uuid(),
  income_date date not null,
  income_type text not null,
  description text,
  amount numeric(12,2) not null check (amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table other_income enable row level security;
