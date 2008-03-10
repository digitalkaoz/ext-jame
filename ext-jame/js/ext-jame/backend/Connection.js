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
			frequency: 1, 
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
			success:function(r){
						ExtJame.backend.Connection.loadXmlFromUrl(ExtJame.backend.url.isconnected,ExtJame.factory.loginORclient);
					}
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
					if(XmlEl.nodeName == "response" && XmlEl.getAttribute("type") == "success"){
						ExtJame.roster.removeGroup(e.node.text);
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
			icon:Ext.MessageBox.QUESTION,
			group:e.node.text
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
					if(XmlEl.nodeName == "response" && XmlEl.getAttribute("type") == "success"){
						ExtJame.roster.removeBuddy(e.node.id);
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
	baseurl : "/jame/",
	isconnected : "/jame/adapter/isconnected",
	login : "/jame/adapter/login",
	getbuddys : "/jame/adapter/getbuddys",
	logout : "/jame/adapter/logout",
	sendmessage : "/jame/adapter/sendmessage",
	setpresence : "/jame/adapter/sendpresence",
	getnotifications : "/jame/adapter/notifications",
	addbuddy : "/jame/adapter/addbuddy",
	addgroup : "/jame/adapter/addgroup",
	deletebuddy : "/jame/adapter/deletebuddy",
	deletegroup : "/jame/adapter/deletegroup"	,
	renamebuddy :"/jame/adapter/renamebuddy",
	renamegroup :"/jame/adapter/renamegroup",
	switchusergroup : "/jame/adapter/switchusergroup",
	subscribe : "/jame/adapter/subscribe"
}
