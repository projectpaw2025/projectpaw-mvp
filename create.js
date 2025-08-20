// create.js
import { db, serverTimestamp, collection, addDoc } from "./js/firebase.js";
import { uploadImageToStorage } from "./js/uploader.js";

const form = document.getElementById("createForm");
const mainInput = document.getElementById("imageMain");
const galInput = document.getElementById("imageGallery");
const prevMain = document.getElementById("previewMain");
const prevGal = document.getElementById("previewGallery");

// 대표사진 미리보기
mainInput?.addEventListener("change", () => {
  const f = mainInput.files?.[0];
  if (!f) {
    prevMain.textContent = "미리보기 없음";
    return;
  }
  const r = new FileReader();
  r.onload = () => {
    prevMain.innerHTML = `<img src="${r.result}" style="max-width:220px;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.08)">`;
  };
  r.readAsDataURL(f);
});

// 갤러리사진 미리보기
galInput?.addEventListener("change", () => {
  prevGal.innerHTML = "";
  const files = Array.from(galInput.files || []);
  files.slice(0, 6).forEach(f => {
    const r = new FileReader();
    r.onload = () => {
      const img = document.createElement("img");
      img.src = r.result;
      img.style.width = "90px";
      img.style.height = "90px";
      img.style.objectFit = "cover";
      img.className = "rounded";
      prevGal.appendChild(img);
    };
    r.readAsDataURL(f);
  });
});

// 폼 제출
form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("projectName").value.trim();
  const situation = document.getElementById("projectSituation").value.trim();
  const goalAmount = parseInt(document.getElementById("projectGoal").value, 10) || 0;

  try {
    // ✅ 이미지 업로드
    let mainUrl = "";
    let galleryUrls = [];

    if (mainInput.files?.[0]) {
      mainUrl = await uploadImageToStorage(mainInput.files[0], "main/");
    }

    if (galInput.files?.length > 0) {
      for (let f of galInput.files) {
        const url = await uploadImageToStorage(f, "gallery/");
        galleryUrls.push(url);
      }
    }

    // ✅ Firestore 저장
    await addDoc(collection(db, "projects"), {
      name,
      situation,
      goalAmount,
      mainImage: mainUrl,
      galleryImages: galleryUrls,
      createdAt: serverTimestamp()
    });

    alert("프로젝트가 등록되었습니다!");
    window.location.href = "index.html";

  } catch (err) {
    console.error("등록 실패:", err);
    alert("업로드 실패: " + err.message);
  }
});
