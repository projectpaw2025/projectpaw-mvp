
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const imageInput = document.querySelector("#cat-image");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.querySelector("#cat-name").value;
      const goal = document.querySelector("#cat-goal").value;
      const story = document.querySelector("#cat-story").value;
      const kakao = document.querySelector("#cat-kakao").value;
      const imageFile = imageInput.files[0];

      if (!imageFile) return alert("이미지를 업로드해주세요.");

      const reader = new FileReader();
      reader.onload = () => {
        const data = {
          name,
          goal,
          story,
          kakao,
          image: reader.result
        };
        const existing = JSON.parse(localStorage.getItem("projects") || "[]");
        existing.push(data);
        localStorage.setItem("projects", JSON.stringify(existing));
        alert("프로젝트가 등록되었습니다!");
        window.location.href = "index.html";
      };
      reader.readAsDataURL(imageFile);
    });
  }

  const container = document.querySelector("#project-container");
  if (container) {
    const projects = JSON.parse(localStorage.getItem("projects") || "[]");
    for (const project of projects) {
      const card = document.createElement("div");
      card.className = "project-card";
      card.innerHTML = `
        <img src="${project.image}" alt="고양이 이미지" />
        <h3>${project.name}</h3>
        <p>${project.story}</p>
        <p><strong>목표:</strong> ${project.goal}원</p>
        <a href="${project.kakao}" target="_blank">카카오톡 링크</a>
      `;
      container.appendChild(card);
    }
  }
});
