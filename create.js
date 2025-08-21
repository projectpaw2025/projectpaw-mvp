// assets/js/create.js
import { apiCreateProject } from "./api.js";

const form = document.getElementById("form");
const submitBtn = document.getElementById("submit");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  msg.style.display = "inline-block";
  try {
    await apiCreateProject(form);
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
