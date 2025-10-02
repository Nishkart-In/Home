
-- Storage policies for bucket 'product-images'
-- Create bucket in Dashboard: Storage → Create bucket → name: product-images → Public ON

-- SELECT for everyone (to view images on site)
drop policy if exists "public read product-images" on storage.objects;
create policy "public read product-images"
on storage.objects for select
using (bucket_id = 'product-images');

-- INSERT for authenticated users (admin)
drop policy if exists "auth upload product-images" on storage.objects;
create policy "auth upload product-images"
on storage.objects for insert to authenticated
with check (bucket_id = 'product-images');

-- UPDATE for authenticated
drop policy if exists "auth update product-images" on storage.objects;
create policy "auth update product-images"
on storage.objects for update to authenticated
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');

-- DELETE for authenticated
drop policy if exists "auth delete product-images" on storage.objects;
create policy "auth delete product-images"
on storage.objects for delete to authenticated
using (bucket_id = 'product-images');
