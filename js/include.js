export async function injectLayout({ active } = {}) {
  const h = document.querySelector('[data-include="header"]');
  const f = document.querySelector('[data-include="footer"]');

  // GitHub Pages 배포 시 경로 보정
  const base = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');

  if (h) {
    try {
      const res = await fetch(`${base}/partials/header.html`);
      h.innerHTML = await res.text();
      if (active) {
        const nav = h.querySelector(`[data-nav="${active}"]`);
        if (nav) nav.classList.add('active');
      }
    } catch (e) {
      console.error("header include 실패:", e);
    }
  }

  if (f) {
    try {
      const res = await fetch(`${base}/partials/footer.html`);
      f.innerHTML = await res.text();
    } catch (e) {
      console.error("footer include 실패:", e);
    }
  }
}
