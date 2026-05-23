-- 0002_book_leads_consent.sql
-- GDPR consent capture extension to public.book_leads.
-- Adds three columns:
--   * marketing_opt_in       — optional marketing consent (defaults false)
--   * consent_text_version   — version string of the consent copy shown
--                              at submission time (nullable for old rows)
--   * terms_accepted         — separate Terms of Use acceptance flag
--
-- Idempotent. Safe to re-run. Existing rows get the default values so the
-- not-null columns stay valid. Postgres requires DO-block guards for the
-- column-existence check; `add column if not exists` is supported but the
-- DO pattern is kept explicit so this reads on older Postgres builds too.

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'book_leads'
      and column_name = 'marketing_opt_in'
  ) then
    alter table public.book_leads
      add column marketing_opt_in boolean not null default false;
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'book_leads'
      and column_name = 'consent_text_version'
  ) then
    alter table public.book_leads
      add column consent_text_version text;
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'book_leads'
      and column_name = 'terms_accepted'
  ) then
    alter table public.book_leads
      add column terms_accepted boolean not null default false;
  end if;
end$$;

-- Helpful index for marketing-opt-in filtering when exporting newsletter
-- segments. Cheap on a small table; harmless on a large one.
create index if not exists book_leads_marketing_opt_in_idx
  on public.book_leads (marketing_opt_in)
  where marketing_opt_in = true;
