create table if not exists app_settings (
  id int primary key default 1 check (id = 1),
  start_date date not null default '2025-02-06',
  opening_balance numeric(12,2) not null default 0,
  notes text,
  updated_at timestamptz not null default now()
);

alter table app_settings enable row level security;

insert into app_settings (id, start_date, opening_balance, notes)
values (1, '2025-02-06', 0, 'Opening balance from the date treasurer took charge')
on conflict (id) do nothing;
