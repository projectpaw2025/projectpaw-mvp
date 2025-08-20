// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, serverTimestamp, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyCNguz8K5MehFR5nydZ293hI60FQ9Jh5Tk",
  authDomain: "projectpaw-bf042.firebaseapp.com",
  projectId: "projectpaw-bf042",
  storageBucket: "projectpaw-bf042.appspot.com", // ⚠️ 반드시 appspot.com 으로!
  messagingSenderId: "340056180297",
  appId: "1:340056180297:web:20ae730ee45b0563062198",
  measurementId: "G-FEMJ80972P"
};

// 초기화
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// 자주 쓰는 것들 export
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
  getDownloadURL
};
