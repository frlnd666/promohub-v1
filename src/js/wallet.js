// src/js/wallet.js
// PromoHub - Wallet Handlers (FINAL, SOP)

import { auth } from "./config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// === Utilitas format rupiah ===
function rupiah(n) {
  try {
    return "Rp " + Number(n).toLocaleString("id-ID");
  } catch {
    return "Rp " + n;
  }
}


// === Ambil data user (Firebase + LocalStorage fallback) ===
function getUser() {
  const localUser = JSON.parse(localStorage.getItem("promohub_user")) || {};
  const user = auth.currentUser;
  return {
    uid: user ? user.uid : localUser.uid || "unknown", // Memastikan user.uid tersedia
    name: user?.displayName || localStorage.getItem("profile_name") || localUser.name || "Member",
    email: user?.email || localStorage.getItem("profile_email") || localUser.email || "user@email.com",
  };
}

// === Wallet data ===
function getWallet() {
  return (
    JSON.parse(localStorage.getItem("promohub_wallet")) || {
      balance: 0,
      withdrawable: 0,
      history: [],
    }
  );
}

function saveWallet(data) {
  localStorage.setItem("promohub_wallet", JSON.stringify(data));
}

// === Render utama ===
function renderWallet() {
  const user = getUser();
  const wallet = getWallet();

  // Nama member di cashback card
  const memberNameEl = document.getElementById("memberName");
  if (memberNameEl) memberNameEl.textContent = user.name;

  // Menampilkan user ID besar dan bold (tanpa "ID:" teks)
  const userIdEl = document.getElementById("userId");
  if (userIdEl) userIdEl.textContent = user.uid;  // Menampilkan hanya userId

  // Saldo
  const withdrawableEl = document.getElementById("withdrawableBalance");
  const walletBalanceEl = document.getElementById("wallet-balance");

  if (withdrawableEl) withdrawableEl.textContent = rupiah(wallet.withdrawable);
  if (walletBalanceEl) walletBalanceEl.textContent = rupiah(wallet.balance);

  // Klaim yang menunggu approval
  const pendingClaimsEl = document.getElementById("pending-claims-list");
  if (pendingClaimsEl) {
    pendingClaimsEl.innerHTML = "";
    const pendingClaims = wallet.history.filter(tx => tx.status === "pending");
    if (pendingClaims.length === 0) {
      pendingClaimsEl.innerHTML = `<div class="empty">Tidak ada klaim yang menunggu persetujuan</div>`;
    } else {
      pendingClaims.forEach((claim) => {
        const claimItem = document.createElement("div");
        claimItem.className = "pending-claim-item";
        claimItem.innerHTML = `
          <div class="claim-desc">${claim.desc}</div>
          <div class="claim-date">${new Date(claim.date).toLocaleString("id-ID")}</div>
        `;
        pendingClaimsEl.appendChild(claimItem);
      });
    }
  }

  // Riwayat transaksi
  const txList = document.getElementById("transaction-list");
  if (txList) {
    txList.innerHTML = "";
    if (!wallet.history || wallet.history.length === 0) {
      txList.innerHTML = `<div class="empty">Belum ada transaksi</div>`;
    } else {
      wallet.history
        .slice()
        .reverse()
        .forEach((tx) => {
          const item = document.createElement("div");
          item.className = "tx-item";
          item.innerHTML = `
            <div class="tx-info">
              <div class="tx-desc">${tx.desc}</div>
              <div class="tx-date">${new Date(tx.date).toLocaleString("id-ID")}</div>
            </div>
            <div class="tx-amount ${tx.amount > 0 ? "plus" : "minus"}">
              ${tx.amount > 0 ? "+" : ""}${rupiah(tx.amount)}
            </div>
          `;
          txList.appendChild(item);
        });
    }
  }
}




// === Event tarik saldo ===
function initWithdraw() {
  const btn = document.getElementById("withdraw-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const wallet = getWallet();
    const minWithdraw = 10000;

    if (wallet.withdrawable < minWithdraw) {
      alert(`Saldo minimal untuk penarikan adalah ${rupiah(minWithdraw)}.`);
      return;
    }

    const amount = wallet.withdrawable;
    wallet.withdrawable = 0;
    wallet.balance -= amount;
    wallet.history.push({
      desc: "Penarikan saldo",
      amount: -amount,
      date: new Date().toISOString(),
    });

    saveWallet(wallet);
    renderWallet();
    alert("Penarikan berhasil diproses.");
  });
}

// === Inisialisasi ===
document.addEventListener("DOMContentLoaded", () => {
  // Sync dengan Firebase Auth
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      // jika belum login
      document.getElementById("memberName").textContent = "Member";
    }
    renderWallet();
  });

  initWithdraw();
});