// js/api.js
import {
  getFirestore, collection, getDocs, query, where, doc, getDoc,
  addDoc, updateDoc, deleteDoc, serverTimestamp,
  runTransaction, setDoc
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
// 유틸
// ------------------------------
function toInt(v) {
  if (!v) return 0;
  return parseInt(v, 10) || 0;
}

// (선택) 파일 업로드 유틸 - 필요 시 사용
export async function uploadFile(path, fileOrBlob) {
  if (!path || !fileOrBlob) return null;
  const r = ref(storage, path);
  const snap = await uploadBytes(r, fileOrBlob);
  return await getDownloadURL(snap.ref);
}

// ------------------------------
// 조회 함수
// ------------------------------

// 모든 프로젝트 불러오기 (관리자용)
export async function fetchAllProjects() {
  const snapshot = await getDocs(collection(db, "projects"));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// 승인된 프로젝트만 불러오기
export async function fetchApprovedProjects() {
  const q = query(collection(db, "projects"), where("adminApproved", "==", true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ID로 프로젝트 1건 조회
export async function getProjectById(id) {
  if (!id) return null;
  const refDoc = doc(db, "projects", id);
  const snap = await getDoc(refDoc);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// ------------------------------
// 쓰기 함수
// ------------------------------

// 프로젝트 생성
export async function createProject(data = {}) {
  const now = serverTimestamp();
  const uid = auth?.currentUser?.uid || null;
  const payload = {
    name: data.name || "",
    description: data.description || "",
    summary: data.summary || "",
    keyMessage: data.keyMessage || "",
    goalAmount: toInt(data.goalAmount),
    currentAmount: toInt(data.currentAmount),
    supporterCount: toInt(data.supporterCount),
    adminApproved: !!data.adminApproved,       // 기본 false
    projectNumber: data.projectNumber || null, // 승인 시 부여
    createdAt: now,
    ownerUid: uid,
    ...data
  };
  const col = collection(db, "projects");
  const added = await addDoc(col, payload);
  return { id: added.id };
}

// 프로젝트 수정
export async function updateProject(id, data = {}) {
  if (!id) throw new Error("id is required");
  const refDoc = doc(db, "projects", id);
  await updateDoc(refDoc, data);
}

// 프로젝트 삭제
export async function deleteProject(id) {
  const refDoc = doc(db, "projects", id);
  await deleteDoc(refDoc);
}

// ------------------------------
// 관리자 승인 시 자동 넘버링
// ------------------------------
/**
 * 관리자 승인
 * - counters/projects 문서에 lastProjectNumber를 저장/증가
 * - projects/{id} 문서에 adminApproved=true, projectNumber=n 배정
 * - approvedAt 최초 승인 시각 기록
 * - extra.registrantKakaoId 전달 시 반영
 */
export async function approveProject(id, extra = {}) {
  const projectRef = doc(db, "projects", id);
  const counterRef = doc(db, "counters", "projects"); // lastProjectNumber 저장소

  await runTransaction(db, async (tx) => {
    const projSnap = await tx.get(projectRef);
    if (!projSnap.exists()) throw new Error("프로젝트가 존재하지 않습니다.");

    const p = projSnap.data();
    let nextNumber = p.projectNumber || null;

    // 이미 승인/번호가 있으면 재할당하지 않음 (중복 방지)
    if (!p.adminApproved || !p.projectNumber) {
      const counterSnap = await tx.get(counterRef);
      const last =
        counterSnap.exists() && typeof counterSnap.data().lastProjectNumber === "number"
          ? counterSnap.data().lastProjectNumber
          : 0;
      nextNumber = last + 1;

      if (counterSnap.exists()) {
        tx.update(counterRef, { lastProjectNumber: nextNumber });
      } else {
        tx.set(counterRef, { lastProjectNumber: nextNumber });
      }
    }

    const updateData = {
      adminApproved: true,
      projectNumber: nextNumber,
      approvedAt: p.approvedAt || serverTimestamp(),
    };

    if (extra && typeof extra.registrantKakaoId === "string" && extra.registrantKakaoId.trim()) {
      updateData.registrantKakaoId = extra.registrantKakaoId.trim();
    }

    tx.update(projectRef, updateData);
  });
}

// ------------------------------
// 호환용 alias
// ------------------------------
export async function apiListProjects(opts = {}) {
  const status = opts.status || "approved";
  if (status === "approved") {
    return await fetchApprovedProjects();
  }
  return await fetchAllProjects();
}
