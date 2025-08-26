// src/js/claim.js
import { db, auth, uploadToCloudinary } from './app.js';
import { addDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js';

const productSelect = document.getElementById('productSelect');
const form = document.getElementById('claimForm');
const msg = document.getElementById('msg');

async function loadForSelect() {
  const resp = await fetch('/__/firebase/init.json').catch(()=>null);
  // Instead, load products from Firestore directly
  const snap = await (await import('https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js')).getDocs((await import('./app.js')).collection((await import('./app.js')).db,'products'));
}

// For simplicity, a small helper to fetch products using another script already present
async function populateProducts() {
  const { db } = await import('./app.js');
  const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js');
  const snap = await getDocs(collection(db, 'products'));
  productSelect.innerHTML = snap.docs.map(d=>`<option value="${d.id}">${d.data().title}</option>`).join('');
}

populateProducts();

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = 'Mengirim klaim...';
  try {
    const file = document.getElementById('invoiceFile').files[0];
    const imageUrl = await uploadToCloudinary(file);
    const productId = document.getElementById('productSelect').value;
    const buyerName = document.getElementById('buyerName').value;
    const totalAmount = Number(document.getElementById('totalAmount').value);

    const claim = {
      productId,
      buyerName,
      totalAmount,
      invoiceImageUrl: imageUrl,
      status: 'pending',
      createdAt: serverTimestamp(),
      userId: auth.currentUser?.uid || null,
      amount: Math.round((totalAmount * 0.05) * 100) / 100 // default cashback 5% example
    };
    await addDoc(collection(db, 'claims'), claim);
    msg.textContent = 'Klaim terkirim. Tunggu verifikasi.';
    form.reset();
  } catch (err) {
    console.error(err);
    msg.textContent = 'Error: ' + err.message;
  }
});
