
window.addEventListener('DOMContentLoaded',()=>{
  const WA_NUMBER = '919711947389';
  const INR = n => '₹ ' + Number(n).toLocaleString('en-IN');

  function getParam(name){ return new URL(location.href).searchParams.get(name); }
  const slug = getParam('slug');
  const products = Array.isArray(window.NISHKART_PRODUCTS) ? window.NISHKART_PRODUCTS : [];
  const product = products.find(p => p.slug === slug) || products[0];

  if(product){
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
    main.addEventListener('touchstart', e=> startX = e.touches[0].clientX);
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
});
