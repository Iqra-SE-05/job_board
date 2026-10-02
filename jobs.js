import { getAllJobs, addApplication } from "./firebase-config.js";

const params = new URLSearchParams(window.location.search);
const jobId = params.get("id");

const detail = document.getElementById("job-detail");
const applySection = document.getElementById("apply-section");

const MAX_FILE_SIZE = 700 * 1024; // 700 KB

// File ko text (base64) mein badalta hai taake database mein save ho sake
function readFileAsDataURL(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () { resolve(reader.result); };
    reader.onerror = function () { reject(new Error("Could not read file")); };
    reader.readAsDataURL(file);
  });
}

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

    const fileInput = document.getElementById("resumeFile");
    const file = fileInput.files[0];
    const link = document.getElementById("resume").value.trim();

    // Kam az kam ek cheez zaroori hai: file ya link
    if (!file && !link) {
      alert("Please upload your resume or paste a resume link.");
      return;
    }

    if (file && file.size > MAX_FILE_SIZE) {
      alert("File is too large. Please upload a file smaller than 700 KB, or use a resume link instead.");
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
        jobTitle: job.title,
        company: job.company,
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        resume: link,
        resumeFile: resumeFile,
        resumeFileName: resumeFileName,
        message: document.getElementById("message").value
      };

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
