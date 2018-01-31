
var isSubscribed = false;
var serviceWorkerRegistration = null;
var pushApplicationPublicKey = 'BLhNLzT7JlJTue3C1FDQzAohmiUqBI2t1NCz6G2n5gKA3jKONRrJTM6MbzuK5SIeftHlz7kemkhzDj8pCMlTYfk';
var serviceWorkerScriptUrl = '/service-worker-app/service-worker.js'; 
var serviceWorkerRegistrationOptions = {scope : '/service-worker-app/'};

function errorHandler(error) {
	console.error(error);
}


function postRequestToServer(url, data, onDone, onFail) {
	
	var request = $.ajax( 
	   {
		url :  url,   
		method : 'POST',
		async : true,
		contentType : 'application/json; charset=UTF-8',
		data : data,
		dataType : 'json',
		timeout : 30000
	   });
			
	request.done(onDone);
		
	request.fail(onFail);
	
	return request;
}


$(document).ready(function() {

	var permitPushNotifsCheckbox = $('#permitPushNotifs');
	permitPushNotifsCheckbox.prop('disabled', true);
	if (Notification.permission !== 'denied') {
	
		if ('serviceWorker' in navigator) {
		  
			if ('PushManager' in window && 'WebPushNotifLib' in window) {
				
				// Register service worker to handle push notifications
				WebPushNotifLib.registerServiceWorker(serviceWorkerScriptUrl, 
						serviceWorkerRegistrationOptions, function(swReg){
					
					serviceWorkerRegistration = swReg;
					WebPushNotifLib.getSubscription(swReg, function(subscription) {
				
						isSubscribed = (subscription !== null);
						permitPushNotifsCheckbox.prop('checked', isSubscribed);
						
						// Observe checkbox changes.
						permitPushNotifsCheckbox.on('change', function(event){
							
							if (Notification.permission !== 'denied' && !isSubscribed) {
							
								// Subscribe client to push notifications.
								WebPushNotifLib.subscribeUser(serviceWorkerRegistration, 
										pushApplicationPublicKey, function(sub){
									
									if (sub) {
									
										postRequestToServer(
											'/service-worker-app/pushsubscription/add', 
											JSON.stringify(sub), 
											function(response){
												if (response.success === true) {
					
													isSubscribed = true;
															
												} else {
															
													errorHandler('Error adding subscription to server.');
												}	
												
												permitPushNotifsCheckbox.prop('checked', isSubscribed);
											},
											function(jqXHR, textStatus, errorThrown){
												
												permitPushNotifsCheckbox.prop('checked', isSubscribed);
												errorHandler('Network error adding subscription. Status: ' + textStatus + '.');
											}
										);
										
									} 
									
								}, function(error){
									
									console.error(error);
									permitPushNotifsCheckbox.prop('checked', false);
									permitPushNotifsCheckbox.prop('disabled', true);
								});
								
							} else if (isSubscribed) {
								
								WebPushNotifLib.getSubscription(serviceWorkerRegistration, function(sub){
									
									if (sub != null) {
										
										// Unsubscribe client to push notifications.
										WebPushNotifLib.unsubscribeUser(sub, function(unsubscribed){
											 
											 if (unsubscribed) {
											 
												 postRequestToServer(
													'/service-worker-app/pushsubscription/remove', 
													JSON.stringify(sub), 
													function(response){
														
														if (response.success == true) {
															
															isSubscribed = false;
															
														} else {
															
															errorHandler('Error removing subscription from server.');
														}		
															
														permitPushNotifsCheckbox.prop('checked', isSubscribed);
													},
													function(jqXHR, textStatus, errorThrown){
														
														permitPushNotifsCheckbox.prop('checked', isSubscribed);
														errorHandler('Network error removing subscription. Status: ' + textStatus + '.');
													}
												 );
											 }		
											 
										 }, function(error){

											console.error(error);
											permitPushNotifsCheckbox.prop('checked', true);
										});
										
									}
									
								}, errorHandler);
								
							}
							
						});
						
					}, errorHandler);
					
				}, errorHandler);
					
				permitPushNotifsCheckbox.prop('disabled', false);	
	
			}
			
		}
	
	} else {
		
		permitPushNotifsCheckbox.prop('checked', false);
	} 
	
});	
	
