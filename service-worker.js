const CACHE="paw-cache-v6-2025-08-11";
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(["index.html","project_list.html","project.html","create.html","dashboard.html","app.min.css","app.min.js","images/logo_wordmark.svg"])));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));});
self.addEventListener("fetch",e=>{
  const req=e.request, url=new URL(req.url);
  if(url.origin!==location.origin) return;
  if(req.destination==="image"){
    e.respondWith((async()=>{const cache=await caches.open(CACHE);const cached=await cache.match(req);const fetched=fetch(req).then(r=>{cache.put(req,r.clone());return r}).catch(()=>cached);return cached||fetched})());
  } else {
    e.respondWith(caches.match(req).then(r=>r||fetch(req)));
  }
});