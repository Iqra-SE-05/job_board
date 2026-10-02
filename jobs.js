import { getAllJobs, addApplication } from "./firebase-config.js";

const params = new URLSearchParams(window.location.search);
const jobId = params.get("id");

const detail = document.getElementById("job-detail");
const applySection = document.getElementById("apply-section");

async function init() {
  detail.innerHTML = "<p class='muted'>Loading...</p>";
  const jobs = await getAllJobs();
  const job = jobs.find(function (j) {
    return String(j.id) === jobId;
  });

  if (!job) {
    detail.innerHTML = "<h2>Job not found</h2><p class='muted'>This job does not exist or was removed.</p>";
    applySection.style.display = "none";
    return;
  }

  document.title = job.title + " - JobBoard";

  const reqList = job.requirements
    .map(function (r) { return "<li>" + r + "</li>"; })
    .join("");

  detail.innerHTML =
    "<h1>" + job.title + "</h1>" +
    "<p class='job-company'>" + job.company + "</p>" +
    "<div class='job-meta'>" +
      "<span class='tag'>" + job.location + "</span>" +
      "<span class='tag'>" + job.type + "</span>" +
      "<span class='tag'>" + job.category + "</span>" +
    "</div>" +
    "<p class='detail-salary'>" + job.salary + "</p>" +
    "<h3>About the job</h3>" +
    "<p>" + job.description + "</p>" +
    "<h3>Requirements</h3>" +
    "<ul class='req-list'>" + reqList + "</ul>";

  document.getElementById("apply-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const btn = e.target.querySelector("button");
    btn.disabled = true;
    btn.textContent = "Submitting...";

    const application = {
      jobId: String(job.id),
      jobTitle: job.title,
      company: job.company,
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      resume: document.getElementById("resume").value,
      message: document.getElementById("message").value
    };

    try {
      await addApplication(application);
      document.getElementById("apply-form").style.display = "none";
      const msg = document.getElementById("success-msg");
      msg.style.display = "block";
      msg.textContent = "Thank you, " + application.name + "! Your application for " + job.title + " has been submitted.";
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
      btn.disabled = false;
      btn.textContent = "Submit Application";
    }
  });
}

init();
