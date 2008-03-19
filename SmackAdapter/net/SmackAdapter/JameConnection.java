/**
 * @author	Robert Schoenthal
 * @date		29.08.2007
 * @license	gpl
 */
package net.SmackAdapter;

// imports
import java.util.Collection;
import java.util.Iterator;
import java.util.LinkedList;

import org.jivesoftware.smack.AccountManager;
import org.jivesoftware.smack.PacketListener;
import org.jivesoftware.smack.Roster;
import org.jivesoftware.smack.RosterEntry;
import org.jivesoftware.smack.RosterGroup;
import org.jivesoftware.smack.RosterListener;
import org.jivesoftware.smack.XMPPConnection;
import org.jivesoftware.smack.filter.PacketFilter;
import org.jivesoftware.smack.packet.Message;
import org.jivesoftware.smack.packet.Packet;
import org.jivesoftware.smack.packet.Presence;

/**
 * @class net.SmackAdapter.JameConnection
 * @description stores a simple presence Object
 */
public class JameConnection implements PacketListener, RosterListener {

	// private attributes
	private XMPPConnection	 conn	          = null;

	private boolean	         connectionClosed	= false;

	@SuppressWarnings("unchecked")
	private final LinkedList	messageList	  = new LinkedList();

	@SuppressWarnings("unchecked")
	private final LinkedList	presenceList	= new LinkedList();

	/**
	 * @param serverName
	 * @param serverPort
	 * @param serviceName
	 * @throws Exception
	 */
	public JameConnection(String serverName, int serverPort, String serviceName)
	        throws Exception {
		// XMPPConnection.DEBUG_ENABLED = true;
		this.conn = new XMPPConnection(serverName);
		this.conn.connect();
		this.conn.addPacketListener(this, new PacketFilter() {
			public boolean accept(Packet p) {
				return true;
			}
		});
	}

	/**
	 * connection established?
	 * 
	 * @return boolean
	 */
	public boolean isConnected() {
		if (this.conn != null && this.conn.isConnected()
		        && this.conn.isAuthenticated())
			return true;
		else
			return false;
	}

	/**
	 * @return boolean
	 * @throws Exception
	 */
	public boolean disconnect() throws Exception {
		boolean ret = false;
		if (this.conn != null) {
			this.conn.disconnect();
			this.connectionClosed = true;
			ret = true;
		}
		return ret;
	}

	/**
	 * @return boolean
	 * @throws Exception
	 */
	public boolean isClosed() throws Exception {
		return this.connectionClosed;
	}

	/**
	 * @return XMPPConnection
	 * @throws Exception
	 */
	public XMPPConnection getConnection() throws Exception {
		return this.conn;
	}

	/**
	 * @throws Exception
	 */
	public void setRosterListener() throws Exception {
		this.conn.getRoster().addRosterListener(this);
	}

	/**
	 * returns an Array with all incoming messages and clear the list, so only
	 * new messages will returned
	 * 
	 * @return JameMessage[]
	 * @throws Exception
	 */
	public JameMessage[] getChatMessages() throws Exception {
		JameMessage[] chatMessages = new JameMessage[this.messageList.size()];
		for (int i = 0; i < this.messageList.size(); i++) {
			chatMessages[i] = (JameMessage) this.messageList.get(0);
			this.messageList.remove(0);
		}
		return chatMessages;
	}

	/**
	 * returns an Array with all incoming presence and clear the list, so only
	 * new presences will returned
	 * 
	 * @return JamePresence[]
	 * @throws Exception
	 */
	public JamePresence[] getPresences() throws Exception {
		JamePresence[] presences = new JamePresence[this.presenceList.size()];
		for (int i = 0; i < this.presenceList.size(); i++) {
			presences[i] = (JamePresence) this.presenceList.get(0);
			this.presenceList.remove(0);
		}
		return presences;
	}

	/**
	 * adds a buddy to the Roster
	 * 
	 * @param rosterEtryName
	 * @param rosterEntryGroup
	 * @return boolean
	 * @throws Exception
	 */
	public boolean addRosterEntry(String rosterEntryName,
	        String rosterEntryGroup) throws Exception {
		String[] group = new String[1];
		group[0] = rosterEntryGroup;
		String rosterEntryNick = rosterEntryName.substring(0, rosterEntryName
		        .indexOf("@"));
		this.conn.getRoster().createEntry(rosterEntryName, rosterEntryNick,
		        group);
		return true;
	}

	/**
	 * adds a group to the roster
	 * 
	 * @param rosterGroupName
	 * @return RosterGroup
	 * @throws Exception
	 */
	public boolean addRosterGroup(String rosterGroupName) throws Exception {
		this.conn.getRoster().createGroup(rosterGroupName);
		return true;
	}

	/**
	 * removes a buddy from the roster
	 * 
	 * @param rosterEntryUserName
	 * @return boolean
	 * @throws Exception
	 */
	public boolean delRosterEntry(String rosterEntryUserName) throws Exception {
		RosterEntry rosterEntry = this.conn.getRoster().getEntry(
		        rosterEntryUserName);
		this.conn.getRoster().removeEntry(rosterEntry);
		return true;
	}

	/**
	 * removes a group from the roster
	 * 
	 * @param rosterGroupName
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public boolean delRosterGroup(String rosterGroupName) throws Exception {
		Iterator groupIterator = this.conn.getRoster().getGroups().iterator();
		while (groupIterator.hasNext()) {
			RosterGroup rg = (RosterGroup) groupIterator.next();
			if (rg.getName() == rosterGroupName)
				groupIterator.remove();
			return true;
		}
		return false;
	}

	/**
	 * renames a buddy
	 * 
	 * @param rosterEntryName
	 * @param newName
	 * @return RosterEntry
	 * @throws Exception
	 */
	public boolean renameRosterEntry(String rosterEntryName, String newName)
	        throws Exception {
		RosterEntry rosterEntry = null;
		rosterEntry = this.conn.getRoster().getEntry(rosterEntryName);
		rosterEntry.setName(newName);
		return true;
	}

	/**
	 * rename a rostergroup
	 * 
	 * @param rosterGroupName
	 * @param newName
	 * @return RosterGroup
	 * @throws Exception
	 */
	public boolean renameRosterGroup(String rosterGroupName, String newName)
	        throws Exception {
		RosterGroup rosterGroup = null;
		rosterGroup = this.conn.getRoster().getGroup(rosterGroupName);
		rosterGroup.setName(newName);
		return true;
	}

	/**
	 * switches a buddy into another group
	 * 
	 * @param rosterEntryName
	 * @param newRosterGroupName
	 * @param oldRosterGroupName
	 * @return RosterEntry
	 * @throws Exception
	 */
	public boolean switchUserGroup(String rosterEntryName,
	        String newRosterGroupName, String oldRosterGroupName)
	        throws Exception {
		RosterEntry rosterEntry = this.conn.getRoster().getEntry(
		        rosterEntryName);
		RosterGroup ng = this.conn.getRoster().getGroup(newRosterGroupName);
		RosterGroup og = this.conn.getRoster().getGroup(oldRosterGroupName);
		if (ng.getClass() != RosterGroup.class) {
			addRosterGroup(newRosterGroupName);
			ng = this.conn.getRoster().getGroup(newRosterGroupName);
		}
		System.out.println(rosterEntry.toString());
		System.out.println(rosterEntry.getGroups().toArray());
		ng.addEntry(rosterEntry);
		og.removeEntry(rosterEntry);
		return true;
	}

	/**
	 * sends a message to a buddy
	 * 
	 * @param JameMessage
	 * @return boolean
	 * @throws Exception
	 */
	public boolean sendChatMessage(JameMessage message) throws Exception {
		Message m = new Message();
		m.setTo(message.getMessageTo());
		m.setBody(message.getMessageBody());
		m.setSubject(message.getMessageSubject());
		this.conn.sendPacket(m);
		return true;
	}

	/**
	 * sets the users presence
	 * 
	 * @param JamePresence
	 * @return boolean
	 * @throws Exception
	 */
	public boolean sendPresence(JamePresence presence) throws Exception {
		Presence p = new Presence(Presence.Type.available);
		p.setMode(Presence.Mode.valueOf(presence.getType()));
		p.setStatus(presence.getText());
		this.conn.sendPacket(p);
		return true;
	}

	/**
	 * sends a subscription type to a user
	 * 
	 * @see org.jivesoftware.smack.packet.Presence
	 * @param JamePresence
	 * @return
	 * @throws Exception
	 */
	public boolean sendSubscribe(JamePresence p) throws Exception {
		Presence response = new Presence(Presence.Type.valueOf(p.getType()));
		response.setTo(p.getJid());
		response.setFrom(this.conn.getUser());
		this.conn.sendPacket(response);
		if (response.getType() == Presence.Type.subscribed) {
			Presence t = new Presence(Presence.Type.available);
			t.setTo(p.getJid());
			t.setFrom(this.conn.getUser());
			this.conn.sendPacket(t);
			addRosterEntry(p.getJid(), "");
		}
		return true;
	}

	/**
	 * evals incoming packets, and adds them if the're important
	 * 
	 * @see PacketListener
	 */
	@SuppressWarnings("unchecked")
	public void processPacket(Packet packet) {
		if (packet.getClass() == Message.class) { // incoming message, so add
			// it to the messageList
			Message m = (Message) packet;
			this.messageList.add(new JameMessage(m.getBody(), m.getSubject(), m
			        .getFrom(), m.getTo()));
		}
		if (packet.getClass() == Presence.class) {
			Presence p = (Presence) packet;
			if (p.getType() == Presence.Type.subscribe
			        || p.getType() == Presence.Type.subscribed) {
				String jid = p.getFrom();
				if (jid.indexOf("/") > 0) // ignore ressources for this
					// version
					jid = jid.substring(0, jid.indexOf("/"));
				JamePresence jp = new JamePresence();
				jp.setJid(jid);
				if (p.getType() != null)
					jp.setStatus(p.getType().toString());
				if (this.conn.getRoster().getPresence(jid).getMode() != null)
					jp.setStatus(this.conn.getRoster().getPresence(jid)
					        .getMode().toString());
				jp.setText(p.toString());
				jp.setType(p.getType().toString());
				this.presenceList.add(jp);
			}
			if (p.getType() == Presence.Type.unsubscribe
			        || p.getType() == Presence.Type.unsubscribed) {
				try {
					delRosterEntry(p.getFrom());
				} catch (Exception e) {

				}
				String jid = p.getFrom();
				if (jid.indexOf("/") > 0) // ignore ressources for this
					// version
					jid = jid.substring(0, jid.indexOf("/"));
				JamePresence jp = new JamePresence();
				jp.setJid(jid);
				if (p.getType() != null)
					jp.setStatus(p.getType().toString());
				if (p.getMode() != null)
					jp.setStatus(p.getMode().toString());
				jp.setText(p.toString());
				jp.setType(p.getType().toString());
				this.presenceList.add(jp);
			}
		}
	}

	/**
	 * @see RosterListener is called if a buddy changes its presence
	 */
	@SuppressWarnings("unchecked")
	public void presenceChanged(Presence p) {
		// System.out.println(p.toString());
		String jid = p.getFrom();
		if (jid.indexOf("/") > 0) // ignore ressources for this version
			jid = jid.substring(0, jid.indexOf("/"));
		JamePresence jp = new JamePresence();
		jp.setJid(jid);
		if (this.conn.getRoster().getPresence(jid).getType() != null)
			jp.setStatus(this.conn.getRoster().getPresence(jid).getType()
			        .toString());
		if (this.conn.getRoster().getPresence(jid).getMode() != null)
			jp.setStatus(this.conn.getRoster().getPresence(jid).getMode()
			        .toString());
		jp.setText(p.toString());
		jp.setType(p.getType().toString());
		this.presenceList.add(jp);
	}

	/**
	 * @see RosterListener is called if a buddy is updated
	 */
	@SuppressWarnings("unchecked")
	public void entriesUpdated(Collection addresses) {
	}

	/**
	 * @see RosterListener is called if a buddy is deleted
	 */
	@SuppressWarnings("unchecked")
	public void entriesDeleted(Collection addresses) {
		for (Iterator it = addresses.iterator(); it.hasNext();) {
			String address = (String) it.next();
			RosterEntry entry = this.conn.getRoster().getEntry(address);
			if (entry != null) {
				Presence response = new Presence(Presence.Type.unsubscribed);
				response.setTo(entry.getUser());
				this.conn.sendPacket(response);
			}
		}
	}

	/**
	 * @see RosterListener is called if a buddy is added, adds this buddy to the
	 *      roster
	 */
	@SuppressWarnings("unchecked")
	public void entriesAdded(Collection addresses) {
		/*
		 * for (Iterator it = addresses.iterator(); it.hasNext();) { String
		 * address = (String) it.next(); RosterEntry entry =
		 * this.conn.getRoster().getEntry(address); if (entry != null) {
		 * Presence response = new Presence(Presence.Type.unsubscribed);
		 * response.setTo(entry.getUser()); this.conn.sendPacket(response); } }
		 */
	}

	/**
	 * returns the roster
	 * 
	 * @return JameContact[]
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public LinkedList getRoster() throws Exception {
		Roster sr = this.conn.getRoster();
		LinkedList buddyList = new LinkedList();
		for (RosterEntry re : sr.getEntries()) {
			try {
				JameContact jc = new JameContact();
				jc.setJabberID(re.getUser().toString());
				jc.setName(re.getName().toString());
				jc.setGroups(re.getGroups());
				jc.setPresenceType(re.getType().toString());
				if (sr.getPresence(re.getUser()).getType() != null)
					jc.setPresenceMode(sr.getPresence(re.getUser()).getType()
					        .toString());
				if (sr.getPresence(re.getUser()).getMode() != null)
					jc.setPresenceMode(sr.getPresence(re.getUser()).getMode()
					        .toString());
				if (sr.getPresence(re.getUser()).getStatus() != null)
					jc.setPresenceMessage(sr.getPresence(re.getUser())
					        .getStatus().toString());

				buddyList.add(jc);
			} catch (Exception e) {
				// System.out.println(e.getStackTrace().toString());
			}
		}
		return buddyList;
	}

	/**
	 * deletes a logged account
	 * 
	 * @return boolean
	 * @throws Exception
	 */
	public boolean deleteLoggedAccount() throws Exception {
		AccountManager accountManager = this.conn.getAccountManager();
		accountManager.deleteAccount();
		return true;
	}

	/**
	 * creates a new account
	 * 
	 * @param userName
	 * @param password
	 * @return boolean
	 * @throws Exception
	 */
	public boolean createNewAccount(String userName, String password)
	        throws Exception {
		AccountManager accountManager = this.conn.getAccountManager();
		if (accountManager.supportsAccountCreation()) {
			accountManager.createAccount(userName, password);
			return true;
		} else
			return false;
	}

	/**
	 * trys to login a user
	 * 
	 * @param userName
	 * @param password
	 * @return boolean
	 * @throws Exception
	 */
	public boolean login(String userName, String password) throws Exception {
		this.conn.login(userName, password);
		setRosterListener();
		conn.getRoster().setSubscriptionMode(Roster.SubscriptionMode.manual);
		return true;
	}

	/**
	 * changes the users password
	 * 
	 * @param password
	 * @return boolean
	 * @throws Exception
	 */
	public boolean changePassword(String password) throws Exception {
		AccountManager accountManager = this.conn.getAccountManager();
		accountManager.changePassword(password);
		return true;
	}
}
