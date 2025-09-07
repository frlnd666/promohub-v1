// src/js/config.js
// PromoHub Configuration (FINAL, SOP)

// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// === Firebase Config (ambil dari Firebase Console) ===
const firebaseConfig = {
  apiKey: "AIzaSyCpw9RcZeXoWr5qykB4awgbCC-MiVVma_M",
  authDomain: "promohub-666.firebaseapp.com",
  projectId: "promohub-666",
  storageBucket: "promohub-666.appspot.com", // perbaikan: harus pakai .appspot.com
  messagingSenderId: "781257685316",
  appId: "1:781257685316:web:3118a505979426e0c6bf11",
  measurementId: "G-ND4NTZM0Q8"
};

// === Init Firebase ===
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// === Cloudinary Config ===
export const cloudinaryConfig = {
  cloudName: "promohub",
  uploadPreset: "promohub",
  uploadUrl: "https://api.cloudinary.com/v1_1/promohub/image/upload"
};

// === Storage Keys ===
export const STORAGE_KEYS = {
  PRODUCTS: "promohub_products",
  SHOPS: "promohub_shops",
  PROMOS: "promohub_promos",
  BANNERS: "promohub_banners",
  MARKETPLACES: "promohub_marketplaces",
  CLAIMS: "promohub_claims",
  WALLETS: "promohub_wallets",
  USER: "promohub_user"
};
