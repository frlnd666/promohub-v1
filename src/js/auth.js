// src/js/auth.js
// PromoHub Authentication (FINAL, SOP)

import { auth } from "./config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// LOGIN
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const pass = document.getElementById("login-password").value.trim();
    const errorBox = document.getElementById("login-error");

    try {
      await signInWithEmailAndPassword(auth, email, pass);
      window.location.href = "index.html";
    } catch (err) {
      console.error("Login gagal:", err.message);
      if (errorBox) {
        errorBox.textContent = "Email atau password salah!";
        errorBox.style.display = "block";
      }
    }
  });
}

// REGISTER
const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const pass = document.getElementById("register-password").value.trim();
    const errorBox = document.getElementById("register-error");
    const successBox = document.getElementById("register-success");
    
    // Reset box
    if (errorBox) errorBox.style.display = "none";
    if (successBox) successBox.style.display = "none";
    
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name });
      }
      
      if (successBox) {
        successBox.textContent = "Registrasi berhasil! Mengarahkan ke beranda...";
        successBox.style.display = "block";
      }
      
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } catch (err) {
      console.error("Registrasi gagal:", err.message);
      if (errorBox) {
        if (err.code === "auth/email-already-in-use") {
          errorBox.textContent = "Email sudah terdaftar, silakan login.";
        } else if (err.code === "auth/weak-password") {
          errorBox.textContent = "Password terlalu lemah (minimal 6 karakter).";
        } else {
          errorBox.textContent = "Registrasi gagal: " + err.message;
        }
        errorBox.style.display = "block";
      }
    }
  });
}