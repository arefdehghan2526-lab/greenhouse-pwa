```javascript id="8c7q0m"
const CACHE_NAME = "greenhouse-pwa-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
];


/* =========================================================
   INSTALL
========================================================= */

self.addEventListener(
  "install",
  function(event) {

    event.waitUntil(

      caches
        .open(CACHE_NAME)
        .then(function(cache) {

          return cache.addAll(APP_FILES);

        })

    );

    self.skipWaiting();

  }
);


/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener(
  "activate",
  function(event) {

    event.waitUntil(

      caches
        .keys()
        .then(function(cacheNames) {

          return Promise.all(

            cacheNames
              .filter(function(cacheName) {

                return (
                  cacheName !== CACHE_NAME
                );

              })
              .map(function(cacheName) {

                return caches.delete(
                  cacheName
                );

              })

          );

        })

    );

    self.clients.claim();

  }
);


/* =========================================================
   FETCH
========================================================= */

self.addEventListener(
  "fetch",
  function(event) {

    const request =
      event.request;


    /*
     * فقط درخواست‌های GET
     * در Service Worker مدیریت می‌شوند.
     */

    if (
      request.method !== "GET"
    ) {

      return;

    }


    /*
     * برای فایل‌های خود PWA:
     * ابتدا Cache و سپس Network
     */

    const url =
      new URL(request.url);


    if (
      url.origin === self.location.origin
    ) {

      event.respondWith(

        caches
          .match(request)
          .then(function(cachedResponse) {

            if (cachedResponse) {

              return cachedResponse;

            }


            return fetch(request)
              .then(function(response) {

                if (
                  response &&
                  response.status === 200 &&
                  response.type === "basic"
                ) {

                  const responseClone =
                    response.clone();


                  caches
                    .open(CACHE_NAME)
                    .then(function(cache) {

                      cache.put(
                        request,
                        responseClone
                      );

                    });

                }


                return response;

              });

          })

      );

    }

  }
);
```
