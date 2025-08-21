// js/project_list.js
import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const projectListContainer = document.getElementById("project-list");

async function loadProjects() {
  try {
    const querySnapshot = await getDocs(collection(db, "projects"));
    projectListContainer.innerHTML = ""; // 기존 내용 비움

    if (querySnapshot.empty) {
      projectListContainer.innerHTML = `<p style="text-align:center; color:#888;">등록된 프로젝트가 없습니다.</p>`;
      return;
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // 대표 이미지 (없으면 기본 이미지 대체)
      const mainImage = data.mainImage || "https://via.placeholder.com/400x250?text=No+Image";

      // 카드 HTML
      const card = document.createElement("div");
      card.className = "project-card";

      card.innerHTML = `
        <img src="${mainImage}" alt="대표 이미지">
        <h3>${data.name || "이름 없음"}</h3>
        <p style="margin:0.3rem 0; color:#666; font-size:0.9rem;">
          구조 장소: ${data.location || "알 수 없음"}
        </p>
        <p style="margin:0.3rem 0; color:#666; font-size:0.9rem;">
          목표 금액: <b>${Number(data.targetAmount || 0).toLocaleString()}원</b>
        </p>
        <button class="donate-btn">후원하기</button>
      `;

      // 후원 버튼 클릭 → project_detail.html?id=DOC_ID 로 이동
      card.querySelector(".donate-btn").addEventListener("click", () => {
        location.href = `project_detail.html?id=${doc.id}`;
      });

      projectListContainer.appendChild(card);
    });
  } catch (e) {
    console.error("프로젝트 불러오기 실패:", e);
    projectListContainer.innerHTML = `<p style="text-align:center; color:red;">프로젝트를 불러오는 중 오류가 발생했습니다.</p>`;
  }
}

loadProjects();
