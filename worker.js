/**
 * Service worker
 */

/**
 * Cache Identifier
 * @type {string}
 */
const CACHE_ID = "test-v19";

/**
 * Files to cache
 * @type {string[]}
 */
const paths = [
    ".", "manifest.json", "script.js", "picnic.min.css", "style.css",
    "img/icon48.png", "img/icon72.png", "img/icon96.png", "img/icon144.png",
    "img/icon168.png", "img/icon192.png",  "img/icon512.png"
];

/**
 * Cache all files on install event
 * @returns {Promise<void>}
 */
const handleInstall = async () => {
    const cache = await caches.open(CACHE_ID);
    return await cache.addAll(paths);
}
self.addEventListener("install",
    (evt) => evt.waitUntil(handleInstall()) );

/**
 * Service worker is ready
 */
self.addEventListener("activate",
    () => console.log("Service worker active and ready") );

/**
 * Handle all fetch events
 * @param evt
 * @returns {Promise<Response|undefined>}
 */
const handleFetch = async (evt) => {
    if (evt.request.url.startsWith('https://api.studentenwerk-dresden.de')) {
        return await fetch(evt.request);
    }
    const cache = await caches.open(CACHE_ID);
    return await cache.match(evt.request);
};
self.addEventListener("fetch",
    (evt => evt.respondWith(handleFetch(evt))) );