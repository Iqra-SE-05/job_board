import { getAllJobs, addApplication, onUser, getRole } from "./api.js";

const params = new URLSearchParams(window.location.search);
const jobId = params.get("id");

const detail = document.getElementById("job-detail");
const applySection = document.getElementById("apply-section");
const form = document.getElementById("apply-form");
const MAX_FILE_SIZE = 700 * 1024;

let currentJob = null;
let currentUser = null;

function readFileAsDataURL(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () { resolve(reader.result); };
    reader.onerror = function () { reject(new Error("Could not read file")); };
    reader.readAsDataURL(file);
  });
}

function showMessage(text, isError) {
  const msg = document.getElementById("success-msg");
  msg.style.display = "block";
  msg.textContent = text;
  msg.style.background = isError ? "#fee2e2" : "#dcfce7";
  msg.style.color = isError ? "#991b1b" : "#166534";
  msg.scrollIntoView({ behavior: "smooth", block: "center" });
}

function showNotice(html) {
  let box = document.getElementById("apply-notice");
  if (!box) {
    box = document.createElement("div");
    box.id = "apply-notice";
    box.className = "apply-notice";
    applySection.insertBefore(box, form);
  }
  box.innerHTML = html;
  box.style.display = "block";
  form.style.display = "none";
}

async function updateApplyArea(user) {
  currentUser = user;
  const notice = document.getElementById("apply-notice");

  if (!user) {
    showNotice("<h3>Login required</h3><p>Please log in as a job seeker to apply for this job.</p><a class='btn btn-primary' href='login.html'>Login / Sign up</a>");
    return;
  }

  const role = await getRole(user);
  if (role === "company") {
    showNotice("<h3>Company account</h3><p>Company accounts cannot apply for jobs. Please use a job seeker account.</p>");
    return;
  }
  if (role !== "applicant") {
    showNotice("<h3>Account not ready</h3><p>Please log out and log in again.</p>");
    return;
  }

  if (notice) notice.style.display = "none";
  form.style.display = "block";
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  if (!nameInput.value) nameInput.value = user.displayName || "";
  emailInput.value = user.email || "";
  emailInput.readOnly = true;
}

async function init() {
  detail.innerHTML = "<p class='muted'>Loading... (first load can take up to a minute)</p>";
  const jobs = await getAllJobs();
  currentJob = jobs.find(function (j) { return String(j.id) === jobId; });

  if (!currentJob) {
    detail.innerHTML = "<h2>Job not found</h2><p class='muted'>This job does not exist or was removed.</p>";
    applySection.style.display = "none";
    return;
  }

  const job = currentJob;
  document.title = job.title + " - JobBoard";

  const reqList = (job.requirements || [])
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

  form.style.display = "none";
  onUser(updateApplyArea);
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  if (!currentUser || !currentJob) return;

  const job = currentJob;
  const btn = form.querySelector("button");
  const file = document.getElementById("resumeFile").files[0];
  const link = document.getElementById("resume").value.trim();

  if (!file && !link) {
    showMessage("Please upload your resume or paste a resume link.", true);
    return;
  }
  if (file && file.size > MAX_FILE_SIZE) {
    showMessage("File is too large. Please upload a file smaller than 700 KB, or use a resume link.", true);
    return;
  }

  btn.disabled = true;
  btn.textContent = "Submitting...";

  try {
    let resumeFile = "";
    let resumeFileName = "";
    if (file) {
      resumeFile = await readFileAsDataURL(file);
      resumeFileName = file.name;
    }

    const application = {
      jobId: String(job.id),
      name: document.getElementById("name").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      resume: link,
      resumeFile: resumeFile,
      resumeFileName: resumeFileName,
      message: document.getElementById("message").value.trim()
    };

    await addApplication(application);
    form.style.display = "none";
    showMessage("Thank you, " + application.name + "! Your application for " + job.title + " has been submitted successfully. You can track it in My Applications.", false);
  } catch (err) {
    console.error(err);
    showMessage(err.message || "Could not submit. Please try again.", true);
    btn.disabled = false;
    btn.textContent = "Submit Application";
  }
});

init();
