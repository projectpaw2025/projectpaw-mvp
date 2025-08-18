
// /js/utils.js
export const percent = (raised, target) => {
  raised = Number(raised||0); target = Number(target||0);
  if (!target || target <= 0) return 0;
  const p = Math.min(100, Math.max(0, Math.round((raised/target)*100)));
  return p;
};

export const toast = (msg) => {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(()=>el.classList.remove("show"), 1800);
};

export const esc = (s="") => (s || "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
