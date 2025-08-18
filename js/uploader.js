
// /js/uploader.js — Firebase Storage uploader + previews
import { storage as fbStorage, ref, uploadBytes, getDownloadURL } from "./firebase.js";

const toBase64 = (file) => new Promise(res => {
  const fr = new FileReader();
  fr.onload = () => res(fr.result);
  fr.readAsDataURL(file);
});

export async function uploadFile(folder, file) {
  const safeName = `${Date.now()}_${(file.name||'file').replace(/[^a-zA-Z0-9._-]/g,'_')}`;
  const path = `${folder}/${safeName}`;
  const fileRef = ref(fbStorage, path);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
}

// Single cover preview
const coverInput = document.querySelector("#cover");
const coverPreview = document.querySelector("#coverPreview");
coverInput?.addEventListener("change", async (e) => {
  const f = e.target.files?.[0];
  if(!f) return;
  const b64 = await toBase64(f);
  coverPreview.src = b64;
});

// Multi previews
const mountMulti = (inputSel, boxSel) => {
  const input = document.querySelector(inputSel);
  const box = document.querySelector(boxSel);
  input?.addEventListener("change", async (e) => {
    box.innerHTML = "";
    for (const f of e.target.files) {
      const b64 = await toBase64(f);
      const img = new Image(); img.src = b64;
      const wrap = document.createElement("div"); wrap.className = "img-cell"; wrap.appendChild(img);
      box.appendChild(wrap);
    }
  });
};

mountMulti("#gallery", ".gallery-preview");
mountMulti("#receipts", ".receipt-preview");
