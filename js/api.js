import {
  getFirestore, collection, getDocs, query, where, doc, getDoc,
  addDoc, updateDoc, deleteDoc, runTransaction, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { app } from "./firebase.js";

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// ------------------------------
// 헬퍼 함수
// ------------------------------
async function uploadAndGetURL(path, file) {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

function toInt(v) {
  if (!v) return 0;
  return parseInt(v, 10) || 0;
}

// ------------------------------
// 조회 함수
// ------------------------------

// 모든 프로젝트 불러오기 (관리자용)
export async function fetchAllProjects() {
  const snapshot = await getDocs(collection(db, "projects"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// 승인된 프로젝트만 불러오기
export async function fetchApprovedProjects() {
  const q = query(collection(db, "projects"), where("adminApproved", "==", true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// 특정 프로젝트 상세 가져오기
export async function getProjectById(id) {
  const ref = doc(db, "projects", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// ------------------------------
// 등록 함수 (🔥 넘버링 추가됨)
// ------------------------------
export async function apiCreateProject(data) {
  const user = auth.currentUser;
  if (!user) throw new Error("로그인이 필요합니다.");

  let coverUrl = null;
  if (data.coverFile) {
    coverUrl = await uploadAndGetURL(`covers/${user.uid}_${Date.now()}`, data.coverFile);
  }

  let galleryUrls = [];
  if (data.galleryFiles && data.galleryFiles.length) {
    for (let f of data.galleryFiles) {
      const url = await uploadAndGetURL(`gallery/${user.uid}_${Date.now()}_${f.name}`, f);
      galleryUrls.push(url);
    }
  }

  let receiptUrls = [];
  if (data.receiptFiles && data.receiptFiles.length) {
    for (let f of data.receiptFiles) {
      const url = await uploadAndGetURL(`receipts/${user.uid}_${Date.now()}_${f.name}`, f);
      receiptUrls.push(url);
    }
  }

  // 🔑 프로젝트 넘버링 발급 (transaction)
  const counterRef = doc(db, "counters", "projects");
  let newNumber = 0;

  await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(counterRef);
    if (!counterSnap.exists()) {
      transaction.set(counterRef, { lastNumber: 0 });
      newNumber = 1;
    } else {
      const last = counterSnap.data().lastNumber || 0;
      newNumber = last + 1;
      transaction.update(counterRef, { lastNumber: newNumber });
    }
  });

  const ref = await addDoc(collection(db, "projects"), {
    ownerUid: user.uid,
    projectNumber: newNumber,        // ✅ 시퀀스 번호 부여
    name: data.name,
    rescuerName: data.rescuerName || "",
    summary: data.summary || "",
    description: data.description || "",
    goalAmount: toInt(data.goalAmount),
    rescuerContribution: toInt(data.rescuerContribution),
    privateContact: data.privateContact || "",   // 관리자용 연락처
    registrantKakaoId: data.registrantKakaoId || "",
    coverUrl,
    galleryUrls,
    receiptUrls,
    adminApproved: false,
    supporterCount: 0,
    currentAmount: 0,
    createdAt: serverTimestamp()
  });

  return ref.id;
}

// ------------------------------
// 관리자용 함수
// ------------------------------

// 승인 처리 (카카오톡 오픈채팅 ID 함께 저장 가능)
export async function approveProject(id, extra = {}) {
  const ref = doc(db, "projects", id);

  const updateData = { adminApproved: true };
  if (extra.registrantKakaoId) {
    updateData.registrantKakaoId = extra.registrantKakaoId.trim();
  }

  await updateDoc(ref, updateData);
}

// 삭제 처리
export async function deleteProject(id) {
  const ref = doc(db, "projects", id);
  await deleteDoc(ref);
}

// ------------------------------
// 호환용 alias
// ------------------------------
export async function apiListProjects(opts = {}) {
  const status = opts.status || 'approved';
  if (status === 'approved') {
    return await fetchApprovedProjects();
  }
  return await fetchAllProjects();
}
