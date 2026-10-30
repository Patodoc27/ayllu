/* AYLLU — service worker: cache del shell + Web Push */
var VERSION = 'ayllu-v1';
var SHELL = [
  './',
  'index.html',
  'app/theme.css',
  'app/config.js',
  'app/icons.js',
  'app/demo.js',
  'app/views.js',
  'app/app.js',
  'manifest.webmanifest'
];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(VERSION).then(function(c){ return c.addAll(SHELL); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if(k !== VERSION) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).then(function(res){
        var copia = res.clone();
        caches.open(VERSION).then(function(c){ c.put(e.request, copia); });
        return res;
      }).catch(function(){ return cached; });
    })
  );
});

/* Push: "Pepito faltó" — llega aunque la app esté cerrada */
self.addEventListener('push', function(e){
  var data = { titulo: 'AYLLU', cuerpo: 'Nueva novedad del colegio', url: './' };
  try{ if(e.data) data = e.data.json(); }catch(err){}
  e.waitUntil(
    self.registration.showNotification(data.titulo, {
      body: data.cuerpo,
      icon: 'assets/icon-192.png',
      badge: 'assets/icon-192.png',
      data: { url: data.url || './' },
      vibrate: [100, 50, 100]
    })
  );
});

self.addEventListener('notificationclick', function(e){
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list){
      for(var i=0;i<list.length;i++){
        if(list[i].url.indexOf('ayllu')>-1 || list[i].focus) return list[i].focus();
      }
      return clients.openWindow(e.notification.data.url);
    })
  );
});
