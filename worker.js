/**
 * Service worker
 */

/**
 * Cache Identifier
 * @type {string}
 */
const CACHE_ID = "test-v17";

/**
 * Files to cache
 * @type {string[]}
 */
const paths = [
    ".", "manifest.json", "img/icon192.png", "img/icon512.png", "script.js", "picnic.min.css", "style.css"
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
 * Service worker is redady
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