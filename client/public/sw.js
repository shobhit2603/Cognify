// Cognify Service Worker cleanup / no-op
// Automatically unregisters any lingering service worker from previous local builds or extensions
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.registration.unregister());
});
