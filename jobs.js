import { getAllJobs } from "./firebase-config.js";

let jobs = [];
let filtered = [];
let selectedId = null;
let cameFromSearch = false;

const listEl = document.getElementById("fj-list");
const detailEl = document.getElementById("fj-detail");
const countEl = document.getElementById("fj-count");

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

function isLiked(id) {
  return getList("likedJobs").indexOf(String(id)) !== -1;
}

function timeAgo(ts) {
  if (!ts) return "Recently";
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  return days + " days ago";
}

const thumbSvg =
  "<svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3'/></svg>";

function norm(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function matchesKeyword(job, query) {
  const words = norm(query).split(" ").filter(Boolean);
  if (words.length === 0) return true;
  const hay = norm(
    [job.title, job.company, job.category, job.location, job.type, job.description].join(" ")
  );
  return words.every(function (w) { return hay.includes(w); });
}

function renderList() {
  listEl.innerHTML = "";
  countEl.textContent = filtered.length + " job(s) found";

  if (filtered.length === 0) {
    listEl.innerHTML = "<div class='fj-empty'><h3>No jobs found</h3><p>Try a different keyword, location or filter.</p></div>";
    detailEl.innerHTML = "<p class='muted' style='padding:30px;'>No job to show.</p>";
    return;
  }

  filtered.forEach(function (job) {
    const item = document.createElement("div");
    item.className = "fj-item" + (String(job.id) === String(selectedId) ? " active" : "");
    item.innerHTML =
      "<button class='like-btn" + (isLiked(job.id) ? " liked" : "") + "' type='button' title='Like job' aria-label='Like job'>" + thumbSvg + "</button>" +
      "<div class='fj-item-body'>" +
        "<h3>" + job.title + "</h3>" +
        "<p class='fj-item-co'>" + job.company + "</p>" +
        "<p class='fj-item-loc'>" + job.location + " &middot; " + timeAgo(job.createdAt) + "</p>" +
        "<div class='fj-item-pills'>" +
          "<span class='pill pill-salary'>" + job.salary + "</span>" +
          "<span class='pill pill-type'>" + job.type + "</span>" +
        "</div>" +
      "</div>";

    item.querySelector(".like-btn").addEventListener("click", function (e) {
      e.stopPropagation();
      const now = toggleInList("likedJobs", job.id);
      e.currentTarget.classList.toggle("liked", now);
      // Agar yehi job right side mein khuli hai to wahan ka button bhi update karo
      if (String(job.id) === String(selectedId)) {
        const d = detailEl.querySelector(".like-btn");
        if (d) d.classList.toggle("liked", now);
      }
    });

    item.addEventListener("click", function () {
      selectedId = job.id;
      renderList();
      renderDetail(job, true);
    });
    listEl.appendChild(item);
  });
}

function renderDetail(job, openOnMobile) {
  const isSaved = getList("savedJobs").indexOf(String(job.id)) !== -1;
  const reqs = (job.requirements || [])
    .map(function (r) { return "<li>" + r + "</li>"; })
    .join("");

  detailEl.innerHTML =
    "<button class='fj-back' type='button'>&larr; Back to jobs</button>" +
    "<div class='fj-head'>" +
      "<button class='like-btn" + (isLiked(job.id) ? " liked" : "") + "' type='button' title='Like job' aria-label='Like job'>" + thumbSvg + "</button>" +
      "<div>" +
        "<h2>" + job.title + "</h2>" +
        "<p class='fj-head-co'>" + job.company + " &middot; " + job.location + "</p>" +
      "</div>" +
    "</div>" +
    "<div class='fj-actions'>" +
      "<a class='btn btn-light-solid' href='job.html?id=" + job.id + "'>Apply Now</a>" +
      "<button class='fj-icon-btn' id='fj-save' type='button'>" + (isSaved ? "Saved" : "Save") + "</button>" +
      "<button class='fj-icon-btn' id='fj-share' type='button'>Share</button>" +
    "</div>" +
    "<div class='fj-body'>" +
      "<div class='fj-tiles'>" +
        "<div class='fj-tile'><span>Salary</span><strong>" + job.salary + "</strong></div>" +
        "<div class='fj-tile'><span>Job type</span><strong>" + job.type + "</strong></div>" +
        "<div class='fj-tile'><span>Location</span><strong>" + job.location + "</strong></div>" +
        "<div class='fj-tile'><span>Category</span><strong>" + job.category + "</strong></div>" +
        "<div class='fj-tile'><span>Posted</span><strong>" + timeAgo(job.createdAt) + "</strong></div>" +
      "</div>" +
      "<h3>About the job</h3>" +
      "<p class='fj-text'>" + job.description + "</p>" +
      (reqs ? "<h3>Requirements</h3><ul class='req-list'>" + reqs + "</ul>" : "") +
      "<a class='btn btn-primary fj-apply-bottom' href='job.html?id=" + job.id + "'>Apply for this job</a>" +
    "</div>";

  detailEl.querySelector(".fj-head .like-btn").addEventListener("click", function (e) {
    const now = toggleInList("likedJobs", job.id);
    e.currentTarget.classList.toggle("liked", now);
    // List ka button bhi sync karo
    const active = listEl.querySelector(".fj-item.active .like-btn");
    if (active) active.classList.toggle("liked", now);
  });

  detailEl.querySelector("#fj-save").addEventListener("click", function (e) {
    e.currentTarget.textContent = toggleInList("savedJobs", job.id) ? "Saved" : "Save";
  });

  detailEl.querySelector("#fj-share").addEventListener("click", function (e) {
    const btn = e.currentTarget;
    const link = location.origin + location.pathname.replace("jobs.html", "") + "jobs.html?id=" + job.id;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(function () {
        btn.textContent = "Link copied";
        setTimeout(function () { btn.textContent = "Share"; }, 1800);
      });
    }
  });

  detailEl.querySelector(".fj-back").addEventListener("click", function () {
    detailEl.classList.remove("open");
  });

  detailEl.scrollTop = 0;
  if (openOnMobile) detailEl.classList.add("open");
}

function applyFilters(keepSelection) {
  const kw = document.getElementById("f-keyword").value;
  const city = norm(document.getElementById("f-city").value);
  const type = document.getElementById("f-type").value;
  const cat = document.getElementById("f-category").value;

  filtered = jobs.filter(function (job) {
    const okKw = matchesKeyword(job, kw);
    const okCity = !city || norm(job.location).includes(city);
    const okType = !type || job.type === type;
    const okCat = !cat || job.category === cat;
    return okKw && okCity && okType && okCat;
  });

  if (filtered.length > 0) {
    const stillThere = filtered.some(function (j) { return String(j.id) === String(selectedId); });
    if (!keepSelection || !stillThere) selectedId = filtered[0].id;
  }

  renderList();
  if (filtered.length > 0) {
    const current = filtered.find(function (j) { return String(j.id) === String(selectedId); });
    renderDetail(current, cameFromSearch && filtered.length === 1 && window.innerWidth <= 900);
    cameFromSearch = false;
  }
}

["f-keyword", "f-city"].forEach(function (id) {
  document.getElementById(id).addEventListener("input", function () { applyFilters(false); });
});
["f-type", "f-category"].forEach(function (id) {
  document.getElementById(id).addEventListener("change", function () { applyFilters(false); });
});

document.getElementById("f-clear").addEventListener("click", function () {
  ["f-keyword", "f-city", "f-type", "f-category"].forEach(function (id) {
    document.getElementById(id).value = "";
  });
  applyFilters(false);
});

async function init() {
  jobs = await getAllJobs();
  jobs.sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });

  const p = new URLSearchParams(location.search);
  if (p.get("q")) document.getElementById("f-keyword").value = p.get("q");
  if (p.get("city")) document.getElementById("f-city").value = p.get("city");
  if (p.get("type")) document.getElementById("f-type").value = p.get("type");
  if (p.get("category")) document.getElementById("f-category").value = p.get("category");

  cameFromSearch = !!(p.get("q") || p.get("city") || p.get("type") || p.get("category"));
  if (p.get("id")) selectedId = p.get("id");

  applyFilters(!!p.get("id"));
}

init();
