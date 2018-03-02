package com.service.worker;

import java.io.IOException;
import java.sql.Date;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.apache.http.HttpResponse;
import org.json.JSONObject;

import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;



@WebServlet(name="PushNotificationSubscriptionServlet",
            description="Manages service worker push notification subscriptions",
            urlPatterns = {"/pushsubscription/add", "/pushsubscription/remove", "/pushsubscription/send"})
public class PushServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;
	private static final String pushApplicationPublicKey = "BLhNLzT7JlJTue3C1FDQzAohmiUqBI2t1NCz6G2n5gKA3jKONRrJTM6MbzuK5SIeftHlz7kemkhzDj8pCMlTYfk";
	private static final String pushApplicationPrivateKey = "InYmtpArpaxlWbPKZ3n_HNNysblzWnL7UOZc9hTY37g"; 
	private static final String addPath = "/pushsubscription/add";
	private static final String removePath = "/pushsubscription/remove";
	private static final String sendPath = "/pushsubscription/send";
	
	private Set<PushSubscription> pushSubscriptions = Collections.synchronizedSet(new LinkedHashSet<PushSubscription>());
       
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		try {
		
			if (request.getServletPath().equalsIgnoreCase(sendPath)) {
				
				final String message = request.getParameter("message");
				final PushService pushService = new PushService(pushApplicationPublicKey, pushApplicationPrivateKey,  "Test");
				for (PushSubscription pushSubscription : pushSubscriptions) {
					
					if (!pushSubscription.hasExpired()) {
					
						Notification notification = new Notification(pushSubscription.getEndPoint(),
								pushSubscription.getP256dhKey(), pushSubscription.getAuthKey(), message);
						
						final HttpResponse httpResponse = pushService.send(notification);
						final int statusCode = httpResponse.getStatusLine().getStatusCode();
						
						if (statusCode == 201) {
							
							// Message received by user agent.
							log("Sent push notification to endpoint: " + pushSubscription.getEndPoint());
							
						} else if (statusCode == 404 || statusCode == 410) {
							
							// Subscription is gone. Remove subscription
							removePushSubscription(pushSubscription);
							
						} else {
							
							log("Push notification attempt failed. Status code: " + statusCode +
								". Status message: " +  httpResponse.getStatusLine().getReasonPhrase() + 
										". Endpoint: " + pushSubscription.getEndPoint());
						}
						
						
					} else {
						
						log("Push subscription expired. Endpoint: " + pushSubscription.getEndPoint());
						removePushSubscription(pushSubscription);
					}
						
				}
				
			}
			
		} catch (Exception exception) {
			
			log("Error sending push notification", exception);
		}
		
		response.getWriter().append("Served at: ").append(request.getContextPath());
	}

	



	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		// Get request body content as JSON.
		boolean success = false;
		try {
		
			final String jsonStr = IOUtils.toString(request.getReader());
		
			// Add subscription to map.
			final JSONObject subscriptionJSON = new JSONObject(jsonStr);
			final String expirationTimeStr = subscriptionJSON.optString("expirationTime", null);
			final Date expirationTime = expirationTimeStr != null ? new Date(Long.valueOf(expirationTimeStr)) : null;
			
			final PushSubscription pushSubscription = new PushSubscription(subscriptionJSON.getString("endpoint"),
				expirationTime, subscriptionJSON.getJSONObject("keys").getString("p256dh"), 
					subscriptionJSON.getJSONObject("keys").getString("auth"));
			
			if (request.getServletPath().equalsIgnoreCase(addPath)) {

				addPushSubscription(pushSubscription);
				success = true;
				
			} else if (request.getServletPath().equalsIgnoreCase(removePath)) {
				
				removePushSubscription(pushSubscription);
				success = true;
			} 
			
		} catch (Exception exception) {
		
			log("Error adding PushSubscription", exception);
		}
		
		response.setContentType("application/json;utf-8");
		JSONObject addResponse = new JSONObject();
		addResponse.put("success", success);
		response.getWriter().append(addResponse.toString()).flush();
				
	}

	
	
	private boolean addPushSubscription(final PushSubscription pushSubscription) {
		
		boolean success = pushSubscriptions.add(pushSubscription);
		if (success) {
			
			log("Added push subscription with endpoint: " + pushSubscription.getEndPoint());
			
		} else {
			
			log("Push subscription added previously - endpoint: " + pushSubscription.getEndPoint());
		}		
		
		return success;
	}

	

	private boolean removePushSubscription(final PushSubscription pushSubscription) {
		
		boolean success = pushSubscriptions.remove(pushSubscription);
		if (success) {
			
			log("Removed push subscription with endpoint: " + pushSubscription.getEndPoint());
			
		} else {
			
			log("Push subscription not found - endpoint: " + pushSubscription.getEndPoint());
		}
		
		return success;
		
	}
	
	
	
}
