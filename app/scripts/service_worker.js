let authToken = '';

self.addEventListener('install', event => {
    const params = new URL(location);
    authToken = params.searchParams.get('token');
    const installCompleted = Promise.resolve()
      .then(() => {});
    event.waitUntil(installCompleted);
  });
  
self.addEventListener('activate', event => {
    event.waitUntil(
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
          return Promise.all(
              cacheNames.map((cache) => {
                  if (cache !== cacheName) {
                      return caches.delete(cache);
                  }
              })
          );
      }));
  });

self.addEventListener("fetch", event => {
    
    if (event.request.url.slice(0, 42) == "https://spraakbanken.gu.se/korp/data/ivip/" ) {
        event.respondWith(customHeaderRequestFetch(event));
    }
});

function customHeaderRequestFetch(event) {

    const newRequest = new Request(event.request, {
        mode: "cors",
        credentials: "omit",
        headers: {
            range:
              event.request.headers.get("range") != undefined
                ? event.request.headers.get("range")
                : "bytes=0-",
            Authorization: "Basic " + authToken
          }
    });

    return fetch(newRequest);
}