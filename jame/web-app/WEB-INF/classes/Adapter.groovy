//imports
import net.SmackAdapter.*
import groovy.net.xmlrpc.*

/**
* @class Adapter
* @description the Adapter provides a Interface for the Smack API via the SmackAdapter.jar (read doc for more information), and provides a function to parse the xml output for the client
*/
class Adapter { 
    //Attributes
	String name = ''
	String server = ''
	int port = 0
    private smack = null
    String jid = name+"@"+server

	/**
	* @method init
	* @public
	* @description initializes the SmackAdapter if not already present
	*/    
    def init(){
    	if(!smack){
    		smack = new SmackAdapter()
    	}
    	return smack
    }

	/**
	* @method response
	* @public
	* @description parses protocol.dtd conform xml structures for the client
	*/    
    def response(_method, _result, _args){
		def writer = new StringWriter()	 
		def mkp = new groovy.xml.MarkupBuilder(writer)
		mkp.response(type:_result) {
		    methodCall(_method)
		    methodResponse{
				if(_args.size() > 0){
					_args.each{ entry ->
						switch(entry.key){
							case "groups" :
							    groups{
							    	entry.value.each{ groupItem ->
										group(groupItem.getName())
							    	}
							    }
							    break
							case "buddys" :
							    buddys{
									entry.value.each{ buddyItem ->
										buddy(jid:buddyItem.getJabberID()){
										    if(buddyItem.getName())
										    	name(buddyItem.getName())
										    status(type:buddyItem.getPresenceMode(),subscription:buddyItem.getPresenceType(),buddyItem.getPresenceMessage())
									    	buddyItem.getGroups().each{ groupItem ->
									    		group(groupItem.getName())
										    }
										}
									}
							    }
							    break
							case "user" : 
								if(entry.value != null){
								    you{
								    	if(entry.value.name)
											name(entry.value.name)
										else
											name()
										if(entry.value.server)
											server(entry.value.server)
										else
											server()
										if(entry.value.port)
											port(entry.value.port.toString())
										else
											port()
								    }
								}
							    break;
							case "error" :
								if(entry.value)
							    	error(entry.value)
							    break
							case "messages":
								if(entry.value != null){
									messages{
										entry.value.each{ messageItem ->
											message("from":messageItem.getMessageFrom()){
												//subject(messageItem.getMessageSubject())
												body(messageItem.getMessageBody())
											}
										}
									}
								}
							    break
							case "presences" :
								if(entry.value != null){
									buddys{
										entry.value.each{ presenceItem ->
											buddy(jid:presenceItem.getJid()){
											    status(type:presenceItem.getType(),subscription:presenceItem.getType(),presenceItem.getText())
											}
										}
									}
								}
								break;
							default:break
						}
					}
				}
    		}
		}
	    return writer.toString()
	}
}
