// src/js/products.js
import { db } from './app.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js';

const tabContent = document.getElementById('tab-content');
const buttons = document.querySelectorAll('.tab-controls button');

async function loadProducts() {
  const snap = await getDocs(collection(db, 'products'));
  const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return arr;
}

async function renderProducts() {
  tabContent.innerHTML = '<h4>Loading products...</h4>';
  const products = await loadProducts();
  if (!products.length) { tabContent.innerHTML = '<p>Tidak ada produk</p>'; return; }
  const html = products.map(p => `
    <div class="card">
      <img src="${p.imageUrl || '/public/assets/logo.png'}"/>
      <h4>${p.title}</h4>
      <p>Cashback: ${p.cashbackPercent || 0}%</p>
      <p>Price: Rp ${p.price || 0}</p>
      <a href="/public/claim.html?productId=${p.id}">Klaim</a>
    </div>
  `).join('');
  tabContent.innerHTML = html;
}

async function renderStores() {
  tabContent.innerHTML = '<h4>Loading stores...</h4>';
  const snap = await getDocs(collection(db, 'stores'));
  const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  tabContent.innerHTML = arr.map(s => `<div class="card"><img src="${s.logoUrl||'/public/assets/logo.png'}"><h4>${s.name}</h4></div>`).join('');
}

async function renderPromos() {
  tabContent.innerHTML = '<h4>Loading promos...</h4>';
  const snap = await getDocs(collection(db, 'promos'));
  const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  tabContent.innerHTML = arr.map(p => `<div class="card"><h4>${p.title}</h4><p>Diskon: ${p.discount}</p></div>`).join('');
}

async function initTabs() {
  buttons.forEach(b => b.addEventListener('click', async (e) => {
    buttons.forEach(x => x.classList.remove('active'));
    e.target.classList.add('active');
    const tab = e.target.dataset.tab;
    if (tab === 'products') await renderProducts();
    if (tab === 'stores') await renderStores();
    if (tab === 'promos') await renderPromos();
  }));
  // load default
  await renderProducts();
}

if (document.readyState !== 'loading') initTabs(); else document.addEventListener('DOMContentLoaded', initTabs);
