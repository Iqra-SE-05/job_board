// URL se job ka id nikalo (jaise job.html?id=2)
const params = new URLSearchParams(window.location.search);
const jobId = Number(params.get("id"));

const job = jobs.find(function (j) {
  return j.id === jobId;
});

const detail = document.getElementById("job-detail");
const applySection = document.getElementById("apply-section");

if (!job) {
  detail.innerHTML = "<h2>Job not found</h2><p class='muted'>This job does not exist or was removed.</p>";
  applySection.style.display = "none";
} else {
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

  // Apply form
  document.getElementById("apply-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const application = {
      jobId: job.id,
      jobTitle: job.title,
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      resume: document.getElementById("resume").value,
      message: document.getElementById("message").value,
      date: new Date().toLocaleString()
    };

    // Abhi browser mein save hoga (Step 7 mein real database lagayenge)
    const saved = JSON.parse(localStorage.getItem("applications") || "[]");
    saved.push(application);
    localStorage.setItem("applications", JSON.stringify(saved));

    document.getElementById("apply-form").style.display = "none";
    const msg = document.getElementById("success-msg");
    msg.style.display = "block";
    msg.textContent = "Thank you, " + application.name + "! Your application for " + job.title + " has been submitted.";
  });
}
