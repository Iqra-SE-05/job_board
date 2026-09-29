// Jobs ka data (abhi sample, baad mein real data aayega)
const jobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "TechNova",
    location: "Lahore",
    type: "Full-time",
    category: "IT",
    salary: "PKR 120,000 - 180,000",
    description: "Build modern user interfaces using HTML, CSS, JavaScript and React."
  },
  {
    id: 2,
    title: "Graphic Designer",
    company: "Creative Hub",
    location: "Karachi",
    type: "Part-time",
    category: "Design",
    salary: "PKR 60,000 - 90,000",
    description: "Design social media posts, logos and marketing material for clients."
  },
  {
    id: 3,
    title: "Digital Marketing Executive",
    company: "GrowFast",
    location: "Islamabad",
    type: "Full-time",
    category: "Marketing",
    salary: "PKR 80,000 - 120,000",
    description: "Plan and run online ad campaigns and manage social media growth."
  },
  {
    id: 4,
    title: "Backend Developer Intern",
    company: "CodeWorks",
    location: "Remote",
    type: "Internship",
    category: "IT",
    salary: "PKR 30,000 - 40,000",
    description: "Learn and build APIs and databases with a friendly senior team."
  }
];

// Jobs ko page par dikhane wala function
function showJobs(jobsToShow) {
  const list = document.getElementById("jobs-list");
  list.innerHTML = "";

  if (jobsToShow.length === 0) {
    list.innerHTML = "<p class='muted'>No jobs found. Try a different keyword or city.</p>";
    return;
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
      "<a href='#' class='btn btn-primary'>View Details</a>";
    list.appendChild(card);
  });
}

// Search aur filter
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

// Search button click par
document.getElementById("search-btn").addEventListener("click", searchJobs);

// Enter dabane par bhi search ho
document.getElementById("search-input").addEventListener("keyup", function (e) {
  if (e.key === "Enter") searchJobs();
});
document.getElementById("city-input").addEventListener("keyup", function (e) {
  if (e.key === "Enter") searchJobs();
});

// Page khulte hi saari jobs dikhao
showJobs(jobs);
