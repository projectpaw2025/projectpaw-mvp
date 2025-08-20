// api.js
import {
  db,
  storage,
  serverTimestamp,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as fLimit,
  updateDoc,
  ref,
  uploadBytesResumable,
  getDownloadURL
} from './firebase.js';
import { auth } from './firebase.js'; // ✅ 익명 인증 UID 사용 (rules: ownerUid == request.auth.uid)

// -------------------------------
// 이미지 압축 유틸
// -------------------------------
async function fileToDataURL(file) {
  return await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
async function loadImage(src) {
  return await new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}
async function compressImage(file, { maxDim = 1600, quality = 0.82 } = {}) {
  try {
    const src = await fileToDataURL(file);
    const img = await loadImage(src);
    const maxSide = Math.max(img.width, img.height);
    const ratio = Math.min(1, maxDim / maxSide);
    const tw = Math.round(img.width * ratio), th = Math.round(img.height * ratio);
    const c = document.createElement('canvas'); c.width = tw; c.height = th;
    c.getContext('2d').drawImage(img, 0, 0, tw, th);
    const blob = await new Promise(res => c.toBlob(res, 'image/jpeg', quality));
    return new File([blob], file.name.replace(/\.(png|webp)$/i, '.jpg'), { type: 'image/jpeg' });
  } catch (e) { console.warn('compress fail', e); return file; }
}

// -------------------------------
// Normalizer
// -------------------------------
function normalizeProject(id, data) {
  return { id, supportersCount: 0, ...data };
}

// -------------------------------
// 리스트 & 단건 조회
// -------------------------------
export async function apiListProjects({ limit = 20, status = 'all' } = {}) {
  let qy = query(collection(db, 'projects'), orderBy('createdAt', 'desc'), fLimit(limit));
  if (status === 'approved') {
    qy = query(collection(db, 'projects'), where('adminApproved', '==', true), orderBy('createdAt', 'desc'), fLimit(limit));
  } else if (status === 'pending') {
    qy = query(collection(db, 'projects'), where('adminApproved', '==', false), orderBy('createdAt', 'desc'), fLimit(limit));
  }
  const snap = await getDocs(qy);
  const out = [];
  snap.forEach(d => out.push(normalizeProject(d.id, d.data())));
  return out;
}

export async function apiGetProject(id) {
  const d = await getDoc(doc(db, 'projects', id));
  if (!d.exists()) throw new Error('NOT_FOUND');
  return normalizeProject(d.id, d.data());
}

// -------------------------------
// 파일 업로드 (Storage 규칙: 단일 단계 경로)
// -------------------------------
async function uploadFile(path, file) {
  const r = ref(storage, path);
  const meta = { contentType: (file && file.type) ? file.type : 'image/jpeg' };
  const task = uploadBytesResumable(r, file, meta);
  await new Promise((res, rej) => { task.on('state_changed', () => {}, rej, res); });
  return await getDownloadURL(task.snapshot.ref);
}

// -------------------------------
// 프로젝트 생성 (rules 준수: ownerUid == request.auth.uid 등)
// -------------------------------
export async function apiCreateProject(formOrObj) {
  const cRef = collection(db, 'projects');
  const dRef = doc(cRef);
  const id = dRef.id;

  // 입력 파싱
  let repFile = null, situFiles = [], rcptFiles = []; let payload = {};
  if (formOrObj instanceof FormData) {
    const fd = formOrObj;
    repFile = fd.get('representativeImage');
    situFiles = fd.getAll('situationImages').filter(Boolean);
    rcptFiles = fd.getAll('receiptImages').filter(Boolean);
    payload = {
      name: fd.get('name') || '',
      rescuerName: fd.get('rescuerName') || '',
      summary: fd.get('summary') || '',
      description: fd.get('description') || '',
      goalAmount: Number(fd.get('goalAmount') || 0),
      rescuerContribution: Number(fd.get('rescuerContribution') || 0),
      registrantKakaoId: fd.get('registrantKakaoId') || ''
    };
  } else {
    payload = { ...formOrObj };
  }

  // ✅ Firestore 규칙 충족: ownerUid는 인증된 UID와 동일해야 함
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('익명 인증이 아직 준비되지 않았습니다. 새로고침 후 다시 시도해주세요.');

  // 1) 문서 생성 (규칙: adminApproved=false, supportersCount=0, createdAt timestamp)
  const dataCreate = {
    ...payload,
    ownerUid: uid,                 // 🔑 규칙에서 요구
    adminApproved: false,
    supportersCount: 0,
    createdAt: serverTimestamp()
  };
  await setDoc(dRef, dataCreate);

  // 2) 이미지 업로드 (Storage 규칙에 맞춘 "단일 단계" 경로)
  let coverUrl = null;
  if (repFile && repFile.size) {
    const c = await compressImage(repFile, { maxDim: 1600, quality: 0.82 });
    coverUrl = await uploadFile(`covers/${id}_${Date.now()}_${c.name}`, c);
  }

  const galleryUrls = [];
  for (const f of situFiles) {
    if (f && f.size) {
      const c = await compressImage(f, { maxDim: 1600, quality: 0.82 });
      galleryUrls.push(await uploadFile(`gallery/${id}_${Date.now()}_${c.name}`, c));
    }
  }

  const receiptUrls = [];
  for (const f of rcptFiles) {
    if (f && f.size) {
      const c = await compressImage(f, { maxDim: 1600, quality: 0.82 });
      receiptUrls.push(await uploadFile(`receipts/${id}_${Date.now()}_${c.name}`, c));
    }
  }

  // 3) 문서에 이미지 URL 업데이트 (update 규칙: owner가 adminApproved=false인 상태에서 가능)
  await updateDoc(dRef, { representativeImageUrl: coverUrl || null, galleryUrls, receiptUrls });

  // 리턴(호출측에서 바로 상세로 이동할 때 사용)
  return { id, ...dataCreate, representativeImageUrl: coverUrl, galleryUrls, receiptUrls };
}

// -------------------------------
// 관리자 승인 토글
// -------------------------------
export async function apiToggleApprove(id, will) {
  const dRef = doc(db, 'projects', id);
  await updateDoc(dRef, { adminApproved: will });
}
