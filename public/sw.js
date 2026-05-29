// FORGE Service Worker — v1
// Strategy: cache-first for assets, network-first for navigation

const CACHE_NAME = 'forge-v1'

// Shell assets to pre-cache on install
const PRECACHE = [
  '/',
  '/index.html',
]

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const { request } = e
  const url = new URL(request.url)

  // Navigation requests → network first, fall back to cached index
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    )
    return
  }

  // Google Fonts → network only (don't cache cross-origin)
  if (url.hostname.includes('fonts.g')) {
    e.respondWith(fetch(request))
    return
  }

  // Everything else → cache first, then network, then cache update
  e.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request)
      if (cached) return cached
      const response = await fetch(request)
      if (response.ok) cache.put(request, response.clone())
      return response
    })
  )
})
