// js/api.js
import { db, storage, auth } from "./firebase.js";
import {
  collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit, where, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// ----------------- 프로젝트 생성 -----------------
export async function apiCreateProject(data) {
  // ✅ 로그인 체크 완화 (베타 모드)
  const user = auth.currentUser || { uid: "guest" };

  // 파일 업로드 helper
  async function uploadAndGetURL(path, file) {
    if (!file) return null;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

  const coverUrl = await uploadAndGetURL(`covers/${user.uid}_${Date.now()}`, data.coverFile);
  const galleryUrls = [];
  if (data.galleryFiles) {
    for (const f of data.galleryFiles) {
      const u = await uploadAndGetURL(`gallery/${user.uid}_${Date.now()}_${f.name}`, f);
      if (u) galleryUrls.push(u);
    }
  }
  const receiptUrls = [];
  if (data.receiptFiles) {
    for (const f of data.receiptFiles) {
      const u = await uploadAndGetURL(`receipts/${user.uid}_${Date.now()}_${f.name}`, f);
      if (u) receiptUrls.push(u);
    }
  }

  const docRef = await addDoc(collection(db, "projects"), {
    name: data.name,
    summary: data.summary,
    keyMessage: data.keyMessage || "",
    goalAmount: Number(data.goalAmount || 0),
    currentAmount: 0,
    supporterCount: 0,
    coverUrl,
    galleryUrls,
    receiptUrls,
    status: "pending",
    createdAt: serverTimestamp(),
    ownerUid: user.uid,
    adminApproved: false,
  });

  return docRef.id;
}

// ----------------- 프로젝트 목록 -----------------
export async function apiListProjects({ status = null, limit: lim = 20 } = {}) {
  let q = query(collection(db, "projects"), orderBy("createdAt", "desc"), limit(lim));
  if (status) q = query(collection(db, "projects"), where("status", "==", status), orderBy("createdAt", "desc"), limit(lim));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ----------------- 프로젝트 상세 -----------------
export async function apiGetProject(id) {
  const refDoc = doc(db, "projects", id);
  const snap = await getDoc(refDoc);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}
