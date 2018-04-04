package com.service.worker;

import java.io.Serializable;
import java.util.Date;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

public class PushSubscription implements Serializable {

	private static final long serialVersionUID = -2597467694482275041L;

	private final String 	endPoint;
	private final Date  	expirationTime;
	private final String	p256dhKey;
	private final String    authKey; // authentication secret.
	
	
	public PushSubscription(String endPoint, Date expirationTime,
				final String p256dhKey, final String authKey) {
		super();
		this.endPoint = endPoint;
		this.expirationTime = expirationTime;
		this.p256dhKey = p256dhKey;
		this.authKey = authKey;
	}


	public String getEndPoint() {
		return endPoint;
	}


	public Date getExpirationTime() {
		return expirationTime;
	}
	
	
	public boolean hasExpired() {

		return getExpirationTime() != null && getExpirationTime().before(new Date());
	}
	
	



	public String getP256dhKey() {
		return p256dhKey;
	}


	public String getAuthKey() {
		return authKey;
	}


	@Override
	public int hashCode() {

		return new HashCodeBuilder().append(getEndPoint()).toHashCode();
	}


	@Override
	public boolean equals(Object obj) {
	
		if (this == obj)
			return true;
		
		boolean isEquals = false;
		if (obj instanceof  PushSubscription) {
			
			final PushSubscription other = (PushSubscription)obj;
			
			isEquals = new EqualsBuilder().
				append(getEndPoint(), other.getEndPoint()).
				isEquals();
		}
		
		
		return isEquals;
	}


	
	
}
