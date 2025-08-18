/* Firebase SDK bootstrap for Project.PAW */
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

/** 콘솔에서 받은 네 값 (storageBucket = *.appspot.com) */
const firebaseConfig = {
  apiKey: "AIzaSyCNguz8K5MehFR5nyd2Z93hT6fO9Jh5Tk",
  authDomain: "projectpaw-bf042.firebaseapp.com",
  projectId: "projectpaw-bf042",
  storageBucket: "projectpaw-bf042.appspot.com",
  messagingSenderId: "340056180297",
  appId: "1:340056180297:web:414156a3716e5594862198",
  measurementId: "G-YMXR48Q4FL"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

/** ✅ 익명 로그인 완료까지 기다릴 수 있게 Promise 제공 */
export const authReady = (async () => {
  try { await signInAnonymously(auth); } catch (e) { console.warn("[auth] anonymous sign-in failed:", e); }
  await new Promise((resolve) => {
    const stop = onAuthStateChanged(auth, (u) => { if (u) { stop(); resolve(); } });
  });
  console.log("[auth] signed in:", auth.currentUser?.uid);
})();

export {
  collection, getDocs, getDoc, addDoc, doc, serverTimestamp, query, orderBy,
  ref, uploadBytes, getDownloadURL
};
