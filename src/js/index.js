// src/js/index.js
// PromoHub - Entry point (FINAL, SOP)

import { ensureDemoData, getAffiliateBanners } from './storage.js';
import {
  renderMarketplaces,
  renderShops,
  renderPromos,
  initMarketplaceHandlers
} from './products.js';

// ---------- Tabs (Marketplace / Toko / Promo) ----------
function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  const sections = document.querySelectorAll('.section');

  function activate(tabName) {
    tabs.forEach(t => {
      const active = t.dataset.tab === tabName;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    sections.forEach(s => {
      s.classList.toggle('active', s.id === tabName);
    });

    // refresh lucide icons setiap kali tab berubah
    if (window.lucide && typeof lucide.createIcons === 'function') {
      lucide.createIcons();
    }
  }

  tabs.forEach(t => {
    t.addEventListener('click', () => activate(t.dataset.tab));
  });

  // default: marketplace
  activate('marketplaces');
}

// ---------- Banner Slider ----------
function initBannerSlider() {
  const linkEl = document.getElementById('bannerLink');
  const imgEl = document.getElementById('bannerImg');
  const banners = getAffiliateBanners();

  if (!banners || banners.length === 0 || !linkEl || !imgEl) return;

  let idx = 0;
  function show(i) {
    const b = banners[i];
    linkEl.href = b.link;
    imgEl.src = b.img;
  }
  show(idx);

  if (banners.length > 1) {
    setInterval(() => {
      idx = (idx + 1) % banners.length;
      show(idx);
    }, 5000);
  }
}

// ---------- Firebase Notifikasi Real-time ----------
function initRealtimeNotifications() {
  try {
    const notifBtn = document.getElementById("notificationBtn");
    const notifBadge = document.getElementById("notifBadge");
    const notifPanel = document.getElementById("notificationPanel");
    const notifList = document.getElementById("notificationList");

    if (!notifBtn || !notifBadge || !notifPanel || !notifList) return;

    // toggle panel saat tombol diklik
    notifBtn.addEventListener("click", () => {
      notifPanel.classList.toggle("hidden");
    });

    // cek apakah Firebase global sudah ada
    if (!window.firebase || !window.firebase.auth || !window.firebase.firestore) {
      console.warn("Firebase belum diinisialisasi, notifikasi real-time dilewati.");
      return;
    }

    const auth = window.firebase.auth();
    const db = window.firebase.firestore();

    auth.onAuthStateChanged(user => {
      if (!user) {
        notifBadge.textContent = "0";
        notifBadge.style.display = "none";
        notifList.innerHTML = "<li>Tidak ada notifikasi</li>";
        return;
      }

      db.collection("notifications")
        .where("userId", "==", user.uid)
        .orderBy("createdAt", "desc")
        .onSnapshot(snap => {
          const count = snap.size;

          // update badge
          if (count > 0) {
            notifBadge.textContent = count;
            notifBadge.style.display = "inline-flex";
          } else {
            notifBadge.textContent = "0";
            notifBadge.style.display = "none";
          }

          // render daftar notifikasi
          notifList.innerHTML = "";
          if (count === 0) {
            notifList.innerHTML = "<li>Tidak ada notifikasi</li>";
            return;
          }

          snap.forEach(doc => {
            const data = doc.data();
            const li = document.createElement("li");
            li.className = "notif-item";
            li.textContent = data.message || "Notifikasi baru";
            notifList.appendChild(li);
          });
        });
    });
  } catch (err) {
    console.error("Realtime notif gagal:", err);
  }
}

// ---------- Init App ----------
document.addEventListener('DOMContentLoaded', () => {
  // seed demo data sekali
  ensureDemoData();

  // render banner
  initBannerSlider();

  // render marketplace (kategori otomatis dari storage.js)
  renderMarketplaces('#marketplaceSection');

  // render tab lain
  renderShops('#shops');
  renderPromos('#promos');

  // event marketplace (modal untuk toko & promo)
  initMarketplaceHandlers({
    popupSel: '#marketplacePopup',
    listSel: '#marketplaceList',
    closeSel: '#closeMarketplace'
  });

  // tab behavior
  initTabs();

  // inisialisasi notifikasi realtime (Firebase)
  initRealtimeNotifications();

  // inisialisasi ikon lucide (sekali lagi setelah render)
  if (window.lucide && typeof lucide.createIcons === 'function') {
    lucide.createIcons();
  }
});