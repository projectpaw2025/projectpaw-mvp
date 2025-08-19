
// /js/app.js
export const SCHEMA = {
  id: "",
  title: "",
  summary: "",
  description: "",
  targetAmount: 0,
  raisedAmount: 0,
  selfPayAmount: 0,
  kakaoLink: "",
  status: "pending",   // pending|approved
  images: {
    cover: "",
    gallery: [],
    receipts: []
  },
  createdAt: 0
};

import { db, collection, getDocs, getDoc, addDoc, doc, serverTimestamp, query, orderBy } from "./firebase.js";

export const storage = {
  async getAll() {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...d.data(), id: d.id }));
},
  async saveAll(_) {
    console.warn("saveAll is not used in Firestore mode.");
  },
  async add(p) {
    const { id: _drop, ...rest } = p; // ensure Firestore owns the id
    const payload = { ...rest, createdAt: serverTimestamp() };
    const refDoc = await addDoc(collection(db, "projects"), payload);
    return { ...rest, id: refDoc.id };
  },
  async byId(id) {
    const s = await getDoc(doc(db, "projects", id));
    return s.exists() ? { id, ...s.data() } : null;
  }
};

export const fmt = (n) => {
  try {
    return Number(n||0).toLocaleString("ko-KR");
  } catch {
    return String(n);
  }
};
export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : (Date.now()+"-"+Math.random().toString(16).slice(2)));
