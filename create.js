// js/create.js
import { db } from "./firebase.js";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { uploadImageToStorage } from "./uploader.js";

const form = document.getElementById("createForm"),
  mainInput = document.getElementById("imageMain"),
  galInput = document.getElementById("imageGallery"),
  prevMain = document.getElementById("previewMain"),
  prevGal = document.getElementById("previewGallery");

// 메인 이미지 미리보기
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

// 갤러리 이미지 미리보기
galInput?.addEventListener("change", () => {
  prevGal.innerHTML = "";
  const files = Array.from(galInput.files || []);
  files.slice(0, 6).forEach((f) => {
    const r = new FileReader();
    r.onload = () => {
      const img = document.createElement("img");
      img.src = r.result;
      img.style.width = "90px";
      img.style.marginRight = "6px";
      img.style.borderRadius = "8px";
      prevGal.appendChild(img);
    };
    r.readAsDataURL(f);
  });
});

// 등록하기 처리
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitBtn = form.querySelector("button[type=submit]");
  try {
    submitBtn.disabled = true;
    submitBtn.textContent = "🐾 업로드 중입니다... 잠시만 기다려주세요";

    // 대표 이미지 업로드
    const mainFile = mainInput.files?.[0];
    let mainUrl = null;
    if (mainFile) {
      mainUrl = await uploadImageToStorage(mainFile, "covers/");
    }

    // 갤러리 이미지 업로드
    const galFiles = Array.from(galInput.files || []);
    const galleryUrls = [];
    for (const f of galFiles) {
      galleryUrls.push(await uploadImageToStorage(f, "gallery/"));
    }

    // Firestore 저장
    await setDoc(doc(collection(db, "projects")), {
      name: form.name.value,
      summary: form.summary.value,
      representativeImageUrl: mainUrl,
      galleryUrls,
      createdAt: serverTimestamp(),
      adminApproved: false,
      supportersCount: 0,
    });

    alert("✅ 등록이 완료되었습니다! 감사합니다 🐾");
    form.reset();
    prevMain.innerHTML = "";
    prevGal.innerHTML = "";
  } catch (err) {
    console.error(err);
    alert("❌ 업로드 실패. 다시 시도해주세요.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "등록하기";
  }
});
