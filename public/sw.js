const CACHE = 'mywally-shell-v1'
const OFFLINE_URL = '/offline'
const PRECACHE = [OFFLINE_URL, '/icon-192.png', '/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE)
      await cache.addAll(PRECACHE)
      self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  if (req.mode !== 'navigate') return

  event.respondWith(
    (async () => {
      try {
        return await fetch(req)
      } catch {
        const cache = await caches.open(CACHE)
        const cached = await cache.match(OFFLINE_URL)
        return cached ?? Response.error()
      }
    })(),
  )
})
