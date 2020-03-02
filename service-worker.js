const CACHE_CONTENT = 'InFoot-Content-v1.0';
const CACHE_APP = 'InFoot-App-v1.0';
var urlsToCache = [
	".",
	"css/materialize.min.css",
	"css/style.css",
	"img/apple-touch-icon.png",
	"img/favicon.png",
	"img/icon-192x192.png",
	"img/icon-512x512.png",
	"img/icon-text.png",
	"js/db.js",
	"js/idb.js",
	"js/materialize.min.js",
	"js/script.js",
	"pages/credit.html",
	"pages/daftar-jadwal-disimpan.html",
	"pages/home.html",
	"pages/informasi-tim.html",
	"pages/jadwal-disimpan.html",
	"pages/jadwal-pertandingan.html",
	"pages/klasemen.html",
	"webfont/MaterialIcons-Regular.woff2",
	"index.html",
	"manifest.json"
];

self.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open(CACHE_APP).then(function(cache) {
			return cache.addAll(urlsToCache);
		})
	);
})

self.addEventListener('activate', function(event) {
	event.waitUntil(self.clients.claim());
})

self.addEventListener('activate', function(event) {
	event.waitUntil(
		caches.keys().then(function(cacheNames) {
			return Promise.all(
				cacheNames.map(function(cacheName) {
					if (!(cacheName == CACHE_APP || cacheName == CACHE_CONTENT)) {
						console.log('Serviceworker: cache ' + cacheName + ' dihapus');
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
});


 
//  Fungsi untuk membuat source konten dari api football di caching secara dinamis
self.addEventListener('fetch', function(event) {
	event.respondWith(
		caches.match(event.request).then(function(cacheResponse) {
			return caches.open(CACHE_CONTENT).then(function(cache) {
				var fetchResponse = fetch(event.request).then(function(networkResponse) {
					cache.put(event.request, networkResponse.clone());
					return networkResponse;
				});
				return cacheResponse || fetchResponse;
			})
		})
	)
})


self.addEventListener('push', function(event) {
	var pushData;
	if (event.data) {
		console.log(event.data.json());
		pushData = event.data.json();
	} else {
		pushData = {'title': 'No Payload Data', 'options': null};
	}
	event.waitUntil(
		self.registration.showNotification(pushData.title, pushData.options)
	)
})

self.addEventListener('notificationclick', (event)=> {
	event.notification.close();
	if (!event.action) {
		return;
	}

	switch (event.action) {
		case 'yes':
			//Buka tab baru
			clients.openWindow('https://pwa-sb2.azharlihan.com/#klasemen');
			break;
	}
})