
/* augment.v8.3.js — Kakao link field, list sort/filter, detail CTA */
(function(){
  // Safeguards
  const $ = (sel, ctx=document)=>ctx.querySelector(sel);
  const $$ = (sel, ctx=document)=>Array.from(ctx.querySelectorAll(sel));
  function onReady(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  // Percent helper (reuse if not present)
  function _percent(p){ const g=Math.max(1,+p.goalAmount||+p.targetAmount||1); const c=+p.currentAmount||+p.raisedAmount||0; return Math.min(100, Math.round((c/g)*100)); }

  // 1) CREATE: Add Kakao link field & persist into last-added project
  onReady(()=>{
    const form = $('#createForm') || $('form#createForm');
    if(form && !$('#kakaoLink')){
      // Inject field near submit
      const field = document.createElement('div');
      field.className = 'mb-3';
      field.innerHTML = `
        <label for="kakaoLink" class="form-label">카카오톡 초대 링크 (선택)</label>
        <input type="url" class="form-control" id="kakaoLink" placeholder="https://open.kakao.com/o/....">
        <div class="form-text">PG 연동 전 시범 운영용. 프로젝트 상세에 '카카오톡 참여' 버튼으로 표시됩니다.</div>
      `;
      form.insertBefore(field, form.lastElementChild);

      // After submit completes (existing logic likely saves to localStorage), attach kakaoLink to the last project
      form.addEventListener('submit', function(){
        const v = ($('#kakaoLink')||{}).value||'';
        if(!v) return;
        setTimeout(()=>{
          try{
            const list = (typeof getProjects==='function') ? getProjects() : JSON.parse(localStorage.getItem('projects')||'[]');
            if(Array.isArray(list) && list.length){
              const lastIdx = list.length-1;
              list[lastIdx].kakaoLink = v;
              (typeof saveProjects==='function') ? saveProjects(list) : localStorage.setItem('projects', JSON.stringify(list));
            }
          }catch(e){ console.warn('kakaoLink attach failed', e); }
        }, 50);
      }, { once:false });
    }
  });

  // 2) DETAIL: If kakaoLink exists, render CTA button near top content
  onReady(()=>{
    const idParam = new URLSearchParams(location.search).get('id');
    if(!idParam) return;
    try{
      const list = (typeof getProjects==='function') ? getProjects() : JSON.parse(localStorage.getItem('projects')||'[]');
      const p = (list||[]).find(x=>String(x.id)===String(idParam));
      if(!p || !p.kakaoLink) return;

      // insert after title or under hero area
      const host = $('#project-detail') || $('.project-hero') || $('.container');
      if(host){
        const wrap = document.createElement('div');
        wrap.className = 'my-2';
        wrap.innerHTML = `<a href="${p.kakaoLink}" target="_blank" rel="noopener" class="btn btn-warning fw-semibold">
          <i class="bi bi-chat-dots-fill me-1"></i> 카카오톡 참여 (Pilot Run)
        </a>`;
        host.insertBefore(wrap, host.firstChild);
      }
    }catch(_){}
  });

  // 3) LIST: Add sort/filter controls and behavior
  onReady(()=>{
    // apply only on project_list.html
    if(!location.pathname.endsWith('project_list.html')) return;
    const topBar = $('.container .d-flex.gap-2') || $('.container');
    if(!topBar) return;

    // Avoid duplicate
    if($('#sortSelectV83')) return;

    const controls = document.createElement('div');
    controls.className = 'd-flex gap-2 flex-wrap';
    controls.innerHTML = `
      <select id="sortSelectV83" class="form-select" style="max-width:160px">
        <option value="">정렬 없음</option>
        <option value="recent">최신 등록</option>
        <option value="progress">달성률 높은순</option>
      </select>
      <div class="form-check align-self-center">
        <input class="form-check-input" type="checkbox" id="onlyApprovedV83" checked>
        <label class="form-check-label" for="onlyApprovedV83">승인만 보기</label>
      </div>
    `;
    topBar.appendChild(controls);

    const listEl = document.getElementById('project-list') || $('.masonry') || $('#project-list');
    if(!listEl) return;

    function currentProjects(){
      const list = (typeof getProjects==='function') ? getProjects() : JSON.parse(localStorage.getItem('projects')||'[]');
      return Array.isArray(list) ? list.slice() : [];
    }
    function percent(p){ return _percent(p); }

    function applyControls(){
      const sortBy = ($('#sortSelectV83')||{}).value||'';
      const onlyApproved = ($('#onlyApprovedV83')||{}).checked;
      // Map DOM cards to project IDs if present
      const cards = Array.from(listEl.children);
      const list = currentProjects();
      const byId = new Map(list.map(p=>[String(p.id), p]));

      // Filter: hide/show
      cards.forEach(c=>{
        const id = c.dataset?.id || c.getAttribute('data-id') || '';
        const proj = byId.get(String(id));
        const approved = proj ? (proj.status==='approved') : true;
        c.style.display = (onlyApproved && !approved) ? 'none' : '';
      });

      // Sort: using percent or recent (assume data-ts attr present; fallback to index)
      let sortable = cards.filter(c=>c.style.display!=='none');
      if(sortBy==='recent'){
        sortable.sort((a,b)=> (+(b.dataset.ts||0)) - (+(a.dataset.ts||0)));
      } else if(sortBy==='progress'){
        sortable.sort((a,b)=>{
          const pa = byId.get(String(a.dataset.id)) || {}; 
          const pb = byId.get(String(b.dataset.id)) || {};
          return percent(pb) - percent(pa);
        });
      }
      sortable.forEach(c=> listEl.appendChild(c));
    }

    $('#sortSelectV83')?.addEventListener('change', applyControls);
    $('#onlyApprovedV83')?.addEventListener('change', applyControls);
    setTimeout(applyControls, 100); // after initial render
  });
})();
