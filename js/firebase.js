/* Firebase SDK bootstrap for Project.PAW (GitHub Pages) */
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

/* 콘솔에서 복사한 네 프로젝트 설정 */
const firebaseConfig = {
  apiKey: "AIzaSyCNguz8K5MehFR5nydZ293hI60FQ9Jh5Tk",
  authDomain: "projectpaw-bf042.firebaseapp.com",
  projectId: "projectpaw-bf042",
  // 🔥 콘솔과 동일하게 firebasestorage.app 로 맞춘다
  storageBucket: "projectpaw-bf042.firebasestorage.app",
  messagingSenderId: "340056180297",
  appId: "1:340056180297:web:20ae730ee45b0563062198",
  measurementId: "G-FEMJ80972P"
};

export const app = initializeApp(firebaseConfig);

// 🔥 버킷도 명시적으로 같은 값으로
export const storage = getStorage(app, "gs://projectpaw-bf042.firebasestorage.app");

export const db = getFirestore(app);
export const auth = getAuth(app);

export const authReady = (async () => {
  try { await signInAnonymously(auth); } catch(e) { console.warn("[auth] anon fail", e); }
  await new Promise(res => { const stop = onAuthStateChanged(auth, u => { if (u) { stop(); res(); } }); });
  console.log("[auth] signed in:", auth.currentUser?.uid);
})();

export {
  collection, getDocs, getDoc, addDoc, doc, serverTimestamp, query, orderBy,
  ref, uploadBytes, getDownloadURL
};
