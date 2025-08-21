// js/create.js
import { injectLayout } from './js/include.js';
import { apiCreateProject } from './js/api.js';
import { authReady } from './js/firebase.js';

injectLayout();

const form = document.getElementById('form');
const submitBtn = document.getElementById('submitBtn');

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
