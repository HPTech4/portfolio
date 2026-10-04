// ==========================================================================
// Service worker — Alimi Azeez Opeyemi portfolio
//
// Shell caching only. Navigation requests are network-first so a deploy is
// picked up immediately; static assets are cache-first with a background
// refresh. Nothing here is push-related — the previous version carried push
// and notificationclick handlers that could never fire, because nothing in
// the site ever subscribes to push.
// ==========================================================================

var CACHE_VERSION = "v2.6.0";
var SHELL_CACHE = "portfolio-shell-" + CACHE_VERSION;
var RUNTIME_CACHE = "portfolio-runtime-" + CACHE_VERSION;

// Paths are absolute, resolved against the deploy root (`frontend/`).
//
// Both forms of the projects URL are listed, because a navigation only matches
// the cache on the exact URL it asked for. In-page links use
// "/projects.html", so they also resolve from a plain local server; Netlify
// 301s that to "/projects", which is the canonical URL in sitemap.xml and the
// PWA shortcut. Dropping either one sends that path to the offline page.
//
// The screenshots in /Assets are deliberately left out: they are large PNGs,
// and caching five of them to serve a page that already degrades gracefully
// offline is not a trade worth making. The CBT illustration is an exception —
// it is vector, a few KB, and it is the only image on the projects page that
// does not have a sibling somewhere else in the site.
var PRECACHE = [
  "/",
  "/projects",
  "/projects.html",
  "/style.css",
  "/script.js",
  "/offline.html",
  "/manifest.json",
  "/Assets/icon-192x192.png",
  "/Assets/cbt-center.svg",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then(function (cache) {
        // cache.addAll() is atomic — one 404 would reject the whole batch and
        // leave the site with no offline support at all. Each asset settles
        // independently instead, and failures are logged by name.
        return Promise.allSettled(
          PRECACHE.map(function (asset) {
            return cache.add(asset).catch(function (error) {
              throw { asset: asset, error: error };
            });
          }),
        );
      })
      .then(function (results) {
        var failures = results.filter(function (r) {
          return r.status === "rejected";
        });

        if (failures.length) {
          console.warn(
            "[sw] " + failures.length + "/" + results.length + " assets failed to pre-cache:",
          );
          failures.forEach(function (failure) {
            console.warn("  ✗ " + failure.reason.asset + " — " + failure.reason.error.message);
          });
        }

        return self.skipWaiting();
      })
      .catch(function (error) {
        console.error("[sw] Pre-cache failed unexpectedly:", error);
      }),
  );
});

self.addEventListener("activate", function (event) {
  var keep = [SHELL_CACHE, RUNTIME_CACHE];

  event.waitUntil(
    caches
      .keys()
      .then(function (names) {
        return Promise.all(
          names.map(function (name) {
            if (keep.indexOf(name) === -1) return caches.delete(name);
            return null;
          }),
        );
      })
      .then(function () {
        return self.clients.claim();
      }),
  );
});

self.addEventListener("fetch", function (event) {
  var request = event.request;

  if (request.method !== "GET") return;

  var url = new URL(request.url);

  // Leave anything cross-origin alone — the Formspree POST, Google Fonts, and
  // any third-party request should go straight to the network untouched.
  if (url.origin !== self.location.origin) return;

  // Navigations: network-first, falling back to cache, then the offline page.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          var copy = response.clone();
          caches.open(RUNTIME_CACHE).then(function (cache) {
            cache.put(request, copy);
          });
          return response;
        })
        .catch(function () {
          return caches.match(request).then(function (cached) {
            return cached || caches.match("/offline.html");
          });
        }),
    );
    return;
  }

  // Static assets: cache-first, refresh in the background.
  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) {
        fetch(request)
          .then(function (response) {
            if (response && response.ok) {
              caches.open(RUNTIME_CACHE).then(function (cache) {
                cache.put(request, response);
              });
            }
          })
          .catch(function () {
            /* offline — the cached copy stands */
          });

        return cached;
      }

      return fetch(request)
        .then(function (response) {
          if (response && response.status === 200 && response.type === "basic") {
            var copy = response.clone();
            caches.open(RUNTIME_CACHE).then(function (cache) {
              cache.put(request, copy);
            });
          }
          return response;
        })
        .catch(function (error) {
          // A missing image degrades to a neutral tile rather than a broken icon.
          if (request.destination === "image") {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">' +
                '<rect fill="#F2EFE8" width="800" height="500"/>' +
                '<text fill="#1F4D3A" font-family="sans-serif" font-size="24" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">Image unavailable offline</text>' +
                "</svg>",
              { headers: { "Content-Type": "image/svg+xml" } },
            );
          }

          throw error;
        });
    }),
  );
});
