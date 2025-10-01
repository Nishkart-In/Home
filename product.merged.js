/* product.js — merged: keep your original design, read single product from Supabase (fallback to products.js) */
window.addEventListener('DOMContentLoaded',()=>{
  const WA_NUMBER = (window.NKCFG && window.NKCFG.WA_NUMBER) ? String(window.NKCFG.WA_NUMBER).trim() : '919711947389';
  const INR = n => '₹ ' + Number(n).toLocaleString('en-IN');

  function getParam(name){ return new URL(location.href).searchParams.get(name); }
  const slug = (getParam('slug') || '').trim();

  const supabase = (window.supabase && window.NKCFG) ? window.supabase.createClient(window.NKCFG.SUPABASE_URL, window.NKCFG.SUPABASE_ANON_KEY) : null;

  async function loadProduct(){
    // Prefer Supabase fetch by slug
    if(supabase && slug){
      try{
        const { data, error } = await supabase.from('products').select('*').eq('slug', slug).limit(1).maybeSingle();
        if(!error && data) return normalize(data);
      }catch(e){ console.warn('Supabase product fetch failed', e.message); }
    }
    // Fallback to local products.js
    const list = Array.isArray(window.NISHKART_PRODUCTS) ? window.NISHKART_PRODUCTS : [];
    return list.find(p => (p.slug || '').trim() === slug) || null;
  }

  function normalize(p){
    return {
      ...p,
      images: Array.isArray(p.images) ? p.images : [],
      specs: (p.specs && typeof p.specs === 'object') ? p.specs : {}
    };
  }

  function toast(msg){
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'), 1400);
  }

  function renderNotFound(){
    const main = document.querySelector('main .container') || document.querySelector('main');
    main.innerHTML = `
      <section class="empty">
        <h2>Product not found</h2>
        <a class="btn" href="index.html">Back to catalog</a>
      </section>`;
  }

  function renderProduct(product){
    document.getElementById('title').textContent = product.name + ' • Nishkart';
    document.getElementById('pName').textContent = product.name;
    document.getElementById('pPrice').textContent = INR(product.price);
    document.getElementById('pShort').textContent = product.short || '';
    document.getElementById('pDesc').textContent = product.description || '';

    const thumbs = document.getElementById('thumbs');
    const main = document.getElementById('mainImg');
    const imgs = (product.images && product.images.length ? product.images : ['assets/small.jpg']);

    function safeSrc(imgEl, src){
      imgEl.src = src;
      imgEl.onerror = () => { imgEl.onerror=null; imgEl.src='assets/small.jpg'; };
    }

    let idx = 0;
    function setIdx(i){
      idx = (i + imgs.length) % imgs.length;
      safeSrc(main, imgs[idx]);
      thumbs.querySelectorAll('img').forEach((e, j)=> e.classList.toggle('active', j===idx));
    }

    setIdx(0);
    main.alt = product.name;

    imgs.forEach((src, i)=>{
      const t = document.createElement('img');
      safeSrc(t, src);
      if(i===0) t.classList.add('active');
      t.addEventListener('click', ()=> setIdx(i));
      thumbs.appendChild(t);
    });

    let startX = 0;
    main.addEventListener('touchstart', e=>{ startX = e.touches[0].clientX; });
    main.addEventListener('touchend', e=>{
      const dx = e.changedTouches[0].clientX - startX;
      if(Math.abs(dx) > 40){ setIdx(idx + (dx < 0 ? 1 : -1)); }
    });

    const wa = document.getElementById('waBtn');
    if(wa){
      wa.href = `https://wa.me/${WA_NUMBER}?text=` + encodeURIComponent(`Hi, I’m interested in: ${product.name} (${INR(product.price)})`);
      wa.target = "_blank"; wa.rel = "noopener";
    }

    async function shareCurrent(){
      const link = location.href;
      try{
        if(navigator.share){
          await navigator.share({title: product.name, text: 'Check this product', url: link});
        }else{
          await navigator.clipboard.writeText(link);
          toast('Link copied!');
        }
      }catch(e){}
    }
    const shareBtn = document.getElementById('shareBtn');
    if(shareBtn) shareBtn.addEventListener('click', shareCurrent);
    const sharePg = document.getElementById('sharePg');
    if(sharePg) sharePg.addEventListener('click', shareCurrent);

    const specs = product.specs || {};
    const dl = document.getElementById('pSpecs');
    Object.keys(specs).forEach(k=>{
      const dt = document.createElement('dt'); dt.textContent = k;
      const dd = document.createElement('dd'); dd.textContent = specs[k];
      dl.appendChild(dt); dl.appendChild(dd);
    });
  }

  (async function init(){
    const product = await loadProduct();
    if(!product){ renderNotFound(); return; }
    renderProduct(product);
  })();
});
