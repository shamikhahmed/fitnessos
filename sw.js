'use strict';

const CACHE = 'fos-v8';
const ASSETS = [
  './',
  './index.html',
  './landing.html',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './js/storage.js',
  './js/app.js',
  './js/modules/onboarding.js',
  './js/modules/dashboard.js',
  './js/modules/workout.js',
  './js/modules/bodymap.js',
  './js/modules/coach.js',
  './js/modules/progress.js',
  './js/modules/nutrition.js',
  './js/modules/recovery.js',
  './js/modules/settings.js',
  './js/modules/profiles.js',
  './js/modules/anatomy.js',
  './js/modules/rehab.js',
  './js/modules/calisthenics.js',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
      .then(r => r || fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }))
      .catch(() => caches.match('./index.html'))
  );
});
