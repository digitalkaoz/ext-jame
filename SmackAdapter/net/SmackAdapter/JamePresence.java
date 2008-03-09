/**
 * @author	Robert Schoenthal
 * @date		29.08.2007
 * @license	gpl
 */

package net.SmackAdapter;

/**
 * @class net.SmackAdapter.JamePresence
 * @description stores a simple presence Object
 */
public class JamePresence {
	private String jid;
	private String status;
	private String type;
	private String text;
	
	public JamePresence(){
		this("","","","");
	}
	
	public JamePresence(String _jid, String _status, String _type, String _text){
		this.jid = (String)_jid;
		if(_status != null)
			this.status =(String) _status;
		if(_text != null)
			this.text = (String)_text;
		this.type = (String)_type;
	}
	
	//setters
	public void setJid(String jid) {
    	this.jid = jid;
    }
	public void setStatus(String status) {
    	this.status = status;
    }
	public void setText(String text) {
    	this.text = text;
    }
	public void setType(String type) {
    	this.type = type;
    }

	//getters
	public String getJid() {
    	return jid;
    }
	public String getStatus() {
    	return status;
    }
	public String getText() {
    	return text;
    }
	public String getType() {
    	return type;
    }

	/** 
	 * @override toString() Method so the object is more readable
	 */
	public String toString(){
		return this.jid+" "+this.status+" "+this.text+" "+this.type;
	}
}
