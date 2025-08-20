import { db, storage, authReady, serverTimestamp, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, fLimit, updateDoc, ref, uploadBytesResumable, getDownloadURL } from './firebase.js';

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

// PRODUCTION-FLOW: create doc first -> upload files -> update doc (urls)
export async function apiCreateProject(formOrObj){
  // ensure authenticated (anonymous ok)
  const user = await authReady;

  const cRef = collection(db, 'projects');
  const dRef = doc(cRef);         // pre-generate id
  const id = dRef.id;

  // Parse input
  let repFile=null, situFiles=[], rcptFiles=[];
  let payload = {};
  if(formOrObj instanceof FormData){
    const fd = formOrObj;
    repFile = fd.get('representativeImage');
    situFiles = fd.getAll('situationImages').filter(Boolean);
    rcptFiles = fd.getAll('receiptImages').filter(Boolean);
    payload = {
      name: fd.get('name') || '',
      rescuerName: fd.get('rescuerName') || '',
      summary: fd.get('summary') || '',
      description: fd.get('description') || '',
      goalAmount: Number(fd.get('goalAmount') || 0),
      rescuerContribution: Number(fd.get('rescuerContribution') || 0),
      registrantKakaoId: fd.get('registrantKakaoId') || ''
    };
  } else {
    payload = { ...formOrObj };
  }

  // 1) CREATE minimal doc (no admin fields, with ownerUid)
  const dataCreate = {
    ...payload,
    ownerUid: user.uid,
    adminApproved: false,
    supportersCount: 0,
    createdAt: serverTimestamp()
    // hospitalName/bankAccount/kakaoInviteLink intentionally omitted at create (admin only)
  };
  await setDoc(dRef, dataCreate);

  // 2) Upload files under projects/{id}/...
  let coverUrl = null;
  if(repFile && repFile.size){
    coverUrl = await uploadFile(`projects/${id}/cover_${Date.now()}_${repFile.name}`, repFile);
  }
  const galleryUrls = [];
  for(const f of situFiles){
    if(f && f.size) galleryUrls.push(await uploadFile(`projects/${id}/gallery/${Date.now()}_${f.name}`, f));
  }
  const receiptUrls = [];
  for(const f of rcptFiles){
    if(f && f.size) receiptUrls.push(await uploadFile(`projects/${id}/receipts/${Date.now()}_${f.name}`, f));
  }

  // 3) UPDATE doc with uploaded URLs
  await updateDoc(dRef, {
    representativeImageUrl: coverUrl || null,
    galleryUrls,
    receiptUrls
  });

  return { id, ...dataCreate, representativeImageUrl: coverUrl, galleryUrls, receiptUrls };
}
