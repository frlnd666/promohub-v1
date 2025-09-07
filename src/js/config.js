/ src/js/config.js
// PromoHub Configuration (FINAL, SOP)

// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// === Init Firebase ===
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

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
