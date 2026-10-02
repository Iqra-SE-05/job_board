import { signup, login, onUser } from "./firebase-config.js";

let mode = "login"; // "login" ya "signup"

const title = document.getElementById("auth-title");
const sub = document.getElementById("auth-sub");
const nameRow = document.getElementById("name-row");
const btn = document.getElementById("auth-btn");
const errorBox = document.getElementById("auth-error");
const switchText = document.getElementById("switch-text");
const switchLink = document.getElementById("switch-link");

function setMode(newMode) {
  mode = newMode;
  errorBox.style.display = "none";
  if (mode === "signup") {
    title.textContent = "Create Company Account";
    sub.textContent = "Sign up to post jobs and see who applied.";
    nameRow.style.display = "block";
    btn.textContent = "Sign Up";
    switchText.textContent = "Already have an account?";
    switchLink.textContent = "Login";
  } else {
    title.textContent = "Company Login";
    sub.textContent = "Log in to post jobs and manage applicants.";
    nameRow.style.display = "none";
    btn.textContent = "Login";
    switchText.textContent = "Don't have an account?";
    switchLink.textContent = "Sign up";
  }
}

switchLink.addEventListener("click", function (e) {
  e.preventDefault();
  setMode(mode === "login" ? "signup" : "login");
});

function friendlyError(err) {
  const code = err.code || "";
  if (code.includes("email-already-in-use")) return "This email is already registered. Please log in.";
  if (code.includes("weak-password")) return "Password must be at least 6 characters.";
  if (code.includes("invalid-email")) return "Please enter a valid email address.";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "Wrong email or password.";
  }
  return "Something went wrong. Please try again.";
}

document.getElementById("auth-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  errorBox.style.display = "none";

  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;
  const companyName = document.getElementById("company-name").value.trim();

  if (mode === "signup" && !companyName) {
    errorBox.textContent = "Please enter your company name.";
    errorBox.style.display = "block";
    return;
  }

  btn.disabled = true;
  btn.textContent = "Please wait...";

  try {
    if (mode === "signup") {
      await signup(companyName, email, password);
    } else {
      await login(email, password);
    }
    window.location.href = "post-job.html";
  } catch (err) {
    console.error(err);
    errorBox.textContent = friendlyError(err);
    errorBox.style.display = "block";
    btn.disabled = false;
    btn.textContent = mode === "signup" ? "Sign Up" : "Login";
  }
});

// Agar pehle se login hai to seedha Post a Job par bhej do
onUser(function (user) {
  if (user) window.location.href = "post-job.html";
});
