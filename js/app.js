
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

export const storage = {
  getAll() {
    try { return JSON.parse(localStorage.getItem("projects") || "[]"); }
    catch { return []; }
  },
  saveAll(list) {
    localStorage.setItem("projects", JSON.stringify(list));
  },
  add(p) {
    const list = storage.getAll();
    list.push(p);
    storage.saveAll(list);
    return p;
  },
  byId(id) {
    return storage.getAll().find(p => p.id === id);
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
