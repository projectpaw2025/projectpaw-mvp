// js/create.js
import { apiCreateProject } from "./api.js";

const form = document.getElementById("form");
const submitBtn = document.getElementById("submit");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  msg.style.display = "inline-block";
  try {
    // FormData에서 필요한 값 추출
    const fd = new FormData(form);
    const projectData = {
      name: fd.get("name"),
      rescuerName: fd.get("rescuerName"),
      summary: fd.get("summary"),
      keyMessage: fd.get("keyMessage"),
      description: fd.get("description"),
      goalAmount: document.getElementById("goalAmount").dataset.value || 0,
      commission: document.getElementById("rescuerContribution").dataset.value || 0, // ✅ 구조자 부담액 추가
      privateContact: fd.get("privateContact"),
      coverFile: document.getElementById("repImage").files[0] || null,
      galleryFiles: Array.from(document.getElementById("situationImages").files),
      receiptFiles: Array.from(document.getElementById("receiptImages").files),
    };

    await apiCreateProject(projectData);
    alert("등록 요청이 저장되었습니다. 관리자 승인 후 노출됩니다.");
    window.location.href = "project_list.html";
  } catch (err) {
    console.error(err);
    alert(err?.message || "저장 중 오류가 발생했습니다.");
  } finally {
    submitBtn.disabled = false;
    msg.style.display = "none";
  }
});
