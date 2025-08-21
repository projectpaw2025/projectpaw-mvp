// assets/js/api.js
// Firebase 앱 객체는 firebase.js에서 초기화/내보냅니다.
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

/* -------------------------------------------
 * Helpers
 * -----------------------------------------*/

/** Blob/File을 지정 경로에 업로드 후 다운로드 URL 반환 */
async function uploadAndGetURL(file, path) {
  const r = ref(storage, path);
  await uploadBytes(r, file);
  return await getDownloadURL(r);
}

/** 숫자 필드를 규칙(int) 통과 가능하게 정수화 */
function toInt(n, fallback = 0) {
  const v = Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.trunc(v);
}

/* -------------------------------------------
 * Reads
 * -----------------------------------------*/

/** 전체 프로젝트(클라이언트 정렬) */
export async function fetchAllProjects() {
  await authReady; // 익명 포함 인증 세션 보장
  const snap = await getDocs(collection(db, "projects"));
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // createdAt(serverTimestamp) 없는 문서 대비 보조 정렬
  rows.sort(
    (a, b) => (b?.createdAt?.seconds || 0) - (a?.createdAt?.seconds || 0)
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

/* -------------------------------------------
 * Writes
 * -----------------------------------------*/

/**
 * 승인 토글(관리자 전용 규칙 필요)
 * - 주의: Firestore 규칙이 isAdmin()을 요구한다면,
 *   현재 로그인 사용자에게 커스텀 클레임(admin=true)이 있어야 성공합니다.
 */
export async function approveProject(id, approved = true) {
  await authReady;
  const refDoc = doc(db, "projects", id);
  await updateDoc(refDoc, { adminApproved: approved });
}

/**
 * 프로젝트 생성
 * - Firestore 규칙 요구 필드 준수:
 *   ownerUid == auth.uid, supportersCount == 0, adminApproved == false,
 *   createdAt is timestamp, 기타 길이/타입 제한
 * - Storage 업로드 후 coverUrl / galleryUrls / receiptUrls 저장
 */
export async function apiCreateProject(formEl) {
  await authReady;
  const user = auth.currentUser;
  if (!user) {
    throw new Error("인증 세션을 초기화하지 못했습니다.");
  }

  const fd = new FormData(formEl);

  const name = (fd.get("name") || "").trim();
  const kakaoLink = (fd.get("kakaoLink") || "").trim();
  const description = (fd.get("description") || "").trim();

  const goalAmount = toInt(fd.get("goalAmount"));
  const rescuerContribution = toInt(fd.get("rescuerContribution"));

  const heroInput = document.getElementById("hero");
  const galleryInput = document.getElementById("gallery");
  const receiptsInput = document.getElementById("receipts");

  const heroFile = heroInput?.files?.[0] || null;
  const galleryFiles = galleryInput ? Array.from(galleryInput.files || []) : [];
  const receiptFiles = receiptsInput ? Array.from(receiptsInput.files || []) : [];

  if (!name || !kakaoLink || !heroFile) {
    throw new Error("필수 항목(이름/카카오링크/대표사진)을 입력하세요.");
  }

  // 새 문서 ID 선할당 (Storage 경로에 사용)
  const colRef = collection(db, "projects");
  const newDoc = doc(colRef); // auto id
  const id = newDoc.id;
  const ts = Date.now();

  // 1) 대표 이미지 업로드
  const coverPath = `covers/${id}-${ts}.jpg`;
  const coverUrl = await uploadAndGetURL(heroFile, coverPath);

  // 2) 갤러리/영수증 업로드 (규칙 상 최대 20장 가드)
  const galleryUrls = [];
  for (let i = 0; i < Math.min(galleryFiles.length, 20); i++) {
    const p = `gallery/${id}/${i}-${ts}.jpg`;
    galleryUrls.push(await uploadAndGetURL(galleryFiles[i], p));
  }

  const receiptUrls = [];
  for (let i = 0; i < Math.min(receiptFiles.length, 20); i++) {
    const p = `receipts/${id}/${i}-${ts}.jpg`;
    receiptUrls.push(await uploadAndGetURL(receiptFiles[i], p));
  }

  // 3) 본문/요약 생성
  const summary = description.split(/\r?\n/)[0]?.slice(0, 60) || "";

  // 4) 규칙 요구 필드 포함한 payload
  const payload = {
    // 규칙 강제 필드
    ownerUid: user.uid,
    supportersCount: 0,
    adminApproved: false,

    // 본문
    name,
    kakaoLink,
    description,
    summary,

    // 금액(정수)
    goalAmount,
    rescuerContribution,
    raisedAmount: 0,

    // 이미지 집합
    coverUrl,
    galleryUrls,
    receiptUrls,

    // 타임스탬프
    createdAt: serverTimestamp(),
  };

  // 5) 저장
  await setDoc(newDoc, payload);
  return { id, ...payload };
}
