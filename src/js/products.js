// src/js/products.js
// PromoHub - Renderers & Marketplace Handlers (FINAL, SOP)

import {
  getProducts,
  getShops,
  getPromos,
  getProductById,
  getMarketplacesByCategory
} from './storage.js';

const FALLBACKS = {
  product: '/src/assets/placeholder/product-placeholder.jpg',
  shop: '/src/assets/placeholder/shop-placeholder.png'
};

function h(html) {
  const d = document.createElement('div');
  d.innerHTML = html.trim();
  return d.firstElementChild;
}

function rupiah(n) {
  try {
    return 'Rp ' + Number(n).toLocaleString('id-ID');
  } catch {
    return 'Rp ' + n;
  }
}

/* ---------- Render Marketplaces (kategori vertikal, grid 2 kolom) ---------- */
export function renderMarketplaces(containerSel) {
  const container = document.querySelector(containerSel);
  if (!container) return;
  container.innerHTML = '';
  
  const categories = [
    { key: 'trending', title: 'Yang Ramai Hari Ini' },
    { key: 'travel', title: 'Travel' },
    { key: 'kosmetik', title: 'Kosmetik' },
    { key: 'fashion', title: 'Fashion' },
    { key: 'home', title: 'Home & Decoration' }
  ];
  
  categories.forEach(cat => {
    const list = getMarketplacesByCategory(cat.key) || [];
    if (!list || list.length === 0) return;
    
    const section = h(`
      <section class="category-section">
        <h3 class="category-title">${cat.title}</h3>
        <div class="marketplace-grid" data-category="${cat.key}"></div>
      </section>
    `);
    
    const grid = section.querySelector('.marketplace-grid');
    
    list.forEach(m => {
      const card = h(`
        <article class="card">
          <img class="shop-logo" src="${m.logo || FALLBACKS.shop}" alt="${m.name}"
               onerror="this.onerror=null;this.src='${FALLBACKS.shop}';" />
          <div class="shop-name">${m.name}</div>
          <div class="cashback">Cashback s/d ${rupiah(m.cashback || 0)}</div>
          <div class="actions">
            <a class="btn btn-primary" href="${m.url}" target="_blank" rel="noopener">Kunjungi</a>
            <button class="btn btn-outline btn-share" data-name="${m.name}" data-url="${m.url}">Share</button>
          </div>
        </article>
      `);
      grid.appendChild(card);
    });
    
    container.appendChild(section);
  });
  
  // Event share
  container.querySelectorAll('.btn-share').forEach(btn => {
    btn.addEventListener('click', async () => {
      const { name, url } = btn.dataset;
      if (navigator.share) {
        try {
          await navigator.share({ title: `Promo di ${name}`, url });
        } catch (err) {
          console.warn('Share gagal', err);
        }
      } else {
        try {
          await navigator.clipboard.writeText(url);
          alert('Link disalin: ' + url);
        } catch {
          prompt('Salin link ini:', url);
        }
      }
    });
  });
}

/* ---------- Render Products ---------- */
export function renderProducts(containerSel) {
  const el = document.querySelector(containerSel);
  if (!el) return;
  const items = getProducts();
  el.innerHTML = '';
  
  const grid = h(`<div class="grid-section"></div>`);
  items.forEach(p => {
    const card = h(`
      <article class="card">
        <img src="${p.image || FALLBACKS.product}" alt="${p.name}"
             onerror="this.onerror=null;this.src='${FALLBACKS.product}';" />
        <div class="name">${p.name}</div>
        <div class="price">${rupiah(p.price)} · Cashback ${rupiah(p.cashback)}</div>
        <div class="actions">
          <button class="btn btn-primary" data-open-market data-shop="${p.shopId}">Buka Marketplace</button>
          <a class="btn btn-outline" href="#!" data-product="${p.id}">Detail</a>
        </div>
      </article>
    `);
    grid.appendChild(card);
  });
  el.appendChild(grid);
}

/* ---------- Render Shops ---------- */
export function renderShops(containerSel) {
  const el = document.querySelector(containerSel);
  if (!el) return;
  const shops = getShops();
  el.innerHTML = '';
  
  const grid = h(`<div id="shopsGrid" class="grid-section"></div>`);
  shops.forEach(s => {
    const card = h(`
      <article class="card">
        <img class="shop-logo" src="${s.logo || FALLBACKS.shop}" alt="${s.name}"
             onerror="this.onerror=null;this.src='${FALLBACKS.shop}';" />
        <div class="shop-name">${s.name}</div>
        <div class="shop-followers">${s.url.replace(/^https?:\/\//,'')}</div>
        <div class="actions">
          <button class="btn btn-primary" data-open-market data-shop="${s.id}">Buka Marketplace</button>
        </div>
      </article>
    `);
    grid.appendChild(card);
  });
  el.appendChild(grid);
}

/* ---------- Render Promos ---------- */
export function renderPromos(containerSel) {
  const el = document.querySelector(containerSel);
  if (!el) return;
  const promos = getPromos();
  el.innerHTML = '';
  
  const grid = h(`<div id="promosGrid" class="grid-section"></div>`);
  promos.forEach(pr => {
    const prod = getProductById(pr.productId);
    const img = (prod && prod.image) ? prod.image : FALLBACKS.product;
    const card = h(`
      <article class="card">
        <img src="${pr.img || img || FALLBACKS.product}" alt="${pr.title}"
             onerror="this.onerror=null;this.src='${FALLBACKS.product}';" />
        <div class="promo-title">${pr.title}</div>
        <div class="promo-desc">${pr.desc || (prod ? prod.name : '')}</div>
        <div class="actions">
          <button class="btn btn-primary" data-open-market data-shop="${prod ? prod.shopId : ''}">Buka Marketplace</button>
        </div>
      </article>
    `);
    grid.appendChild(card);
  });
  el.appendChild(grid);
}

/* ---------- Marketplace Popup (untuk toko & promo) ---------- */
export function initMarketplaceHandlers({ popupSel, listSel, closeSel } = {}) {
  const popup = document.querySelector(popupSel || '#marketplacePopup');
  const list = document.querySelector(listSel || '#marketplaceList');
  const btnClose = document.querySelector(closeSel || '#closeMarketplace');
  
  // Daftar affiliate statis
  const AFFILIATES = [
    { name: 'Tiktokshop', url: 'https://affiliate.tiktokshop.com', logo: '/src/assets/marketplace/tiktok.png' },
    { name: 'Shopee', url: 'https://shopee.co.id', logo: '/src/assets/marketplace/shopee.png' },
    { name: 'Lazada', url: 'https://www.lazada.co.id', logo: '/src/assets/marketplace/lazada.png' },
    { name: 'Blibli', url: 'https://www.blibli.com', logo: '/src/assets/marketplace/blibli.png' },
    { name: 'Tokopedia', url: 'https://www.tokopedia.com', logo: '/src/assets/marketplace/tokopedia.png' }
  ];
  
  function open() {
    if (!list) return;
    list.innerHTML = '';
    AFFILIATES.forEach(m => {
      const item = h(`
        <a class="marketplace-item vertical" href="${m.url}" target="_blank" rel="noopener">
          <img src="${m.logo || FALLBACKS.shop}" alt="${m.name}"
               onerror="this.onerror=null;this.src='${FALLBACKS.shop}';" />
          <div>${m.name}</div>
        </a>
      `);
      list.appendChild(item);
    });
    popup?.classList.add('active');
    popup?.setAttribute('aria-hidden', 'false');
  }
  
  function close() {
    popup?.classList.remove('active');
    popup?.setAttribute('aria-hidden', 'true');
  }
  
  document.addEventListener('click', (e) => {
    const trg = e.target.closest('[data-open-market]');
    if (trg) {
      open();
    }
  });
  
  btnClose?.addEventListener('click', close);
  popup?.addEventListener('click', (e) => {
    if (e.target === popup) close();
  });
  
  // set default aria-hidden
  if (popup) popup.setAttribute('aria-hidden', 'true');
}