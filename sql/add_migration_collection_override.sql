-- Migration month collection override
-- Run once in Supabase SQL Editor.

alter table app_settings
  add column if not exists migration_month text,
  add column if not exists migration_collection_override numeric(12,2) not null default 0,
  add column if not exists use_migration_collection_override boolean not null default false;

update app_settings
set migration_month = coalesce(migration_month, '2026-02')
where id = 1;
