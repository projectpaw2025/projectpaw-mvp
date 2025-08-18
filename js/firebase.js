
/* Firebase SDK bootstrap for Project.PAW
   Replace the firebaseConfig values with your project's config from Firebase Console.
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

// TODO: Paste your real config here
const firebaseConfig = {
  apiKey: "AIzaSyCNguz8K5MehFR5nyd2Z93hT6fO9Jh5Tk",
  authDomain: "projectpaw-bf042.firebaseapp.com",
  projectId: "projectpaw-bf042",
  storageBucket: "projectpaw-bf042.appspot.com",
  messagingSenderId: "340056180297",
  appId: "1:340056180297:web:414156a3716e5594862198",
  measurementId: "G-YMXR48Q4FL"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

try { await signInAnonymously(auth); } catch (e) { console.warn("Anonymous auth failed (you can ignore in dev):", e); }

export {
  db, storage, collection, getDocs, getDoc, addDoc, doc, serverTimestamp, query, orderBy,
  ref, uploadBytes, getDownloadURL
};
