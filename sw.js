// Service Worker desabilitado para evitar problemas de CORS e fetch errors
// O site funciona perfeitamente sem PWA offline cache

self.addEventListener('install', (event) => {
    console.log('SW: Service worker installed (no caching)');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('SW: Service worker activated');
    // Limpar todos os caches antigos
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    console.log('SW: Deleting cache:', cacheName);
                    return caches.delete(cacheName);
                })
            );
        })
    );
    self.clients.claim();
});

// Não interceptar nenhum fetch - deixar o browser lidar naturalmente
self.addEventListener('fetch', (event) => {
    // Do nothing - let all requests pass through naturally
}); 