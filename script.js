document.addEventListener('DOMContentLoaded', function () {
  const projectList = document.getElementById('project-list');
  const projects = JSON.parse(localStorage.getItem('pawProjects')) || [];

  if (projects.length === 0) {
    projectList.innerHTML = "<p>등록된 프로젝트가 없습니다.</p>";
    return;
  }

  projects.forEach((project, index) => {
    const card = document.createElement('div');
    card.classList.add('project-card');

    card.innerHTML = `
      <img src="${project.image}" alt="${project.animalName}" width="200">
      <h3>${project.animalName}</h3>
      <p>${project.description}</p>
      <p>목표금액: ${project.targetAmount}원</p>
      <a href="donation.html?index=${index}">자세히 보기</a>
    `;

    projectList.appendChild(card);
  });
});
