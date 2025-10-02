
Nishkart • Supabase Fix Bundle (Drop‑in)
======================================

WHAT THIS DOES
- Keeps your existing design & HTML as-is.
- Adds Supabase-backed products with admin panel.
- No deletions; just add/replace the files in this ZIP.

FILES
-----
/config.js            → fill with your SUPABASE_URL, ANON KEY, WA_NUMBER
/supa-bridge.js       → adapter that refills your UI from Supabase
/admin.html           → login + product CRUD + image uploads
/sql/setup.sql        → products table + RLS (run once in Supabase SQL Editor)
/sql/storage_policies.sql → storage RLS for bucket product-images

HOW TO INSTALL
--------------
1) Upload these 3 files to your site root:
   - config.js
   - supa-bridge.js
   - admin.html

2) Edit BOTH pages:
   *index.html*  → <head> add:
       <script src="./config.js"></script>
       <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
     At end of <body> (AFTER your scripts) add:
       <script defer src="./supa-bridge.js"></script>

   *product.html* → same additions as above.

3) Supabase setup (one-time)
   - SQL Editor → paste & run sql/setup.sql
   - Storage → create PUBLIC bucket named: product-images
   - SQL Editor → paste & run sql/storage_policies.sql
   - Authentication → Users → Add user (your admin login)

4) Use
   - Open /admin.html → login → Add Product (images upload) → Save
   - Home & product pages will render from DB, same design.

SUPPORT
- If grid is blank, check console (F12) & ensure config.js loads.
- Make sure bucket name EXACTLY: product-images.
