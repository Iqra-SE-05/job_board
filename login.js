import { signup, login, getRole, onUser } from "./api.js";

let mode = "login";
let busy = false;

const title = document.getElementById("auth-title");
const sub = document.getElementById("auth-sub");
const extra = document.getElementById("signup-extra");
const nameLabel = document.getElementById("name-label");
const nameInput = document.getElementById("company-name");
const btn = document.getElementById("auth-btn");
const errorBox = document.getElementById("auth-error");
const switchText = document.getElementById("switch-text");
const switchLink = document.getElementById("switch-link");

function selectedRole() {
  return document.querySelector("input[name='role']:checked").value;
}

function updateNameLabel() {
  const isCompany = selectedRole() === "company";
  nameLabel.textContent = isCompany ? "Company Name" : "Full Name";
  nameInput.placeholder = isCompany ? "e.g. TechNova" : "Your name";
}

document.querySelectorAll("input[name='role']").forEach(function (r) {
  r.addEventListener("change", updateNameLabel);
});

function setMode(newMode) {
  mode = newMode;
  errorBox.style.display = "none";
  if (mode === "signup") {
    title.textContent = "Create Account";
    sub.textContent = "Join as a job seeker or as a company.";
    extra.style.display = "block";
    btn.textContent = "Sign Up";
    switchText.textContent = "Already have an account?";
    switchLink.textContent = "Login";
  } else {
    title.textContent = "Login";
    sub.textContent = "Log in to apply for jobs or manage your company.";
    extra.style.display = "none";
    btn.textContent = "Login";
    switchText.textContent = "Don't have an account?";
    switchLink.textContent = "Sign up";
  }
}

switchLink.addEventListener("click", function (e) {
  e.preventDefault();
  setMode(mode === "login" ? "signup" : "login");
});

function goHome(role) {
  window.location.href = role === "company" ? "dashboard.html" : "jobs.html";
}

document.getElementById("auth-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  errorBox.style.display = "none";

  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;
  const name = nameInput.value.trim();

  if (mode === "signup" && !name) {
    errorBox.textContent = "Please enter your name.";
    errorBox.style.display = "block";
    return;
  }

  busy = true;
  btn.disabled = true;
  btn.textContent = "Please wait... (first request can take up to a minute)";

  try {
    let user;
    if (mode === "signup") {
      user = await signup(name, email, password, selectedRole());
    } else {
      user = await login(email, password);
    }
    goHome(user.role);
  } catch (err) {
    console.error(err);
    busy = false;
    errorBox.textContent = err.message || "Something went wrong. Please try again.";
    errorBox.style.display = "block";
    btn.disabled = false;
    btn.textContent = mode === "signup" ? "Sign Up" : "Login";
  }
});

// Pehle se login ho to seedha uske page par bhej do
onUser(async function (user) {
  if (user && !busy) {
    const role = await getRole(user);
    if (role) goHome(role);
  }
});
