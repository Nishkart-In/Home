
-- products table + RLS
create extension if not exists "pgcrypto";

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  price integer not null check (price >= 0),
  short text,
  description text,
  images jsonb default '[]'::jsonb,
  specs jsonb default '{}'::jsonb,
  tags text[] default '{}',
  in_stock boolean default true,
  compare_at integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at
before update on products
for each row execute function set_updated_at();

alter table products enable row level security;

-- RLS: read for all
drop policy if exists "read products" on products;
create policy "read products" on products for select using (true);

-- RLS: write for authenticated
drop policy if exists "write products (auth only)" on products;
create policy "write products (auth only)" on products for all to authenticated using (true) with check (true);
