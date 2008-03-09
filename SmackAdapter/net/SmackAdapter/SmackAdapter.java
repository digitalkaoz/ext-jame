/**
 * @author	Robert Schoenthal
 * @date		29.08.2007
 * @license	gpl
 */
package net.SmackAdapter;

// imports
import java.util.Collection;

/**
 * @class net.SmackAdapter.SmackAdapter
 * @description
 */
public class SmackAdapter {

	private JameConnection	jconn	= null; // private Attribute

	/**
	 * adds the specified buddy to the specified group
	 * 
	 * @param rosterEntryUserName
	 * @param rosterEntryGroup
	 * @return boolean
	 * @throws Exception
	 */
	public boolean addRosterEntry(String rosterEntryUserName,
	        String rosterEntryGroup) throws Exception {
		if (jconn.isConnected()) {
			return jconn.addRosterEntry(rosterEntryUserName, rosterEntryGroup);
		} else
			return false;
	}

	/**
	 * changes the users password
	 * 
	 * @param newPassword
	 * @return boolean
	 * @throws Exception
	 */
	public boolean changePassword(String newPassword) throws Exception {
		if (jconn.isConnected()) {
			return jconn.changePassword(newPassword);
		} else
			return false;
	}

	/**
	 * connects to a server, creates a new user if createNewUser=true, and logs
	 * in the user
	 * 
	 * @param userName
	 * @param password
	 * @param serverName
	 * @param serverPort
	 * @param serviceName
	 * @param createNewUser
	 * @return boolean
	 * @throws Exception
	 */
	public boolean connect(String userName, String password, String serverName,
	        int serverPort, String serviceName, boolean createNewUser)
	        throws Exception {
		if (jconn == null) {
			jconn = new JameConnection(serverName, serverPort, "Jame");
			if (createNewUser) {
				createNewAccount(userName, password);
			}
			return login(userName, password);
		} else {
			return jconn.isConnected();
		}
	}

	/**
	 * returns wether the user is connected or not
	 * 
	 * @return boolean
	 */
	public boolean isConnected() {
		if (jconn != null)
			return jconn.isConnected();
		else
			return false;
	}

	/**
	 * trys to login in the user
	 * 
	 * @param userName
	 * @param password
	 * @throws Exception
	 */
	private boolean login(String userName, String password) throws Exception {
		if (userName != null && password != null && jconn != null) {
			return jconn.login(userName, password);
		} else
			return false;
	}

	/**
	 * trys to create a new user account on the server
	 * 
	 * @param userName
	 * @param password
	 * @throws Exception
	 */
	private boolean createNewAccount(String userName, String password)
	        throws Exception {
		if (userName != null && password != null) {
			return jconn.createNewAccount(userName, password);
		} else
			return false;
	}

	/**
	 * deletes a buddy
	 * 
	 * @param rosterEntryUserName
	 * @return boolean
	 * @throws Exception
	 */
	public boolean delRosterEntry(String rosterEntryName) throws Exception {
		if (rosterEntryName != null && jconn.isConnected()) {
			jconn.delRosterEntry(rosterEntryName);
			return true;
		} else
			return false;
	}

	/**
	 * deletes a rostergroup
	 * 
	 * @param rosterGroupName
	 * @return boolean
	 * @throws Exception
	 */
	public boolean delRosterGroup(String rosterGroupName) throws Exception {
		if (rosterGroupName != null && jconn.isConnected()) {
			return jconn.delRosterGroup(rosterGroupName);
		} else
			return false;
	}

	/**
	 * delete the users account
	 * 
	 * @return boolean
	 * @throws Exception
	 */
	public boolean deleteLoggedAccount() throws Exception {
		if (jconn.isConnected()) {
			return jconn.deleteLoggedAccount();
		} else
			return false;
	}

	/**
	 * disconnectes the user from the jabber server
	 * 
	 * @return boolean
	 * @throws Exception
	 */
	public boolean disconnect() throws Exception {
		if (jconn.isConnected()) {
			jconn.disconnect();
			return true;
		} else
			return true;
	}

	/**
	 * returns all incoming messages
	 * 
	 * @return JameMessage[]
	 * @throws Exception
	 */
	public JameMessage[] getChatMessages() throws Exception {
		if (jconn.isConnected()) {
			return jconn.getChatMessages();
		} else
			return null;
	}

	/**
	 * returns all incoming presences
	 * 
	 * @return JamePresence[]
	 * @throws Exception
	 */
	public JamePresence[] getPresences() throws Exception {
		if (jconn.isConnected()) {
			return jconn.getPresences();
		} else
			return null;
	}

	/**
	 * returns the size of the rosterlist
	 * 
	 * @return int
	 * @throws Exception
	 */
	public int getContactsCount() throws Exception {
		if (jconn.isConnected())
			return jconn.getConnection().getRoster().getEntryCount();
		else
			return 0;
	}

	/**
	 * returns the roster
	 * 
	 * @return JameContact[]
	 * @throws Exception
	 */
	public JameContact[] getRoster() throws Exception {
		if (jconn.isConnected()) {
			return jconn.getRoster();
		} else
			return null;
	}

	/**
	 * sends a message to a buddy
	 * 
	 * @param messageBody
	 * @param messageSubject
	 * @param messageFrom
	 * @param messageTo
	 * @return boolean
	 * @throws Exception
	 */
	public boolean sendChatMessage(String messageBody, String messageSubject,
	        String messageFrom, String messageTo) throws Exception {
		if (jconn.isConnected()) {
			JameMessage m = new JameMessage();
			m.setMessageBody(messageBody);
			m.setMessageFrom(messageFrom);
			m.setMessageSubject(messageSubject);
			m.setMessageTo(messageTo);
			return jconn.sendChatMessage(m);
		} else
			return false;
	}

	/**
	 * sets the users presence
	 * 
	 * @param presenceMode
	 * @param presenceMessage
	 * @return boolean
	 * @throws Exception
	 */
	public boolean sendPresence(String presenceMode, String presenceMessage)
	        throws Exception {
		if (jconn.isConnected()) {
			JamePresence p = new JamePresence();
			p.setType(presenceMode);
			p.setText(presenceMessage);
			return jconn.sendPresence(p);
		} else
			return false;
	}

	/**
	 * sends a subscription type to a user
	 * 
	 * @see org.jivesoftware.smack.packet.Presence
	 * @param rosterEntryName
	 * @param type
	 * @return
	 * @throws Exception
	 */
	public boolean sendSubscribe(String rosterEntryName, String type)
	        throws Exception {
		if (jconn.isConnected()) {
			JamePresence p = new JamePresence();
			p.setType(type);
			p.setJid(rosterEntryName);
			return jconn.sendSubscribe(p);
		} else
			return false;
	}

	/**
	 * returns the roster groups
	 * 
	 * @return Collection
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public Collection getGroups() throws Exception {
		if (jconn.isConnected()) {
			return jconn.getConnection().getRoster().getGroups();
		} else
			return null;
	}

	/**
	 * returns the rostergroup matching the parameter
	 * 
	 * @param rosterGroupName
	 * @return RosterGroup
	 * @throws Exception
	 */
	public boolean addRosterGroup(String rosterGroupName) throws Exception {
		if (jconn.isConnected()) {
			return jconn.addRosterGroup(rosterGroupName);
		} else
			return false;
	}

	/**
	 * renames a rostergroup
	 * 
	 * @param rosterGroupName
	 * @param newName
	 * @return boolean
	 * @throws Exception
	 */
	public boolean renameRosterGroup(String rosterGroupName, String newName)
	        throws Exception {
		if (jconn.isConnected()) {
			return jconn.renameRosterGroup(rosterGroupName, newName);
		}
		return false;
	}

	/**
	 * switches a user into another group
	 * 
	 * @param rosterEntryName
	 * @param newRosterGroupName
	 * @param oldRosterGroupName
	 * @return JameContact[]
	 * @throws Exception
	 */
	public boolean switchUserGroup(String rosterEntryName,
	        String newRosterGroupName, String oldRosterGroupName)
	        throws Exception {
		if (jconn.isConnected()) {
			return jconn.switchUserGroup(rosterEntryName, newRosterGroupName,
			        oldRosterGroupName);
		} else
			return false;
	}

	/**
	 * renames a buddy
	 * 
	 * @param rosterEntryName
	 * @param newName
	 * @return JameContact[]
	 * @throws Exception
	 */
	public boolean renameRosterEntry(String rosterEntryName, String newName)
	        throws Exception {
		if (jconn.isConnected()) {
			return jconn.renameRosterEntry(rosterEntryName, newName);
		} else
			return false;
	}
}
