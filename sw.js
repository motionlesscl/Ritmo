// Ritmo service worker: werkt offline en haalt updates op zodra er internet is.
const VERSIE='ritmo-v3';
const BASIS=['./','./index.html','./manifest.webmanifest','./vendor/zxing.min.js','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSIE).then(c=>c.addAll(BASIS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSIE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request,url=new URL(req.url);
  if(req.method!=='GET')return;
  if(url.hostname.endsWith('openfoodfacts.org'))return; // productdata altijd live ophalen
  if(req.mode==='navigate'){ // pagina: eerst netwerk (nieuwste versie), anders uit cache
    e.respondWith(fetch(req).then(r=>{const k=r.clone();caches.open(VERSIE).then(c=>c.put('./index.html',k));return r}).catch(()=>caches.match('./index.html')));return}
  if(url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com'||url.origin===location.origin){
    e.respondWith(caches.match(req).then(hit=>{const net=fetch(req).then(r=>{if(r.ok||r.type==='opaque'){const k=r.clone();caches.open(VERSIE).then(c=>c.put(req,k))}return r}).catch(()=>hit);return hit||net}));
  }
});
