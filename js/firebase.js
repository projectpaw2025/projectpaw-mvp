// js/firebase.js
// (CDN ESM 모듈 사용 — 번들러 없이 GitHub Pages에서 동작)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// ✅ Firebase 콘솔의 웹 앱 설정값 그대로 반영 (storageBucket만 .appspot.com 으로 교정)
const firebaseConfig = {
  apiKey: "AIzaSyCNguz8K5MehFR5nydZ293hI60FQ9Jh5Tk",
  authDomain: "projectpaw-bf042.firebaseapp.com",
  projectId: "projectpaw-bf042",
  storageBucket: "projectpaw-bf042.appspot.com",   // ← 여기 교정!
  messagingSenderId: "340056180297",
  appId: "1:340056180297:web:20ae730ee45b0563062198",
  measurementId: "G-FEMJ80972P"
};

// Initialize Firebase core services
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// (옵션) Analytics — 지원 브라우저에서만 활성화
isSupported().then((ok) => {
  if (ok) getAnalytics(app);
}).catch(() => { /* no-op */ });

// (옵션) 익명 로그인 준비 — 업로드/등록 페이지에서 필요
export const authReady = (async () => {
  try {
    if (!auth.currentUser) await signInAnonymously(auth);
  } catch (e) {
    console.warn("Anonymous sign-in failed:", e);
  }
})();
