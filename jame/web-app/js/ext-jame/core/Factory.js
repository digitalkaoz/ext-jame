/**
*	Licence	:	GPL
*	Author	:	Robert Schönthal
*	Date	:	16.08.2007
*/

/**
 * @class ExtJame.helpers
 * @description some helpers functions
 */
ExtJame.factory = {

	/**
	 * @method statusStore
	 * @public
	 * @description stores the status types
	 */
	statusStore : new Ext.data.SimpleStore({
		fields: ["value", "text"],
		data : [["available","Online"],
				["away","Away"],
				["dnd","DND"],
				["chat","Chat"],
				["xa","XA"],
				["unavailable","Unavailable"]
			]
	}),

	/**
	 * @method sendMessage
	 * @private
	 * @descriptions sends a message to user
	 */
	sendMessage : function(e){
		//TODO
	},
	
	/**
	 * @method enterChat
	 * @private
	 * @description enter a MUC (multi-user-chat) chat
	 */
	enterChat : function(e){
		//TODO
	},
	
	/**
	 * @method showAbout
	 * @private
	 * @description shows some infos about the programm in a new dialog
	 */
	showAbout : function(e){
		if(!Ext.WindowMgr.get("AboutDialog"))
			new ExtJame.ui.SimpleDialog(ExtJame.hud,ExtJame.ui.UiConfig.AboutLayout).init();
		else
			Ext.WindowMgr.get("AboutDialog").show();
	},
	
	/**
	 * @method showOffline
	 * @private
	 * @description shows/hides the offline buddys from the rostertree
	 */
	showOffline : function(e,state){
		var buddys = ExtJame.roster.getBuddys();
		buddys.each(function(b){
			if(state == false && b.value.attributes.status == "unavailable"){
				b.value.ui.ctNode.parentNode.style.display = 'none';
				b.value.attributes.hide = true;
			}else{
				b.value.parentNode.ui.ctNode.parentNode.style.display = 'block';
				b.value.ui.ctNode.parentNode.style.display = 'block';
				b.value.attributes.hide = false;
			}
		});
		if(!Ext.WindowMgr.get("ClientDialog").getTopToolbar().items.items[0].menu.items.items[3].checked){
		var groups = ExtJame.roster.getGroups();
			groups.each(function(g){
				if(g.value.findChild("hide",false) == null)
					g.value.ui.ctNode.parentNode.style.display = 'none';
			});
		}
	},
	
	/**
	 * @method showEmpty
	 * @private
	 * @description shows/hides the empty groups (e.g. if anybody from this group is offline) from the rostertree 
	 */
	showEmpty : function(e,state){
		var groups = ExtJame.roster.getGroups();
		groups.each(function(g){
			if(state == true){//show empty groups
				g.value.ui.ctNode.parentNode.style.display = 'block';
			}
			else{
				//hide empty groups
				if(g.value.findChild("hide",false) == null){
					g.value.ui.ctNode.parentNode.style.display = 'none';
				}
			}
		});
	},
	
	/**
	 * @method addBuddy
	 * @private
	 * @description creates a new SimpleDialog with a SimpleForm for adding users to the roster
	 */
	addBuddy : function(e){
		if(!Ext.WindowMgr.get("AddBuddyDialog")){
			new ExtJame.ui.SimpleDialog(ExtJame.hud,ExtJame.ui.UiConfig.AddBuddyLayout).init();
			Ext.WindowMgr.get("AddBuddyDialog").getComponent(0).findByType("combo")[0].store.loadData(ExtJame.roster.groupsArr());
		}else
			Ext.WindowMgr.get("AddBuddyDialog").show();
	},

	/**
	 * @method addGroup
	 * @private
	 * @description creates a SimpleDialog and a SimpleForm for adding groups to the roster
	 */
	addGroup : function(e){
		if(!Ext.WindowMgr.get("AddGroupDialog"))
			new ExtJame.ui.SimpleDialog(ExtJame.hud,ExtJame.ui.UiConfig.AddGroupLayout).init();
		else
			Ext.WindowMgr.get("AddGroupDialog").show();
	},
	
	/**
	 * 
	 * 
	 * 
	 */
	 showPreferences : function(e){
	 	//TODO
	 },
	
	/**
	 * 
	 * 
	 * 
	 */
	 showVCard: function(e){
	 	//TODO
	 },
	 
	 /**
	  * 
	  */
	loginORclient :function(e){
		if(e != null && e.getAttribute("type") == "success" && ExtJame.backend.Xml.getUserFromResponse(e)){	//yes is still connected
			ExtJame.connected = true;
			if(!Ext.WindowMgr.get("ClientDialog"))
				new ExtJame.ui.ClientDialog(ExtJame.hud,ExtJame.ui.UiConfig.ClientLayout).init();
			else
				Ext.WindowMgr.get("ClientDialog").show();
			ExtJame.connected = true;
			if(Ext.WindowMgr.get("LoginDialog"))
				Ext.WindowMgr.get("LoginDialog").close();
			ExtJame.backend.Connection.getNotifications();
		}else{	// no is not connected,show the login widget
			ExtJame.connected = false;
			if(!Ext.WindowMgr.get("LoginDialog"))
				new ExtJame.ui.SimpleDialog(ExtJame.hud,ExtJame.ui.UiConfig.LoginLayout).init();
			else
				Ext.WindowMgr.get("LoginDialog").show();
		}
	},
	
	/**
	 * 
	 */
	 cutJid : function (jid){
	 	return jid.substring(0,jid.indexOf("@"));
	 }
}
