// src/js/profile.js
// PromoHub Profile Page (FINAL, SOP)
// - Firebase auth + Cloudinary upload
// - Edit profil (displayName saved to Firebase), phone/bank saved to localStorage
// - Avatar upload -> Cloudinary -> updateProfile(photoURL)
// - Dummy favorites (stores + promos) rendered as modern items (still inside <ul>)
// - "How it works" content rendered
// - Change password via sendPasswordResetEmail (Firebase)
// - Notification settings modal (saved to localStorage)
// - Logout (signOut)

// Imports
import { auth, cloudinaryConfig } from "./config.js";
import {
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ---------------------------
// DOM Elements (guarded)
// ---------------------------
const nameEl = document.getElementById("profile-name");
const emailEl = document.getElementById("profile-email");
const avatarEl = document.getElementById("profile-avatar");
const avatarInput = document.getElementById("avatar-input");
const editBtn = document.getElementById("edit-profile-btn");
const logoutBtn = document.getElementById("logout-btn");

const phoneEl = document.getElementById("profile-phone");
const bankEl = document.getElementById("profile-bank");

const modal = document.getElementById("editProfileModal");
const closeModalBtn = document.getElementById("closeModal");
const editForm = document.getElementById("edit-profile-form");

const changePasswordBtn = document.getElementById("change-password-btn");
const notificationSettingsBtn = document.getElementById("notification-settings-btn");

const favoritesList = document.getElementById("favorites-list");
const howItWorksEl = document.getElementById("how-it-works");

// LocalStorage keys
const LS_PHONE = "profile_phone";
const LS_BANK = "profile_bank";
const LS_FAVORITES = "promohub_favorites"; // optional future persistence
const LS_NOTIF = "promohub_notif_settings";

// Dummy defaults for favorites (used when no persisted favorites exist)
const DEFAULT_FAVORITES = {
  stores: ["Store A", "Store B", "Store C"],
  promos: ["Promo 1", "Promo 2", "Promo 3"]
};

// ---------------------------
// Utility / Render functions
// ---------------------------

/**
 * Render user profile into DOM. Accepts a Firebase user object.
 */
function loadProfile(user) {
  if (!user) return;

  if (nameEl) nameEl.textContent = user.displayName || "User Name";
  if (emailEl) emailEl.textContent = user.email || "user@email.com";

  // Avatar: photoURL or initial letter
  if (avatarEl) {
    if (user.photoURL) {
      avatarEl.style.backgroundImage = `url(${user.photoURL})`;
      avatarEl.style.backgroundSize = "cover";
      avatarEl.style.backgroundPosition = "center";
      avatarEl.textContent = "";
    } else {
      avatarEl.style.backgroundImage = "";
      avatarEl.textContent = (user.displayName?.[0] || "U").toUpperCase();
    }
  }

  // phone & bank from localStorage fallback
  if (phoneEl) phoneEl.textContent = localStorage.getItem(LS_PHONE) || "-";
  if (bankEl) bankEl.textContent = localStorage.getItem(LS_BANK) || "-";

  // Render static/dummy favorites and how-it-works on load
  renderFavorites();
  renderHowItWorks();
}

/**
 * Render favorites into #favorites-list.
 * Keeps structure as <ul> but creates card-like li items with classes:
 * - favorite-header
 * - favorite-item
 */
function renderFavorites() {
  if (!favoritesList) return;

  // Attempt to read persisted favorites; fallback to defaults
  let fav = null;
  try {
    fav = JSON.parse(localStorage.getItem(LS_FAVORITES));
  } catch (err) {
    fav = null;
  }
  if (!fav || !fav.stores || !fav.promos) {
    fav = DEFAULT_FAVORITES;
  }

  favoritesList.innerHTML = "";

  // Header - Stores
  const storeHeader = document.createElement("li");
  storeHeader.className = "favorite-header";
  storeHeader.textContent = "Toko Favorit";
  favoritesList.appendChild(storeHeader);

  // Store items
  fav.stores.forEach((store) => {
    const li = document.createElement("li");
    li.className = "favorite-item";
    // structure inside li (keamanan: textContent)
    li.innerHTML = `
      <div class="fav-card">
        <div class="fav-title">${escapeHtml(store)}</div>
        <div class="fav-meta">Toko populer • Diikuti</div>
      </div>
    `;
    favoritesList.appendChild(li);
  });

  // Header - Promos
  const promoHeader = document.createElement("li");
  promoHeader.className = "favorite-header";
  promoHeader.textContent = "Promo Favorit";
  favoritesList.appendChild(promoHeader);

  // Promo items
  fav.promos.forEach((promo) => {
    const li = document.createElement("li");
    li.className = "favorite-item";
    li.innerHTML = `
      <div class="fav-card">
        <div class="fav-title">${escapeHtml(promo)}</div>
        <div class="fav-meta">Cashback aktif • Berakhir: 30 Sep 2025</div>
      </div>
    `;
    favoritesList.appendChild(li);
  });
}

/**
 * Populate "How it works" section text (structured for readability).
 */
function renderHowItWorks() {
  if (!howItWorksEl) return;
  howItWorksEl.innerHTML = `
    <h3>Cara Kerja PromoHub</h3>
    <p>PromoHub bekerja dengan mengumpulkan promo dan cashback dari merchant mitra. Secara garis besar:</p>
    <ol class="how-list">
      <li>Temukan promo atau produk yang diinginkan di aplikasi.</li>
      <li>Ikuti instruksi pembelian pada halaman toko/promo.</li>
      <li>Upload bukti transaksi pada halaman klaim (jika diperlukan).</li>
      <li>Tim PromoHub akan memverifikasi klaim — status klaim: <strong>pending</strong>, <strong>approved</strong>, atau <strong>rejected</strong>.</li>
      <li>Jika disetujui, cashback akan masuk ke saldo dompet Anda dan dapat ditarik sesuai ketentuan.</li>
    </ol>
    <p class="note">Catatan: mekanisme pembayaran, waktu verifikasi, dan persentase cashback tergantung pada syarat masing-masing promo/merchant.</p>
  `;
}

/**
 * Simple helper to avoid inserting raw HTML content from dynamic sources.
 */
function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ---------------------------
// Event handlers / UI flows
// ---------------------------

/** Open edit modal and prefill fields */
if (editBtn) {
  editBtn.addEventListener("click", () => {
    // Prefill using auth.currentUser and localStorage
    const cur = auth.currentUser;
    if (cur && document.getElementById("edit-name")) {
      document.getElementById("edit-name").value = cur.displayName || "";
      document.getElementById("edit-phone").value = localStorage.getItem(LS_PHONE) || "";
      document.getElementById("edit-bank").value = localStorage.getItem(LS_BANK) || "";
    }
    if (modal) modal.classList.add("active");
  });
}

/** Close edit modal */
if (closeModalBtn) {
  closeModalBtn.addEventListener("click", () => {
    if (modal) modal.classList.remove("active");
  });
  // close when clicking outside content
  if (modal) {
    modal.addEventListener("click", (ev) => {
      if (ev.target === modal) modal.classList.remove("active");
    });
  }
}

/** Submit edit profile form */
if (editForm) {
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newName = (document.getElementById("edit-name")?.value || "").trim();
    const newPhone = (document.getElementById("edit-phone")?.value || "").trim();
    const newBank = (document.getElementById("edit-bank")?.value || "").trim();

    try {
      if (auth.currentUser && newName) {
        await updateProfile(auth.currentUser, { displayName: newName });
      }
      localStorage.setItem(LS_PHONE, newPhone);
      localStorage.setItem(LS_BANK, newBank);

      // Update UI immediately
      if (nameEl) nameEl.textContent = newName || nameEl.textContent;
      if (phoneEl) phoneEl.textContent = newPhone || "-";
      if (bankEl) bankEl.textContent = newBank || "-";

      alert("Profil berhasil diperbarui!");
      if (modal) modal.classList.remove("active");
    } catch (err) {
      console.error("Error update profile:", err);
      alert("Gagal memperbarui profil: " + (err.message || err));
    }
  });
}

// ---------------------------
// Avatar upload flow (Cloudinary)
// ---------------------------
if (avatarEl) {
  avatarEl.addEventListener("click", () => {
    if (avatarInput) avatarInput.click();
  });
}

if (avatarInput) {
  avatarInput.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!auth.currentUser) {
      alert("Silakan login terlebih dahulu.");
      return;
    }
    if (!cloudinaryConfig?.uploadUrl || !cloudinaryConfig?.uploadPreset) {
      alert("Upload tidak tersedia: konfigurasi Cloudinary belum diset.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", cloudinaryConfig.uploadPreset);

      const res = await fetch(cloudinaryConfig.uploadUrl, {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (!data?.secure_url) throw new Error(data?.error?.message || "Upload gagal");

      // Update Firebase profile
      await updateProfile(auth.currentUser, { photoURL: data.secure_url });

      // Update UI
      if (avatarEl) {
        avatarEl.style.backgroundImage = `url(${data.secure_url})`;
        avatarEl.style.backgroundSize = "cover";
        avatarEl.style.backgroundPosition = "center";
        avatarEl.textContent = "";
      }

      alert("Foto profil berhasil diperbarui!");
    } catch (err) {
      console.error("Upload avatar gagal:", err);
      alert("Upload avatar gagal: " + (err.message || err));
    }
  });
}

// ---------------------------
// Account settings: change password (send reset email)
// ---------------------------
if (changePasswordBtn) {
  changePasswordBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user || !user.email) {
      alert("Tidak ada email pengguna terdeteksi. Silakan login kembali.");
      return;
    }

    const confirmReset = confirm(`Kirim email reset password ke ${user.email}?`);
    if (!confirmReset) return;

    try {
      await sendPasswordResetEmail(auth, user.email);
      alert("Email reset password telah dikirim. Periksa inbox atau spam Anda.");
    } catch (err) {
      console.error("sendPasswordResetEmail error:", err);
      alert("Gagal mengirim email reset: " + (err.message || err));
    }
  });
}

// ---------------------------
// Notification settings modal (dynamic)
// ---------------------------
function openNotificationSettingsModal() {
  // Prevent duplicate modal
  if (document.getElementById("notif-settings-modal")) return;

  const current = JSON.parse(localStorage.getItem(LS_NOTIF) || '{"email":true,"push":false}');
  const overlay = document.createElement("div");
  overlay.id = "notif-settings-modal";
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "rgba(0,0,0,0.6)";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "1200";

  const modalBox = document.createElement("div");
  modalBox.style.width = "92%";
  modalBox.style.maxWidth = "420px";
  modalBox.style.background = "rgba(255,255,255,0.06)";
  modalBox.style.borderRadius = "12px";
  modalBox.style.padding = "18px";
  modalBox.style.color = "#fff";
  modalBox.style.backdropFilter = "blur(6px)";

  modalBox.innerHTML = `
    <h3 style="margin-bottom:10px;color:#00e0ff">Pengaturan Notifikasi</h3>
    <div style="margin-bottom:12px;">
      <label style="display:flex;gap:10px;align-items:center">
        <input type="checkbox" id="notif-email" ${current.email ? "checked" : ""} />
        <span>Email Notifikasi</span>
      </label>
    </div>
    <div style="margin-bottom:12px;">
      <label style="display:flex;gap:10px;align-items:center">
        <input type="checkbox" id="notif-push" ${current.push ? "checked" : ""} />
        <span>Push Notifikasi (jika tersedia)</span>
      </label>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:12px;">
      <button id="notif-cancel" class="btn-outline" style="padding:8px 12px;border-radius:8px;border:1px solid rgba(0,224,255,0.25)">Batal</button>
      <button id="notif-save" class="btn-primary" style="padding:8px 12px;border-radius:8px">Simpan</button>
    </div>
  `;

  overlay.appendChild(modalBox);
  document.body.appendChild(overlay);

  const cancelBtn = document.getElementById("notif-cancel");
  const saveBtn = document.getElementById("notif-save");

  cancelBtn?.addEventListener("click", () => {
    overlay.remove();
  });

  // close when clicking outside
  overlay.addEventListener("click", (ev) => {
    if (ev.target === overlay) overlay.remove();
  });

  saveBtn?.addEventListener("click", () => {
    const emailChecked = document.getElementById("notif-email")?.checked || false;
    const pushChecked = document.getElementById("notif-push")?.checked || false;
    localStorage.setItem(LS_NOTIF, JSON.stringify({ email: emailChecked, push: pushChecked }));
    alert("Pengaturan notifikasi disimpan.");
    overlay.remove();
  });
}

if (notificationSettingsBtn) {
  notificationSettingsBtn.addEventListener("click", openNotificationSettingsModal);
}



// ---------------------------
// Auth state watcher (init)
// ---------------------------
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // not logged in -> redirect to login
    try { window.location.href = "login.html"; } catch (e) { /* ignore */ }
  } else {
    loadProfile(user);
  }
});

// ---------------------------
// Defensive init for pages without Firebase (fallback)
// ---------------------------
// If onAuthStateChanged didn't run (e.g., dev environment), attempt to render from localStorage data
document.addEventListener("DOMContentLoaded", () => {
  // Only render favorites/howitworks if elements exist
  if (favoritesList && favoritesList.children.length === 0) renderFavorites();
  if (howItWorksEl && howItWorksEl.innerHTML.trim() === "") renderHowItWorks();
});