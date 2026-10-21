import { onUser, getRole, getAllJobs, getApplicantApplications } from "./api.js";

const STATUSES = ["Submitted", "Under Review", "Shortlisted", "Interview", "Selected", "Rejected"];

const listEl = document.getElementById("ma-list");
const subEl = document.getElementById("ma-sub");
const statsEl = document.getElementById("ma-stats");
const filtersEl = document.getElementById("ma-filters");

let apps = [];
let allJobs = [];
let activeTab = "applied";
let activeStatus = "All";

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getList(key) {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); }
  catch (e) { return []; }
}

function removeFromList(key, id) {
  const list = getList(key).filter(function (x) { return x !== String(id); });
  try { localStorage.setItem(key, JSON.stringify(list)); } catch (e) {}
}

function statusClass(s) {
  return "st-" + String(s).toLowerCase().replace(/\s+/g, "-");
}

function timeAgo(ts) {
  if (!ts) return "";
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  return days + " days ago";
}

function emptyBox(text, linkText, href) {
  return "<div class='detail-card ma-empty'><p class='muted'>" + esc(text) + "</p>" +
    "<a class='btn btn-primary' href='" + href + "'>" + esc(linkText) + "</a></div>";
}

// ---------- Stats ----------
function renderStats() {
  const count = function (s) {
    return apps.filter(function (a) { return a.status === s; }).length;
  };
  const items = [
    ["Total Applied", apps.length],
    ["Under Review", count("Under Review") + count("Submitted")],
    ["Shortlisted / Interview", count("Shortlisted") + count("Interview")],
    ["Selected", count("Selected")],
    ["Rejected", count("Rejected")]
  ];
  statsEl.innerHTML = items.map(function (i) {
    return "<div class='ma-stat'><strong>" + i[1] + "</strong><span>" + i[0] + "</span></div>";
  }).join("");
}

// ---------- Tab: Applied ----------
function renderFilters() {
  if (activeTab !== "applied") { filtersEl.innerHTML = ""; return; }
  const opts = ["All"].concat(STATUSES);
  filtersEl.innerHTML = opts.map(function (s) {
    return "<button class='ma-chip" + (s === activeStatus ? " active" : "") + "' data-status='" + s + "'>" + s + "</button>";
  }).join("");
  filtersEl.querySelectorAll(".ma-chip").forEach(function (b) {
    b.addEventListener("click", function () {
      activeStatus = b.dataset.status;
      render();
    });
  });
}

function renderApplied() {
  if (apps.length === 0) {
    listEl.innerHTML = emptyBox("You have not applied for any job yet.", "Find Jobs", "jobs.html");
    return;
  }
  const shown = apps.filter(function (a) { return activeStatus === "All" || a.status === activeStatus; });
  if (shown.length === 0) {
    listEl.innerHTML = "<div class='detail-card ma-empty'><p class='muted'>No applications with this status.</p></div>";
    return;
  }
  listEl.innerHTML = shown.map(function (a) {
    return "<div class='detail-card ma-app'>" +
      "<div class='dash-job-head'>" +
        "<div>" +
          "<h2>" + esc(a.jobTitle) + "</h2>" +
          "<p class='muted'>" + esc(a.company) + " &middot; Applied " + timeAgo(a.createdAt) + " (" + new Date(a.createdAt).toLocaleDateString() + ")</p>" +
        "</div>" +
        "<span class='status-badge " + statusClass(a.status) + "'>" + esc(a.status) + "</span>" +
      "</div>" +
      "<div class='ma-progress'>" + progress(a.status) + "</div>" +
      "<a class='btn btn-outline small-btn' href='jobs.html?id=" + encodeURIComponent(a.jobId) + "'>View Job</a>" +
    "</div>";
  }).join("");
}

// Chhoti progress line: Submitted -> Under Review -> Shortlisted -> Interview -> Selected
function progress(status) {
  if (status === "Rejected") return "<span class='ma-rejected'>This application was not selected.</span>";
  const steps = ["Submitted", "Under Review", "Shortlisted", "Interview", "Selected"];
  const idx = steps.indexOf(status);
  return steps.map(function (s, i) {
    return "<span class='ma-step" + (i <= idx ? " done" : "") + "'>" + s + "</span>";
  }).join("");
}

// ---------- Job cards (saved / liked / recommended) ----------
function jobCard(job, removeKey) {
  const applied = apps.some(function (a) { return String(a.jobId) === String(job.id); });
  return "<div class='ma-job'>" +
    "<div class='ma-job-body'>" +
      "<h3>" + esc(job.title) + "</h3>" +
      "<p class='ma-job-co'>" + esc(job.company) + "</p>" +
      "<p class='muted'>" + esc(job.location) + " &middot; " + timeAgo(job.createdAt) + "</p>" +
      "<div class='job-pills'>" +
        "<span class='pill pill-salary'>" + esc(job.salary) + "</span>" +
        "<span class='pill pill-type'>" + esc(job.type) + "</span>" +
        "<span class='pill pill-cat'>" + esc(job.category) + "</span>" +
      "</div>" +
    "</div>" +
    "<div class='ma-job-actions'>" +
      (applied
        ? "<span class='status-badge st-submitted'>Applied</span>"
        : "<a class='btn btn-primary small-btn' href='job.html?id=" + encodeURIComponent(job.id) + "'>Apply</a>") +
      "<a class='btn btn-outline small-btn' href='jobs.html?id=" + encodeURIComponent(job.id) + "'>Details</a>" +
      (removeKey ? "<button class='btn small-btn ma-remove' data-key='" + removeKey + "' data-id='" + esc(job.id) + "'>Remove</button>" : "") +
    "</div>" +
  "</div>";
}

function renderSaved(key, label, emptyText) {
  const ids = getList(key);
  const jobs = allJobs.filter(function (j) { return ids.indexOf(String(j.id)) !== -1; });
  if (jobs.length === 0) {
    listEl.innerHTML = emptyBox(emptyText, "Find Jobs", "jobs.html");
    return;
  }
  listEl.innerHTML = "<div class='ma-job-grid'>" + jobs.map(function (j) { return jobCard(j, key); }).join("") + "</div>";
  listEl.querySelectorAll(".ma-remove").forEach(function (b) {
    b.addEventListener("click", function () {
      removeFromList(b.dataset.key, b.dataset.id);
      render();
    });
  });
}

// ---------- Recommended ----------
function words(s) {
  return String(s || "").toLowerCase().split(/[^a-z0-9]+/).filter(function (w) { return w.length > 2; });
}

function renderRecommended() {
  const appliedIds = apps.map(function (a) { return String(a.jobId); });
  const interestIds = appliedIds.concat(getList("savedJobs"), getList("likedJobs"));
  const interestJobs = allJobs.filter(function (j) { return interestIds.indexOf(String(j.id)) !== -1; });

  const cats = {};
  const keywords = {};
  interestJobs.forEach(function (j) {
    cats[j.category] = (cats[j.category] || 0) + 1;
    words(j.title).forEach(function (w) { keywords[w] = true; });
  });

  const candidates = allJobs.filter(function (j) { return appliedIds.indexOf(String(j.id)) === -1; });

  let scored = candidates.map(function (j) {
    let score = (cats[j.category] || 0) * 2;
    words(j.title).forEach(function (w) { if (keywords[w]) score += 2; });
    return { job: j, score: score };
  });

  let note;
  if (interestJobs.length > 0) {
    scored = scored.filter(function (s) { return s.score > 0; });
    scored.sort(function (a, b) { return b.score - a.score || (b.job.createdAt || 0) - (a.job.createdAt || 0); });
    note = "Based on the jobs you applied for, saved or liked.";
  } else {
    scored.sort(function (a, b) { return (b.job.createdAt || 0) - (a.job.createdAt || 0); });
    note = "Latest jobs. Apply, save or like jobs to get personal suggestions.";
  }

  const top = scored.slice(0, 6).map(function (s) { return s.job; });
  if (top.length === 0) {
    listEl.innerHTML = emptyBox("No related jobs right now. Check back later.", "Find Jobs", "jobs.html");
    return;
  }
  listEl.innerHTML = "<p class='muted ma-note'>" + note + "</p>" +
    "<div class='ma-job-grid'>" + top.map(function (j) { return jobCard(j, null); }).join("") + "</div>";
}

// ---------- Main render ----------
function render() {
  renderStats();
  renderFilters();
  document.querySelectorAll(".ma-tab").forEach(function (t) {
    t.classList.toggle("active", t.dataset.tab === activeTab);
  });
  if (activeTab === "applied") renderApplied();
  else if (activeTab === "saved") renderSaved("savedJobs", "Saved", "You have not saved any job yet. Use the Save button on a job.");
  else if (activeTab === "liked") renderSaved("likedJobs", "Liked", "You have not liked any job yet. Use the Like button on a job.");
  else renderRecommended();
}

document.querySelectorAll(".ma-tab").forEach(function (t) {
  t.addEventListener("click", function () {
    activeTab = t.dataset.tab;
    render();
  });
});

let started = false;
onUser(async function (user) {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  if (started) return;
  started = true;

  const role = await getRole(user);
  if (role === "company") {
    window.location.href = "dashboard.html";
    return;
  }

  try {
    const results = await Promise.all([getApplicantApplications(), getAllJobs()]);
    apps = results[0];
    allJobs = results[1];
    subEl.textContent = "Welcome, " + (user.displayName || user.email) + ". Track your applications, saved jobs and recommendations here.";
    render();
  } catch (err) {
    console.error(err);
    subEl.textContent = "Could not load your data. Please refresh the page.";
  }
});
