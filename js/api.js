import { 
  db, storage, authReady, serverTimestamp, 
  collection, doc, setDoc, getDoc, getDocs, 
  query, where, updateDoc, ref, 
  uploadBytesResumable, getDownloadURL 
} from './firebase.js';

// image compression helpers
async function fileToDataURL(file){ 
  return await new Promise((res, rej)=>{ 
    const r=new FileReader(); 
    r.onload=()=>res(r.result); 
    r.onerror=rej; 
    r.readAsDataURL(file); 
  }); 
}
async function loadImage(src){ 
  return await new Promise((res, rej)=>{ 
    const img=new Image(); 
    img.onload=()=>res(img); 
    img.onerror=rej; 
    img.src=src; 
  }); 
}
async function compressImage(file, {maxDim=1600, quality=0.82}={}) {
  try {
    const src = await fileToDataURL(file);
    const img = await loadImage(src);
    const maxSide = Math.max(img.width, img.height);
    const ratio = Math.min(1, maxDim/maxSide);
    const tw = Math.round(img.width*ratio), th = Math.round(img.height*ratio);
    const c = document.createElement('canvas'); 
    c.width=tw; c.height=th;
    c.getContext('2d').drawImage(img,0,0,tw,th);
    const blob = await new Promise(res => c.toBlob(res, 'image/jpeg', quality));
    return new File([blob], file.name.replace(/\.(png|webp)$/i,'.jpg'), {type:'image/jpeg'});
  } catch(e) { 
    console.warn('compress fail', e); 
    return file; 
  }
}

function normalizeProject(id, data){ 
  return { id, supportersCount: 0, ...data }; 
}

// 🔥 수정된 부분: orderBy 제거, status별 조건만
export async function apiListProjects({ limit = 20, status = 'all' } = {}) {
  let q = collection(db, 'projects');

  if (status === 'approved') {
    q = query(q, where('adminApproved','==', true));
  } else if (status === 'pending') {
    q = query(q, where('adminApproved','==', false));
  }
  // status === 'all' → 필터 없음 (모든 프로젝트 불러옴)

  const snap = await getDocs(q); 
  const out=[];
  snap.forEach(d => out.push(normalizeProject(d.id, d.data()))); 
  return out;
}

export async function apiGetProject(id){ 
  const d=await getDoc(doc(db,'projects',id)); 
  if(!d.exists()) throw new Error('NOT_FOUND'); 
  return normalizeProject(d.id,d.data()); 
}

async function uploadFile(path, file){
  const r = ref(storage, path);
  const meta = { contentType: (file && file.type) ? file.type : 'image/jpeg' };
  const task = uploadBytesResumable(r, file, meta);
  await new Promise((res, rej)=>{ task.on('state_changed', ()=>{}, rej, res); });
  return await getDownloadURL(task.snapshot.ref);
}

// production flow: create doc -> upload -> update
export async function apiCreateProject(formOrObj){
  const user = await authReady;
  const cRef = collection(db, 'projects');
  const dRef = doc(cRef);
  const id = dRef.id;

  let repFile=null, situFiles=[], rcptFiles=[]; 
  let payload={};

  if(formOrObj instanceof FormData){
    const fd=formOrObj;
    repFile=fd.get('representativeImage');
    situFiles=fd.getAll('situationImages').filter(Boolean);
    rcptFiles=fd.getAll('receiptImages').filter(Boolean);
    payload={
      name: fd.get('name')||'',
      rescuerName: fd.get('rescuerName')||'',
      summary: fd.get('summary')||'',
      description: fd.get('description')||'',
      goalAmount: Number(fd.get('goalAmount')||0),
      rescuerContribution: Number(fd.get('rescuerContribution')||0),
      registrantKakaoId: fd.get('registrantKakaoId')||''
    };
  } else { 
    payload = {...formOrObj}; 
  }

  // 1) create doc
  const dataCreate = {
    ...payload,
    ownerUid: user.uid,
    adminApproved: false,
    supportersCount: 0,
    createdAt: serverTimestamp()
  };
  await setDoc(dRef, dataCreate);

  // 2) uploads (compressed)
  let coverUrl=null;
  if(repFile && repFile.size){
    const c=await compressImage(repFile,{maxDim:1600,quality:0.82});
    coverUrl = await uploadFile(`projects/${id}/cover_${Date.now()}_${c.name}`, c);
  }
  const galleryUrls=[];
  for(const f of situFiles){ 
    if(f && f.size){ 
      const c=await compressImage(f,{maxDim:1600,quality:0.82}); 
      galleryUrls.push(await uploadFile(`projects/${id}/gallery/${Date.now()}_${c.name}`, c)); 
    }
  }
  const receiptUrls=[];
  for(const f of rcptFiles){ 
    if(f && f.size){ 
      const c=await compressImage(f,{maxDim:1600,quality:0.82}); 
      receiptUrls.push(await uploadFile(`projects/${id}/receipts/${Date.now()}_${c.name}`, c)); 
    }
  }

  // 3) update doc
  await updateDoc(dRef, { representativeImageUrl: coverUrl||null, galleryUrls, receiptUrls });
  return { id, ...dataCreate, representativeImageUrl: coverUrl, galleryUrls, receiptUrls };
}
