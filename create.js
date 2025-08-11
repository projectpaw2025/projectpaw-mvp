
const form = document.getElementById("createForm");
const mainInput = document.getElementById("imageMain");
const galInput = document.getElementById("imageGallery");
const prevMain = document.getElementById("previewMain");
const prevGal = document.getElementById("previewGallery");

mainInput?.addEventListener("change", () => {
  const f = mainInput.files?.[0];
  if(!f){ prevMain.textContent = "미리보기 없음"; return; }
  const r = new FileReader();
  r.onload = () => { prevMain.innerHTML = `<img src="${r.result}" style="max-width:220px;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.08)">`; };
  r.readAsDataURL(f);
});

galInput?.addEventListener("change", () => {
  prevGal.innerHTML = "";
  const files = Array.from(galInput.files||[]);
  files.slice(0,6).forEach(f => {
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

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim();
  const goalAmount = +document.getElementById("goalAmount").value || 0;
  const currentAmount = +document.getElementById("currentAmount").value || 0;
  const ownerAmount = +document.getElementById("ownerAmount").value || 0;
  const kakaoLink = document.getElementById("kakaoLink").value.trim();
  const status = document.getElementById("status").value;

  const mainFile = mainInput.files?.[0];
  if(!mainFile){ alert("대표 사진을 선택해 주세요."); return; }

  const galleryFiles = Array.from(galInput.files||[]);

  const images = [];
  const readerMain = new FileReader();
  readerMain.onload = () => {
    images.push(readerMain.result);
    if(galleryFiles.length){
      let pending = galleryFiles.length;
      galleryFiles.forEach(f => {
        const r = new FileReader();
        r.onload = () => {
          images.push(r.result);
          pending--;
          if(pending===0) finalize();
        };
        r.readAsDataURL(f);
      });
    }else{
      finalize();
    }
  };
  readerMain.readAsDataURL(mainFile);

  function finalize(){
    const newProject = {
      id: Date.now(),
      name, description, goalAmount, currentAmount, ownerAmount, kakaoLink, status,
      images
    };
    const list = JSON.parse(localStorage.getItem("projects")||"[]");
    list.unshift(newProject);
    localStorage.setItem("projects", JSON.stringify(list));
    alert("등록되었습니다.");
    location.href = "index.html";
  }
});
