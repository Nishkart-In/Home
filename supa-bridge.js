/**
 * supa-bridge.js — keep your original design, swap data source to Supabase.
 * Usage:
 *   <script src="/config.js"></script>
 *   <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
 *   (your existing scripts: products.js, app.js, product.js ...)
 *   <script defer src="/supa-bridge.js"></script>
 */
(function(){
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  function hasSupabase(){ return !!(window.NKCFG && window.NKCFG.SUPABASE_URL && window.NKCFG.SUPABASE_ANON_KEY && window.supabase); }
  function inr(n){ const x=Number(n); return isFinite(x)?'₹ '+x.toLocaleString('en-IN'):String(n); }
  function norm(p){
    try{ if(typeof p.images==='string') p.images=JSON.parse(p.images); }catch(e){}
    try{ if(typeof p.specs==='string')  p.specs =JSON.parse(p.specs ); }catch(e){}
    p.images = Array.isArray(p.images)?p.images:[];
    p.specs  = (p.specs && typeof p.specs==='object')?p.specs:{};
    return p;
  }
  ready(async function(){
    if(!hasSupabase()) return;
    const supa = window.supabase.createClient(window.NKCFG.SUPABASE_URL, window.NKCFG.SUPABASE_ANON_KEY);
    const params = new URL(location.href).searchParams;
    const slug = (params.get('slug')||'').trim();

    // Catalog page
    const grid = document.getElementById('grid');
    if(grid){
      try{
        const {data, error} = await supa.from('products').select('*').order('created_at',{ascending:false});
        if(error) throw error;
        const list = (data||[]).map(norm);
        window.NISHKART_PRODUCTS = list; // keep old code happy
        window.ALL_PRODUCTS = list;
        if(typeof window.renderGrid==='function') window.renderGrid(list); // re-render using your UI
      }catch(e){ console.warn('[supa-bridge] catalog fetch failed:', e.message); }
    }

    // Product page
    if(slug && typeof window.renderProduct==='function'){
      try{
        const {data, error} = await supa.from('products').select('*').eq('slug', slug).limit(1).maybeSingle();
        if(error) throw error;
        if(data){
          const p = norm(data);
          window.renderProduct(p);
          const waNum = (window.NKCFG && window.NKCFG.WA_NUMBER)?String(window.NKCFG.WA_NUMBER).trim():'';
          const wa = document.getElementById('waBtn');
          if(wa && waNum){
            const msg = encodeURIComponent(`Hi, I want to order: ${p.name} (${inr(p.price)})`);
            wa.href = `https://wa.me/${waNum}?text=${msg}`;
            wa.target = "_blank"; wa.rel = "noopener";
          }
          const head=document.head, img=(p.images&&p.images[0])||'';
          [['og:title',p.name],['og:description',p.short||p.description||''],['og:image',img],['twitter:card','summary_large_image']]
            .forEach(([prop,content])=>{ const m=document.createElement('meta'); if(prop.startsWith('og:'))m.setAttribute('property',prop); else m.setAttribute('name',prop); m.setAttribute('content',content); head.appendChild(m); });
        }
      }catch(e){ console.warn('[supa-bridge] product fetch failed:', e.message); }
    }
  });
})();