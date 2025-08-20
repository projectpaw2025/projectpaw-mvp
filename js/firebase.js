// js/firebase.js (patched: anonymous auth + authReady)
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

const firebaseConfig = {
  apiKey: "AIzaSyCNguz8K5MehFR5nydZ293hI60FQ9Jh5Tk",
  authDomain: "projectpaw-bf042.firebaseapp.com",
  projectId: "projectpaw-bf042",
  storageBucket: "projectpaw-bf042.appspot.com", // ⚠️ 반드시 appspot.com 으로!
  messagingSenderId: "340056180297",
  appId: "1:340056180297:web:20ae730ee45b0563062198",
  measurementId: "G-FEMJ80972P"
};

export const app = initializeApp(firebaseConfig);

// Anonymous Auth
export const auth = getAuth(app);
let _resolveAuthReady;
export const authReady = new Promise((res)=>{ _resolveAuthReady = res; });
onAuthStateChanged(auth, (user)=>{
  if (user) {
    _resolveAuthReady && _resolveAuthReady(user);
  } else {
    signInAnonymously(auth).catch(err=>{ console.error("Anonymous sign-in failed:", err); _resolveAuthReady && _resolveAuthReady(null); });
  }
});

export const db = getFirestore(app);
export const storage = getStorage(app);

// re-exports
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
