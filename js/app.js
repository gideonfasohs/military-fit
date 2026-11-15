// MILITARY FIT — app entry. In this step it only registers the service worker.
// The router and screens come in the next steps.

const secure = location.protocol === 'https:' ||
  location.hostname === 'localhost' || location.hostname === '127.0.0.1';

if ('serviceWorker' in navigator && secure) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => console.warn('Service worker not registered:', err));
  });
}
