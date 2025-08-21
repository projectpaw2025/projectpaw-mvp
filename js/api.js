// assets/js/api.js
import { db, storage, auth, authReady } from "./firebase.js";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";

/** 공통: 파일을 Storage에 업로드 후 URL 리턴 */
async function uploadAndGetURL(file, path) {
  const r = ref(storage, path);
  await uploadBytes(r, file);
  return await getDownloadURL(r);
}

/** Firestore 전체 가져오기 → JS에서 정렬/필터 (서버타임스탬프 null 보호) */
export async function fetchAllProjects() {
  await authReady;
  const snap = await getDocs(collection(db, "projects"));
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  rows.sort(
    (a, b) =>
      (b?.createdAt?.seconds || 0) - (a?.createdAt?.seconds || 0)
  );
  return rows;
}

/** 승인된 프로젝트만 */
export async function fetchApprovedProjects() {
  const all = await fetchAllProjects();
  return all.filter((p) => p.adminApproved === true);
}

/** 단건 조회 */
export async function getProjectById(id) {
  await authReady;
  const refDoc = doc(db, "projects", id);
  const snap = await getDoc(refDoc);
  return snap.exists() ? { id, ...snap.data() } : null;
}

/** 승인/거절 */
export async function approveProject(id, approved = true) {
  await authReady;
  const refDoc = doc(db, "projects", id);
  await updateDoc(refDoc, { adminApproved: approved });
}

/** ✅ 핵심: 등록(권한 대기 + 이미지 업로드 + coverUrl 생성) */
export async function apiCreateProject(formEl) {
  // 🔒 익명 인증 준비가 끝날 때까지 대기 (권한 오류 방지)
  await authReady;

  const fd = new FormData(formEl);

  const name = (fd.get("name") || "").trim();
  const kakaoLink = (fd.get("kakaoLink") || "").trim();
  const description = (fd.get("description") || "").trim();
  const goalAmount = Number(fd.get("goalAmount") || 0);
  const rescuerContribution = Number(fd.get("rescuerContribution") || 0);

  const heroInput = document.getElementById("hero");
  const galleryInput = document.getElementById("gallery");
  const receiptsInput = document.getElementById("receipts");

  const heroFile = heroInput?.files?.[0] || null;
  const galleryFiles = galleryInput ? Array.from(galleryInput.files || []) : [];
  const receiptFiles = receiptsInput ? Array.from(receiptsInput.files || []) : [];

  if (!name || !kakaoLink || !heroFile) {
    throw new Error("필수 항목(이름/카카오링크/대표사진)을 입력하세요.");
  }

  // 미리 doc ID 만들기 (Storage 경로에 사용)
  const colRef = collection(db, "projects");
  const newDoc = doc(colRef); // auto id
  const id = newDoc.id;
  const ts = Date.now();

  // 1) 대표 이미지
  const coverPath = `covers/${id}-${ts}.jpg`;
  const coverUrl = await uploadAndGetURL(heroFile, coverPath);

  // 2) 갤러리/영수증 이미지
  const galleryUrls = [];
  for (let i = 0; i < galleryFiles.length; i++) {
    const p = `gallery/${id}/${i}-${ts}.jpg`;
    galleryUrls.push(await uploadAndGetURL(galleryFiles[i], p));
  }
  const receiptUrls = [];
  for (let i = 0; i < receiptFiles.length; i++) {
    const p = `receipts/${id}/${i}-${ts}.jpg`;
    receiptUrls.push(await uploadAndGetURL(receiptFiles[i], p));
  }

  // 3) Firestore 저장 (초기엔 비승인)
  const summary =
    description.split(/\r?\n/)[0]?.slice(0, 60) || "";

  const payload = {
    name,
    kakaoLink,
    description,
    summary,
    goalAmount,
    rescuerContribution,
    raisedAmount: 0,
    coverUrl,
    galleryUrls,
    receiptUrls,
    adminApproved: false,
    createdAt: serverTimestamp(),
  };

  await setDoc(newDoc, payload);
  return { id, ...payload };
}
