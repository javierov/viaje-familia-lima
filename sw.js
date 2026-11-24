/* copia sin conexión de «Lima Familia»: solo toca sus propias copias (prefijo lf-) */
const CACHE="lf-v8",T="lf-mapa",FILES=["./","index.html","manifest.json","icono.png","icono-192.png","apple-touch-icon.png","favicon-32.png","fotos/miraflores.jpg","fotos/centro.jpg","fotos/barranco.jpg","polizas/poliza-677989.bin","polizas/poliza-677995.bin","polizas/poliza-677994.bin"];
/* cada archivo por separado: si uno falla, el resto queda guardado igual */
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(FILES.map(f=>fetch(new Request(f,{cache:"reload"})).then(r=>{if(r.ok)return c.put(f,r)})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("lf-")&&k!==CACHE&&k!==T).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;
  /* calles del mapa: se guardan al verlas (o en la precarga) para que sirvan sin señal */
  if(/tile\.openstreetmap\.org/.test(r.url)){e.respondWith(caches.open(T).then(c=>c.match(r.url).then(m=>m||fetch(r).then(res=>{if(res.ok)c.put(r.url,res.clone());return res}).catch(()=>new Response("",{status:504})))));return}
  const u=new URL(r.url);if(u.origin!==location.origin)return;
  const nav=r.mode==="navigate"||u.pathname.endsWith(".html")||u.pathname.endsWith("/");
  e.respondWith((nav?fetch(u.href,{cache:"no-cache",credentials:"same-origin"}):fetch(r)).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r).then(m=>m||caches.match("index.html"))))});
