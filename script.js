import { getAllJobs } from "./firebase-config.js";

let jobs = [];

function getList(key) {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); }
  catch (e) { return []; }
}

function toggleInList(key, id) {
  const list = getList(key);
  const i = list.indexOf(String(id));
  if (i === -1) list.push(String(id)); else list.splice(i, 1);
  try { localStorage.setItem(key, JSON.stringify(list)); } catch (e) {}
  return i === -1;
}

function timeAgo(ts) {
  if (!ts) return "";
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  return days + " days ago";
}

const bookmarkSvg =
  "<svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z'/></svg>";

const thumbSvg =
  "<svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3'/></svg>";

function showJobs(list) {
  const box = document.getElementById("jobs-list");
  box.innerHTML = "";

  if (list.length === 0) {
    box.innerHTML = "<p class='muted'>No jobs available yet.</p>";
    return;
  }

  const saved = getList("savedJobs");
  const liked = getList("likedJobs");

  list.forEach(function (job) {
    const card = document.createElement("div");
    card.className = "job-card";
    const posted = timeAgo(job.createdAt);
    const isSaved = saved.indexOf(String(job.id)) !== -1;
    const isLiked = liked.indexOf(String(job.id)) !== -1;

    card.innerHTML =
      "<button class='save-btn" + (isSaved ? " saved" : "") + "' title='Save job' aria-label='Save job'>" + bookmarkSvg + "</button>" +
      "<div class='job-top'>" +
        "<button class='like-btn" + (isLiked ? " liked" : "") + "' title='Like job' aria-label='Like job'>" + thumbSvg + "</button>" +
        "<div class='job-heading'>" +
          "<span class='apply-badge'>Open for applications</span>" +
          "<h3>" + job.title + "</h3>" +
        "</div>" +
      "</div>" +
      "<p class='job-company'>" + job.company + "</p>" +
      "<p class='job-loc'>📍 " + job.location + (posted ? " &middot; " + posted : "") + "</p>" +
      "<div class='job-pills'>" +
        "<span class='pill pill-salary'>" + job.salary + "</span>" +
        "<span class='pill pill-type'>" + job.type + "</span>" +
        "<span class='pill pill-cat'>" + job.category + "</span>" +
      "</div>" +
      "<a href='jobs.html?id=" + job.id + "' class='btn btn-primary view-btn'>View Details &amp; Apply</a>";

    card.querySelector(".save-btn").addEventListener("click", function (e) {
      const now = toggleInList("savedJobs", job.id);
      e.currentTarget.classList.toggle("saved", now);
    });

    card.querySelector(".like-btn").addEventListener("click", function (e) {
      const now = toggleInList("likedJobs", job.id);
      e.currentTarget.classList.toggle("liked", now);
    });

    box.appendChild(card);
  });
}

function updateStats() {
  const companies = new Set(jobs.map(function (j) { return String(j.company).toLowerCase(); }));
  const cities = new Set(jobs.map(function (j) { return String(j.location).toLowerCase(); }));
  document.getElementById("stat-jobs").textContent = jobs.length;
  document.getElementById("stat-companies").textContent = companies.size;
  document.getElementById("stat-cities").textContent = cities.size;

  ["IT", "Design", "Marketing", "Finance", "Sales", "Other"].forEach(function (cat) {
    const n = jobs.filter(function (j) { return j.category === cat; }).length;
    const el = document.getElementById("count-" + cat);
    if (el) el.textContent = n + (n === 1 ? " job" : " jobs");
  });
}

function goSearch() {
  const q = document.getElementById("search-input").value.trim();
  const city = document.getElementById("city-input").value.trim();
  const type = document.getElementById("type-input").value;

  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (city) p.set("city", city);
  if (type) p.set("type", type);

  window.location.href = "jobs.html" + (p.toString() ? "?" + p.toString() : "");
}

document.getElementById("search-btn").addEventListener("click", goSearch);
["search-input", "city-input"].forEach(function (id) {
  document.getElementById(id).addEventListener("keyup", function (e) {
    if (e.key === "Enter") goSearch();
  });
});

document.querySelectorAll(".cat-card").forEach(function (card) {
  card.addEventListener("click", function () {
    window.location.href = "jobs.html?category=" + encodeURIComponent(card.dataset.category);
  });
});

async function init() {
  document.getElementById("jobs-list").innerHTML = "<p class='muted'>Loading jobs...</p>";
  jobs = await getAllJobs();
  jobs.sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
  updateStats();

  document.getElementById("jobs-count").textContent = "Browse the newest openings from top companies.";
  showJobs(jobs.slice(0, 6));

  if (jobs.length > 6) {
    const more = document.createElement("a");
    more.href = "jobs.html";
    more.className = "btn btn-outline";
    more.style.cssText = "display:block;width:max-content;margin:28px auto 0;";
    more.textContent = "View all " + jobs.length + " jobs";
    document.getElementById("jobs").appendChild(more);
  }
}

init();
