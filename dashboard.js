import { onUser, getRole, getMyJobs, getMyApplications, setApplicationStatus, deleteJob } from "./api.js";

const STATUSES = ["Submitted", "Under Review", "Shortlisted", "Interview", "Selected", "Rejected"];

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

function statusClass(s) {
  return "st-" + String(s).toLowerCase().replace(/\s+/g, "-");
}

function applicantCard(app) {
  const card = el("div", "applicant");

  const top = el("div", "dash-job-head");
  const left = el("div");
  left.appendChild(el("h4", "", app.name || "No name"));
  top.appendChild(left);
  const badge = el("span", "status-badge " + statusClass(app.status), app.status);
  top.appendChild(badge);
  card.appendChild(top);

  card.appendChild(el("p", "", "Email: " + (app.email || "-")));
  card.appendChild(el("p", "", "Phone: " + (app.phone || "-")));
  if (app.createdAt) {
    card.appendChild(el("p", "muted", "Applied: " + new Date(app.createdAt).toLocaleString()));
  }
  if (app.message) card.appendChild(el("p", "applicant-msg", app.message));

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
  if (actions.children.length === 0) actions.appendChild(el("span", "muted", "No resume provided"));

  // Status badalne ka dropdown
  const select = el("select", "status-select");
  STATUSES.forEach(function (s) {
    const o = el("option", "", s);
    o.value = s;
    if (s === app.status) o.selected = true;
    select.appendChild(o);
  });
  select.addEventListener("change", async function () {
    const prev = app.status;
    select.disabled = true;
    try {
      const updated = await setApplicationStatus(app.id, select.value);
      app.status = updated.status;
      badge.textContent = app.status;
      badge.className = "status-badge " + statusClass(app.status);
    } catch (err) {
      alert(err.message || "Could not update status");
      select.value = prev;
    }
    select.disabled = false;
  });
  actions.appendChild(select);

  card.appendChild(actions);
  return card;
}

async function init(user) {
  try {
    const results = await Promise.all([getMyJobs(), getMyApplications()]);
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
      const jobApps = apps.filter(function (a) { return String(a.jobId) === String(job.id); });

      const box = el("div", "detail-card");
      const head = el("div", "dash-job-head");
      const titleWrap = el("div");
      titleWrap.appendChild(el("h2", "", job.title));
      titleWrap.appendChild(el("p", "muted", job.location + " | " + job.type + " | " + job.category));
      head.appendChild(titleWrap);

      const right = el("div", "dash-head-right");
      right.appendChild(el("span", "count-badge", jobApps.length + " applicant(s)"));
      const del = el("button", "btn small-btn ma-remove", "Delete job");
      del.addEventListener("click", async function () {
        if (!confirm("Delete this job? Its applications will no longer be linked to it.")) return;
        try {
          await deleteJob(job.id);
          box.remove();
        } catch (err) {
          alert(err.message || "Could not delete job");
        }
      });
      right.appendChild(del);
      head.appendChild(right);
      box.appendChild(head);

      if (jobApps.length === 0) {
        box.appendChild(el("p", "muted", "No applications yet."));
      } else {
        jobApps.forEach(function (a) { box.appendChild(applicantCard(a)); });
      }
      container.appendChild(box);
    });
  } catch (err) {
    console.error(err);
    sub.textContent = "Could not load dashboard. Please refresh the page.";
  }
}

let started = false;
onUser(async function (user) {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  if (started) return;
  started = true;

  const role = await getRole(user);
  if (role !== "company") {
    window.location.href = "my-applications.html";
    return;
  }
  init(user);
});
