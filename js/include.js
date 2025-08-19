// js/include.js
import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/**
 * opts.active: 'index' | 'project_list' | 'project' | 'create' | 'about' | 'login'
 */
export async function injectLayout(opts = {}) {
  const headerSlot = document.querySelector('[data-include="header"]');
  const footerSlot = document.querySelector('[data-include="footer"]');

  const [headerHtml, footerHtml] = await Promise.all([
    fetch("./partials/header.html").then(r => r.text()),
    fetch("./partials/footer.html").then(r => r.text()),
  ]);

  if (headerSlot) headerSlot.innerHTML = headerHtml;
  if (footerSlot) footerSlot.innerHTML = footerHtml;

  // 활성화 네비 표시
  if (opts.active && headerSlot) {
    const a = headerSlot.querySelector(`a[data-nav="${opts.active}"]`);
    if (a) a.classList.add("is-active");
  }

  // 로그아웃 버튼 이벤트
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await signOut(auth);
        alert("로그아웃 완료! 다시 로그인 해주세요.");
        location.href = "index.html";
      } catch (e) {
        console.error("로그아웃 실패:", e);
      }
    });
  }
}
