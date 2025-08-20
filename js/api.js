import { db, storage, serverTimestamp, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, fLimit, updateDoc, ref, uploadBytesResumable, getDownloadURL } from './firebase.js';

function normalizeProject(id, data){
  return { id, supportersCount: 0, ...data };
}

export async function apiListProjects({ limit = 20, status = 'all' } = {}){
  let q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'), fLimit(limit));
  if(status === 'approved'){
    q = query(collection(db,'projects'), where('adminApproved','==', true), orderBy('createdAt','desc'), fLimit(limit));
  } else if(status === 'pending'){
    q = query(collection(db,'projects'), where('adminApproved','==', false), orderBy('createdAt','desc'), fLimit(limit));
  }
  const snap = await getDocs(q);
  const out = [];
  snap.forEach(d => out.push(normalizeProject(d.id, d.data())));
  return out;
}

export async function apiGetProject(id){
  const d = await getDoc(doc(db, 'projects', id));
  if(!d.exists()) throw new Error('NOT_FOUND');
  return normalizeProject(d.id, d.data());
}

async function uploadFile(path, file){
  const r = ref(storage, path);
  const task = uploadBytesResumable(r, file);
  await new Promise((res, rej)=>{
    task.on('state_changed', ()=>{}, rej, res);
  });
  return await getDownloadURL(task.snapshot.ref);
}

export async function apiCreateProject(formOrObj){
  const cRef = collection(db, 'projects');
  const dRef = doc(cRef);
  const id = dRef.id;

  let data;
  let repFile=null, situFiles=[], rcptFiles=[];
  if(formOrObj instanceof FormData){
    const fd = formOrObj;
    repFile = fd.get('representativeImage');
    situFiles = fd.getAll('situationImages').filter(Boolean);
    rcptFiles = fd.getAll('receiptImages').filter(Boolean);
    data = {
      name: fd.get('name') || '',
      rescuerName: fd.get('rescuerName') || '',
      summary: fd.get('summary') || '',
      description: fd.get('description') || '',
      goalAmount: Number(fd.get('goalAmount') || 0),
      rescuerContribution: Number(fd.get('rescuerContribution') || 0),
      registrantKakaoId: fd.get('registrantKakaoId') || '',
      hospitalName: null, bankAccount: null, kakaoInviteLink: null,
      adminApproved: false, supportersCount: 0,
      createdAt: serverTimestamp()
    };
  } else {
    data = { ...formOrObj, createdAt: serverTimestamp(), adminApproved: false, supportersCount: 0 };
  }

  let coverUrl = null;
  if(repFile && repFile.size){
    coverUrl = await uploadFile(`projects/${id}/cover_${Date.now()}.jpg`, repFile);
  }
  const galleryUrls = [];
  for(const f of situFiles){
    if(f && f.size) galleryUrls.push(await uploadFile(`projects/${id}/gallery/${Date.now()}_${f.name}`, f));
  }
  const receiptUrls = [];
  for(const f of rcptFiles){
    if(f && f.size) receiptUrls.push(await uploadFile(`projects/${id}/receipts/${Date.now()}_${f.name}`, f));
  }

  const toSave = {
    ...data,
    representativeImageUrl: coverUrl,
    galleryUrls,
    receiptUrls,
  };

  await setDoc(dRef, toSave);
  return { id, ...toSave };
}

export async function apiToggleApprove(id, approved){
  await updateDoc(doc(db,'projects', id), { adminApproved: !!approved });
  return { ok:true };
}
