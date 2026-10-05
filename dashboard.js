import { onUser, getMyJobs, getMyApplications } from "./firebase-config.js";

const container = document.getElementById("dash-jobs");
const sub = document.getElementById("dash-sub");

function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
}

function isSafeLink(url) {
  return /^https?:\/\//i.test(url);
}

function applicantCard(app) {
  const card = el("div", "applicant");

  card.appendChild(el("h4", "", app.name || "No name"));
  card.appendChild(el("p", "", "Email: " + (app.email || "-")));
  card.appendChild(el("p", "", "Phone: " + (app.phone || "-")));
  if (app.createdAt) {
    card.appendChild(el("p", "muted", "Applied: " + new Date(app.createdAt).toLocaleString()));
  }
  if (app.message) {
    card.appendChild(el("p", "applicant-msg", app.message));
  }

  const actions = el("div", "applicant-actions");

  if (app.resume && isSafeLink(app.resume)) {
    const link = el("a", "btn btn-outline small-btn", "Open Resume Link");
    link.href = app.resume;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    actions.appendChild(link);
  }

  if (app.resumeFile && app.resumeFile.startsWith("data:")) {
    const dl = el("a", "btn btn-primary small-btn", "Download Resume");
    dl.href = app.resumeFile;
    dl.download = app.resumeFileName || "resume";
    actions.appendChild(dl);
  }

  if (actions.children.length === 0) {
    actions.appendChild(el("span", "muted", "No resume provided"));
  }

  card.appendChild(actions);
  return card;
}

async function init(user) {
  try {
    const results = await Promise.all([getMyJobs(user.uid), getMyApplications(user.uid)]);
    const myJobs = results[0];
    const apps = results[1];

    sub.textContent = "Welcome, " + (user.displayName || user.email) + ". You have posted " +
      myJobs.length + " job(s) and received " + apps.length + " application(s).";

    container.innerHTML = "";

    if (myJobs.length === 0) {
      const empty = el("div", "detail-card");
      empty.appendChild(el("p", "muted", "You have not posted any jobs yet."));
      const link = el("a", "btn btn-primary", "Post your first job");
      link.href = "post-job.html";
      empty.appendChild(link);
      container.appendChild(empty);
      return;
    }

    myJobs.forEach(function (job) {
      const jobApps = apps.filter(function (a) { return a.jobId === String(job.id); });

      const box = el("div", "detail-card");
      const head = el("div", "dash-job-head");
      const titleWrap = el("div");
      titleWrap.appendChild(el("h2", "", job.title));
      titleWrap.appendChild(el("p", "muted", job.location + " | " + job.type + " | " + job.category));
      head.appendChild(titleWrap);
      head.appendChild(el("span", "count-badge", jobApps.length + " applicant(s)"));
      box.appendChild(head);

      if (jobApps.length === 0) {
        box.appendChild(el("p", "muted", "No applications yet."));
      } else {
        jobApps.forEach(function (a) {
          box.appendChild(applicantCard(a));
        });
      }

      container.appendChild(box);
    });
  } catch (err) {
    console.error(err);
    sub.textContent = "Could not load dashboard. Please refresh the page.";
  }
}

onUser(function (user) {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  init(user);
});
