-- Run once in Supabase SQL Editor before deploying V21.
-- Stores one bank statement link per month. The file itself can remain in
-- Google Drive, Supabase Storage, or any other accessible file location.

create table if not exists public.bank_statements (
  id uuid primary key default gen_random_uuid(),
  month text not null unique,
  file_name text not null,
  file_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bank_statements_month_format check (month ~ '^\d{4}-\d{2}$')
);

create index if not exists bank_statements_month_idx
  on public.bank_statements(month);
