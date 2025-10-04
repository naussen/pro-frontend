const CACHE_NAME = 'proconcursos-study-v1';
const urlsToCache = [
    '/',
    '/saladeestudos.html',
    '/header_saladeestudos.html',
    '/styles.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    // Não intercepta requisições para APIs externas (como Mercado Pago, PayPal, etc.)
    if (event.request.url.includes('proconcursos.onrender.com') || 
        event.request.url.includes('api.mercadopago.com') ||
        event.request.url.includes('paypal.com') ||
        event.request.url.includes('googleapis.com') ||
        event.request.method !== 'GET') {
        return; // Deixa a requisição passar sem interceptar
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
}); 