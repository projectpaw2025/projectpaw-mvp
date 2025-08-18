
// /js/uploader.js
const toBase64 = (file) => new Promise(res => {
  const fr = new FileReader();
  fr.onload = () => res(fr.result);
  fr.readAsDataURL(file);
});

// Single cover
const coverInput = document.querySelector("#cover");
const coverPreview = document.querySelector("#coverPreview");
coverInput?.addEventListener("change", async (e) => {
  const f = e.target.files?.[0];
  if(!f) return;
  const b64 = await toBase64(f);
  coverPreview.src = b64;
  coverPreview.dataset.src = b64;
});

// Multi helpers
const mountMulti = (inputSel, boxSel) => {
  const input = document.querySelector(inputSel);
  const box = document.querySelector(boxSel);
  input?.addEventListener("change", async (e) => {
    box.innerHTML = "";
    for (const f of e.target.files) {
      const b64 = await toBase64(f);
      const img = new Image(); img.src = b64; img.dataset.src = b64;
      const wrap = document.createElement("div"); wrap.className = "img-cell"; wrap.appendChild(img);
      box.appendChild(wrap);
    }
  });
};

mountMulti("#gallery", ".gallery-preview");
mountMulti("#receipts", ".receipt-preview");
