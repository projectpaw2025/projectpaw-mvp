
function loadProjects(maxCount) {
  const container = document.getElementById("cardsContainer");
  if (!container) return;

  const projects = JSON.parse(localStorage.getItem("projects")) || [];
  container.innerHTML = "";

  projects.slice().reverse().slice(0, maxCount).forEach(project => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${project.image}" alt="${project.name}" class="card-img">
      <div class="card-body">
        <h3>${project.name}</h3>
        <p>${project.situation}</p>
        <p>✅ 목표: ${project.goalAmount}원</p>
        <p>💸 모금 현황: ${project.currentAmount}원</p>
        <p>👤 구조자부담액: ${project.ownerAmount}원</p>
        <div class="progress-bar">
          <div class="progress" style="width: ${Math.min(
            100,
            (parseInt(project.currentAmount) / parseInt(project.goalAmount)) * 100
          )}%"></div>
        </div>
        <a href="project_cheesecat_detailed_final_v2.html" class="btn">상세 보기</a>
      </div>
    `;
    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const isIndex = window.location.pathname.includes("index.html");
  const isList = window.location.pathname.includes("project_list.html");
  if (isIndex) loadProjects(4);
  if (isList) loadProjects(6);
});



// === 실시간 기부 현황 업데이트 (Polling) ===
function updateDonations() {
    document.querySelectorAll('.progress-bar').forEach(bar => {
        let current = parseInt(bar.dataset.current);
        let goal = parseInt(bar.dataset.goal);
        // 예시: 랜덤 증가 시뮬레이션
        current += Math.floor(Math.random() * 10);
        if (current > goal) current = goal;
        bar.dataset.current = current;
        let percent = Math.floor((current / goal) * 100);
        bar.style.width = percent + '%';
        bar.parentElement.nextElementSibling.textContent = `₩${current.toLocaleString()} / ₩${goal.toLocaleString()}`;
    });
}
setInterval(updateDonations, 5000);

// === 검색 / 필터 기능 ===
function setupSearchFilter() {
    const searchInput = document.getElementById('searchInput');
    const cards = document.querySelectorAll('.card');
    searchInput.addEventListener('input', () => {
        let keyword = searchInput.value.toLowerCase();
        cards.forEach(card => {
            let title = card.querySelector('.card-title').textContent.toLowerCase();
            card.style.display = title.includes(keyword) ? '' : 'none';
        });
    });
}

// === 추천 캠페인 AI 알고리즘 (간단 버전) ===
function recommendCampaigns() {
    const cards = [...document.querySelectorAll('.card')];
    cards.sort((a, b) => {
        let aPercent = parseInt(a.querySelector('.progress-bar').style.width);
        let bPercent = parseInt(b.querySelector('.progress-bar').style.width);
        return bPercent - aPercent; // 높은 퍼센트 우선
    });
    const recommendSection = document.getElementById('recommendSection');
    if (recommendSection) {
        recommendSection.innerHTML = '';
        cards.slice(0, 3).forEach(card => {
            recommendSection.appendChild(card.cloneNode(true));
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupSearchFilter();
    recommendCampaigns();
});
