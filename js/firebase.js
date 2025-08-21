// js/firebase.js
// (CDN ESM 모듈 — GitHub Pages에서 동작)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// ✅ Firebase 콘솔의 값 그대로 (버킷: firebasestorage.app)
const firebaseConfig = {
  apiKey: "AIzaSyCNguz8K5MehFR5nydZ293hI60FQ9Jh5Tk",
  authDomain: "projectpaw-bf042.firebaseapp.com",
  projectId: "projectpaw-bf042",
  storageBucket: "projectpaw-bf042.firebasestorage.app",
  messagingSenderId: "340056180297",
  appId: "1:340056180297:web:20ae730ee45b0563062198",
  measurementId: "G-FEMJ80972P"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

isSupported().then((ok) => { if (ok) getAnalytics(app); }).catch(() => {});

export const authReady = (async () => {
  try { if (!auth.currentUser) await signInAnonymously(auth); }
  catch (e) { console.warn("Anonymous sign-in failed:", e); }
})();
