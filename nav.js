import { onUser, logout } from "./firebase-config.js";

const nav = document.querySelector(".nav-links");
const btn = document.querySelector(".nav-links a.btn-outline");

onUser(function (user) {
  if (!btn || !nav) return;

  const old = document.getElementById("dash-link");
  if (old) old.remove();

  if (user) {
    const dash = document.createElement("a");
    dash.id = "dash-link";
    dash.href = "dashboard.html";
    dash.textContent = "Dashboard";
    nav.insertBefore(dash, btn);

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
