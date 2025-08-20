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

// ✅ 기존 프로젝트 설정 그대로 유지
const firebaseConfig = {
  apiKey: "AIzaSyCNguz8K5MehFR5nydZ293hI60FQ9Jh5Tk",
  authDomain: "projectpaw-bf042.firebaseapp.com",
  projectId: "projectpaw-bf042",
  storageBucket: "projectpaw-bf042.appspot.com", // appspot.com 필수
  messagingSenderId: "340056180297",
  appId: "1:340056180297:web:20ae730ee45b0563062198",
  measurementId: "G-FEMJ80972P"
};

// Initialize
export const app = initializeApp(firebaseConfig);

// 🔒 Auth: 익명 로그인 자동 수행 (rules에서 request.auth != null 요구 충족)
export const auth = getAuth(app);

// 외부에서 await 할 수 있도록 Promise 제공
let _resolveAuthReady;
export const authReady = new Promise((res) => { _resolveAuthReady = res; });

// 상태 변화 감지 → 이미 로그인되어 있으면 OK, 아니면 익명 로그인 시도
onAuthStateChanged(auth, (user) => {
  if (user) {
    _resolveAuthReady && _resolveAuthReady(user);
  } else {
    // 로그인 없으면 익명 로그인
    signInAnonymously(auth).catch((err) => {
      console.error("Anonymous sign-in failed:", err);
      // 실패해도 계속 대기하지 않도록 resolve는 한 번 호출
      _resolveAuthReady && _resolveAuthReady(null);
    });
  }
});

// Firestore & Storage
export const db = getFirestore(app);
export const storage = getStorage(app);

// 재사용 유틸들 export (api.js에서 import 중)
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
  limit,             // api.js 에서 `limit as fLimit`로 사용
  updateDoc,
  ref,
  uploadBytesResumable,
  getDownloadURL,
};
