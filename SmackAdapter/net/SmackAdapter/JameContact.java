/**
 * @author	Robert Schoenthal
 * @date		29.08.2007
 * @license	gpl
 */
package net.SmackAdapter;

/**
 * @class net.SmackAdapter.JameContact
 * @description stores a simple Jabber Contact
 */
public class JameContact {

	// private attributes
	private String	             jabberID;

	private String	             name;

	private String	             presenceMode;

	private String	             presenceMessage;

	private String	             presenceType;

	@SuppressWarnings("unchecked")
	private java.util.Collection	groups;

	// default constructor
	public JameContact() {
		this("", "", "", "", "");
	}

	// enhanced contructor, sets the attributes instant
	public JameContact(String jabberID, String name, String presenceMode,
	        String presenceMessage, String presenceType) {
		this.jabberID = jabberID;
		this.name = name;
		this.presenceMode = presenceMode;
		this.presenceMessage = presenceMessage;
		this.presenceType = presenceType;
	}

	// setters
	public void setJabberID(String jabberID) {
		this.jabberID = jabberID;
	}

	public void setName(String name) {
		this.name = name;
	}

	public void setPresenceMode(String presenceMode) {
		this.presenceMode = presenceMode;
	}

	public void setPresenceMessage(String presenceMessage) {
		this.presenceMessage = presenceMessage;
	}

	public void setPresenceType(String presenceType) {
		this.presenceType = presenceType;
	}

	@SuppressWarnings("unchecked")
	public void setGroups(java.util.Collection groups) {
		this.groups = groups;
	}

	// getters
	public String getJabberID() {
		return this.jabberID;
	}

	public String getName() {
		return this.name;
	}

	public String getPresenceMode() {
		return this.presenceMode;
	}

	public String getPresenceMessage() {
		return this.presenceMessage;
	}

	public String getPresenceType() {
		return this.presenceType;
	}

	@SuppressWarnings("unchecked")
	public java.util.Collection getGroups() {
		return this.groups;
	}

	/**
	 * @override toString() Method so the object is more readable
	 */
	@Override
	public String toString() {
		return this.jabberID + " " + this.name + " " + this.presenceMessage
		        + " " + this.presenceMode + " " + this.presenceType;
	}
}
