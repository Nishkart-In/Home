
window.addEventListener('DOMContentLoaded',()=>{
  const WA_NUMBER = '919711947389';
  const INR = n => '₹ ' + Number(n).toLocaleString('en-IN');

  const waSVG = `<svg viewBox="0 0 32 32" width="18" height="18" aria-hidden="true">
    <path fill="#fff" d="M.5 31.5l2.3-8.4a14 14 0 1125.7-7.4 13.9 13.9 0 01-19.7 12.4L.5 31.5z"/>
    <path fill="#25d366" d="M9 26.3l.5.3a12 12 0 10-4.5-4.3l.2.5-1.4 5 5.2-1.5z"/>
    <path fill="#fff" d="M21.9 18.7c-.3-.2-1.7-.9-2-1-.3-.1-.5-.2-.7.2s-.8 1-1 1.2-.4.2-.7 0c-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.6-1.8-1.8-2.1-.2-.3 0-.5.2-.7.2-.2.3-.4.5-.6.2-.2.2-.4.3-.6 0-.2 0-.5 0-.7 0-.2-.7-1.7-1-2.3-.3-.6-.6-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.3.2-1 1-1 2.4s1 2.7 1.2 2.9c.1.2 2 3.1 4.7 4.4.7.3 1.2.6 1.6.7.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.3.2-.6.2-1.2.1-1.3-.1-.1-.3-.2-.6-.4z"/>
  </svg>`;

  function productCard(p){
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
          <a class="btn whatsapp" href="https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hi, I’m interested in: ' + p.name + ' ('+INR(p.price)+')')}" target="_blank" rel="noopener">${waSVG} Shop Now</a>
          <button class="btn share" data-share="${url}" aria-label="Share ${p.name}">Share</button>
        </div>
      </div>
    </article>`;
  }

  function render(list){
    const grid = document.getElementById('grid');
    grid.innerHTML = list.map(productCard).join('');
    grid.querySelectorAll('button[data-share]').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        const link = new URL(btn.dataset.share, location.href).href;
        try{
          if(navigator.share){
            await navigator.share({title:'Nishkart', text:'Check this out', url:link});
          }else{
            await navigator.clipboard.writeText(link);
            toast('Link copied!');
          }
        }catch(err){}
      });
    });
  }

  function toast(msg){
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'), 1400);
  }

  const products = Array.isArray(window.NISHKART_PRODUCTS) ? window.NISHKART_PRODUCTS.slice() : [];
  if(!products.length){
    document.getElementById('grid').innerHTML = '<div class="muted">No products available.</div>';
  }else{
    render(products);
  }

  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  form.addEventListener('submit', e=>e.preventDefault());
  input.addEventListener('input', ()=>{
    const q = input.value.toLowerCase();
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.short||'').toLowerCase().includes(q) ||
      (p.description||'').toLowerCase().includes(q)
    );
    render(filtered);
  });

  if(location.hash){
    const slug = location.hash.slice(1);
    const card = document.getElementById('card-'+slug);
    if(card){
      card.scrollIntoView({behavior:'smooth', block:'center'});
      card.classList.add('highlight-pulse');
      setTimeout(()=>card.classList.remove('highlight-pulse'), 2400);
    }
  }
});
