const CACHE_NAME = 'shawnsworks-v1';
const STATIC_CACHE = 'shawnsworks-static-v1';
const DYNAMIC_CACHE = 'shawnsworks-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon.svg',
];

const OFFLINE_PAGE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SHAWNSWORKS - Offline</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #0a0a0b;
      color: #fafafa;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 20px;
    }
    .container { max-width: 400px; }
    .icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      background: linear-gradient(135deg, #6d28d9, #4c1d95);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: bold;
    }
    h1 { font-size: 24px; margin-bottom: 12px; }
    p { color: #a1a1aa; margin-bottom: 24px; line-height: 1.6; }
    button {
      background: #6d28d9;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover { background: #5b21b6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">SW</div>
    <h1>You're Offline</h1>
    <p>Please check your internet connection and try again. Your data is safely cached.</p>
    <button onclick="location.reload()">Try Again</button>
  </div>
</body>
</html>
`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(navigationHandler(request));
    return;
  }

  if (request.destination === 'image' || request.destination === 'font') {
    event.respondWith(cacheFirstWithNetwork(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

async function navigationHandler(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    const indexCache = await caches.match('/');
    if (indexCache) {
      return indexCache;
    }
    return new Response(OFFLINE_PAGE, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

async function networkFirstWithCache(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response(JSON.stringify({ error: 'Offline', message: 'Please check your connection' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function cacheFirstWithNetwork(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    return new Response('', { status: 404, statusText: 'Not Found' });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => null);

  if (cachedResponse) {
    fetchPromise.catch(() => {});
    return cachedResponse;
  }

  const networkResponse = await fetchPromise;
  if (networkResponse) {
    return networkResponse;
  }

  return new Response('Resource unavailable offline', { 
    status: 503, 
    statusText: 'Service Unavailable' 
  });
}

self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'SHAWNSWORKS Alert';
  const options = {
    body: data.body || 'New trading signal available',
    icon: '/icons/icon.svg',
    badge: '/icons/icon.svg',
    tag: data.tag || 'swc-notification',
    data: { url: data.url || '/' },
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncPendingTransactions());
  }
});

async function syncPendingTransactions() {
  console.log('[SW] Syncing pending transactions');
}
