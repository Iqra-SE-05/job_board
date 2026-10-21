
const API_URL = "https://job-board-api-bhi5.onrender.com";

function getToken() {
  try { return localStorage.getItem("token"); } catch (e) { return null; }
}

function getSavedUser() {
  try { return JSON.parse(localStorage.getItem("user") || "null"); } catch (e) { return null; }
}

function saveSession(token, user) {
  try {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  } catch (e) {}
}

function clearSession() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch (e) {}
}

// Listeners who comes from login/logout 
const listeners = [];
function notify() {
    const u = toUser(getSavedUser());
  listeners.forEach(function (cb) { cb(u); });
}

async function request(path, options) {
  options = options || {};
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = "Bearer " + token;

  let res;
  try {
    res = await fetch(API_URL + path, {
      method: options.method || "GET",
      headers: headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
  } catch (e) {
    const err = new Error("Cannot reach the server. Please check your internet and try again.");
    err.code = "network";
    throw err;
  }

  let data = {};
  try { data = await res.json(); } catch (e) {}

  if (!res.ok) {
    if (res.status === 401 && token) {
      clearSession();
      notify();
    }
    const err = new Error(data.error || "Something went wrong");
    err.code = res.status === 403 ? "permission-denied" : "api";
    err.status = res.status;
    throw err;
  }
  return data;
}

// ---------- Jobs ----------
export async function getAllJobs() {
  try {
    const data = await request("/api/jobs");
    return data.jobs;
  } catch (e) {
    console.error("Could not load jobs:", e);
    return [];
  }
}

export async function addJob(job) {
  const data = await request("/api/jobs", { method: "POST", body: job });
  return data.job.id;
}

export async function getMyJobs() {
  const data = await request("/api/my-jobs");
  return data.jobs;
}

export async function deleteJob(id) {
  await request("/api/jobs/" + id, { method: "DELETE" });
}

// ---------- Applications ----------
export async function addApplication(application) {
  const data = await request("/api/applications", { method: "POST", body: application });
  return data.application.id;
}

// Company: apni jobs ke applicants
export async function getMyApplications() {
  const data = await request("/api/job-applications");
  return data.applications;
}

// Applicant: meri applications
export async function getApplicantApplications() {
  const data = await request("/api/my-applications");
  return data.applications;
}

export async function setApplicationStatus(id, status) {
  const data = await request("/api/applications/" + id + "/status", {
    method: "PATCH",
    body: { status: status }
  });
  return data.application;
}

// ---------- Login / Signup ----------
export async function signup(name, email, password, role) {
  const data = await request("/api/signup", {
    method: "POST",
    body: { name: name, email: email, password: password, role: role }
  });
  saveSession(data.token, data.user);
  notify();
  return toUser(data.user);
}

export async function login(email, password) {
  const data = await request("/api/login", {
    method: "POST",
    body: { email: email, password: password }
  });
  saveSession(data.token, data.user);
  notify();
  return toUser(data.user);
}

export function logout() {
  clearSession();
  notify();
  return Promise.resolve();
}

// Firebase wale user jaisa shape: uid, displayName, email
function toUser(u) {
  if (!u) return null;
  return { uid: u.id, displayName: u.name, email: u.email, role: u.role };
}

export function onUser(callback) {
  listeners.push(callback);
  const u = getSavedUser();
  setTimeout(function () { callback(toUser(u)); }, 0);
}

export async function getRole(user) {
  if (user && user.role) return user.role;
  const u = getSavedUser();
  return u ? u.role : null;
}
