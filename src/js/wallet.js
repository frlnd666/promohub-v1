// src/js/wallet.js
import { db, auth } from './app.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js';

const balanceEl = document.getElementById('balance');
const historyEl = document.getElementById('history');
const adminSecretInput = document.getElementById('adminSecret');
const adminClaimId = document.getElementById('adminClaimId');
const adminNote = document.getElementById('adminNote');

async function loadWallet() {
  const uid = auth.currentUser?.uid;
  if (!uid) { balanceEl.textContent = 'Silakan tunggu login...'; return; }
  const snap = await getDoc(doc(db, 'wallets', uid));
  const data = snap.exists() ? snap.data() : { balance:0, history:[] };
  balanceEl.textContent = 'Rp ' + (data.balance || 0);
  historyEl.innerHTML = (data.history || []).map(h => `<li>${h.type} - ${h.amount}</li>`).join('');
}

auth.onAuthStateChanged(loadWallet);

async function adminAction(action) {
  const secret = adminSecretInput.value.trim();
  const cid = adminClaimId.value.trim();
  if (!secret || !cid) return alert('Isi secret dan claimId');
  const res = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type':'application/json', 'x-admin-secret': secret }, body: JSON.stringify({ action, claimId: cid, note: adminNote.value }) });
  const j = await res.json();
  if (j.ok) alert(action + ' berhasil'); else alert('Error: '+(j.error||JSON.stringify(j)));
}

document.getElementById('approveBtn').addEventListener('click', ()=>adminAction('approve'));
document.getElementById('rejectBtn').addEventListener('click', ()=>adminAction('reject'));
