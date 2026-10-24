// Kill switch. The site no longer uses a service worker; this file replaces the old one on a
// returning visitor's next visit, clears its caches, unregisters itself and reloads the open
// tabs once so they get the current site. Keep it in place for a few months, then delete it.
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then(clients => clients.forEach(client => client.navigate(client.url)))
  )
})
