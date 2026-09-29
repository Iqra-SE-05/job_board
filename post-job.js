// Special characters ko safe banata hai
function clean(text) {
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
}

document.getElementById("post-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const requirements = document
    .getElementById("requirements")
    .value.split("\n")
    .map(function (line) { return clean(line); })
    .filter(function (line) { return line !== ""; });

  const newJob = {
    id: Date.now(),
    title: clean(document.getElementById("title").value),
    company: clean(document.getElementById("company").value),
    location: clean(document.getElementById("location").value),
    type: document.getElementById("type").value,
    category: document.getElementById("category").value,
    salary: clean(document.getElementById("salary").value),
    description: clean(document.getElementById("description").value),
    requirements: requirements
  };

  // Abhi browser mein save hoga (Step 7 mein real database lagayenge)
  const saved = JSON.parse(localStorage.getItem("postedJobs") || "[]");
  saved.push(newJob);
  localStorage.setItem("postedJobs", JSON.stringify(saved));

  document.getElementById("post-form").style.display = "none";
  const msg = document.getElementById("post-success");
  msg.style.display = "block";
  msg.innerHTML = "Your job <strong>" + newJob.title + "</strong> has been posted! <a href='index.html#jobs'>View it on the home page</a>";
});
