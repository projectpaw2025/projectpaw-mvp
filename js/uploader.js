// js/uploader.js
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "./firebase.js";

const storage = getStorage(app);
const MAX_MB = 5;               // 5MB
const MAX_W = 1200;             // 최대 가로 1200px (세로는 비율 유지)
const MIME = "image/jpeg";      // 업로드 포맷 고정 (품질로 용량 제어)
const QUALITY = 0.82;           // 0~1

export async function uploadImageToStorage(file, folder = "uploads/") {
  // 용량 선검사
  if (file.size > MAX_MB * 1024 * 1024) {
    // 그래도 리사이즈 시도
    const blob = await resizeImage(file);
    if (blob.size > MAX_MB * 1024 * 1024) {
      throw new Error(`이미지 용량이 큽니다(>${MAX_MB}MB). 다른 이미지를 사용해주세요.`);
    }
    return await putBlob(blob, folder);
  } else {
    // 5MB 이하지만 그래도 리사이즈로 균질화
    const blob = await resizeImage(file);
    return await putBlob(blob, folder);
  }
}

async function putBlob(blob, folder) {
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const path = `${folder}${id}.jpg`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType: MIME, cacheControl: "public,max-age=31536000,immutable" });
  return await getDownloadURL(storageRef);
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = reject;
    img.src = url;
  });
}

async function resizeImage(file) {
  const img = await loadImage(file);
  const scale = img.width > MAX_W ? MAX_W / img.width : 1;
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);

  const blob = await new Promise(res => canvas.toBlob(res, MIME, QUALITY));
  return blob;
}
