// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  serverTimestamp,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// 🔧 너의 기존 프로젝트 설정 그대로 사용
const firebaseConfig = {
  apiKey: "AIzaSyCNguz8K5MehFR5nydZ293hI60FQ9Jh5Tk",
  authDomain: "projectpaw-bf042.firebaseapp.com",
  projectId: "projectpaw-bf042",
  storageBucket: "projectpaw-bf042.appspot.com",
  messagingSenderId: "340056180297",
  appId: "1:340056180297:web:20ae730ee45b0563062198",
  measurementId: "G-FEMJ80972P"
};

// Initialize
export const app = initializeApp(firebaseConfig);

// ✅ 익명 인증: 규칙의 request.auth != null 충족을 위해 자동 로그인
export const auth = getAuth(app);

let _resolveAuthReady;
export const authReady = new Promise((res) => { _resolveAuthReady = res; });

onAuthStateChanged(auth, (user) => {
  if (user) {
    _resolveAuthReady && _resolveAuthReady(user);
  } else {
    signInAnonymously(auth).catch((err) => {
      console.error("Anonymous sign-in failed:", err);
      _resolveAuthReady && _resolveAuthReady(null);
    });
  }
});

// Firestore / Storage 핸들
export const db = getFirestore(app);
export const storage = getStorage(app);

// 그대로 외부에서 쓰던 것들 export
export {
  serverTimestamp,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  ref,
  uploadBytesResumable,
  getDownloadURL,
};
