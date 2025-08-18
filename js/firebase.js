/* Firebase SDK bootstrap for Project.PAW
   Firebase Console → Project Settings → General → Web API Key & SDK Config 복사해서 넣어야 함
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getFirestore, collection, getDocs, getDoc, addDoc, doc, serverTimestamp, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";
import {
  getAuth, signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

// 🔥 반드시 Firebase Console에서 복사한 최신 설정값 붙여넣기
const firebaseConfig = {
  apiKey: "AIzaSyCNguz8K5MehFR5nydZ293hI60FQ9Jh5Tk",
  authDomain: "projectpaw-bf042.firebaseapp.com",      // 프로젝트 ID 맞는지 확인
  projectId: "projectpaw-bf042",
  storageBucket: "projectpaw-bf042.appspot.com",       // 반드시 .appspot.com 이어야 함
  messagingSenderId: "340056180297",
  appId: "1:340056180297:web:414156a3716e5594862198",
  measurementId: "G-YMXR48Q4FL"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// ✅ GitHub Pages에서 쓸 수 있도록 익명 로그인 (사용자 없이도 read/write 가능하게)
try {
  const userCred = await signInAnonymously(auth);
  console.log("[auth] signed in:", userCred.user.uid);
} catch (e) {
  console.error("[auth] anonymous sign-in failed:", e);
}

export {
  db, storage, collection, getDocs, getDoc, addDoc, doc, serverTimestamp, query, orderBy,
  ref, uploadBytes, getDownloadURL
};
