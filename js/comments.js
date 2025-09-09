// js/comments.js
// Firestore 댓글: 익명 인증, 작성/삭제, 페이지네이션(5개 단위)
import "./firebase.js";

import {
  getFirestore, collection, addDoc, query, orderBy, limit, startAfter, getDocs, serverTimestamp, doc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import {
  getAuth, onAuthStateChanged, signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

let _authReady;
function _ensureAuthPromise() {
  if (_authReady) return _authReady;
  _authReady = new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
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

export async function ensureAuth(){ return _ensureAuthPromise(); }
export function getUid(){ return auth?.currentUser?.uid || null; }

/** 댓글 작성 */
export async function addComment(projectId, text, name=null){
  text = String(text||"").trim();
  if (!projectId || !text) return;
  if (text.length > 500) text = text.slice(0, 500);
  const user = await ensureAuth();
  const commentsRef = collection(db, "projects", projectId, "comments");
  await addDoc(commentsRef, {
    text,
    name: name ? String(name).slice(0,30) : null,
    uid: user?.uid || "anon",
    createdAt: serverTimestamp()
  });
}

/** 댓글 삭제(본인 또는 관리자 → 규칙 필요) */
export async function deleteComment(projectId, commentId){
  await ensureAuth();
  const dref = doc(db, "projects", projectId, "comments", commentId);
  await deleteDoc(dref);
}

/** 페이지네이션: 5개 단위 */
export async function listCommentsPage(projectId, pageSize=5, cursorDoc=null){
  const commentsRef = collection(db, "projects", projectId, "comments");
  const qBase = query(commentsRef, orderBy("createdAt", "desc"), limit(pageSize+1));
  const q = cursorDoc ? query(commentsRef, orderBy("createdAt","desc"), startAfter(cursorDoc), limit(pageSize+1)) : qBase;
  const snap = await getDocs(q);
  const docs = snap.docs;
  const hasMore = docs.length > pageSize;
  const pageDocs = hasMore ? docs.slice(0, pageSize) : docs;
  const items = pageDocs.map(d => ({ id: d.id, ...d.data() }));
  const lastDoc = pageDocs.length ? pageDocs[pageDocs.length-1] : null;
  return { items, lastDoc, hasMore };
}
