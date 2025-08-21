// js/uploader.js
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "./firebase.js";

const storage = getStorage(app);
const MAX_MB = 5;               // 5MB
const MAX_W = 1200;             // 최대 가로 1200px (세로는 비율 유지)
const MIME = "image/jpeg";      // 업로드 포맷 고정
const QUALITY = 0.82;           // 0~1

// 이미지 리사이즈
async function resizeImage(file) {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_W / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("이미지 처리 실패"));
            resolve(blob);
          },
          MIME,
          QUALITY
        );
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ✅ Storage 업로드 후 다운로드 URL 반환
export async function uploadImageToStorage(file, folder = "uploads/") {
  const blob = await resizeImage(file);
  const storageRef = ref(storage, `${folder}${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, blob);
  return await getDownloadURL(storageRef); // 여기서 URL 반환
}
