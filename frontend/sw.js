// ============================================
// HPTECH PORTFOLIO - SERVICE WORKER
// ============================================

const CACHE_NAME = "hptech-portfolio-v1.0.0";
const RUNTIME_CACHE = "hptech-runtime-v1.0.0";

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/offline.html",
  "/manifest.json",
  "/Assets/icons/favicon.svg",
  "/Assets/icons/icon-192x192.png",
  "/Assets/icons/icon-512x512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap",
];

// Install event - cache critical assets
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Pre-caching assets");
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log("[Service Worker] Installation complete");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("[Service Worker] Pre-cache failed:", error);
      }),
  );
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");

  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              console.log("[Service Worker] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log("[Service Worker] Activation complete");
        return self.clients.claim();
      }),
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests and API calls
  if (event.request.method !== "GET") return;

  // Skip cross-origin requests (like Google Fonts, CDNs, etc.)
  const url = new URL(event.request.url);
  if (
    url.origin !== location.origin &&
    !url.href.includes("fonts.googleapis.com") &&
    !url.href.includes("cdnjs.cloudflare.com")
  ) {
    return;
  }

  // For navigation requests (HTML pages), use network-first strategy
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the latest version
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If offline, serve cached version or offline page
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || caches.match("/offline.html");
          });
        }),
    );
    return;
  }

  // For other assets (CSS, JS, images), use cache-first strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version immediately
        // Update cache in background for next visit
        fetch(event.request)
          .then((response) => {
            if (response.ok) {
              caches
                .open(RUNTIME_CACHE)
                .then((cache) => cache.put(event.request, response));
            }
          })
          .catch(() => {});

        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetch(event.request)
        .then((response) => {
          // Check if we received a valid response
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the response
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch((error) => {
          // If image fails, return a placeholder
          if (event.request.destination === "image") {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#E1F5EE" width="200" height="200"/><text fill="#1D9E75" font-family="sans-serif" font-size="18" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">Image not available</text></svg>',
              { headers: { "Content-Type": "image/svg+xml" } },
            );
          }

          // For other resources, throw error (will show offline page for navigation)
          throw error;
        });
    }),
  );
});

// Handle messages from the main thread
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});

// Background sync for offline form submissions
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-messages") {
    event.waitUntil(syncMessages());
  }
});

async function syncMessages() {
  try {
    // This would need to be implemented with IndexedDB
    // For now, this is a placeholder for future implementation
    console.log("[Service Worker] Background sync triggered");

    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "SYNC_COMPLETE",
        message: "Offline messages synced successfully",
      });
    });
  } catch (error) {
    console.error("[Service Worker] Background sync failed:", error);
  }
}

// Push notification support (for future use)
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "New message from HPTech Portfolio",
    icon: "/Assets/icons/icon-192x192.png",
    badge: "/Assets/icons/icon-72x72.png",
    vibrate: [200, 100, 200],
    tag: "hptech-notification",
  };

  event.waitUntil(
    self.registration.showNotification("HPTech Portfolio", options),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});

console.log("[Service Worker] Service Worker loaded successfully!");
