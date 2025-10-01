
// app.supabase.js
const supabase = window.supabase.createClient(NKCFG.SUPABASE_URL, NKCFG.SUPABASE_ANON_KEY);

async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('DB error:', error.message);
    return [];
  }
  return (data || []).map(p => ({
    ...p,
    images: Array.isArray(p.images) ? p.images : [],
    specs: typeof p.specs === 'object' && p.specs !== null ? p.specs : {}
  }));
}

function waLink(name, price) {
  const msg = encodeURIComponent(`Hi, I want to order: ${name} (₹${price})`);
  return `https://wa.me/${NKCFG.WA_NUMBER}?text=${msg}`;
}

function productCard(p) {
  const img = (p.images && p.images[0]) || "https://via.placeholder.com/600x400?text=No+Image";
  return `
  <div class="card">
    <img src="${img}" alt="${p.name}" style="width:100%;height:180px;object-fit:cover;border-radius:12px;">
    <h3 style="margin:.6rem 0 0;">${p.name}</h3>
    <div style="opacity:.8;margin:.2rem 0;">₹${p.price}</div>
    ${p.short ? `<p style="opacity:.8">${p.short}</p>` : ""}
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
      <a href="/product.supabase.html?slug=${encodeURIComponent(p.slug)}"><button>View</button></a>
      <a href="${waLink(p.name, p.price)}" target="_blank"><button>WhatsApp</button></a>
    </div>
  </div>`;
}

function renderGrid(products) {
  const grid = document.getElementById('grid');
  const empty = document.getElementById('empty');
  if (!products.length) {
    grid.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";
  grid.innerHTML = products.map(productCard).join('');
}

(async function init() {
  let all = await fetchProducts();
  renderGrid(all);

  // Search
  const q = document.getElementById('search');
  q?.addEventListener('input', (e) => {
    const s = (e.target.value || '').toLowerCase();
    const filtered = all.filter(p =>
      (p.name||'').toLowerCase().includes(s) ||
      (p.short||'').toLowerCase().includes(s) ||
      (p.description||'').toLowerCase().includes(s)
    );
    renderGrid(filtered);
  });
})();
