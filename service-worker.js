const CACHE_NAME = 'brutbegleiter-v1';

self.addEventListener('install', function(event) {
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(clients.claim());
});

self.addEventListener('push', function(event) {
    if (!event.data) return;
    const data = event.data.json();
    const options = {
          body: data.body,
          icon: '/Brutbegleiter/icon-192.png',
          badge: '/Brutbegleiter/icon-192.png',
          vibrate: [200, 100, 200],
          data: { url: '/Brutbegleiter/' },
          actions: [
            { action: 'open', title: 'App oeffnen' }
                ]
    };
    event.waitUntil(
          self.registration.showNotification(data.title, options)
        );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
          clients.openWindow('/Brutbegleiter/')
        );
});
