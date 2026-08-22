create table if not exists public.fixed_deposits (
  id uuid primary key default gen_random_uuid(),
  bank_name text not null,
  fd_reference text,
  amount numeric(12,2) not null check (amount > 0),
  start_date date not null,
  maturity_date date,
  interest_rate numeric(6,3),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_fixed_deposits_start_date on public.fixed_deposits(start_date);
create index if not exists idx_fixed_deposits_maturity_date on public.fixed_deposits(maturity_date);

alter table public.fixed_deposits enable row level security;
