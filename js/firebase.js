/* Firebase SDK bootstrap for Project.PAW */
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

// ✅ Firebase Console → SDK snippet (Config)에서 복사한 값
const firebaseConfig = {
  apiKey: "AIzaSyCNguz8K5MehFR5nydZ293hI60FQ9Jh5Tk",
  authDomain: "projectpaw-bf042.firebaseapp.com",
  projectId: "projectpaw-bf042",
  storageBucket: "projectpaw-bf042.appspot.com",   // 🔥 반드시 이렇게 수정해야 함
  messagingSenderId: "340056180297",
  appId: "1:340056180297:web:20ae730ee45b0563062198",
  measurementId: "G-FEMJ80972P"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// ✅ 익명 로그인 (필수: 업로드/쓰기 전에 인증 필요)
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
