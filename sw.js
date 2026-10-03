const CACHE='lja-app-static-v8';
const STATIC_ASSETS=[
  './style.css?v=7',
  './app.js?v=7',
  './manifest.webmanifest?v=7',
  './LOGO_LJA4_2024.jpg'
];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache=>cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;

  const request=event.request;
  const url=new URL(request.url);

  // Navigation/HTML: toujours demander la version publiée au serveur.
  // On ne met volontairement jamais index.html en cache.
  if(request.mode==='navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html')){
    event.respondWith(
      fetch(request,{cache:'no-store'}).catch(()=>
        new Response(
          '<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="background:#050505;color:white;font-family:Arial;padding:24px"><h2>LJA</h2><p>Connexion nécessaire pour charger la dernière version de l’application.</p></body></html>',
          {headers:{'Content-Type':'text/html; charset=utf-8'}}
        )
      )
    );
    return;
  }

  // Fichiers statiques : réseau d’abord, cache uniquement en secours.
  event.respondWith(
    fetch(request).then(response=>{
      if(response && response.ok && url.origin===self.location.origin){
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(request,copy));
      }
      return response;
    }).catch(()=>caches.match(request))
  );
});