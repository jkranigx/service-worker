

if ('serviceWorker' in navigator) {
  
	if ('PushManager' in window) {

		var WebPushNotifLib = {};
		WebPushNotifLib.log = true;

		// Register Service Worker
		WebPushNotifLib.registerServiceWorker = function(scriptUrl, options,
				onServiceWorkerRegistered, onServiceWorkerRegError) {
		
			// Register service worker script.
			navigator.serviceWorker.register(scriptUrl, options).then(function(swReg) {

				if(WebPushNotifLib.log) { 
					console.info('registerServiceWorker: Service worker registered.');
				}	
					
				if (onServiceWorkerRegistered) {
					
					onServiceWorkerRegistered(swReg);
				}	
				
			}).catch(function(error) {
				
				if (onServiceWorkerRegError) {
					
					onServiceWorkerRegError(error);
				}
			});
			
		};	
	
		
		// Get Subscription
		WebPushNotifLib.getSubscription = function(swReg, onGetSubscription, onGetSubscriptionError) {
			
			swReg.pushManager.getSubscription().then(function(subscription) {
				
				if (subscription) { 

					if(WebPushNotifLib.log) { 
						console.info('getSubscription: Retrieved push notification subscription with endpoint: ' 
								+ subscription.endpoint);
					}	
					
				} else {
					
					if(WebPushNotifLib.log) { 

						console.info('getSubscription: No push subscription found.');
					}	
				}	
				
				if (onGetSubscription) {
					
					onGetSubscription(subscription);
				}	
				
			}).catch(function(error) {
				
				if (onGetSubscriptionError) {
					
					onGetSubscriptionError(error);
				}
			});

		};	
		
		
		// Subscribe User
		WebPushNotifLib.subscribeUser = function(swReg, base64EncodedPublicKey, onSubscribed, onSubscribeError) {

			swReg.pushManager.subscribe(
				{userVisibleOnly: true, 
				 applicationServerKey: WebPushNotifLib.urlB64ToUint8Array(base64EncodedPublicKey)}).then(function(subscription) {

				if(WebPushNotifLib.log) { 

					console.info('subscribeUser: User subscribed. Push notification: ' + subscription.endpoint);
				}	
	 				 
				if (onSubscribed) {	 
					onSubscribed(subscription);
				}	
				
			}).catch(function(error) {
			    
				if (onSubscribeError) {
					onSubscribeError(error);	
				}
				
			});
			
		};	
		
		
		// Unsubscribe User
		WebPushNotifLib.unsubscribeUser = function(subscription, onUnsubscribed, onUnsubscribeError) {
		
			if (subscription != null) {
			
				subscription.unsubscribe().then(function(unsubscribed) {
				    
					if(WebPushNotifLib.log) { 

						console.info('unsubscribeUser: User ' + (unsubscribed ? 'unsubscribed.' : 'could not be unsubscribed.'));
					}	
					
					if (onUnsubscribed) {
						onUnsubscribed(unsubscribed);
					}	
					
				}).catch(function(error) {
					
					if (onUnsubscribeError) {
						onUnsubscribeError(error);
					}	
				});
			}
			
		};	
		
		
		WebPushNotifLib.askPermissionToAllowPushNotifications = function(onSuccess, onError) {
			
			return new Promise(function(resolve, reject) {
				
				var permissionResult = Notification.requestPermission(function(result) {
					resolve(result);
			    });

			    if (permissionResult) {
			     
			    	permissionResult.then(resolve, reject);
			    }
			    
				}).then(function(permissionResult) {
			   
					if (onSuccess) {
						onSuccess(permissionResult);	
					}
					
				}).catch(function(error){
					
					if (onError) {
						onError(error)
					}
				});
		};
		
		
		WebPushNotifLib.urlB64ToUint8Array = function(base64String) {
			  
			var padding = '='.repeat((4 - base64String.length % 4) % 4);
			var base64 = (base64String + padding)
			    .replace(/\-/g, '+')
			    .replace(/_/g, '/');

			var rawData = window.atob(base64);
			var outputArray = new Uint8Array(rawData.length);

			for (let i = 0; i < rawData.length; ++i) {
			   outputArray[i] = rawData.charCodeAt(i);
			}
			
			return outputArray;
		};		
		
	
	} else {
		
		console.warn('Push messaging not supported by browser.');
	}

	
	
} else {
	
	console.warn('Service workers not supported by browser.');
}	


