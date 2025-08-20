import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAnalytics, isSupported } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js';
import { getFirestore, serverTimestamp, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit as fLimit, updateDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';

const firebaseConfig = {
  apiKey: "AIzaSyCNguz8K5MehFR5nydZ293hI60FQ9Jh5Tk",
  authDomain: "projectpaw-bf042.firebaseapp.com",
  projectId: "projectpaw-bf042",
  storageBucket: "projectpaw-bf042.firebasestorage.app",
  messagingSenderId: "340056180297",
  appId: "1:340056180297:web:20ae730ee45b0563062198",
  measurementId: "G-FEMJ80972P"
};

export const app = initializeApp(firebaseConfig);
isSupported().then(ok => { if(ok) getAnalytics(app); });

export const db = getFirestore(app);
export const storage = getStorage(app);

export { serverTimestamp, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, fLimit, updateDoc, ref, uploadBytesResumable, getDownloadURL };
