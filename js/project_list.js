import { apiListProjects } from './js/api.js';

async function renderProjects() {
  const listEl = document.getElementById("project-list");
  listEl.innerHTML = "<p>불러오는 중...</p>";

  try {
    const projects = await apiListProjects({ limit: 20, status: 'approved' });
    listEl.innerHTML = "";

    if (!projects.length) {
      listEl.innerHTML = "<p>등록된 프로젝트가 없습니다.</p>";
      return;
    }

    projects.forEach(proj => {
      const card = document.createElement("div");
      card.className = "project-card";

      const imgUrl = proj.representativeImageUrl || "assets/no-image.png";

      card.innerHTML = `
        <a href="project.html?id=${proj.id}">
          <img src="${imgUrl}" alt="${proj.name}" class="thumb"/>
          <h3>${proj.name}</h3>
          <p>${proj.summary || ""}</p>
        </a>
      `;
      listEl.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    listEl.innerHTML = "<p>프로젝트를 불러오지 못했습니다 😢</p>";
  }
}

renderProjects();
