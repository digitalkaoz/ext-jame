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
		if(XmlEl.nodeName == "response" && XmlEl.getAttribute("type") == "success"){ //incoming notification
			$('jame-hud').setAttribute("lastActivity",new Date().getTime());
			var response = XmlEl.getElementsByTagName("methodResponse")[0];
			var messages = ExtJame.backend.Xml.getMessagesFromResponse(response);
			var buddys = ExtJame.backend.Xml.getBuddysFromResponse(response);

			if(messages.length > 0){	// messages were found so create a chat or appends the message
				ExtJame.backend.Xml.updateMessages(messages);
			}
			if(buddys.length > 0){		// buddys were found the modify details or append the buddy to the tree
				ExtJame.backend.Xml.updateBuddys(buddys,XmlEl);
			}
		}else if(XmlEl.nodeName == "response" && XmlEl.getAttribute("type") == "error"){ //disconnected or something like that
				Ext.WindowMgr.each(function(win){win.close()});
				Ext.ComponentMgr.all.each(function(comp){Ext.ComponentMgr.unregister(comp)})
				ExtJame.connected = false;
				ExtJame.mgr.stopAutoRefresh();
	    		ExtJame.timer.stop();
		}
	},
	
	/**
	 * @method updateMessages
	 */
	 updateMessages : function (messages){
			for(var i=0;i<messages.length;i++){
				if(Ext.ComponentMgr.get(messages[i]["from"])){ // chat exists
					var pDlg = Ext.ComponentMgr.get(messages[i]["from"]).parent;
					Ext.WindowMgr.get(pDlg).show();
				}else{ // chat doesnt exists
					new ExtJame.ui.ChatDialog(ExtJame.hud,ExtJame.ui.UiConfig.ChatLayout,messages[i]["from"]).init();
				}
				var panel = Ext.ComponentMgr.get(messages[i]["from"]).getComponent(0);
				var d = new Date();
				var ts = d.getHours()+":"+d.getMinutes();
				var val = messages[i]["msg"].replace(/script|onclick/g, "");
		 		var btext = "<b style='color:red;'>["+ExtJame.factory.cutJid(messages[i]["from"])+" "+ts+"] </b>"+val+"<br/>";
				panel.body.insertHtml("beforeEnd",btext);
				panel.body.scroll('b',panel.body.dom.offsetHeight,false);
				if(Ext.ComponentMgr.get(messages[i]["from"]) && Ext.ComponentMgr.get(messages[i]["from"]) != Ext.ComponentMgr.get(messages[i]["from"]).ownerCt.getActiveTab()){
					var oldIconClass = Ext.ComponentMgr.get(messages[i]["from"]).iconCls;
					var tabSpan = Ext.fly(Ext.ComponentMgr.get(messages[i]["from"]).ownerCt.getTabEl(Ext.ComponentMgr.get(messages[i]["from"]))).child('span.x-tab-strip-text');
					tabSpan.removeClass(oldIconClass);
					Ext.ComponentMgr.get(messages[i]["from"]).iconCls = "message";
					tabSpan.addClass("message");
				}
			}
	 },
	
	/**
	 * @method updateBuddys
	 */
	 updateBuddys : function(buddys,_xml){
				for(var i=0;i<buddys.length;i++){
					if(buddys[i]["status"] == "subscribe"){	//ask for subscription request
						var buddy = buddys[i];
						var xml = _xml;
						var addem = function(btn){
							if(btn == "yes"){
								var node = ExtJame.roster.getBuddy(buddy["jid"]);
								ExtJame.backend.Connection.sendSubscription(buddy["jid"],"subscribe");
								ExtJame.backend.Connection.sendSubscription(buddy["jid"],"subscribed");
								if(node)
										ExtJame.roster.updateBuddy(node,buddy);
								else
										ExtJame.roster.addBuddys(null,xml);
							}else{
								ExtJame.backend.Connection.sendSubscription(buddy["jid"],"unsubscribe");
								ExtJame.backend.Connection.sendSubscription(buddy["jid"],"unsubscribed");
							}
						}
						Ext.MessageBox.show({
					 		title:'Authorization Request',
					 		msg: 'Accept Authorization Request from '+buddy["jid"]+" ?",
					 		buttons: Ext.MessageBox.YESNO,
							icon:Ext.MessageBox.QUESTION,
							fn: addem
						});
					}else{ // presence updates
						var buddy = ExtJame.roster.getBuddy(buddys[i]["jid"]);
						if(buddy){
							if(buddys[i]["subscription"] == "unsubscribed" || buddys[i]["subscription"] == "unsubscribe"){
								ExtJame.roster.removeBuddy(buddys[i]["jid"]);								
								ExtJame.backend.Connection.sendSubscription(buddy["jid"],"unsubscribe");
								ExtJame.backend.Connection.sendSubscription(buddy["jid"],"unsubscribed");
							}else{
								ExtJame.roster.updateBuddy(buddy,buddys[i]);
								if(Ext.ComponentMgr.get(buddys[i]["jid"])){
									var oldIconClass = Ext.ComponentMgr.get(buddys[i]["jid"]).iconCls;
									var tabSpan = Ext.fly(Ext.ComponentMgr.get(buddys[i]["jid"]).ownerCt.getTabEl(Ext.ComponentMgr.get(buddys[i]["jid"]))).child('span.x-tab-strip-text');
									tabSpan.removeClass(oldIconClass);
									Ext.ComponentMgr.get(buddys[i]["jid"]).iconCls = buddys[i]["status"];
									tabSpan.addClass(buddys[i]["status"]);
								}
							}
						}else{
							//ExtJame.roster.addBuddys(null,XmlEl);
						}
					}
				}
	 }
}
