import { addJob, onUser, getRole } from "./api.js";

let currentUser = null;

const form = document.getElementById("post-form");
const msg = document.getElementById("post-success");

function showMsg(html, isError) {
  msg.style.display = "block";
  msg.innerHTML = html;
  msg.style.background = isError ? "#fee2e2" : "#dcfce7";
  msg.style.color = isError ? "#991b1b" : "#166534";
  msg.scrollIntoView({ behavior: "smooth", block: "center" });
}

// Sirf logged-in company job post kar sakti hai
onUser(async function (user) {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  const role = await getRole(user);
  if (role !== "company") {
    form.style.display = "none";
    showMsg("Only company accounts can post jobs. Please log in with a company account.", true);
    return;
  }
  currentUser = user;
  const companyInput = document.getElementById("company");
  if (!companyInput.value && user.displayName) {
    companyInput.value = user.displayName;
  }
});

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  if (!currentUser) return;

  const btn = form.querySelector("button");
  btn.disabled = true;
  btn.textContent = "Posting...";

  const requirements = document
    .getElementById("requirements")
    .value.split("\n")
    .map(function (line) { return line.trim(); })
    .filter(function (line) { return line !== ""; });

  const newJob = {
    title: document.getElementById("title").value.trim(),
    company: document.getElementById("company").value.trim(),
    location: document.getElementById("location").value.trim(),
    type: document.getElementById("type").value,
    category: document.getElementById("category").value,
    salary: document.getElementById("salary").value.trim(),
    description: document.getElementById("description").value.trim(),
    requirements: requirements
  };

  try {
    await addJob(newJob);
    form.style.display = "none";
    showMsg("Your job <strong>" + newJob.title.replace(/</g, "&lt;") + "</strong> has been posted! <a href='jobs.html'>View it on Find Jobs</a>", false);
  } catch (err) {
    console.error(err);
    showMsg(err.message || "Could not post the job. Please try again.", true);
    btn.disabled = false;
    btn.textContent = "Post Job";
  }
});
