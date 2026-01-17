// Ticko Push Notification Service Worker
// This handles incoming push notifications when the app is in the background

self.addEventListener('install', (event) => {
    console.log('[SW] Service worker installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Service worker activated');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
    console.log('[SW] Push received:', event);

    let data = {
        title: 'Ticko',
        body: 'Du har en ny notifikation',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        url: '/',
    };

    try {
        if (event.data) {
            const payload = event.data.json();
            data = {
                title: payload.title || data.title,
                body: payload.body || data.body,
                icon: payload.icon || data.icon,
                badge: data.badge,
                url: payload.url || data.url,
                tag: payload.tag || 'ticko-notification',
            };
        }
    } catch (e) {
        console.error('[SW] Failed to parse push data:', e);
    }

    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        tag: data.tag,
        vibrate: [100, 50, 100],
        data: {
            url: data.url,
            dateOfArrival: Date.now(),
        },
        actions: [
            { action: 'open', title: 'Öppna Ticko' },
            { action: 'dismiss', title: 'Avfärda' },
        ],
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event);

    event.notification.close();

    if (event.action === 'dismiss') {
        return;
    }

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Try to focus an existing window
            for (const client of clientList) {
                if (client.url.includes('ticko.se') && 'focus' in client) {
                    client.navigate(urlToOpen);
                    return client.focus();
                }
            }
            // Open a new window if none found
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});
