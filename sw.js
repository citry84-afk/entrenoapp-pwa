const CACHE_NAME = 'entrenoapp-v1.0.1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/css/glassmorphism.css',
    '/js/app.js',
    '/js/config/firebase-config.js',
    '/js/auth/auth.js',
    '/js/components/dashboard.js',
    '/js/components/workouts.js',
    '/js/components/running.js',
    '/js/components/challenges.js',
    '/js/components/profile.js',
    '/js/data/exercises.js',
    '/js/data/crossfit-wods.js',
    '/js/data/running-plans.js',
    '/js/utils/tts.js',
    '/js/utils/offline.js',
    '/manifest.json',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png',
    '/assets/icons/icon-144x144.png',
    '/assets/icons/apple-touch-icon.png',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Instalación del service worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Cacheando archivos');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activación del service worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activando...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Eliminando caché antigua');
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Interceptar peticiones de red
self.addEventListener('fetch', (event) => {
    // Solo cachear peticiones GET
    if (event.request.method !== 'GET') return;
    
    // Evitar cachear Firebase Auth y Analytics
    if (event.request.url.includes('firebaseapp.com') || 
        event.request.url.includes('googleapis.com') ||
        event.request.url.includes('googletagmanager.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Si está en caché, devolverlo
                if (response) {
                    return response;
                }
                
                // Si no está en caché, hacer petición de red
                return fetch(event.request)
                    .then((response) => {
                        // Verificar que la respuesta sea válida
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clonar la respuesta para cachearla
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // Si falla la red y no está en caché, mostrar página offline
                        if (event.request.destination === 'document') {
                            return caches.match('/offline.html');
                        }
                    });
            })
    );
});

// Sincronización en background
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('Service Worker: Sincronización en background');
        event.waitUntil(
            // Aquí irían las funciones de sincronización
            syncData()
        );
    }
});

// Notificaciones push
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/assets/icons/icon-192x192.png',
            badge: '/assets/icons/badge.png',
            vibrate: [200, 100, 200],
            data: data.data,
            actions: [
                {
                    action: 'open',
                    title: 'Abrir App'
                },
                {
                    action: 'close',
                    title: 'Cerrar'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Función auxiliar para sincronización
async function syncData() {
    try {
        // Aquí se sincronizarían los datos offline con Firebase
        console.log('Sincronizando datos...');
        return Promise.resolve();
    } catch (error) {
        console.error('Error en sincronización:', error);
        return Promise.reject(error);
    }
}
