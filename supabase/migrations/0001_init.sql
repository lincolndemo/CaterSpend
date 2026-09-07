-- CaterSpend initial schema.
-- Every table except profiles carries user_id; profiles keys on the auth user id.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  business_name text check (business_name is null or length(business_name) <= 200),
  monthly_budget numeric(12,2) check (monthly_budget is null or monthly_budget >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -------------------------------------------------------------- categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(btrim(name)) > 0),
  is_builtin boolean not null default false,
  color_light text not null check (color_light ~ '^#[0-9a-fA-F]{6}$'),
  color_dark text not null check (color_dark ~ '^#[0-9a-fA-F]{6}$'),
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);

alter table public.categories add constraint categories_id_user_uniq unique (id, user_id);

create unique index categories_user_name_uniq
  on public.categories (user_id, lower(btrim(name)));
create index categories_user_idx on public.categories (user_id);

-- -------------------------------------------------------------------- jobs
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(btrim(name)) > 0),
  client text,
  event_date date,
  quoted_amount numeric(12,2) check (quoted_amount is null or quoted_amount >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.jobs add constraint jobs_id_user_uniq unique (id, user_id);

create index jobs_user_idx on public.jobs (user_id);

-- ---------------------------------------------------------------- expenses
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  amount numeric(12,2) not null check (amount > 0),
  description text not null check (length(btrim(description)) > 0),
  category_id uuid not null,
  payment_method text not null check (payment_method in ('Cash', 'Bank Transfer', 'Debit Card', 'Other')),
  job_id uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (category_id, user_id) references public.categories(id, user_id) on delete restrict,
  foreign key (job_id, user_id)      references public.jobs(id, user_id)       on delete set null (job_id)
);

create index expenses_user_date_idx on public.expenses (user_id, date desc);
create index expenses_job_idx on public.expenses (job_id);
create index expenses_category_idx on public.expenses (category_id);

-- ------------------------------------------------------------------ income
create table public.income (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  amount numeric(12,2) not null check (amount > 0),
  description text not null check (length(btrim(description)) > 0),
  job_id uuid,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (job_id, user_id) references public.jobs(id, user_id) on delete set null (job_id)
);

create index income_user_date_idx on public.income (user_id, date desc);
create index income_job_idx on public.income (job_id);

-- ------------------------------------------------------------- updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger jobs_set_updated_at before update on public.jobs
  for each row execute function public.set_updated_at();
create trigger expenses_set_updated_at before update on public.expenses
  for each row execute function public.set_updated_at();
create trigger income_set_updated_at before update on public.income
  for each row execute function public.set_updated_at();

-- --------------------------------------------------------------------- RLS
alter table public.profiles   enable row level security;
alter table public.categories enable row level security;
alter table public.jobs       enable row level security;
alter table public.expenses   enable row level security;
alter table public.income     enable row level security;

create policy profiles_select on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy profiles_insert on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy profiles_update on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy profiles_delete on public.profiles for delete to authenticated using ((select auth.uid()) = id);

create policy categories_select on public.categories for select to authenticated using ((select auth.uid()) = user_id);
create policy categories_insert on public.categories for insert to authenticated with check ((select auth.uid()) = user_id);
create policy categories_update on public.categories for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and is_builtin = false);
create policy categories_delete on public.categories for delete to authenticated
  using ((select auth.uid()) = user_id and not is_builtin);

create policy jobs_select on public.jobs for select to authenticated using ((select auth.uid()) = user_id);
create policy jobs_insert on public.jobs for insert to authenticated with check ((select auth.uid()) = user_id);
create policy jobs_update on public.jobs for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy jobs_delete on public.jobs for delete to authenticated using ((select auth.uid()) = user_id);

create policy expenses_select on public.expenses for select to authenticated using ((select auth.uid()) = user_id);
create policy expenses_insert on public.expenses for insert to authenticated with check ((select auth.uid()) = user_id);
create policy expenses_update on public.expenses for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy expenses_delete on public.expenses for delete to authenticated using ((select auth.uid()) = user_id);

create policy income_select on public.income for select to authenticated using ((select auth.uid()) = user_id);
create policy income_insert on public.income for insert to authenticated with check ((select auth.uid()) = user_id);
create policy income_update on public.income for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy income_delete on public.income for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------- signup seeding
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, business_name)
  values (new.id, nullif(btrim(coalesce(new.raw_user_meta_data ->> 'business_name', '')), ''))
  on conflict do nothing;

  insert into public.categories (user_id, name, is_builtin, color_light, color_dark, sort_order)
  values
    (new.id, 'Ingredients',  true, '#2a78d6', '#3987e5', 10),
    (new.id, 'Packaging',    true, '#eb6834', '#d95926', 20),
    (new.id, 'Transport',    true, '#1baf7a', '#199e70', 30),
    (new.id, 'Gas/Fuel',     true, '#eda100', '#c98500', 40),
    (new.id, 'Staff/Labour', true, '#e87ba4', '#d55181', 50),
    (new.id, 'Equipment',    true, '#008300', '#008300', 60),
    (new.id, 'Marketing',    true, '#4a3aa7', '#9085e9', 70),
    (new.id, 'Utilities',    true, '#e34948', '#e66767', 80),
    (new.id, 'Other',        true, '#898781', '#898781', 90)
  on conflict do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
