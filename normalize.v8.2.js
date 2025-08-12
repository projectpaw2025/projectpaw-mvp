
/* normalize.v8.2.js — permanent normalization & image fallback */
(function(){
  const FALLBACK = "images/login_cat2.jpg";
  const https = (u)=>{ try{ return (typeof u==="string" && u.startsWith("http:")) ? ("https:"+u.slice(5)) : u; }catch(_){ return u; } };
  function normalizeProject(p, idx){
    if(!p||typeof p!=='object') p={};
    const id = (p.id??idx??0);
    const status = p.status||'approved';
    const visibility = p.visibility||'public';
    let images = Array.isArray(p.images) ? p.images.slice() : [];
    if(!images.length && p.mainImage) images=[p.mainImage];
    if(!images.length) images=[FALLBACK];
    images = images.map(x=> https(x||FALLBACK));
    const mainImage = https(p.mainImage || images[0] || FALLBACK);
    const goal = +p.goalAmount||+p.targetAmount||0;
    const curr = +p.currentAmount||+p.raisedAmount||0;
    return {...p, id, status, visibility, images, mainImage,
      goalAmount: goal, targetAmount: goal, currentAmount: curr, raisedAmount: curr};
  }
  function normalizeList(list){ if(!Array.isArray(list)) return []; return list.map((p,i)=>normalizeProject(p,i)); }
  const _origGet = (typeof window.getProjects==='function') ? window.getProjects : function(){ try{return JSON.parse(localStorage.getItem('projects')||'[]');}catch(_){return []}};
  const _origSave = (typeof window.saveProjects==='function') ? window.saveProjects : function(list){ localStorage.setItem('projects', JSON.stringify(list||[])); };
  window.getProjects = function(){ const raw=_origGet()||[]; const norm=normalizeList(raw); try{ if(JSON.stringify(raw)!==JSON.stringify(norm)) _origSave(norm);}catch(_){ } return norm; };
  window.saveProjects = function(list){ const norm=normalizeList(list||[]); _origSave(norm); return norm; };
  window.addEventListener("error",(e)=>{ const t=e.target; if(t && t.tagName==="IMG"){ t.onerror=null; t.src=FALLBACK; }}, true);
  document.addEventListener('DOMContentLoaded', ()=>{
    const list=getProjects(); const byId=new Map(list.map(p=>[String(p.id),p]));
    document.querySelectorAll('img.card-img-top, #project-detail img, .project-hero img').forEach(img=>{
      const id=img.getAttribute('data-id'); let src=img.getAttribute('src');
      if(id && byId.has(String(id))) src = byId.get(String(id)).mainImage || byId.get(String(id)).images?.[0];
      img.src = https(src||FALLBACK) || FALLBACK;
      img.loading='lazy'; img.decoding='async';
    });
  });
})();