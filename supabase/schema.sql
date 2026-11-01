-- Execute SOMENTE no projeto Supabase independente do Meus Gastos.
-- O casal compartilha um usuario autenticado na primeira versao.
create extension if not exists pgcrypto;
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  description text not null check (length(trim(description)) between 1 and 250),
  amount numeric(12,2) not null check (amount > 0),
  category text not null check (length(trim(category)) between 1 and 80),
  expense_date date not null,
  created_at timestamptz not null default now()
);
create index if not exists expenses_user_date_idx on public.expenses(user_id,expense_date desc);
alter table public.expenses enable row level security;
create policy "expenses_select_own" on public.expenses for select to authenticated using ((select auth.uid()) = user_id);
create policy "expenses_insert_own" on public.expenses for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "expenses_update_own" on public.expenses for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "expenses_delete_own" on public.expenses for delete to authenticated using ((select auth.uid()) = user_id);
grant select,insert,update,delete on public.expenses to authenticated;
-- Para sincronizacao em tempo real, habilite public.expenses na publicacao
-- supabase_realtime no painel Database > Publications.
