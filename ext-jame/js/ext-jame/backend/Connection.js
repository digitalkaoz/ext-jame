/**
*	Licence	:	GPL
*	Author	:	Robert Schoenthal
*	Date	:	16.08.2007
*/

/**
 * @class ExtJame.backend.Connection
 * @description handles the backend connection, and evals the responses
 */
ExtJame.backend.Connection = {

	/**
	 * @method getNotifications
	 * @public
	 * @description creates the periodically updater and evals its response
	 */
	getNotifications : function(){
		var container = null;
		if(!$('update-container')){
			container = document.createElement("DIV");
			container.id = "update-container";
			document.body.appendChild(container);
		}
		container = $('update-container');
		var upd = new Ajax.PeriodicalUpdater(container, 
			ExtJame.backend.url.getnotifications, 
			{method: 'get',
			frequency: 2, 
			decay: 1,
			onSuccess : function(transport){	//parse the response
				ExtJame.backend.Xml.parseNotifications(transport.responseXML.firstChild);
			},
			onFailure : function(){}
		});
	},

	/**
	 * @method login
	 * @public
	 * @description evals the response from the Login Form
	 */
	login : function(f,a){
		f.ownerCt.form.submit({
			reset:false,
			scope: this,
			success:ExtJame.factory.loginORClient
		});
	},

	/**
	 * @method sendSubscription
	 * @public
	 * @description sends a subscription type to a specific buddy
	 */
	sendSubscription : function(_buddy,_type){
		var url = ExtJame.backend.url.subscribe;
		var parseDom = function(XmlEl){
			// TODO
		}
		ExtJame.backend.Connection.loadXmlFromUrl(url,parseDom,$H({name:_buddy,type:_type}));
	},

	/**
	 * @method isConnected
	 * @public
	 * @description checks wether the user is already connected or not, if true shows the client widget, 
	 * 		if false shows the login widget
	 */
	isConnected : function(){
		ExtJame.backend.Connection.loadXmlFromUrl(ExtJame.backend.url.isconnected,ExtJame.factory.loginORclient);
		
		//temporary
			//login widget
		/*		if(!Ext.WindowMgr.get("LoginDialog"))
					ExtJame.ui.SimpleDialog("jame-hud",ExtJame.ui.UiConfig.LoginLayout).init();
				else
					Ext.WindowMgr.get("LoginDialog").show();*/
			//client widget
				if(!Ext.WindowMgr.get("ClientDialog"))
					new ExtJame.ui.ClientDialog("ClientDialog","jame-hud",ExtJame.ui.UiConfig.ClientLayout).init();
				else
					Ext.WindowMgr.get("ClientDialog").show();
				ExtJame.connected = true;
			//message widget
				/*ts = new Date().getTime();
				uid ="mw_"+ts;
				new ExtJame.ui.ChatDialog(uid,"jame-hud",ExtJame.ui.UiConfig.ChatLayout,"jame-hud").init();*/
			
		
	},

	/**
	 * @method logout
	 * @public
	 * @description sends logout to the backend after confirmation
	 */
	logout : function(){
		var exit = function(btn){
			Ext.Msg.getDialog().close();
			if(btn == "yes"){
				var parseDom = function(e){
					if(e.getAttribute("type") == "success"){	
						window.location.reload();
					}else{
						// TODO
						window.location.reload();
					}
				}
				ExtJame.backend.Connection.loadXmlFromUrl(ExtJame.backend.url.logout, parseDom);
			}
		}
		Ext.Msg.show({
	 		title:'Really Logout?',
	 		msg: 'do you really want to quit?',
	 		buttons: Ext.Msg.YESNO,
			fn: exit,
			icon:Ext.MessageBox.QUESTION
		});
	},
	
	/**
	 * @method addBuddy
	 * @public
	 * @description adds a buddy to the ExtJame.ui.RosterTree.rosterBuddys, and destroys the addbuddy widget
	 */
	addBuddy : function(f,a){
		f.ownerCt.form.submit({
			reset:false,
			scope: this,
			success:ExtJame.roster.addBuddys
		});
	},
	
	/**
	 * @method addGroup
	 * @public
	 * @description adds a group to ExtJame.ui.RosterTree.rosterGroups, and destroys the addgroup widget
	 */
	addGroup : function(f,a){
		f.ownerCt.form.submit({
			reset:false,
			scope: this,
			success:ExtJame.roster.addGroups
		});
	},
	
	/**
	 * @method removeGroup
	 * @public
	 * @description removes a Group from ExtJame.ui.RosterTree.rosterGroups after Confirmation
	 */
	removeGroup : function(e,a){
		var deleteem = function(btn){
			if(btn == "yes"){
				var url = ExtJame.backend.url.deletegroup;
				var parseDom = function(XmlEl){
					if(XmlEl.nodeName == "response"){
						var response = XmlEl.getElementsByTagName("methodResponse")[0];
						var groups = ExtJame.backend.Xml.getGroupsFromResponse(response);
						for(var i = 0; i<groups.length;i++){
							ExtJame.roster.removeGroup(groups[i]);
						}
					}
				}
				ExtJame.backend.Connection.loadXmlFromUrl(url,parseDom,$H({name:e.node.text}));
			}
		}
		Ext.MessageBox.show({
	 		title:'Really Delete',
	 		msg: 'do you really want to delete '+e.node.text,
	 		buttons: Ext.MessageBox.YESNOCANCEL,
			fn: deleteem,
			icon:Ext.MessageBox.QUESTION
		});
	},

	/**
	 * @method removeBuddy
	 * @public
	 * @description removes a buddy from ExtJame.ui.RosterTree.rosterBuddys after confirmation
	 */
	removeBuddy : function(e,a){
		var deleteem = function(btn){
			if(btn == "yes"){
				var url = ExtJame.backend.url.deletebuddy;
				var parseDom = function(XmlEl){
					if(XmlEl.nodeName == "response"){
						var response = XmlEl.getElementsByTagName("methodResponse")[0];
						var buddys = ExtJame.backend.Xml.getBuddysFromResponse(response);
						for(var i = 0; i<buddys.length;i++){
							ExtJame.roster.removeBuddy(buddys[i]["jid"]);
						}
					}
				}
				ExtJame.backend.Connection.loadXmlFromUrl(url,parseDom,$H({name:e.node.id}));
			}
		}
		Ext.MessageBox.show({
	 		title:'Really Delete',
	 		msg: 'do you really want to delete '+e.node.text,
	 		buttons: Ext.MessageBox.YESNOCANCEL,
			fn: deleteem,
			icon:Ext.MessageBox.QUESTION
		});
	},

	/**
	 * @method renameBuddy
	 * @public
	 * @description renames a buddy from ExtJame.ui.RosterTree.rosterBuddys
	 */	
	renameBuddy : function(_te,_new,_old){
		var jid = _te.editNode.id;
		var url = ExtJame.backend.url.renamebuddy;
		var parseDom = function(XmlEl){
			// TODO
		}
		ExtJame.backend.Connection.loadXmlFromUrl(url,parseDom,$H({name:jid,newname:_new}));
	},

	/**
	 * @method renameGroup
	 * @public
	 * @description renames a group from ExtJame.ui.RosterTree.rosterGroups
	 */
	renameGroup : function(_te,_new,_old){
		var url = ExtJame.backend.url.renamegroup;
		var parseDom = function(XmlEl){
			// TODO
		}
		ExtJame.backend.Connection.loadXmlFromUrl(url,parseDom,$H({name:_old,newname:_new}));
	},

	/**
	 * @method switchUserGroup
	 * @public
	 * @description switches a buddy from ExtJame.ui.RosterTree.rosterBuddys into another group
	 */
	switchUserGroup : function(_jid,_new,_old){
		var url = ExtJame.backend.url.switchusergroup;
		var parseDom = function(XmlEl){
			// TODO
		}
		ExtJame.backend.Connection.loadXmlFromUrl(url,parseDom,$H({newg:_new,oldg:_old,buddy:_jid}));
	},
	
	/**
	 * @method loadXmlFromUrl
	 * @public
	 * @description sends a Request with the specified parameters to the specified url, and calls the specified
	 * 		callback function on success
	 */
	loadXmlFromUrl : function(_url,callback,args){
		if(!args)
			args = new Hash();
		new Ajax.Request(_url, {
			method:"get",
			parameters : args.toQueryString(),
		  	onComplete: function(transport) {
				if(transport.responseXML){
			      		callback(transport.responseXML.firstChild);
				}
		  	},
		  	onFailure : function(transport) {
				Ext.Msg.show({
			 		title:'Error Occured',
			 		msg: 'Backend URL unreachable!',
			 		buttons: Ext.MessageBox.OK,
			 		fn:callback,
					icon:Ext.MessageBox.ERROR
				});
		  	}
		});
	}
}

/**
 * @class ExtJame.backend.url
 * @description stores the backend urls
 */
ExtJame.backend.url = {
	baseurl : "/Jame/",
	isconnected : "/Jame/adapter/isconnected",
	login : "/Jame/adapter/login",
	getbuddys : "/Jame/adapter/getbuddys",
	logout : "/Jame/adapter/logout",
	sendmessage : "/Jame/adapter/sendmessage",
	setpresence : "/Jame/adapter/sendpresence",
	getnotifications : "/Jame/adapter/notifications",
	addbuddy : "/Jame/adapter/addbuddy",
	addgroup : "/Jame/adapter/addgroup",
	deletebuddy : "/Jame/adapter/deletebuddy",
	deletegroup : "/Jame/adapter/deletegroup"	,
	renamebuddy :"/Jame/adapter/renamebuddy",
	renamegroup :"/Jame/adapter/renamegroup",
	switchusergroup : "/Jame/adapter/switchusergroup",
	subscribe : "/Jame/adapter/subscribe"
}