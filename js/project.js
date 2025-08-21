// assets/js/project.js
import { getProjectById } from "./api.js";

function getParam(key) {
  const u = new URL(window.location.href);
  return u.searchParams.get(key);
}

function safeKRW(n) {
  const v = Number(n || 0);
  return "₩" + v.toLocaleString("ko-KR");
}

function isHttpUrl(s) {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

const id = getParam("id");
const bad = document.getElementById("bad-id");
const content = document.getElementById("content");

(async () => {
  if (!id) {
    if (bad) bad.style.display = "block";
    return;
  }

  const p = await getProjectById(id);
  if (!p) {
    if (bad) bad.style.display = "block";
    return;
  }

  if (content) content.style.display = "block";
  document.title = `${p.name || "프로젝트"} — Project.PAW`;

  // 제목/메타
  const titleEl = document.getElementById("title");
  if (titleEl) titleEl.textContent = p.name || "";

  const goal = Number(p.goalAmount || 0);
  const raised = Number(p.raisedAmount || 0);
  const rescuer = Number(p.rescuerContribution || 0);
  const percent = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  const metaEl = document.getElementById("meta");
  if (metaEl) {
    metaEl.innerHTML =
      `목표 ${safeKRW(goal)} · 구조자 30% ${safeKRW(rescuer)} · 달성 ${percent}%`;
  }
  const bar = document.getElementById("bar");
  if (bar) bar.style.width = `${percent}%`;

  const descEl = document.getElementById("desc");
  if (descEl) descEl.textContent = p.description ?? "";

  // 카카오톡 버튼
  const kakaoBtn = document.getElementById("kakao-btn");
  if (kakaoBtn) {
    kakaoBtn.href = isHttpUrl(p.kakaoLink) ? p.kakaoLink : "#";
  }

  // 이미지 슬라이더 (coverUrl 우선, 과거 호환 heroImage도 백업)
  const slider = document.getElementById("slider");
  const cover = p.coverUrl || p.heroImage || null;
  const galleryArr = (p.galleryUrls || p.galleryImages || []).filter(Boolean);
  const imgs = [cover, ...galleryArr].filter(Boolean);

  if (slider) {
    const dotWrap = document.createElement("div");
    dotWrap.className = "dots";

    if (imgs.length === 0) {
      slider.innerHTML = '<img src="assets/img/paw.svg" class="active"/>';
    } else {
      slider.innerHTML = imgs
        .map((src, i) => `<img class="${i === 0 ? "active" : ""}" src="${src}" alt="프로젝트 이미지 ${i + 1}"/>`)
        .join("");
      slider.appendChild(dotWrap);
      imgs.forEach((_, i) => {
        const b = document.createElement("button");
        b.className = i === 0 ? "active" : "";
        b.addEventListener("click", () => go(i));
        dotWrap.appendChild(b);
      });
    }

    let idx = 0;
    function go(n) {
      idx = n;
      slider.querySelectorAll("img").forEach((img, i) => img.classList.toggle("active", i === idx));
      slider.querySelectorAll(".dots button").forEach((d, i) => d.classList.toggle("active", i === idx));
    }
  }

  // 영수증/추가 사진 갤러리 (receiptUrls 우선, 과거 호환 receiptImages 지원)
  const recWrap = document.getElementById("receipt-gallery");
  const receipts = (p.receiptUrls || p.receiptImages || []).filter(Boolean);
  if (recWrap) {
    recWrap.innerHTML = "";
    receipts.forEach((src, i) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = `영수증/추가 사진 ${i + 1}`;
      recWrap.appendChild(img);
    });
  }
})();
