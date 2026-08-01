create table if not exists monthly_dues (
  id uuid primary key default gen_random_uuid(),
  month text unique not null,
  maintenance_amount numeric(12,2) not null default 0,
  emergency_fund_amount numeric(12,2) not null default 0,
  other_amount numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists flat_dues (
  id uuid primary key default gen_random_uuid(),
  month text not null,
  flat_no text not null,
  maintenance_amount numeric(12,2) not null default 0,
  emergency_fund_amount numeric(12,2) not null default 0,
  other_amount numeric(12,2) not null default 0,
  total_due numeric(12,2) not null default 0,
  paid_amount numeric(12,2) not null default 0,
  pending_amount numeric(12,2) not null default 0,
  status text not null default 'Pending',
  paid_date date,
  updated_at timestamptz not null default now(),
  unique(month, flat_no)
);

alter table monthly_dues enable row level security;
alter table flat_dues enable row level security;
