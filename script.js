import { getAllJobs } from "./firebase-config.js";

let jobs = [];

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

  jobsToShow.forEach(function (job) {
    const card = document.createElement("div");
    card.className = "job-card";
    card.innerHTML =
      "<h3>" + job.title + "</h3>" +
      "<p class='job-company'>" + job.company + "</p>" +
      "<div class='job-meta'>" +
        "<span class='tag'>" + job.location + "</span>" +
        "<span class='tag'>" + job.type + "</span>" +
        "<span class='tag'>" + job.category + "</span>" +
      "</div>" +
      "<p class='job-desc'>" + job.description + "</p>" +
      "<p class='job-desc'><strong>" + job.salary + "</strong></p>" +
      "<a href='job.html?id=" + job.id + "' class='btn btn-primary'>View Details</a>";
    list.appendChild(card);
  });
}

function searchJobs() {
  const keyword = document.getElementById("search-input").value.toLowerCase().trim();
  const city = document.getElementById("city-input").value.toLowerCase().trim();

  const filtered = jobs.filter(function (job) {
    const matchesKeyword =
      job.title.toLowerCase().includes(keyword) ||
      job.company.toLowerCase().includes(keyword) ||
      job.category.toLowerCase().includes(keyword) ||
      job.description.toLowerCase().includes(keyword);

    const matchesCity = job.location.toLowerCase().includes(city);
    return matchesKeyword && matchesCity;
  });

  showJobs(filtered);
}

document.getElementById("search-btn").addEventListener("click", searchJobs);
document.getElementById("search-input").addEventListener("keyup", function (e) {
  if (e.key === "Enter") searchJobs();
});
document.getElementById("city-input").addEventListener("keyup", function (e) {
  if (e.key === "Enter") searchJobs();
});

// Page khulte hi Firebase se jobs lao
async function init() {
  document.getElementById("jobs-list").innerHTML = "<p class='muted'>Loading jobs...</p>";
  jobs = await getAllJobs();
  showJobs(jobs);
}

init();
