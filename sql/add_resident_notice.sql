alter table public.app_settings
  add column if not exists resident_notice_title text,
  add column if not exists resident_notice_message text,
  add column if not exists resident_notice_active boolean not null default false;

update public.app_settings
set resident_notice_title = coalesce(resident_notice_title, 'Important Notice')
where id = 1;
