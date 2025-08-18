/* Firebase SDK bootstrap for Project.PAW (GitHub Pages용) */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getFirestore, collection, getDocs, getDoc, addDoc, doc, serverTimestamp, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";
import {
  getAuth, signInAnonymously, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

// ★ 네 프로젝트 설정 (콘솔에서 복사한 값)
const firebaseConfig = {
  apiKey: "AIzaSyCNguz8K5MehFR5nydZ293hI60FQ9Jh5Tk",
  authDomain: "projectpaw-bf042.firebaseapp.com",
  projectId: "projectpaw-bf042",
  storageBucket: "projectpaw-bf042.appspot.com", // 반드시 .appspot.com
  messagingSenderId: "340056180297",
  appId: "1:340056180297:web:20ae730ee45b0563062198",
  measurementId: "G-FEMJ80972P"
};

// --- Initialize
export const app = initializeApp(firebaseConfig);

// Storage: 버킷을 명시적으로 지정 (CORS/사전요청 혼동 방지)
export const storage = getStorage(app, "gs://projectpaw-bf042.appspot.com");

// Firestore / Auth
export const db = getFirestore(app);
export const auth = getAuth(app);

// 익명 로그인 완료까지 기다릴 수 있는 Promise
export const authReady = (async () => {
  try { await signInAnonymously(auth); }
  catch (e) { console.warn("[auth] anonymous sign-in failed:", e); }
  await new Promise((resolve) => {
    const stop = onAuthStateChanged(auth, (u) => { if (u) { stop(); resolve(); } });
  });
  console.log("[auth] signed in:", auth.currentUser?.uid);
})();

// 편의 export (앱 곳곳에서 사용)
export {
  collection, getDocs, getDoc, addDoc, doc, serverTimestamp, query, orderBy,
  ref, uploadBytes, getDownloadURL
};
