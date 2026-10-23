// Diario di allenamento: funzionamento offline
const CACHE='prova-v11';
const PRE='prova-';
const SHELL=['./','index.html','manifest.webmanifest','icon-192-v2.png','icon-512-v2.png','icon-maskable-512-v2.png'];
// all'installazione scarica i file aggirando la cache del browser
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(SHELL.map(u=>fetch(new Request(u,{cache:'reload'})).then(r=>{if(r.ok)return c.put(u,r)})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k.startsWith(PRE)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  // la pagina: prima la rete (sempre l'ultima versione), la copia salvata solo offline
  if(r.mode==='navigate'){e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put('index.html',cp))}return res}).catch(()=>caches.match('index.html',{ignoreSearch:true}).then(m=>m||caches.match('./'))));return}
  if(u.origin===location.origin||/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.match(r).then(m=>{const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>m);return m||net}));
  }
});
