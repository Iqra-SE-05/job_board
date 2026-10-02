import { onUser, logout } from "./firebase-config.js";

const btn = document.querySelector(".nav-links a.btn-outline");

onUser(function (user) {
  if (!btn) return;
  if (user) {
    btn.textContent = "Logout";
    btn.href = "#";
    btn.onclick = async function (e) {
      e.preventDefault();
      await logout();
      window.location.href = "index.html";
    };
  } else {
    btn.textContent = "Login";
    btn.href = "login.html";
    btn.onclick = null;
  }
});
