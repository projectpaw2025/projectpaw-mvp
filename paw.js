
const PAW_KEY = "paw_projects";
function getProjects(){try{const raw=localStorage.getItem(PAW_KEY);return raw?JSON.parse(raw):[]}catch(e){console.warn("Corrupt storage, resetting",e);localStorage.removeItem(PAW_KEY);return []}}
function saveProjects(projects){localStorage.setItem(PAW_KEY, JSON.stringify(projects));}
function upsertProject(p){const all=getProjects();const idx=all.findIndex(x=>x.id===p.id);if(idx>=0) all[idx]=p; else all.push(p);saveProjects(all);}
function formatCurrency(n){if(isNaN(n)) return "₩0";return n.toLocaleString('ko-KR',{style:'currency',currency:'KRW',maximumFractionDigits:0});}
function calcProgress(p){const raised=Number(p.raisedAmount||0);const goal=Math.max(1,Number(p.goalAmount||0));return Math.max(0,Math.min(100,Math.round((raised/goal)*100)));}
function parseFilesToDataURLs(fileList){const files=Array.from(fileList||[]);return Promise.all(files.map(f=>new Promise(res=>{const reader=new FileReader();reader.onload=e=>res({name:f.name,dataUrl:e.target.result});reader.readAsDataURL(f);})));}
function renderCard(p){const pct=calcProgress(p);const img=(p.representativeImage&&p.representativeImage.dataUrl)?p.representativeImage.dataUrl:"";return `
<article class="card">
  <img src="${img}" alt="" onerror="this.style.display='none'"/>
  <div class="body">
    <div class="toolbar" style="justify-content:space-between">
      <span class="badge">진행중</span>
      <small class="muted">${new Date(p.createdAt).toLocaleDateString('ko-KR')}</small>
    </div>
    <strong>${p.name||"이름 미정"}</strong>
    <small class="muted">${p.summary||""}</small>
    <div class="progress-wrap"><div class="progress" style="width:${pct}%"></div></div>
    <small class="muted">목표 ${formatCurrency(Number(p.goalAmount||0))} · 구조자 부담 ${formatCurrency(Number(p.rescuerContribution||0))}</small>
    <button class="btn full" onclick="location.href='project.html?id=${encodeURIComponent(p.id)}'">상세보기</button>
  </div>
</article>`;}
function populateCards(rootSelector, limit=null){const root=document.querySelector(rootSelector);const items=getProjects().sort((a,b)=>b.createdAt-a.createdAt);if(items.length===0){root.innerHTML=`<div class="empty">아직 등록된 프로젝트가 없습니다. <br/><br/><a class="btn" href="create.html">첫 프로젝트 등록하기</a></div>`;return;}const list=typeof limit==="number"?items.slice(0,limit):items;root.innerHTML=list.map(renderCard).join("");}
function loadProjectFromUrl(){const params=new URLSearchParams(location.search);const id=params.get("id");const p=getProjects().find(x=>String(x.id)===String(id));return p||null;}
function copy(text){navigator.clipboard.writeText(text).then(()=>{alert("링크가 복사되었습니다.");}).catch(()=>{prompt("복사 실패. 수동으로 복사하세요:", text);});}
