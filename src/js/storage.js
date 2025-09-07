// src/js/storage.js
// PromoHub - LocalStorage Data Layer (FINAL, SOP)

import { STORAGE_KEYS } from './config.js';

// fallback keys (untuk kompatibilitas)
const BANNER_KEY = (STORAGE_KEYS && STORAGE_KEYS.BANNERS) || 'promohub_banners';
const MARKET_KEY = (STORAGE_KEYS && STORAGE_KEYS.MARKETPLACES) || 'promohub_marketplaces';

/* ---------- Helpers ---------- */
function safeRead(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('safeRead error', e);
    return fallback;
  }
}

function safeWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn('safeWrite error', e);
    return false;
  }
}

/* ---------- Seed Demo Data ---------- */
export function ensureDemoData() {
  // Demo produk
  const demoProducts = [
    { id: 'p-001', name: 'Headphone X', price: 250000, cashback: 15000, shopId: 's-01', image: '/src/assets/produk/hp.jpg', createdAt: Date.now() },
    { id: 'p-002', name: 'Smartphone Y', price: 1800000, cashback: 50000, shopId: 's-02', image: '/src/assets/produk/sp.jpg', createdAt: Date.now() },
    { id: 'p-003', name: 'Powerbank Z', price: 120000, cashback: 8000, shopId: 's-03', image: '/src/assets/produk/pb.jpg', createdAt: Date.now() }
  ];
  
  // Demo toko
  const demoShops = [
    { id: 's-01', name: 'Toko Elektronik A', url: 'https://marketplace.example/a', logo: '/src/assets/shops/shop1.png' },
    { id: 's-02', name: 'Gadget Store', url: 'https://marketplace.example/g', logo: '/src/assets/shops/shop2.png' },
    { id: 's-03', name: 'Accs Shop', url: 'https://marketplace.example/acc', logo: '/src/assets/shops/shop3.png' }
  ];
  
  // Demo promo
  const demoPromos = [
    { id: 'promo-01', title: 'Diskon 10% untuk Headphone', productId: 'p-001', img: '/src/assets/promos/promo1.jpg', desc: 'Hemat 10% untuk Headphone X' },
    { id: 'promo-02', title: 'Cashback 5% Smartphone Y', productId: 'p-002', img: '/src/assets/promos/promo2.jpg', desc: 'Cashback 5% hingga akhir bulan' }
  ];
  
  // Demo banner
  const demoBanners = [
    { img: '/src/assets/banner1.jpg', link: 'https://affiliate.example/a' },
    { img: '/src/assets/banner2.jpg', link: 'https://affiliate.example/b' },
    { img: '/src/assets/banner3.jpg', link: 'https://affiliate.example/c' }
  ];
  
  // Demo marketplace per kategori (6 item per kategori)
  const demoMarketplaces = [
    // Trending
    { id: 'm-001', name: 'Shopee', url: 'https://shopee.co.id', logo: '/src/assets/marketplaces/shopee.png', category: 'trending', cashback: 20000 },
    { id: 'm-002', name: 'Tokopedia', url: 'https://tokopedia.com', logo: '/src/assets/marketplaces/tokopedia.png', category: 'trending', cashback: 25000 },
    { id: 'm-003', name: 'Blibli', url: 'https://blibli.com', logo: '/src/assets/marketplaces/blibli.png', category: 'trending', cashback: 15000 },
    { id: 'm-004', name: 'Lazada', url: 'https://lazada.co.id', logo: '/src/assets/marketplaces/lazada.png', category: 'trending', cashback: 18000 },
    { id: 'm-005', name: 'Bukalapak', url: 'https://bukalapak.com', logo: '/src/assets/marketplaces/bukalapak.png', category: 'trending', cashback: 22000 },
    { id: 'm-006', name: 'JD.ID', url: 'https://jd.id', logo: '/src/assets/marketplaces/jdid.png', category: 'trending', cashback: 20000 },
    
    // Travel
    { id: 'm-101', name: 'Traveloka', url: 'https://traveloka.com', logo: '/src/assets/marketplaces/traveloka.png', category: 'travel', cashback: 50000 },
    { id: 'm-102', name: 'Tiket.com', url: 'https://tiket.com', logo: '/src/assets/marketplaces/tiket.png', category: 'travel', cashback: 45000 },
    { id: 'm-103', name: 'Agoda', url: 'https://agoda.com', logo: '/src/assets/marketplaces/agoda.png', category: 'travel', cashback: 40000 },
    { id: 'm-104', name: 'Pegipegi', url: 'https://pegipegi.com', logo: '/src/assets/marketplaces/pegipegi.png', category: 'travel', cashback: 35000 },
    { id: 'm-105', name: 'Booking.com', url: 'https://booking.com', logo: '/src/assets/marketplaces/booking.png', category: 'travel', cashback: 42000 },
    { id: 'm-106', name: 'Airbnb', url: 'https://airbnb.com', logo: '/src/assets/marketplaces/airbnb.png', category: 'travel', cashback: 48000 },
    
    // Kosmetik
    { id: 'm-201', name: 'Sephora', url: 'https://sephora.co.id', logo: '/src/assets/marketplaces/sephora.png', category: 'kosmetik', cashback: 15000 },
    { id: 'm-202', name: 'Sociolla', url: 'https://sociolla.com', logo: '/src/assets/marketplaces/sociolla.png', category: 'kosmetik', cashback: 12000 },
    { id: 'm-203', name: 'Watsons', url: 'https://watsons.co.id', logo: '/src/assets/marketplaces/watsons.png', category: 'kosmetik', cashback: 10000 },
    { id: 'm-204', name: 'Guardian', url: 'https://guardian.co.id', logo: '/src/assets/marketplaces/guardian.png', category: 'kosmetik', cashback: 9000 },
    { id: 'm-205', name: 'Beautyhaul', url: 'https://beautyhaul.com', logo: '/src/assets/marketplaces/beautyhaul.png', category: 'kosmetik', cashback: 8000 },
    { id: 'm-206', name: 'Oriflame', url: 'https://oriflame.co.id', logo: '/src/assets/marketplaces/oriflame.png', category: 'kosmetik', cashback: 11000 },
    
    // Fashion
    { id: 'm-301', name: 'Zalora', url: 'https://zalora.co.id', logo: '/src/assets/marketplaces/zalora.png', category: 'fashion', cashback: 20000 },
    { id: 'm-302', name: 'H&M', url: 'https://hm.com', logo: '/src/assets/marketplaces/hm.png', category: 'fashion', cashback: 18000 },
    { id: 'm-303', name: 'Uniqlo', url: 'https://uniqlo.com', logo: '/src/assets/marketplaces/uniqlo.png', category: 'fashion', cashback: 17000 },
    { id: 'm-304', name: 'Nike', url: 'https://nike.com', logo: '/src/assets/marketplaces/nike.png', category: 'fashion', cashback: 25000 },
    { id: 'm-305', name: 'Adidas', url: 'https://adidas.com', logo: '/src/assets/marketplaces/adidas.png', category: 'fashion', cashback: 23000 },
    { id: 'm-306', name: 'Levis', url: 'https://levi.com', logo: '/src/assets/marketplaces/levis.png', category: 'fashion', cashback: 19000 },
    
    // Home
    { id: 'm-401', name: 'IKEA', url: 'https://ikea.co.id', logo: '/src/assets/marketplaces/ikea.png', category: 'home', cashback: 30000 },
    { id: 'm-402', name: 'Ace Hardware', url: 'https://acehardware.co.id', logo: '/src/assets/marketplaces/ace.png', category: 'home', cashback: 25000 },
    { id: 'm-403', name: 'Informa', url: 'https://informa.co.id', logo: '/src/assets/marketplaces/informa.png', category: 'home', cashback: 20000 },
    { id: 'm-404', name: 'Dekoruma', url: 'https://dekoruma.com', logo: '/src/assets/marketplaces/dekoruma.png', category: 'home', cashback: 22000 },
    { id: 'm-405', name: 'Fabelio', url: 'https://fabelio.com', logo: '/src/assets/marketplaces/fabelio.png', category: 'home', cashback: 21000 },
    { id: 'm-406', name: 'MrDIY', url: 'https://mrdiy.com', logo: '/src/assets/marketplaces/mrdiy.png', category: 'home', cashback: 19000 }
  ];
  
  // Simpan hanya jika kosong
  if (!safeRead(STORAGE_KEYS.PRODUCTS)) safeWrite(STORAGE_KEYS.PRODUCTS, demoProducts);
  if (!safeRead(STORAGE_KEYS.SHOPS)) safeWrite(STORAGE_KEYS.SHOPS, demoShops);
  if (!safeRead(STORAGE_KEYS.PROMOS)) safeWrite(STORAGE_KEYS.PROMOS, demoPromos);
  if (!safeRead(BANNER_KEY)) safeWrite(BANNER_KEY, demoBanners);
  if (!safeRead(MARKET_KEY)) safeWrite(MARKET_KEY, demoMarketplaces);
  if (!safeRead(STORAGE_KEYS.CLAIMS)) safeWrite(STORAGE_KEYS.CLAIMS, []);
  if (!safeRead(STORAGE_KEYS.WALLETS)) safeWrite(STORAGE_KEYS.WALLETS, {});
  if (!safeRead(STORAGE_KEYS.USER)) safeWrite(STORAGE_KEYS.USER, null);
}

/* ---------- Getters ---------- */
export function getProducts() { return safeRead(STORAGE_KEYS.PRODUCTS, []); }
export function getShops() { return safeRead(STORAGE_KEYS.SHOPS, []); }
export function getPromos() { return safeRead(STORAGE_KEYS.PROMOS, []); }
export function getAffiliateBanners() { return safeRead(BANNER_KEY, []); }
export function getMarketplaces() { return safeRead(MARKET_KEY, []); }
export function getMarketplacesByCategory(category) {
  const all = getMarketplaces() || [];
  if (!category) return all;
  return all.filter(m => String(m.category).toLowerCase() === String(category).toLowerCase());
}
export function getProductById(id) { return getProducts().find(p => p.id === id) || null; }

/* ---------- Low-level Export ---------- */
export const read = safeRead;
export const write = safeWrite;