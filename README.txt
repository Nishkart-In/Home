
Supabase Admin + Storefront (Drop‑In Starter)
============================================

This kit gives you:
1) admin.html — login + add/update products + image uploads
2) index.supabase.html — catalog page reading from Supabase
3) product.supabase.html — product detail page by ?slug=
4) app.supabase.js — JS for catalog
5) product.supabase.js — JS for product detail
6) config.sample.js — put your Supabase keys + WhatsApp number

How to use (Noob‑friendly, 10 minutes):
---------------------------------------
1) Create a free Supabase project:
   - Copy **Project URL** and **anon public key** from Settings → API
   - In Storage, create bucket **product-images** (make it Public)

2) Create the database table (SQL → New Query → paste ↓ and run):
   --------------------------------------------------------------
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

   -- Public read (so storefront can fetch products)
   create policy "read products" on products
   for select using (true);

   -- Only authenticated users can write
   create policy "write products (auth only)" on products
   for all to authenticated using (true) with check (true);

3) Open config.sample.js, fill in your details, and rename it to **config.js**.

4) Copy all files into your site folder (same place as index.html).
   - Upload **admin.html** (don’t link it in navbar).
   - For testing, open **index.supabase.html** and **product.supabase.html**.
   - When happy, you can replace your existing index.html/product.html with these versions (or keep original as backup).

5) Log in to admin (you must create a user first):
   - In Supabase → Authentication → Users → Create a user (your email & password).
   - Open /admin.html, log in, add your first product (+ upload images).

6) Done. Your Supabase pages will now show live data:
   - /index.supabase.html → shows catalog
   - /product.supabase.html?slug=your-product-slug → shows detail page

Notes:
- WhatsApp number is set in config.js (WA_NUMBER).
- Image uploads go to the bucket product-images automatically.
- You can delete/edit products from the Admin panel list.
- Keep your anon key public; it's designed for client usage. Write access is protected by login.
