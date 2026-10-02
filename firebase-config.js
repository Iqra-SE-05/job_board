import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { sampleJobs } from "./jobs-data.js";

const firebaseConfig = {
  apiKey: "AIzaSyBUTHdlzlaLnf-hDXwG2fJF0fBckFq3T2U",
  authDomain: "job-board-d5f98.firebaseapp.com",
  projectId: "job-board-d5f98",
  storageBucket: "job-board-d5f98.firebasestorage.app",
  messagingSenderId: "759410279806",
  appId: "1:759410279806:web:31cffda07d13bc8182df2f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Saari jobs lao (company ki posted + sample jobs)
export async function getAllJobs() {
  let posted = [];
  try {
    const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    posted = snap.docs.map(function (d) {
      return Object.assign({}, d.data(), { id: d.id });
    });
  } catch (err) {
    console.error("Could not load jobs:", err);
  }
  return posted.concat(sampleJobs);
}

// Nayi job save karo
export async function addJob(job) {
  job.createdAt = Date.now();
  const ref = await addDoc(collection(db, "jobs"), job);
  return ref.id;
}

// Application save karo
export async function addApplication(application) {
  application.createdAt = Date.now();
  const ref = await addDoc(collection(db, "applications"), application);
  return ref.id;
}
