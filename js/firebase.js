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

/* ← Firebase 콘솔에서 복사한 네 값 사용 */
const firebaseConfig = {
  apiKey: "AIzaSyCNguz8K5MehFR5nydZ293hI60FQ9Jh5Tk",
  authDomain: "projectpaw-bf042.firebaseapp.com",
  projectId: "projectpaw-bf042",
  storageBucket: "projectpaw-bf042.appspot.com",   // 반드시 .appspot.com
  messagingSenderId: "340056180297",
  appId: "1:340056180297:web:20ae730ee45b0563062198",
  measurementId: "G-FEMJ80972P"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);           // ✅ export 추가

// ✅ 익명 로그인 완료를 기다릴 수 있게 Promise 제공
export const authReady = (async () => {
  try { await signInAnonymously(auth); }
  catch (e) { console.warn("[auth] anonymous sign-in failed:", e); }
  await new Promise(res => {
    const stop = onAuthStateChanged(auth, u => { if (u) { stop(); res(); } });
  });
  console.log("[auth] signed in:", auth.currentUser?.uid);
})();

// 편의 export
export {
  collection, getDocs, getDoc, addDoc, doc, serverTimestamp, query, orderBy,
  ref, uploadBytes, getDownloadURL
};
