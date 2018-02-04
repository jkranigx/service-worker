
const cacheName = 'cache_v1';
const networkUnavailbleUrl = '/service-worker-app/network-unavailable.html';

// Install
self.addEventListener('install', function(event){
	
	event.waitUntil(caches.open(cacheName).then(function(cache){ 
		
		return cache.addAll([
			networkUnavailbleUrl,
			'/service-worker-app/index.html',
			'/service-worker-app/pages/home.html',
			'/service-worker-app/images/icon-144x144.png',
			'/service-worker-app/images/icon-192x192.png'
		]);
		
	}).catch(function(error){
		
		console.info('Error installing service worker: ' + error);		
	}));
	
});



// Fetch 
self.addEventListener('fetch', function(event) {
		
	event.respondWith(caches.match(event.request).then(function(response){
		
		return response || fetch(event.request);
		
	}).catch(function(event) {
		
		// If there is an error fetching from network, display 
		// "No Network Connection" page (cached)
		return caches.match(networkUnavailbleUrl);
    }));
});



// Activate 
self.addEventListener('activate', function(event) {
	
	// No cleanup (outdated cache, etc.) to perform.
});



// Push event
self.addEventListener('push', function(event) {
  
	if (event.data) {
		
		console.info('This push event has data: ', event.data.text());
		
	} else {
	  
	  console.info('This push event has no data.');
	}
	
	var promiseChain = self.registration.showNotification(event.data.text());
    event.waitUntil(promiseChain);

	
});


