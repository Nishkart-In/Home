
// product.supabase.js
const supabase = window.supabase.createClient(NKCFG.SUPABASE_URL, NKCFG.SUPABASE_ANON_KEY);

function getSlug() {
  const u = new URL(location.href);
  return (u.searchParams.get('slug') || '').trim();
}

function injectOGMeta(p) {
  const head = document.head;
  const img = (p.images && p.images[0]) || '';
  const meta = [
    ['og:title', p.name],
    ['og:description', p.short || p.description || ''],
    ['og:image', img],
    ['twitter:card', 'summary_large_image']
  ];
  meta.forEach(([prop, content]) => {
    const m = document.createElement('meta');
    if (prop.startsWith('og:')) m.setAttribute('property', prop);
    else m.setAttribute('name', prop);
    m.setAttribute('content', content);
    head.appendChild(m);
  });
}

function waLink(name, price) {
  const msg = encodeURIComponent(`Hi, I want to order: ${name} (₹${price})`);
  return `https://wa.me/${NKCFG.WA_NUMBER}?text=${msg}`;
}

function render(p) {
  const root = document.getElementById('root');
  if (!p) {
    root.innerHTML = `<section class="empty"><h2>Product not found</h2><a class="btn" href="/index.supabase.html">Back to catalog</a></section>`;
    return;
  }
  const img = (p.images && p.images[0]) || "https://via.placeholder.com/900x600?text=No+Image";
  const specsHTML = Object.entries(p.specs || {}).map(([k,v]) => `<div><strong>${k}:</strong> ${v}</div>`).join('') || '<div class="muted">No specs</div>';
  root.innerHTML = `
    <article class="card" style="max-width:960px;margin:2rem auto;">
      <img src="${img}" alt="${p.name}" style="width:100%;max-height:420px;object-fit:cover;border-radius:14px;">
      <h1 style="margin:.8rem 0 0;">${p.name}</h1>
      <div style="opacity:.8;margin:.2rem 0;">₹${p.price}</div>
      ${p.short ? `<p>${p.short}</p>` : ""}
      ${p.description ? `<p>${p.description}</p>` : ""}
      <h3>Specifications</h3>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;">${specsHTML}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
        <a href="${waLink(p.name, p.price)}" target="_blank"><button>WhatsApp to Order</button></a>
        <a href="/index.supabase.html"><button>Back</button></a>
      </div>
    </article>
  `;
}

(async function init() {
  const slug = getSlug();
  if (!slug) return render(null);
  const { data, error } = await supabase.from('products').select('*').eq('slug', slug).limit(1).maybeSingle();
  if (error || !data) return render(null);
  const p = {
    ...data,
    images: Array.isArray(data.images) ? data.images : [],
    specs: typeof data.specs === 'object' && data.specs !== null ? data.specs : {}
  };
  injectOGMeta(p);
  render(p);
})();
