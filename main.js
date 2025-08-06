
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
