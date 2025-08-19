// js/app.js
import {
  db,
  collection, addDoc, getDocs, getDoc, doc,
  query, orderBy, serverTimestamp, updateDoc
} from "./firebase.js";

// 숫자 포맷터 (원화 간단 표기)
export function fmt(n) {
  const x = Number(n || 0);
  return x.toLocaleString("ko-KR");
}

// 🔒 업데이트 허용 필드 화이트리스트
const ALLOWED_UPDATE_FIELDS = new Set([
  "title", "animalName", "rescuerName", "summary", "description",
  "targetAmount", "selfPayAmount", "images",
  "status", "kakaoLink",
  "raisedAmount"
]);

function pickAllowed(partial) {
  const out = {};
  for (const k of Object.keys(partial || {})) {
    if (ALLOWED_UPDATE_FIELDS.has(k)) out[k] = partial[k];
  }
  if ("createdAt" in out) delete out.createdAt;
  if ("id" in out) delete out.id;
  return out;
}

export const storage = {
  async getAll() {
    const snap = await getDocs(query(collection(db, "projects"), orderBy("createdAt", "desc")));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }));
  },

  async byId(id) {
    if (!id) return null;
    const ref = doc(db, "projects", id);
    const s = await getDoc(ref);
    return s.exists() ? ({ ...s.data(), id: s.id }) : null;
  },

  async add(p) {
    const { id: _drop, createdAt: _c, ...rest } = p || {};
    const payload = { ...rest, createdAt: serverTimestamp() };
    const ref = await addDoc(collection(db, "projects"), payload);
    return { ...rest, id: ref.id };
  },

  async update(id, partial) {
    if (!id) throw new Error("id가 필요합니다");
    const safe = pickAllowed(partial);
    if (!Object.keys(safe).length) {
      throw new Error("업데이트할 유효한 필드가 없습니다");
    }
    const ref = doc(db, "projects", id);
    await updateDoc(ref, safe);
    const after = await getDoc(ref);
    return { ...after.data(), id: after.id };
  }
};
