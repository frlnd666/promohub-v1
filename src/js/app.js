// src/js/app.js
// PromoHub - App Core (Final Version)

// -------------------------
// PWA Service Worker
// -------------------------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("../service-worker.js")
      .then(() => console.log("✅ Service Worker terdaftar"))
      .catch(err => console.error("❌ SW gagal:", err));
  });
}

// -------------------------
// PWA Install Prompt
// -------------------------
let deferredPrompt;
const installBtn = document.getElementById("install-btn");
const installPopup = document.getElementById("install-popup");
const closePopup = document.getElementById("close-install-popup");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installPopup) {
    installPopup.classList.add("show");
  }
});

if (installBtn) {
  installBtn.addEventListener("click", async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      console.log("👍 User pilihan:", choice.outcome);
      deferredPrompt = null;
      installPopup.classList.remove("show");
    }
  });
}

if (closePopup) {
  closePopup.addEventListener("click", () => {
    installPopup.classList.remove("show");
  });
}

// -------------------------
// User Session (pakai storage.js)
// -------------------------
import { storage } from "./storage.js";
import { STORAGE_KEYS } from "./storage.js";

export function getCurrentUser() {
  return storage.get(STORAGE_KEYS.USER, null);
}

export function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
  }
  return user;
}

export function logout() {
  storage.remove(STORAGE_KEYS.USER);
  window.location.href = "login.html";
}

// -------------------------
// Format Rupiah
// -------------------------
export function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR"
  }).format(amount);
}

// -------------------------
// Bottom Nav Active State
// -------------------------
document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname.split("/").pop();
  document.querySelectorAll(".bottom-nav .nav-item").forEach(item => {
    const href = item.querySelector("a")?.getAttribute("href");
    if (href === currentPath) {
      item.classList.add("active");
    }
  });
});