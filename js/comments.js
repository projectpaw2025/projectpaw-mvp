// js/comments.js
// Firestore 실시간 댓글 모듈 (api.js는 손대지 않음)
import "./firebase.js"; // 기본 앱 초기화 보장

import {
  getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import {
  getAuth, onAuthStateChanged, signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

// 익명 로그인 또는 기존 세션 대기
let _authReady;
function _ensureAuthPromise() {
  if (_authReady) return _authReady;
  _authReady = new Promise((resolve, reject) => {
    let unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          unsub && unsub();
          resolve(user);
        } else {
          const cred = await signInAnonymously(auth);
          unsub && unsub();
          resolve(cred.user);
        }
      } catch (e) {
        reject(e);
      }
    }, reject);
  });
  return _authReady;
}

export async function ensureAuth(){
  return _ensureAuthPromise();
}

export async function addComment(projectId, text){
  text = String(text||"").trim();
  if (!projectId || !text) return;
  if (text.length > 500) text = text.slice(0, 500);
  const user = await ensureAuth();
  const commentsRef = collection(db, "projects", projectId, "comments");
  await addDoc(commentsRef, {
    text,
    uid: user?.uid || "anon",
    createdAt: serverTimestamp()
  });
}

export function listenComments(projectId, callback){
  const commentsRef = collection(db, "projects", projectId, "comments");
  const q = query(commentsRef, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap)=>{
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data);
  });
}
