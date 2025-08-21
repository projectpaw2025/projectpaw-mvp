// js/create.js
import { injectLayout } from './js/include.js';
import { apiCreateProject } from './js/api.js';
import { authReady } from './js/firebase.js';

injectLayout();

const form = document.getElementById('form');
const submitBtn = document.getElementById('submitBtn');

// =====================
// 📌 미리보기 기능
// =====================
function previewSingle(inputId, containerId) {
  const input = document.getElementById(inputId);
  const container = document.getElementById(containerId);

  input.addEventListener("change", (e) => {
    container.innerHTML = "";
    const file = e.target.files[0];
    if (file) {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file); // ✅ 업로드 전 즉시 미리보기
      img.style.maxWidth = "220px";
      img.style.borderRadius = "12px";
      img.style.boxShadow = "0 8px 30px rgba(0,0,0,.08)";
      container.appendChild(img);
    }
  });
}

function previewMultiple(inputId, containerId) {
  const input = document.getElementById(inputId);
  const container = document.getElementById(containerId);

  input.addEventListener("change", (e) => {
    container.innerHTML = "";
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.style.width = "90px";
      img.style.marginRight = "6px";
      img.style.borderRadius = "8px";
      container.appendChild(img);
    });
  });
}

// 미리보기 연결
previewSingle("repImage", "previewMain");
previewMultiple("situationImages", "previewGallery");
previewMultiple("receiptImages", "previewReceipts");

// =====================
// 📌 등록 처리
// =====================
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  await authReady;

  submitBtn.classList.add('disabled');

  // 업로드 시작 팝업
  Swal.fire({
    title: '업로드 중...',
    text: '사진과 내용을 등록하고 있습니다. 잠시만 기다려주세요 🐾',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  const fd = new FormData(form);
  const rep = document.getElementById('repImage').files[0];
  const situ = document.getElementById('situationImages').files;
  const rcpt = document.getElementById('receiptImages').files;
  if (rep) fd.append('representativeImage', rep);
  Array.from(situ).forEach(f => fd.append('situationImages', f));
  Array.from(rcpt).forEach(f => fd.append('receiptImages', f));

  try {
    const saved = await apiCreateProject(fd);

    Swal.fire({
      icon: 'success',
      title: '등록 완료!',
      text: '프로젝트가 성공적으로 등록되었습니다 🎉'
    }).then(() => {
      location.href = 'project.html?id=' + encodeURIComponent(saved.id);
    });

    form.reset();
    document.getElementById("previewMain").innerHTML = "";
    document.getElementById("previewGallery").innerHTML = "";
    document.getElementById("previewReceipts").innerHTML = "";
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: '업로드 실패',
      text: '다시 시도해주세요 😢'
    });
  } finally {
    submitBtn.classList.remove('disabled');
    submitBtn.textContent = '등록하기';
  }
});
