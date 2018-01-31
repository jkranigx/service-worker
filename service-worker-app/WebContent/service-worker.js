

// Handle push event
self.addEventListener('push', function(event) {
  
	if (event.data) {
		
		console.info('This push event has data: ', event.data.text());
		
	} else {
	  
	  console.info('This push event has no data.');
	}
	
	var promiseChain = self.registration.showNotification(event.data.text());
    event.waitUntil(promiseChain);

	
});



self.addEventListener('fetch', function(e) {
	
	// All requests handled by browser.
	return;
});
