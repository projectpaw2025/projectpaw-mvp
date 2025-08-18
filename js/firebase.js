
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
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
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
