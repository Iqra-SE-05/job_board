import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
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
const auth = getAuth(app);

// ---------- Jobs ----------
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

export async function addJob(job) {
  job.createdAt = Date.now();
  const ref = await addDoc(collection(db, "jobs"), job);
  return ref.id;
}

export async function addApplication(application) {
  application.createdAt = Date.now();
  const ref = await addDoc(collection(db, "applications"), application);
  return ref.id;
}

// ---------- Login / Signup ----------
export async function signup(companyName, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: companyName });
  return cred.user;
}

export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export function logout() {
  return signOut(auth);
}

export function onUser(callback) {
  return onAuthStateChanged(auth, callback);
}
