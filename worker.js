/**
 * Service worker
 * changing this file triggers installation event
 * increment version number to trigger app reload on client
 */
const WORKERVERSION = '240818_1846';

/**
 * Asset files to cache
 * paths must be adjusted, if pwa is hosted in subdirectory
 */
const assets = [
    "/", "/manifest.json", "/script.js", "/picnic.min.css", "/style.css",
    "/img/icon48.png", "/img/icon72.png", "/img/icon96.png", "/img/icon144.png",
    "/img/icon168.png", "/img/icon192.png",  "/img/icon512.png"
];

/**
 * Install event: wipe all caches
 */
self.addEventListener('install', (event) => {
    console.log('Installing: ' + WORKERVERSION);
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(cacheName) {
                    // Return true if you want to remove this cache,
                    // but remember that caches are shared across
                    // the whole origin
                    //console.log('delete cache: ' + cacheName);
                    return true;
                }).map(function(cacheName) {
                    console.log('Deleting cache: ' + cacheName);
                    return caches.delete(cacheName);
                })
            );
        })
    );
    self.skipWaiting();
});

/**
 * Activate event: cache all assets
 */
self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open('assets');
        // Setting {cache: 'reload'} in the new request will ensure that the response
        // isn't fulfilled from the HTTP cache; i.e., it will be from the network.
        await assets.forEach(function(path) {
            //console.log('Add ' + path + ' to asset cache');
            cache.add(new Request(path, {cache: 'reload'}));
        });
    })());
    //Tell the active service worker to take control of the page immediately.
    event.waitUntil(clients.claim());
});

/**
 * Handle fetch event with caching strategy:
 * 1. API calls only from cache when offline
 * 2. photos of meals only from cache when offline, delete from cache if server responds with 404
 * 3. all assets always from cache
 */
self.addEventListener('fetch', (event) => {
    let path = new URL(event.request.url).pathname;
    //console.log(event.request.url);

    //API calls
    if (event.request.url.startsWith('https://api.studentenwerk-dresden.de')) {

        event.respondWith((async () => {
            const dataCache = await caches.open('data');
            try {
                const resp = await fetch(event.request);
                if (resp.ok) {
                    dataCache.add(event.request);
                    return resp;
                } else {
                    throw new Error('Error');
                }
            } catch (error) {
                //console.log('Data fetch failed!');
                return await dataCache.match(event.request);
            }
        })());

    //Fetching photos of meals
    } else if (event.request.url.startsWith('https://bilderspeiseplan.studentenwerk-dresden.de') ||
        event.request.url.startsWith('http://bilderspeiseplan.studentenwerk-dresden.de') ||
        event.request.url.startsWith('https://static.studentenwerk-dresden.de') ||
        event.request.url.startsWith('http://static.studentenwerk-dresden.de')) {

        event.respondWith((async () => {
            const dataCache = await caches.open('data');
            try {
                const resp = await fetch(event.request);
                if (resp.ok) {
                    dataCache.add(event.request);
                    //delete image from cache if its not available anymore
                } else if (resp.status === 404) {
                    dataCache.delete(event.request);
                }
                return resp;
            } catch (error) {
                return await dataCache.match(event.request);
            }
        })());

    //load assets always from cache
    } else if (assets.includes(path)) {

        event.respondWith((async () => {
            const cache = await caches.open('assets');
            const cachedResponse = await cache.match(event.request);
            if (cachedResponse) {
                //console.log('fetch asset ' + path + ' from cache');
                return cachedResponse;
            }
            return fetch(event.request);
        })());

    //unhandled fetches should never happen
    } else {
        console.log('Unhandled fetch: ' + event.request.url);
    }
});