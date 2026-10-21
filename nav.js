import { onUser, logout, getRole } from "./api.js";

const nav = document.querySelector(".nav-links");
const btn = document.querySelector(".nav-links a.btn-outline");

onUser(async function (user) {
  if (!btn || !nav) return;

  const old = document.getElementById("role-link");
  if (old) old.remove();

  if (user) {
    const role = await getRole(user);
    const link = document.createElement("a");
    link.id = "role-link";
    if (role === "applicant") {
      link.href = "my-applications.html";
      link.textContent = "My Applications";
    } else {
      link.href = "dashboard.html";
      link.textContent = "Dashboard";
    }
    nav.insertBefore(link, btn);

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
