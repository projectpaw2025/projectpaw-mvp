// js/include.js
export async function injectLayout({ active } = {}) {
  const h = document.querySelector('[data-include="header"]');
  const f = document.querySelector('[data-include="footer"]');

  try {
    if (h) {
      const headerHtml = await (await fetch("./partials/header.html")).text();
      h.innerHTML = headerHtml;

      // 현재 페이지 active 메뉴 표시
      if (active) {
        const link = h.querySelector(`[data-nav="${active}"]`);
        if (link) link.classList.add("active");
      }
    }

    if (f) {
      const footerHtml = await (await fetch("./partials/footer.html")).text();
      f.innerHTML = footerHtml;
    }
  } catch (err) {
    console.error("include.js 오류:", err);
  }
}
