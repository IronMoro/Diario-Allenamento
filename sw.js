// Diario di allenamento: funzionamento offline
const CACHE='prova-v1';
const SHELL=['./','index.html','manifest.webmanifest','icon-192-v2.png','icon-512-v2.png','icon-maskable-512-v2.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
function update(req,key){return fetch(req).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(key||req,cp))}return res})}
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(r.mode==='navigate'){e.respondWith(caches.match('index.html').then(m=>{const net=update(r,'index.html').catch(()=>m);return m||net}));return}
  if(u.origin===location.origin||/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.match(r).then(m=>{const net=update(r).catch(()=>m);return m||net}));
  }
});
