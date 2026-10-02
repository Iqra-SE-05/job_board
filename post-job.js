import { addJob, onUser } from "./firebase-config.js";

let currentUser = null;

function clean(text) {
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
}

// Login nahi hai to login page par bhej do
onUser(function (user) {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUser = user;
  const companyInput = document.getElementById("company");
  if (!companyInput.value && user.displayName) {
    companyInput.value = user.displayName;
  }
});

document.getElementById("post-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  if (!currentUser) return;

  const btn = e.target.querySelector("button");
  btn.disabled = true;
  btn.textContent = "Posting...";

  const requirements = document
    .getElementById("requirements")
    .value.split("\n")
    .map(function (line) { return clean(line); })
    .filter(function (line) { return line !== ""; });

  const newJob = {
    title: clean(document.getElementById("title").value),
    company: clean(document.getElementById("company").value),
    location: clean(document.getElementById("location").value),
    type: document.getElementById("type").value,
    category: document.getElementById("category").value,
    salary: clean(document.getElementById("salary").value),
    description: clean(document.getElementById("description").value),
    requirements: requirements,
    ownerId: currentUser.uid,
    ownerEmail: currentUser.email
  };

  try {
    await addJob(newJob);
    document.getElementById("post-form").style.display = "none";
    const msg = document.getElementById("post-success");
    msg.style.display = "block";
    msg.innerHTML = "Your job <strong>" + newJob.title + "</strong> has been posted! <a href='index.html#jobs'>View it on the home page</a>";
  } catch (err) {
    console.error(err);
    alert("Something went wrong. Please try again.");
    btn.disabled = false;
    btn.textContent = "Post Job";
  }
});
