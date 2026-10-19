import { getAllJobs } from "./firebase-config.js";

let jobs = [];
let activeCategory = "";

// Saved jobs is browser mein save hoti hain (har user ke apne device par)
function getSaved() {
  try { return JSON.parse(localStorage.getItem("savedJobs") || "[]"); }
  catch (e) { return []; }
}

function toggleSaved(id) {
  const saved = getSaved();
  const i = saved.indexOf(String(id));
  if (i === -1) saved.push(String(id)); else saved.splice(i, 1);
  try { localStorage.setItem("savedJobs", JSON.stringify(saved)); } catch (e) {}
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

function showJobs(list) {
  const box = document.getElementById("jobs-list");
  box.innerHTML = "";

  if (list.length === 0) {
    box.innerHTML = "<p class='muted'>No jobs found. Try a different keyword, location or job type.</p>";
    return;
  }

  const saved = getSaved();

  list.forEach(function (job) {
    const card = document.createElement("div");
    card.className = "job-card";
    const posted = timeAgo(job.createdAt);
    const isSaved = saved.indexOf(String(job.id)) !== -1;

    card.innerHTML =
      "<button class='save-btn" + (isSaved ? " saved" : "") + "' title='Save job' aria-label='Save job'>" + bookmarkSvg + "</button>" +
      "<div class='job-top'>" +
        "<div class='avatar'>" + (job.company || "?").charAt(0).toUpperCase() + "</div>" +
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
      "<a href='job.html?id=" + job.id + "' class='btn btn-primary view-btn'>View Details &amp; Apply</a>";

    card.querySelector(".save-btn").addEventListener("click", function (e) {
      const nowSaved = toggleSaved(job.id);
      e.currentTarget.classList.toggle("saved", nowSaved);
    });

    box.appendChild(card);
  });
}

function applyFilters() {
  const keyword = document.getElementById("search-input").value.toLowerCase().trim();
  const city = document.getElementById("city-input").value.toLowerCase().trim();
  const type = document.getElementById("type-input").value;

  const filtered = jobs.filter(function (job) {
    const matchesKeyword =
      job.title.toLowerCase().includes(keyword) ||
      job.company.toLowerCase().includes(keyword) ||
      job.category.toLowerCase().includes(keyword) ||
      job.description.toLowerCase().includes(keyword);
    const matchesCity = job.location.toLowerCase().includes(city);
    const matchesType = !type || job.type === type;
    const matchesCategory = !activeCategory || job.category === activeCategory;
    return matchesKeyword && matchesCity && matchesType && matchesCategory;
  });

  document.getElementById("jobs-count").textContent = filtered.length + " job(s) found";

  const chip = document.getElementById("filter-chip");
  if (activeCategory) {
    chip.style.display = "inline-block";
    chip.textContent = "Category: " + activeCategory + "  ✕";
  } else {
    chip.style.display = "none";
  }

  showJobs(filtered);
}

function searchAndScroll() {
  applyFilters();
  document.getElementById("jobs").scrollIntoView({ behavior: "smooth" });
}

function updateStats() {
  const companies = new Set(jobs.map(function (j) { return j.company.toLowerCase(); }));
  const cities = new Set(jobs.map(function (j) { return j.location.toLowerCase(); }));
  document.getElementById("stat-jobs").textContent = jobs.length;
  document.getElementById("stat-companies").textContent = companies.size;
  document.getElementById("stat-cities").textContent = cities.size;

  ["IT", "Design", "Marketing", "Finance", "Sales", "Other"].forEach(function (cat) {
    const n = jobs.filter(function (j) { return j.category === cat; }).length;
    const el = document.getElementById("count-" + cat);
    if (el) el.textContent = n + (n === 1 ? " job" : " jobs");
  });
}

document.getElementById("search-btn").addEventListener("click", searchAndScroll);
["search-input", "city-input"].forEach(function (id) {
  document.getElementById(id).addEventListener("keyup", function (e) {
    if (e.key === "Enter") searchAndScroll();
  });
});
document.getElementById("type-input").addEventListener("change", applyFilters);

document.querySelectorAll(".cat-card").forEach(function (card) {
  card.addEventListener("click", function () {
    activeCategory = card.dataset.category;
    applyFilters();
    document.getElementById("jobs").scrollIntoView({ behavior: "smooth" });
  });
});

document.getElementById("filter-chip").addEventListener("click", function () {
  activeCategory = "";
  applyFilters();
});

async function init() {
  document.getElementById("jobs-list").innerHTML = "<p class='muted'>Loading jobs...</p>";
  jobs = await getAllJobs();
  updateStats();
  applyFilters();
}

init();
