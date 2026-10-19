import { getAllJobs } from "./firebase-config.js";

let jobs = [];
let activeCategory = "";

function timeAgo(ts) {
  if (!ts) return "";
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted 1 day ago";
  return "Posted " + days + " days ago";
}

function showJobs(list) {
  const box = document.getElementById("jobs-list");
  box.innerHTML = "";

  if (list.length === 0) {
    box.innerHTML = "<p class='muted'>No jobs found. Try a different keyword, location or job type.</p>";
    return;
  }

  list.forEach(function (job) {
    const card = document.createElement("div");
    card.className = "job-card";
    const posted = timeAgo(job.createdAt);
    card.innerHTML =
      "<div class='job-top'>" +
        "<div class='avatar'>" + (job.company || "?").charAt(0).toUpperCase() + "</div>" +
        "<div class='job-heading'><h3>" + job.title + "</h3><p class='job-company'>" + job.company + "</p></div>" +
      "</div>" +
      "<div class='job-meta'>" +
        "<span class='tag'>📍 " + job.location + "</span>" +
        "<span class='tag'>" + job.type + "</span>" +
        "<span class='tag'>" + job.category + "</span>" +
      "</div>" +
      "<p class='job-desc'>" + job.description + "</p>" +
      "<div class='job-footer'>" +
        "<p class='job-salary'>" + job.salary + "</p>" +
        (posted ? "<p class='posted-on'>" + posted + "</p>" : "") +
        "<a href='job.html?id=" + job.id + "' class='btn btn-primary'>View Details &amp; Apply</a>" +
      "</div>";
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
