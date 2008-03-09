/**
* @class AdapterController
* @description provides the public interface for the SmackAdapter, these url all returns pure xml watch the protocol.dtd for more information
*/
class AdapterController {
	
	def params = [:]
	def testMode = false

	/**
	* @method notifications
	* @public
	* @params none
	* @description returns messages and presences
	*/
	def notifications = {
		def fnResult = null
		def errors = null
		def messages = null
		def presences = null
		if(session.adapter && session.adapter.smack && session.adapter.smack.isConnected()){
			try{
				messages = session.adapter.smack.getChatMessages()
				presences = session.adapter.smack.getPresences()
				fnResult = "success"
			}catch(Exception e){
				fnResult = "error"
				errors = e.getMessage()
			}
		}else{
			session.adapter = new Adapter()
		}
		if(!testMode)
			render(contentType:"text/xml") {
				render session.adapter.response("Adapter.notifications",fnResult,["error":errors,	"messages":messages,	"presences":presences]) 
			}
		else
			return session.adapter.response("Adapter.notifications",fnResult,["error":errors,	"messages":messages,	"presences":presences])
	}
	
	/**
	* @method login
	* @public
	* @params String name, String password, String server, String port, Boolean newuser
	* @description trys to log in the user with the specified parameters
	*/
	def login = {
		def fnResult = null
		def errors = null
		if(!session.adapter){
			session.adapter = new Adapter()
			session.adapter.init()
			try{
				if(params.newuser)
					params.newuser = true;
				else
					params.newuser = false;
				def ret = session.adapter.smack.connect(params.name,params.password,params.server,params.port.toInteger(), "Jame",params.newuser)
				if(ret){
					fnResult = "success"
					session.adapter.name = params.name
					session.adapter.port = params.port.toInteger()
					session.adapter.server = params.server
				}else{
					errors = "could not connected to specified server,please check your input"
					fnResult = "error"
				}
			}catch(Exception e){
				fnResult = "error"
				errors = e.getMessage()
			}
		}else{
			if(session.adapter.smack){
				if(session.adapter.smack.isConnected()){
					fnResult = "success"
				}else{
					try{
						if(params.newuser)
							params.newuser = true;
						else
							params.newuser = false;
						def ret = session.adapter.smack.connect(params.name,params.password,params.server,params.port.toInteger(), "Jame",params.newuser)
						if(ret){
							fnResult = "success"
							session.adapter.name = params.name
							session.adapter.port = params.port.toInteger()
							session.adapter.server = params.server
						}else{
							errors = "could not connected to specified server,please check your input"
							fnResult = "error"
						}
					}catch(Exception e){
						fnResult = "error"
						errors = e.getMessage()
					}
				}
			}else{
				session.adapter.init()
				try{
					if(params.newuser)
						params.newuser = true;
					else
						params.newuser = false;
					def ret = session.adapter.smack.connect(params.name,params.password,params.server,params.port.toInteger(), "Jame",params.newuser)
					if(ret){
						fnResult = "success"
						session.adapter.name = params.name
						session.adapter.port = params.port.toInteger()
						session.adapter.server = params.server
					}else{
						errors = "could not connected to specified server,please check your input"
						fnResult = "error"
					}
				}catch(Exception e){
					fnResult = "error"
					errors = e.getMessage()
				}
			}
		}
		if(!testMode)
    		render(contentType:"text/xml") {render session.adapter.response("Adapter.login",fnResult,["user":params,"error":errors])}
		else
			return session.adapter.response("Adapter.login",fnResult,["user":params,"error":errors])
	}
	
	/**
	* @method logout
	* @public
	* @params none
	* @description trys to log out the user
	*/
	def logout =  {
		def fnResult = null
		def errors = null
		if(session.adapter && session.adapter.smack && session.adapter.smack.isConnected()){
			try{
				session.adapter.smack.disconnect()
			    fnResult = "success"
			}catch(Exception e){
				fnResult = "error"
				errors = e.getMessage()
			}
		    //session.clear()
		}else{
			session.adapter = new Adapter()
			fnResult = "error"
			errors = "not logged in"
		}
		if(!testMode)
	    	render(contentType:"text/xml") {render session.adapter.response("Adapter.logout",fnResult,["error":errors]) }
		else
			return session.adapter.response("Adapter.logout",fnResult,["error":errors])
	}
	
	/**
	* @method isconnected
	* @public
	* @params none
	* @description checks if the user is already connection
	*/
	def isconnected = {
		def fnResult = null
		def errors = null
		def userinfo = ["name":"","server":"","port":""]
		if(session.adapter && session.adapter.smack){
			try{
				def ret = session.adapter.smack.isConnected()
				if(ret){
					fnResult="success"
					userinfo["name"] = session.adapter.name
					userinfo["server"] = session.adapter.server
					userinfo["port"] = session.adapter.port
				}else{
					errors = "You are not connected"
					fnResult="error"
				}
			}catch(Exception e){
				errors = e.getMessage()
				fnResult="error"
			}
		}else{
			session.adapter = new Adapter()
			errors = "You are not connected"
			fnResult="error"
		}
		if(!testMode)
    		render(contentType:"text/xml") {render session.adapter.response("Adapter.isconnected",fnResult,["error":errors,"user":userinfo]) }
		else
			return session.adapter.response("Adapter.isconnected",fnResult,["error":errors,"user":userinfo])
	}
	
	/**
	* @method getbuddys
	* @public
	* @params none
	* @description returns the roster buddys and groups
	*/
	def getbuddys = {
		def fnResult = null
		def errors = null
		def buddys =  null
		def groups = null
		if(session.adapter && session.adapter.smack && session.adapter.smack.isConnected()){
			try{
				buddys = session.adapter.smack.getRoster()
				groups = session.adapter.smack.getGroups()
				fnResult="success"
			}catch(Exception e){
				errors = e.getMessage()
				fnResult="error"
			}
		}else{
			session.adapter = new Adapter()
			errors = "You are not connected"
			fnResult="error"
		}
		if(!testMode)
	    	render(contentType:"text/xml") {render session.adapter.response("Adapter.getBuddys",fnResult,["error":errors,"buddys":buddys,"groups":groups]) }
		else
			return session.adapter.response("Adapter.getBuddys",fnResult,["error":errors,"buddys":buddys,"groups":groups])
	}
	
	/**
	* @method sendPresence
	* @public
	* @params String mode, String message
	* @description sets the users presence to a state. read Presences in the Smack Docu for more information
	*/
	def sendpresence = {
		def fnResult = null
		def errors = null
		if(session.adapter && session.adapter.smack && session.adapter.smack.isConnected()){
			try{
				session.adapter.smack.sendPresence(params.mode,params.message)
				fnResult="success"
			}catch(Exception e){
				errors = e.getMessage()
				fnResult="error"
			}
		}else{
			session.adapter = new Adapter()
			errors = "You are not connected"
			fnResult="error"
		}
		if(!testMode)
	    	render(contentType:"text/xml") {render session.adapter.response("Adapter.sendpresence",fnResult,["error":errors]) }
		else
			return session.adapter.response("Adapter.sendpresence",fnResult,["error":errors])
	}
	
	/**
	* @method sendmessage
	* @public
	* @params String body, String to
	* @description sends a message to the specified user
	*/
	def sendmessage = {
		def fnResult = null
		def errors = null
		if(session.adapter && session.adapter.smack && session.adapter.smack.isConnected()){
			try{
				session.adapter.smack.sendChatMessage(params.body,null,session.adapter.jid,params.to)
				fnResult="success"
			}catch(Exception e){
				errors = e.getMessage()
				fnResult="error"
			}
		}else{
			session.adapter = new Adapter()
			errors = "You are not connected"
			fnResult="error"
		}
		if(!testMode)
	    	render(contentType:"text/xml") {render session.adapter.response("Adapter.sendmessage",fnResult,["error":errors]) }
		else
			return session.adapter.response("Adapter.sendmessage",fnResult,["error":errors]) 
	}
	
	/**
	* @method addbuddy
	* @public
	* @params String name, String group
	* @description adds a user to roster and move em into the right group
	*/
	def addbuddy = {
		def fnResult = null
		def errors = null
		if(session.adapter && session.adapter.smack && session.adapter.smack.isConnected()){
			try{
				session.adapter.smack.addRosterEntry(params.name,params.group)
				fnResult="success"
			}catch(Exception e){
				errors = e.getMessage()
				fnResult="error"
			}
		}else{
			session.adapter = new Adapter()
			errors = "You are not connected"
			fnResult="error"
		}
		if(!testMode)
	    	render(contentType:"text/xml") {render session.adapter.response("Adapter.addBuddy",fnResult,["error":errors]) }
		else
			return session.adapter.response("Adapter.addBuddy",fnResult,["error":errors]) 
	}
	
	/**
	* @method addgroup
	* @public
	* @params String name
	* @description adds a group to the roster
	*/
	def addgroup = {
		def fnResult = null
		def errors = null
		if(session.adapter && session.adapter.smack && session.adapter.smack.isConnected()){
			try{
				session.adapter.smack.addRosterGroup(params.name)
				fnResult="success"
			}catch(Exception e){
				errors = e.getMessage()
				fnResult="error"
			}
		}else{
			session.adapter = new Adapter()
			errors = "You are not connected"
			fnResult="error"
		}
		if(!testMode)
	    	render(contentType:"text/xml") {render session.adapter.response("Adapter.addGroup",fnResult,["error":errors])}
		else
			return session.adapter.response("Adapter.addGroup",fnResult,["error":errors])
	}

	/**
	* @method deletebuddy
	* @public
	* @params String name
	* @description deletes a buddy from the roster
	*/
	def deletebuddy = {
		def fnResult = null
		def errors = null
		if(session.adapter && session.adapter.smack && session.adapter.smack.isConnected()){
			try{
				session.adapter.smack.delRosterEntry(params.name)
				fnResult="success"
			}catch(Exception e){
				errors = e.getMessage()
				fnResult="error"
			}
		}else{
			session.adapter = new Adapter()
			errors = "You are not connected"
			fnResult="error"
		}
		if(!testMode)
	    	render(contentType:"text/xml") {render session.adapter.response("Adapter.deletebuddy",fnResult,["error":errors]) }
		else
			return session.adapter.response("Adapter.deletebuddy",fnResult,["error":errors])
	}

	/**
	* @method renamebuddy
	* @public
	* @params String name, String newname
	* @description renames a buddy
	*/
	def renamebuddy = {
		def fnResult = null
		def errors = null
		if(session.adapter && session.adapter.smack && session.adapter.smack.isConnected()){
			try{
				session.adapter.smack.renameRosterEntry(params.name,params.newname)
				fnResult="success"
			}catch(Exception e){
				errors = e.getMessage()
				fnResult="error"
			}
		}else{
			session.adapter = new Adapter()
			errors = "You are not connected"
			fnResult="error"
		}
		if(!testMode)
	    	render(contentType:"text/xml") {render session.adapter.response("Adapter.renamebuddy",fnResult,["error":errors]) }
		else
			return session.adapter.response("Adapter.renamebuddy",fnResult,["error":errors])
	}

	/**
	* @method switchusergroup
	* @public
	* @params String buddy, String newg, String oldg
	* @description moves a buddy from one group into an other
	*/
	def switchusergroup = {
		def fnResult = null
		def errors = null
		if(session.adapter && session.adapter.smack && session.adapter.smack.isConnected()){
			try{
				session.adapter.smack.switchUserGroup(params.name,params.newg,params.oldg)
				fnResult="success"
			}catch(Exception e){
				errors = e.getMessage()
				fnResult="error"
			}
		}else{
			session.adapter = new Adapter()
			errors = "You are not connected"
			fnResult="error"
		}
		if(!testMode)
	    	render(contentType:"text/xml") {render session.adapter.response("Adapter.switchUserGroup",fnResult,["error":errors]) }
		else
			return session.adapter.response("Adapter.switchUserGroup",fnResult,["error":errors])
	}

	/**
	* @method subscribe
	* @public
	* @params String name, String type
	* @description sends a subscribtion to a user, read subscribtion handling in the smack docu for more details
	*/
	def subscribe = {
		def fnResult = null
		def errors = null
		if(session.adapter && session.adapter.smack && session.adapter.smack.isConnected()){
			try{
				session.adapter.smack.sendSubscribe(params.name,params.type)
				fnResult="success"
			}catch(Exception e){
				errors = e.getMessage()
				fnResult="error"
			}
		}else{
			session.adapter = new Adapter()
			errors = "You are not connected"
			fnResult="error"
		}
		if(!testMode)
	    	render(contentType:"text/xml") {render session.adapter.response("Adapter.subscribe",fnResult,["error":errors]) }
		else
			return session.adapter.response("Adapter.subscribe",fnResult,["error":errors])
	}

	/**
	* @method renamegroup
	* @public
	* @params String name, String newname
	* @description renames a roster group
	*/
	def renamegroup = {
		def fnResult = null
		def errors = null
		if(session.adapter && session.adapter.smack && session.adapter.smack.isConnected()){
			try{
				session.adapter.smack.renameRosterGroup(params.name,params.newname)
				fnResult="success"
			}catch(Exception e){
				errors = e.getMessage()
				fnResult="error"
			}
		}else{
			session.adapter = new Adapter()
			errors = "You are not connected"
			fnResult="error"
		}
		if(!testMode)
	    	render(contentType:"text/xml") {render session.adapter.response("Adapter.renamegroup",fnResult,["error":errors]) }
		else
			return session.adapter.response("Adapter.renamegroup",fnResult,["error":errors])
	}

	/**
	* @method deletegroup
	* @public
	* @params String name
	* @description deletes a group from the roster
	*/
	def deletegroup = {
		def fnResult = null
		def errors = null
		def group = null
		if(session.adapter && session.adapter.smack && session.adapter.smack.isConnected()){
			try{
				session.adapter.smack.delRosterGroup(params.name)
				fnResult="success"
			}catch(Exception e){
				errors = e.getMessage()
				fnResult="error"
			}
		}else{
			session.adapter = new Adapter()
			errors = "You are not connected"
			fnResult="error"
		}
		if(!testMode)
	    	render(contentType:"text/xml") {render session.adapter.response("Adapter.deletegroup",fnResult,["group":group,"error":errors]) }
		else
			return session.adapter.response("Adapter.deletegroup",fnResult,["group":group,"error":errors])
	}
}
