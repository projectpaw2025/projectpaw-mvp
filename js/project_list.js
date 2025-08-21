// assets/js/project_list.js
import { fetchApprovedProjects } from "./api.js";

const grid = document.getElementById("list-grid");
const empty = document.getElementById("list-empty");
const sortSel = document.getElementById("sort");
const approvedOnly = document.getElementById("approvedOnly");
const search = document.getElementById("search");

function cardHTML(p) {
  const img = p.coverUrl || "assets/img/paw.svg";
  const percent =
    p.goalAmount > 0
      ? Math.min(100, Math.round((Number(p.raisedAmount || 0) / Number(p.goalAmount)) * 100))
      : 0;

  return `<a class="card" href="project.html?id=${p.id}">
    <img src="${img}" alt="대표 이미지"/>
    <div class="content">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:center">
        <strong>${p.name}</strong>
        ${p.adminApproved ? '<span class="badge">승인</span>' : '<span class="badge" style="background:#fee2e2;color:#991b1b">대기</span>'}
      </div>
      <div class="meta">${p.summary ?? ""}</div>
      <div class="progress"><div style="width:${percent}%"></div></div>
      <div class="meta">목표 ₩${(p.goalAmount || 0).toLocaleString("ko-KR")} · 구조자 30% ₩${(p.rescuerContribution || 0).toLocaleString("ko-KR")}</div>
    </div>
  </a>`;
}

let cache = [];
function applyFilters() {
  let arr = [...cache];

  const q = (search.value || "").trim().toLowerCase();
  if (q) {
    arr = arr.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
    );
  }
  if (approvedOnly.checked) {
    arr = arr.filter((p) => p.adminApproved === true);
  }

  if (sortSel.value === "progress") {
    arr.sort((a, b) => {
      const ap = a.goalAmount ? (a.raisedAmount || 0) / a.goalAmount : 0;
      const bp = b.goalAmount ? (b.raisedAmount || 0) / b.goalAmount : 0;
      return bp - ap;
    });
  } else if (sortSel.value === "goal") {
    arr.sort((a, b) => (b.goalAmount || 0) - (a.goalAmount || 0));
  } else {
    // 최신순 (createdAt가 serverTimestamp일 수 있으므로 보조 정렬)
    arr.sort(
      (a, b) =>
        (b?.createdAt?.seconds || 0) - (a?.createdAt?.seconds || 0)
    );
  }

  if (arr.length === 0) {
    empty.style.display = "block";
    grid.innerHTML = "";
    return;
  }
  empty.style.display = "none";
  grid.innerHTML = arr.map(cardHTML).join("");
}

async function bootstrap() {
  cache = await fetchApprovedProjects();
  applyFilters();
}

[sortSel, approvedOnly, search].forEach((el) =>
  el.addEventListener("input", applyFilters)
);

bootstrap();
