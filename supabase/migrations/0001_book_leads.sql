-- 0001_book_leads.sql
-- Lead-capture table for /books submissions. Paste this into the Supabase
-- SQL editor and run. Idempotent — safe to re-run.

create table if not exists public.book_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  book_title text not null,
  book_slug text not null,
  book_type text not null check (book_type in ('free','paid')),
  source_page text not null default '/books',
  consent_accepted boolean not null default false,
  user_agent text,
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists book_leads_created_at_idx on public.book_leads (created_at desc);
create index if not exists book_leads_book_slug_idx on public.book_leads (book_slug);
create index if not exists book_leads_email_idx on public.book_leads (email);

-- RLS: nobody can read leads from the client. The service role bypasses RLS
-- so the admin API route can still query the table on the server.
alter table public.book_leads enable row level security;
-- Intentionally no policies declared = no client access.
