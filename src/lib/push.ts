// Push notification utilities

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray as Uint8Array<ArrayBuffer>;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
        console.log('Service workers not supported');
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service worker registered:', registration);
        return registration;
    } catch (error) {
        console.error('Service worker registration failed:', error);
        return null;
    }
}

export async function subscribeToPush(userId: string): Promise<PushSubscription | null> {
    if (!('PushManager' in window)) {
        console.log('Push notifications not supported');
        return null;
    }

    if (!VAPID_PUBLIC_KEY) {
        console.log('VAPID public key not configured');
        return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        console.log('Push notification permission denied');
        return null;
    }

    const registration = await registerServiceWorker();
    if (!registration) return null;

    try {
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        // Send subscription to server
        await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                subscription: subscription.toJSON(),
            }),
        });

        console.log('Push subscription successful:', subscription);
        return subscription;
    } catch (error) {
        console.error('Failed to subscribe to push:', error);
        return null;
    }
}

export async function unsubscribeFromPush(): Promise<boolean> {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            await subscription.unsubscribe();

            // Notify server
            await fetch('/api/push/unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: subscription.endpoint,
                }),
            });

            return true;
        }
        return false;
    } catch (error) {
        console.error('Failed to unsubscribe from push:', error);
        return false;
    }
}

export async function isPushSupported(): Promise<boolean> {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export async function getPushPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
        return 'denied';
    }
    return Notification.permission;
}
