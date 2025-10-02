
/**
 * supa-bridge.js — v2 (fixed)
 * Works with your CURRENT design & JS (no deletions).
 * - Catalog: fetches from Supabase → sets window.NISHKART_PRODUCTS → tries window.render(); 
 *            if not present, renders cards itself (same markup as your app.js).
 * - Product: fetches by slug → fills DOM directly (ids: #pName, #pPrice, #mainImg, #thumbs, #pDesc, #pShort, #pSpecs, #waBtn, share buttons).
 *
 * Order in HTML:
 *   <script src="./config.js"></script>
 *   <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
 *   <!-- your existing scripts: products.js, app.js or product.js -->
 *   <script defer src="./supa-bridge.js"></script>
 */
(function(){
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  function ok(){ return !!(window.NKCFG && window.NKCFG.SUPABASE_URL && window.NKCFG.SUPABASE_ANON_KEY && window.supabase); }
  function INR(n){ const x=Number(n); return isFinite(x)?'₹ '+x.toLocaleString('en-IN'):String(n); }
  function norm(p){
    try{ if(typeof p.images==='string') p.images=JSON.parse(p.images); }catch(e){}
    try{ if(typeof p.specs==='string')  p.specs =JSON.parse(p.specs ); }catch(e){}
    p.images = Array.isArray(p.images)?p.images:[];
    p.specs  = (p.specs && typeof p.specs==='object')?p.specs:{};
    return p;
  }
  function waNumber(){ return (window.NKCFG && window.NKCFG.WA_NUMBER) ? String(window.NKCFG.WA_NUMBER).trim() : ''; }

  // === Catalog helpers (fallback renderer) ===
  function renderCatalogFallback(list){
    const grid = document.getElementById('grid');
    if(!grid) return;
    const wa = waNumber();
    const waSVG = `<svg viewBox="0 0 32 32" width="18" height="18" aria-hidden="true">
      <path fill="#fff" d="M.5 31.5l2.3-8.4a14 14 0 1125.7-7.4 13.9 13.9 0 01-19.7 12.4L.5 31.5z"/>
      <path fill="#25d366" d="M9 26.3l.5.3a12 12 0 10-4.5-4.3l.2.5-1.4 5 5.2-1.5z"/>
      <path fill="#fff" d="M21.9 18.7c-.3-.2-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.1-.2.1-.3.2-.6.1-.3-.1-1.2-.4-2.4-1.5-1-1-1.5-2.2-1.7-2.5-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.1-.3.2-.5.1-.1 0-.4 0-.5-.1-.1-.7-1.8-1-2.4-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.3 3.1c.2.3 2.1 3.3 5 4.5.7.3 1.3.5 1.7.6.7.2 1.3.2 1.7.1.6-.1 1.7-.7 1.9-1.3.2-.6.2-1.2.1-1.3-.1-.1-.3-.2-.6-.4z"/>
    </svg>`;
    function card(p){
      const url = `product.html?slug=${encodeURIComponent(p.slug)}`;
      const img0 = (p.images && p.images[0]) || 'assets/small.jpg';
      return `
      <article class="card" id="card-${p.slug}">
        <a class="img" href="${url}" aria-label="${p.name}">
          <img src="${img0}" alt="${p.name}" onerror="this.onerror=null;this.src='assets/small.jpg'">
        </a>
        <div class="body">
          <a class="name" href="${url}">${p.name}</a>
          <div class="price">${INR(p.price)}</div>
          <div class="muted">${p.short || ''}</div>
          <div class="actions">
            <a class="btn whatsapp" href="${wa ? `https://wa.me/${wa}?text=${encodeURIComponent('Hi, I want to order: ' + p.name + ' ('+INR(p.price)+')')}`:'#'}" target="_blank" rel="noopener">${waSVG} Shop Now</a>
            <button class="btn share" data-share="${url}" aria-label="Share ${p.name}">Share</button>
          </div>
        </div>
      </article>`;
    }
    grid.innerHTML = list.map(card).join('');
    grid.querySelectorAll('button[data-share]').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        const link = new URL(btn.dataset.share, location.href).href;
        try{
          if(navigator.share){
            await navigator.share({title:'Nishkart', text:'Check this out', url:link});
          }else{
            await navigator.clipboard.writeText(link);
            const t=document.getElementById('toast'); if(t){ t.textContent='Link copied!'; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),1400); }
          }
        }catch(e){}
      });
    });
  }

  // === Product helpers (DOM fill) ===
  function renderProductDOM(p){
    const INRf = INR;
    const title = document.getElementById('title'); if(title) title.textContent = (p.name||'') + ' • Nishkart';
    const n = document.getElementById('pName'); if(n) n.textContent = p.name || '';
    const pr = document.getElementById('pPrice'); if(pr) pr.textContent = INRf(p.price);
    const sh = document.getElementById('pShort'); if(sh) sh.textContent = p.short || '';
    const de = document.getElementById('pDesc');  if(de) de.textContent = p.description || '';

    const thumbs = document.getElementById('thumbs');
    const main = document.getElementById('mainImg');
    const imgs = (p.images && p.images.length ? p.images : ['assets/small.jpg']);

    function safeSrc(imgEl, src){
      if(!imgEl) return;
      imgEl.src = src;
      imgEl.onerror = () => { imgEl.onerror=null; imgEl.src='assets/small.jpg'; };
    }
    let idx = 0;
    function setIdx(i){
      idx = (i + imgs.length) % imgs.length;
      if(main) safeSrc(main, imgs[idx]);
      if(thumbs) thumbs.querySelectorAll('img').forEach((e, j)=> e.classList.toggle('active', j===idx));
    }
    if(main){ setIdx(0); main.alt = p.name || ''; }
    if(thumbs){
      thumbs.innerHTML = '';
      imgs.forEach((src, i)=>{
        const t = document.createElement('img');
        safeSrc(t, src);
        if(i===0) t.classList.add('active');
        t.addEventListener('click', ()=> setIdx(i));
        thumbs.appendChild(t);
      });
    }
    if(main){
      let startX = 0;
      main.addEventListener('touchstart', e=>{ startX = e.touches[0].clientX; });
      main.addEventListener('touchend', e=>{
        const dx = e.changedTouches[0].clientX - startX;
        if(Math.abs(dx) > 40){ setIdx(idx + (dx < 0 ? 1 : -1)); }
      });
    }

    const waNum = waNumber();
    const wa = document.getElementById('waBtn');
    if(wa && waNum){
      const msg = encodeURIComponent(`Hi, I want to order: ${p.name} (${INRf(p.price)})`);
      wa.href = `https://wa.me/${waNum}?text=${msg}`;
      wa.target = "_blank"; wa.rel = "noopener";
    }

    async function shareCurrent(){
      const link = location.href;
      try{
        if(navigator.share){
          await navigator.share({title: p.name || 'Product', text: 'Check this product', url: link});
        }else{
          await navigator.clipboard.writeText(link);
          const t=document.getElementById('toast'); if(t){ t.textContent='Link copied!'; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),1400); }
        }
      }catch(e){}
    }
    const shareBtn = document.getElementById('shareBtn'); if(shareBtn) shareBtn.addEventListener('click', shareCurrent);
    const sharePg  = document.getElementById('sharePg');  if(sharePg)  sharePg.addEventListener('click', shareCurrent);

    const specs = p.specs || {};
    const dl = document.getElementById('pSpecs');
    if(dl){
      dl.innerHTML = '';
      Object.keys(specs).forEach(k=>{
        const dt = document.createElement('dt'); dt.textContent = k;
        const dd = document.createElement('dd'); dd.textContent = specs[k];
        dl.appendChild(dt); dl.appendChild(dd);
      });
    }
  }

  ready(async function(){
    if(!ok()) return;
    const supa = window.supabase.createClient(window.NKCFG.SUPABASE_URL, window.NKCFG.SUPABASE_ANON_KEY);
    const params = new URL(location.href).searchParams;
    const slug = (params.get('slug')||'').trim();

    // === Catalog ===
    const grid = document.getElementById('grid');
    if(grid){
      try{
        const {data, error} = await supa.from('products').select('*').order('created_at',{ascending:false});
        if(error) throw error;
        const list = (data||[]).map(norm);
        window.NISHKART_PRODUCTS = list; // overwrite global
        window.ALL_PRODUCTS = list;
        if(typeof window.render==='function'){
          window.render(list);  // your app.js function
        }else if(typeof window.renderGrid==='function'){
          window.renderGrid(list);
        }else{
          renderCatalogFallback(list);
        }
      }catch(e){
        console.warn('[supa-bridge] catalog fetch failed:', e.message);
      }
    }

    // === Product ===
    const onProduct = document.getElementById('pName') || document.getElementById('mainImg');
    if(slug && onProduct){
      try{
        const {data, error} = await supa.from('products').select('*').eq('slug', slug).limit(1).maybeSingle();
        if(error) throw error;
        if(data){
          const p = norm(data);
          if(typeof window.renderProduct==='function'){
            window.renderProduct(p);
          }else{
            renderProductDOM(p);
          }
          // basic social meta
          const head=document.head, img=(p.images&&p.images[0])||'';
          [['og:title',p.name],['og:description',p.short||p.description||''],['og:image',img],['twitter:card','summary_large_image']]
            .forEach(([prop,content])=>{ const m=document.createElement('meta'); if(prop.startsWith('og:'))m.setAttribute('property',prop); else m.setAttribute('name',prop); m.setAttribute('content',content); head.appendChild(m); });
        }
      }catch(e){
        console.warn('[supa-bridge] product fetch failed:', e.message);
      }
    }
  });
})();
