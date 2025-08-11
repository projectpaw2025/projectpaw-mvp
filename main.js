
// ---------- Utils ----------
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
const fmt = new Intl.NumberFormat('ko-KR');

function getProjects(){ try{ return JSON.parse(localStorage.getItem("projects")||"[]"); }catch(_){ return []; } }
function saveProjects(list){ localStorage.setItem("projects", JSON.stringify(list)); }
function getUpdates(){ try{ return JSON.parse(localStorage.getItem("updates")||"[]"); }catch(_){ return []; } }
function saveUpdates(list){ localStorage.setItem("updates", JSON.stringify(list)); }

// Backward compatibility: normalize legacy projects
(function normalize(){
  const list = getProjects().map(p => {
    if(!p.images){
      p.images = p.image ? [p.image] : [];
    }
    if(typeof p.currentAmount === "undefined") p.currentAmount = 0;
    if(!p.status) p.status = "pending";
    return p;
  });
  saveProjects(list);
})();

function badgeFor(status){
  if(status === "approved") return '<span class="badge bg-success-subtle text-success">승인됨</span>';
  return '<span class="badge bg-warning-subtle text-warning">대기</span>';
}
function barClass(percent){
  if(percent >= 80) return "bg-success";
  if(percent >= 50) return "bg-warning";
  return "bg-danger";
}
function percent(current, goal){
  const g = +goal || 0;
  const c = +current || 0;
  if(g <= 0) return 0;
  return Math.min(100, Math.round((c/g)*100));
}

function makeCarousel(images, id){
  if(!images || !images.length){
    return `<img src="" class="card-img-top" alt="no image">`;
  }
  if(images.length === 1){
    return `<img src="${images[0]}" class="card-img-top" alt="project image" loading="lazy">`;
  }
  const items = images.map((src, i) => `
    <div class="carousel-item ${i===0?"active":""}">
      <img src="${src}" class="d-block w-100 card-img-top" alt="slide ${i+1}" loading="lazy">
    </div>`).join("");
  return `
  <div id="carousel-${id}" class="carousel slide" data-bs-ride="carousel">
    <div class="carousel-inner">${items}</div>
    <button class="carousel-control-prev" type="button" data-bs-target="#carousel-${id}" data-bs-slide="prev">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Previous</span>
    </button>
    <button class="carousel-control-next" type="button" data-bs-target="#carousel-${id}" data-bs-slide="next">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Next</span>
    </button>
  </div>`;
}

function makeCard(p){
  const id = p.id;
  const pr = percent(p.currentAmount, p.goalAmount);
  const col = document.createElement("div");
  col.className = "col-12 col-sm-6 col-lg-4";
  col.innerHTML = `
    <div class="card-paw h-100 card-dim ${p.status === "pending" ? "pending" : ""}">
      <div class="position-absolute m-2">${badgeFor(p.status)}</div>
      <a class="d-block" href="project.html?id=${encodeURIComponent(p.id)}">
        ${makeCarousel(p.images, id)}
      </a>
      <div class="p-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <small class="text-secondary">자기부담 ${fmt.format(+p.ownerAmount||0)}원</small>
          <small class="text-secondary">목표 ${fmt.format(+p.goalAmount||0)}원</small>
        </div>
        <h5 class="mb-1 text-truncate">${p.name||""}</h5>
        <p class="text-secondary small mb-2 two-lines">${p.description||""}</p>
        <div class="progress mb-2" style="height:8px;">
          <div class="progress-bar ${barClass(pr)}" style="width:${pr}%"></div>
        </div>
        <div class="d-flex justify-content-between small text-secondary">
          <div>₩${fmt.format(+p.currentAmount||0)}</div>
          <div>${pr}%</div>
        </div>
        <div class="d-flex justify-content-end mt-2">
          <a class="btn btn-sm btn-primary" href="project.html?id=${encodeURIComponent(p.id)}"><i class="bi bi-heart me-1"></i>후원하기</a>
        </div>
      </div>
    </div>`;
  return col;
}

// Home render (max 4)
(function renderHome(){
  const wrap = $("#home-projects");
  if(!wrap) return;
  const list = getProjects();
  if(!list.length){
    wrap.innerHTML = '<div class="col-12"><div class="alert alert-light border">아직 등록된 프로젝트가 없습니다. 첫 번째 이야기를 만들어 주세요.</div></div>';
    return;
  }
  list.slice(0,4).forEach(p => wrap.appendChild(makeCard(p)));
})();

// List render with search & status filter
(function renderList(){
  const wrap = $("#project-list");
  if(!wrap) return;
  let source = getProjects();
  let list = source;

  const apply = () => {
    wrap.innerHTML = "";
    if(!list.length){
      wrap.innerHTML = '<div class="col-12"><div class="alert alert-light border">프로젝트가 없습니다.</div></div>';
      return;
    }
    list.forEach(p => wrap.appendChild(makeCard(p)));
  };
  apply();

  const search = $("#searchInput");
  const clear = $("#clearSearch");
  const filter = $("#statusFilter");

  const doFilter = () => {
    const q = (search?.value || "").trim().toLowerCase();
    const st = filter?.value || "";
    list = source.filter(p => {
      const okText = !q || (p.name||"").toLowerCase().includes(q) || (p.description||"").toLowerCase().includes(q);
      const okSt = !st || p.status === st;
      return okText && okSt;
    });
    apply();
  };

  search?.addEventListener("input", doFilter);
  filter?.addEventListener("change", doFilter);
  clear?.addEventListener("click", () => { if(search) search.value=""; if(filter) filter.value=""; list = source; apply(); });
})();

// Detail render + updates tab
(function renderDetail(){
  const wrap = $("#project-detail");
  if(!wrap) return;

  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const project = getProjects().find(x => String(x.id) === String(id));
  if(!project){
    wrap.innerHTML = '<div class="col-12"><div class="alert alert-danger">프로젝트를 찾을 수 없습니다.</div></div>';
    return;
  }
  const pr = percent(project.currentAmount, project.goalAmount);

  // Detail header with carousel
  wrap.innerHTML = `
    <div class="col-lg-6">
      ${makeCarousel(project.images, "detail-"+project.id)}
    </div>
    <div class="col-lg-6">
      <div class="d-flex align-items-center gap-2 mb-2">
        ${badgeFor(project.status)}
        <small class="text-secondary">자기부담 ${fmt.format(+project.ownerAmount||0)}원</small>
      </div>
      <h1 class="h3 fw-bold">${project.name||""}</h1>
      <p class="text-secondary">${project.description||""}</p>
      <div class="d-flex flex-wrap gap-4 align-items-center my-3">
        <div><div class="text-secondary small">목표 금액</div><div class="h5 mb-0">₩${fmt.format(+project.goalAmount||0)}</div></div>
        <div><div class="text-secondary small">현재 모금액</div><div class="h5 mb-0">₩${fmt.format(+project.currentAmount||0)}</div></div>
      </div>
      <div class="progress mb-2" style="height:10px;">
        <div class="progress-bar ${barClass(pr)}" style="width:${pr}%"></div>
      </div>
      <div class="small text-secondary mb-3">${pr}% 달성</div>
      ${project.kakaoLink ? `<a class="btn btn-primary btn-lg" href="${project.kakaoLink}" target="_blank" rel="noopener"><i class="bi bi-chat-dots-fill me-1"></i>카카오톡으로 연결</a>` : `<div class="alert alert-light border small">카카오톡 링크가 등록되지 않았습니다.</div>`}
      <hr class="my-4">
      <div class="small text-secondary">철학</div>
      <p class="mb-0">책임의 끝과 공감의 시작이 만나는 곳. Project.PAW는 따뜻한 마음을 안전하게 연결합니다.</p>
    </div>
  `;

  // Intro tab content (can hold more structured info later)
  $("#intro-content").innerHTML = `
    <div class="alert alert-light border small">등록자 후기와 영수증 요약은 <strong>후기</strong> 탭에서 확인하세요.</div>
  `;

  // Render updates timeline
  const updatesWrap = $("#updates-list");
  const all = getUpdates().filter(u => String(u.projectId) === String(project.id));
  all.sort((a,b)=> new Date(b.date) - new Date(a.date));
  if(!all.length){
    updatesWrap.innerHTML = '<div class="alert alert-light border">아직 후기가 없습니다.</div>';
  }else{
    updatesWrap.innerHTML = "";
    all.forEach(u => {
      const imgs = (u.images||[]).map(src => `<img src="${src}" class="rounded" style="width:90px;height:90px;object-fit:cover">`).join("");
      const item = document.createElement("div");
      item.className = "p-3 border rounded-3 bg-white shadow-sm";
      item.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-1">
          <strong>${new Date(u.date).toLocaleDateString("ko-KR")}</strong>
          <small class="text-secondary">${u.author||"등록자"}</small>
        </div>
        <div class="mb-2">${(u.content||"").replace(/\n/g,"<br>")}</div>
        <div class="d-flex gap-2 flex-wrap">${imgs}</div>
      `;
      updatesWrap.appendChild(item);
    });
  }

  // Handle new update submit
  const updateForm = $("#updateForm");
  updateForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const content = $("#updateContent").value.trim();
    const files = $("#updateImages").files;
    const images = [];
    if(files && files.length){
      let pending = files.length;
      Array.from(files).forEach(f => {
        const r = new FileReader();
        r.onload = () => {
          images.push(r.result);
          pending--;
          if(pending===0) finalize();
        };
        r.readAsDataURL(f);
      });
    }else{
      finalize();
    }
    function finalize(){
      const list = getUpdates();
      list.push({
        id: Date.now(),
        projectId: project.id,
        date: new Date().toISOString(),
        content,
        images
      });
      saveUpdates(list);
      alert("후기가 등록되었습니다.");
      location.reload();
    }
  });
})();
