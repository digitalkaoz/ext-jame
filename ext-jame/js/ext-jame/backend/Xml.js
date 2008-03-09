/**
*	Licence	:	GPL
*	Author	:	Robert Schönthal
*	Date	:	16.08.2007
*/

/**
 * @class ExtJame.backend.Xml
 * @description parses xml responses
 */
ExtJame.backend.Xml = {

	/**
	 * @method getUserFromResponse
	 * @public
	 * @description fetches the user from the xml response
	 */
	getUserFromResponse : function(el){
		if(el.getElementsByTagName("methodResponse")[0]){
			var response = el.getElementsByTagName("methodResponse")[0];
			var me = response.getElementsByTagName("you")[0];
			if(me){
				ExtJame.myJid = me.getElementsByTagName("name")[0].firstChild.nodeValue;
				return true;
			}
		}else{
			return false;
		}
	},

	/**
	 * @method getBuddyFromResponse
	 * @public
	 * @description fetches a buddy from the xml response
	 */
	getBuddyFromResponse : function(el){
		var buddy = el;
		var buddy_attrs = new Object();
		buddy_attrs["jid"] = buddy.getAttribute("jid");
		for(var x=0; x<buddy.childNodes.length; x++){
			if(buddy.childNodes[x].nodeType == 1){
				switch(buddy.childNodes[x].nodeName){
					case "name" :{
						buddy_attrs["name"] = buddy.childNodes[x].firstChild ? buddy.childNodes[x].firstChild.nodeValue : "";
						break;
					}
					case "status":{
						buddy_attrs["status"] = buddy.childNodes[x].getAttribute("type")? buddy.childNodes[x].getAttribute("type") : "";
						buddy_attrs["subscription"] = buddy.childNodes[x].getAttribute("subscription")? buddy.childNodes[x].getAttribute("subscription") : "";
						buddy_attrs["status_text"] =  buddy.childNodes[x].firstChild ?  buddy.childNodes[x].firstChild.nodeValue : "";
						break;
					}
					case "group":{
						buddy_attrs["group"] = buddy.childNodes[x].firstChild ? buddy.childNodes[x].firstChild.nodeValue : "";
						break;
					}
					default:break;
				}
			}
		}
		return buddy_attrs;
	},

	/**
	 * @method getBuddysFromResponse
	 * @public
	 * @description fetches the buddys from response, calls getBuddyFromResponse for each buddy
	 */
	getBuddysFromResponse : function(el){
		var buddys = el.getElementsByTagName("buddys")[0].childNodes;
		var ret = Array();
		if(buddys.length > 0){ //buddys matching to group adden
			for(var b=0;b<buddys.length;b++){
				if(buddys[b].nodeName == "buddy"){
					var temp = ExtJame.backend.Xml.getBuddyFromResponse(buddys[b]);
					ret.push(temp);
				}
			}
		}
		return ret;
	},

	/**
	 * @method getGroupsFromResponse
	 * @public
	 * @description fetches the groups from the xml response
	 */
	getGroupsFromResponse : function(el){
		var groups = el.getElementsByTagName("groups")[0].childNodes;
		var ret = new Array();
		if(groups.length > 0){
			for(var b=0;b<groups.length;b++){
				if(groups[b].nodeType == 1 && groups[b].firstChild){
					ret.push(groups[b].firstChild.nodeValue);
				}
			}
		}
		return ret;
	},

	/**
	 * @method getMessagesFromResponse
	 * @public
	 * @description fetches the messages from the xml response
	 */
	getMessagesFromResponse : function(el){
		var msg = el.getElementsByTagName("messages")[0].childNodes;
		var ret = new Array();
		if(msg.length > 0){
			for(var b=0;b<msg.length;b++){
				if(msg[b].nodeType == 1 && msg[b].nodeName == "message"){
					var tmp = new Array();
					if(msg[b].getAttribute("from").indexOf("/"))
						tmp['from'] = msg[b].getAttribute("from").substr(0,msg[b].getAttribute("from").indexOf("/"));
					else
						tmp['from'] = msg[b].getAttribute("from");
					tmp['msg'] = msg[b].getElementsByTagName("body")[0].firstChild.nodeValue;
					ret.push(tmp);
				}
			}
		}
		return ret;
	},

	/**
	 * @method parseNotifications
	 * @public
	 * @description parses the notifications from the response, calls getMessagesFromResponse and getBuddysFromResponse
	 * 		creates a chat if it doesnt exists, modifies buddy attributes or adds new buddys
	 */
	parseNotifications : function(XmlEl){
		if(XmlEl.nodeName == "response" && XmlEl.getAttribute("type") == "push"){ //incoming notification
			var response = XmlEl.getElementsByTagName("methodResponse")[0];
			var messages = ExtJame.backend.Xml.getMessagesFromResponse(response);
			var buddys = ExtJame.backend.Xml.getBuddysFromResponse(response);

			if(messages.length > 0){	// messages were found so create a chat or appends the message
				for(var i=0;i<messages.length;i++){
					if(Ext.ComponentMgr.get(messages[i]["from"]){ // chat exists
						var pDlg = Ext.ComponentMgr.get(messages[i]["from"]).parent;
						Ext.WindowMgr.get(pDlg).show();
						Ext.WindowMgr.get(pDlg).getComponent(0).activate(messages[i]["from"]);
				 		var myText = "["+messages[i]["from"]+"] "+messages[i]["msg"]+"<br/>";
						var panel = Ext.ComponentMgr.get(messages[i]["from"]).getComponent(0);
						panel.body.insertHtml("beforeEnd",myText);
					}else{ // chat doesnt exists
						ts = new Date().getTime();
						uid ="mw_"+ts;
						new ExtJame.ui.ChatDialog(uid,"jame-hud",ExtJame.ui.UiConfig.ChatLayout,messages[i]["from"]).init();
						var panel = Ext.ComponentMgr.get(messages[i]["from"]).getComponent(0);
				 		var myText = "["+messages[i]["from"]+"] "+messages[i]["msg"]+"<br/>";
						panel.body.insertHtml("beforeEnd",myText);
					}
				}
			}
			if(buddys.length > 0){		// buddys were found the modify details or append the buddy to the tree
				for(var i=0;i<buddys.length;i++){
					if(buddys[i]["subscription"] == "from"){	//ask for subscription request
						var buddy = buddys[i];
						var addem = function(btn){
							if(btn == "yes"){
								ExtJame.backend.Connection.sendSubscription(this["jid"],"subscribed");
							}else{
								ExtJame.backend.Connection.sendSubscription(this["jid"],"unsubscribed");
							}
						}
						Ext.Msg.show({
					 		title:'Authorization Request',
					 		msg: 'Accept Authorization Request from '+buddy["jid"]+" ?",
					 		buttons: Ext.MessageBox.YESNO,
							icon:Ext.MessageBox.QUESTION
							fn: addem,
							scope:buddy
						});
					}else{
						var buddy = ExtJame.roster.getBuddy(buddys[i]["jid"]);
						if(buddy){
							ExtJame.roster.updateBuddy(buddy);
						}else{
							ExtJame.roster.addBuddys(null,XmlEl);
						}
					}
				}
			}
		}
	}
	
}