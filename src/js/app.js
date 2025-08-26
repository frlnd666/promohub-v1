// src/js/app.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, serverTimestamp, query, orderBy, where } from 'https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js';

// --- CONFIG: isi dari env (deploy) - di Vercel inject as env into static build or via small templating
const firebaseConfig = {
  apiKey: '%FIREBASE_API_KEY%',
  authDomain: '%FIREBASE_AUTH_DOMAIN%',
  projectId: '%FIREBASE_PROJECT_ID%',
  storageBucket: '%FIREBASE_STORAGE_BUCKET%',
  messagingSenderId: '%FIREBASE_MESSAGING_SENDER_ID%',
  appId: '%FIREBASE_APP_ID%'
};

// When deploying, replace placeholders with actual env values (Vercel supports replace during build)

window.__APP_FIREBASE_CONFIG__ = firebaseConfig;
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// sign in anonymously for demo
signInAnonymously(auth).catch(console.error);

export function now() { return serverTimestamp(); }

export async function uploadToCloudinary(file) {
  // unsigned upload using preset
  const cloudName = '%CLOUDINARY_CLOUD_NAME%';
  const uploadPreset = '%CLOUDINARY_UPLOAD_PRESET_UNSIGNED%';
  if (!cloudName || !uploadPreset) throw new Error('Cloudinary not configured');

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', uploadPreset);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const resp = await fetch(url, { method: 'POST', body: form });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || 'Upload failed');
  return data.secure_url;
  }
