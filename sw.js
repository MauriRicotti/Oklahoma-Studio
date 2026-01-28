// Service Worker para Oklahoma Studio
const CACHE_NAME = 'oklahoma-v1';
const urlsToCache = [
  './',
  './index.html',
  './dashboard.html',
  './Style.css',
  './dashboard.css',
  './Main.js',
  './firebase-config.js',
  './install-app.js',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/fonts/bootstrap-icons.woff2'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache).catch(err => {
          console.warn('Algunos recursos no pudieron ser cacheados:', err);
          // Continuar incluso si algunos recursos fallan
          return cache.addAll(urlsToCache.filter(url => !url.includes('http')));
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de fetch: Network first, fallback to cache
self.addEventListener('fetch', event => {
  // Solo cachear requests GET
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Para APIs externas: network first, cache as fallback
  if (url.origin.includes('firebase') || event.request.url.includes('api')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cachear respuestas exitosas de APIs
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Si falla la red, intentar desde cache
          return caches.match(event.request)
            .then(response => response || new Response('Sin conexión', { status: 503 }));
        })
    );
    return;
  }

  // Para páginas HTML: intentar network, luego cache
  if (event.request.destination === 'document' || event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Si no hay conexión, intentar desde cache
          return caches.match(event.request)
            .then(response => {
              if (response) {
                return response;
              }
              // Si no está en cache, devolver index.html como fallback
              return caches.match('./index.html');
            });
        })
    );
    return;
  }

  // Para archivos locales (CSS, JS, etc.): cache first
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(response => {
            // No cachear responses que no sean 200
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }
            // Cachear respuesta exitosa
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
            return response;
          })
          .catch(() => {
            return new Response('Recurso no disponible', { status: 404 });
          });
      })
  );
});
