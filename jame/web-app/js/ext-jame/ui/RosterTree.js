/**
*	Licence	:	GPL
*	Author	:	Robert Schönthal
*	Date	:	16.08.2007
*/

/**
 * @class ExtJame.ui.RosterTree
 * @description provides the roster tree with groups, buddys and their attributes
 */
ExtJame.ui.RosterTree = function(_parent){
	var extTree = null;
	var parent = _parent;
	var rosterGroups = new Hash();	//the groups
	var rosterBuddys = new Hash();	//the buddys

	/**
	 * @method createTree
	 * @private
	 * @description creates the tree, fetches the groups and buddys from the backend, and append these to the tree
	 */
	var createTree = function(url) {
		extTree = new Ext.tree.TreePanel({
				enableDD:true,
				animate:true,
				rootVisible:false,
				lines:false,
				ddGroup: "buddys",
				border:false	
		});
		extTree.setRootNode(new Ext.tree.TreeNode({
				text: "buddys",
				allowDrag:false,
				expanded:true
		}));
		var p = new Ext.data.HttpProxy({url:url});	// fetch the groups/buddys from the backend
		p.load(null, {	//if load was complete
			read: function(response) {
				if(response && response.responseXML){
					var doc = response.responseXML;
					addGroupToTree(null,doc.documentElement);	//add groups
					addBuddyToTree(null,doc.documentElement);	//add buddys
				}
			}
		}, function(){parent.add(extTree); parent.doLayout();}, extTree);
		return extTree;
	}
	
	/**
	 * @method renameBuddys
	 * @private
	 * @description activates inline editing of buddy nodes, and submit these changes to the backend
	 */
	var renameBuddy = function(_node,e){
		var treeEditor = new Ext.tree.TreeEditor(extTree, {
		        allowBlank:false,
		        blankText:'A name is required',
		        selectOnFocus:true
		});
		treeEditor.on("complete",ExtJame.backend.Connection.renameBuddy,this);
		treeEditor.triggerEdit(_node.node);
	}
	
	/**
	 * @method renameGroup
	 * @private
	 * @description activates inline editing of group nodes, and submit these changes to the backend
	 */
	var renameGroup = function(_node,e){
		var treeEditor = new Ext.tree.TreeEditor(extTree, {
		        allowBlank:false,
		        blankText:'A name is required',
		        selectOnFocus:true
		});
		treeEditor.on("complete",ExtJame.backend.Connection.renameGroup,this);
		treeEditor.triggerEdit(_node.node);
	}
	
	/**
	 * @method subscribedBuddys
	 * @private
	 * @description send the buddy he is subscribed
	 */
	var subscribedBuddy = function(_node,e){
		ExtJame.backend.Connection.sendSubscription(_node.node.attributes.jid,"subscribed");
	}
	
	/**
	 * @method subscribeBuddy
	 * @private
	 * @description ask the buddy for subscribtion
	 */
	var subscribeBuddy = function(_node,e){
		ExtJame.backend.Connection.sendSubscription(_node.node.attributes.jid,"subscribe");
	}
	
	/**
	 * @method buddyContext
	 * @private
	 * @description creates a context menu for buddys, provides some options for this buddy
	 */
	var buddyContext = function(_node, e){
		var items = Array();
		items.push({ 	
			text: 'message', 
			handler: initChat ,
			node:_node,
			focus:this,
			icon: 'images/jame/message-pending.png'
		});
		items.push({ 	
			text: 'edit', 
			handler: renameBuddy ,
			node:_node, 
			icon:"images/jame/user_edit.png"
		});
		items.push({ 	
			text: 'delete', 
			handler: ExtJame.backend.Connection.removeBuddy ,
			node:_node, 
			icon:"images/jame/user_delete.png"
		});
		if (_node.attributes.subscription == "none" || _node.attributes.subscription == "to" || _node.attributes.subscription == "from") {
			items.push({
				text: 'subscribe',
				handler: subscribedBuddy,
				node: _node,
				icon: "images/jame/group_go.png"
			});
		}
		var menu = new Ext.menu.Menu({ 
				id: 'menuContext',
				items: items
		}); 
		menu.show(_node.ui.getAnchor());
	}
	
	/**
	 * @method groupContext
	 * @private
	 * @description create a context menu for groups, provides some options for this group
	 */
	var groupContext = function(_node, e){
		var menu = new Ext.menu.Menu({ 
				id: 'menuContext',
				items: [ 
					{ 	text: 'edit', 
						handler: renameGroup ,
						node:_node, 
						icon:"images/jame/group_edit.png"},
					{ 	text: 'delete', 
						handler: ExtJame.backend.Connection.removeGroup,
						node:_node,
						icon:"images/jame/group_delete.png"}
				]
			}); 
		menu.show(_node.ui.getAnchor());
	}
	
	/**
	 * @method initChat
	 * @private
	 * @description is called if a buddy dbl clicked, create if chat if doesnt exists, otherwise show it
	 */
	var initChat = function(e) {
		if(this.node){
			var jid = this.node.id;
			var anchor = this.node.ui.anchor;
		}else{
			var jid = e.id;
			var anchor = e.ui.anchor;
		}
		if (!anchor) {
			anchor = ExtJame.hud;
		}
		if(Ext.ComponentMgr.get(jid)){
			Ext.WindowMgr.get(Ext.ComponentMgr.get(jid).parent).show();
			Ext.WindowMgr.get(Ext.ComponentMgr.get(jid).parent).getComponent(0).activate(jid);
		}else{
			new ExtJame.ui.ChatDialog(anchor,ExtJame.ui.UiConfig.ChatLayout,jid).init();
		}
	}
	
	/**
	 * @method addGroupToTree
	 * @private
	 * @description adds groups to the tree
	 */
	var addGroupToTree = function(f,a){
		var e = null;
		if (a && a.response) {
			e = a.response.responseXML.firstChild;
		}
		else {
			e = a;
		}
		if(e.getAttribute("type") == "success"){
			if(f){
				var _group = new Ext.tree.TreeNode({ //group adden
								text:f.findField("name").getValue(),
								iconCls:"display:none!important;",
								expanded:true,
								expandable:true,
								allowDrag:false,
								"gname":f.findField("name").getValue(),
								qtip:"Group:"+f.findField("name").getValue()
				});
				_group.on("contextmenu",groupContext,this);
				rosterGroups.set(f.findField("name").getValue(), _group);		
				extTree.root.appendChild(_group);		
			}else{
				var groups = ExtJame.backend.Xml.getGroupsFromResponse(e.getElementsByTagName("methodResponse")[0]);
				for(var i=0;i<groups.length;i++){
					var _group = new Ext.tree.TreeNode({ //group adden
									text:groups[i],
									iconCls:"display:none;",
									expanded:true,
									expandable:true,
									allowDrag:false,
									"gname":groups[i],
									qtip:"Group:"+groups[i]
					});
					_group.on("contextmenu",groupContext,this);
					rosterGroups.set(groups[i], _group);		
					extTree.root.appendChild(_group);		
				}
			}
		}
	}
	
	/**
	 * @method switchUserGroup
	 * @private
	 * @description is called if a buddy is dragged into another group, notifies the backend for the changes
	 */
	var switchUserGroup = function(_tree,_buddy,_old,_new,_pos){
		ExtJame.backend.Connection.switchUserGroup(_buddy.id,_new.text,_old.text);
	}
	
	/**
	 * @method removeGroupFromTree
	 * @private
	 * @description removes a group node from the tree
	 */
	var removeGroupFromTree = function(_name){
		extTree.root.removeChild(rosterGroups.get(_name));
		rosterGroups.unset(_name);
	}
	
	/**
	 * @method removeBuddyFromTree
	 * @private
	 * @description removes a buddy node from the tree
	 */
	var removeBuddyFromTree = function(_jid){
		rosterBuddys.get(_jid).parentNode.removeChild(rosterBuddys.get(_jid));
		rosterBuddys.unset(_jid);
	}
	
	/**
	 * @method addBuddyToTree
	 * @private
	 * @description adds a buddy node to the tree
	 */
	var addBuddyToTree = function(f,a){
		var e = null;
		if (a && a.response) {
			e = a.response.responseXML.firstChild;
		}
		else {
			e = a;
		}
		if(e.getAttribute("type") == "success" || e.getAttribute("type") == "push"){
			if(f){
				var buddy = Array();
				buddy["jid"] = f.findField("name").getValue();
				buddy["name"] = f.findField("name").getValue();
				buddy["status"] = "unavailable";
				buddy["group"] = f.findField("group").getValue();
				var buddys = Array();
				buddys[0] = buddy; 
			}else{
				var buddys = ExtJame.backend.Xml.getBuddysFromResponse(e.getElementsByTagName("methodResponse")[0]);
			}
			for(var i=0;i<buddys.length;i++){
				var buddy = buddys[i];
				var appended = false;
				if (buddy["name"]) {
					var label = buddy["name"];
				}
				else {
					var label = buddy["jid"];
				}
				var _buddy = new Ext.tree.TreeNode({ //buddy adden
						id:buddy["jid"],
						status:buddy["status"],
						status_text:buddy["status_text"],
						jid:buddy["jid"],
						subscription:buddy["subscription"],
						hide:false,
						text:label,
						icon:ExtJame.backend.url.baseurl+"images/jame/icon_"+buddy["status"]+".png",
						allowDrag:true,
						allowDrop:false,
						qtip:"JID : "+buddy["jid"]+"<br/>Status : "+buddy["status"]+"<br/>Text : "+buddy["status_text"]+"<br/>Subscription : "+buddy["subscription"]
				});
				_buddy.on("contextmenu",buddyContext,this);
				_buddy.on("dblclick",initChat,this);
				if(buddy["group"]){
						rosterGroups.get(buddy["group"]).appendChild(_buddy);
						appended = true;
				}
				if (!appended) {
					extTree.root.appendChild(_buddy);
				}
				_buddy.on("move",switchUserGroup,this);
				rosterBuddys.set(buddy["jid"], _buddy);
			}			
		}
	}
	return {
		/**
		 * @method init
		 * @public
		 * @description initializes the rostertree
		 */
		init : function(){
			if (!extTree) {
				extTree = createTree(ExtJame.backend.url.getbuddys);
			}
		},
	
		/**
		 * @method getGroup
		 * @private
		 * @description returns the group matching the parameter
		 */
		getGroup : function(_name){
			return rosterGroups.get(_name);
		},
	
		/**
		 * @method getBuddy
		 * @public
		 * @description returns the buddy matching the parameter
		 */
		getBuddy : function(_name){
			return rosterBuddys.get(_name);
		},
	
		/**
		 * @method getGroups
		 * @public
		 * @description returns all group nodes
		 */
		getGroups : function(){
			return rosterGroups;
		},
	
		/**
		 * @method getBuddys
		 * @public
		 * @description returns alle buddy nodes
		 */
		getBuddys : function(){
			return rosterBuddys;
		},
	
		/**
		 * @method addGroups
		 * @public
		 * @description adds a group to the tree
		 */
		addGroups : function(f,a){
			addGroupToTree(f,a);
			if (Ext.WindowMgr.get("AddGroupDialog")) {
				Ext.WindowMgr.get("AddGroupDialog").close();
			}
		},
	
		/**
		 * @method addBuddys
		 * @public
		 * @description adds a buddy to the tree
		 */
		addBuddys : function(f,a){
			addBuddyToTree(f,a);
			if (Ext.WindowMgr.get("AddBuddyDialog")) {
				Ext.WindowMgr.get("AddBuddyDialog").close();
			}
		},
	
		/**
		 * @method removeGroup
		 * @public
		 * @description removes a group node from the tree
		 */
		removeGroup : function(_group){
			removeGroupFromTree(_group);
		},
	
		/**
		 * @method removeBuddy
		 * @public
		 * @description removes a buddy node from the tree
		 */
		removeBuddy : function(_jid){
			removeBuddyFromTree(_jid);
		},
	
		/**
		 * @method groupsArr
		 * @public
		 * @description returns the groups array for an Ext.data.SimpleStore
		 */
		groupsArr : function(){
			var groupsArr = Array();
			rosterGroups.each(function(group){
				var g = Array();
				g.push(group.key);
				g.push(group.key);
				groupsArr.push(g);
			});
			return  groupsArr;
		},
	
		/**
		 * @method updateBuddy
		 * @public
		 * @description updates a buddy node
		 */
		updateBuddy : function(buddy,_attrs){
			buddy.getUI().iconNode.src = ExtJame.backend.url.baseurl+"images/jame/icon_"+_attrs["status"]+".png";
			buddy.attributes.status = _attrs['status'];
			buddy.attributes.subscription = _attrs['subscription'];
			var qtip = "JID : "+_attrs["jid"]+"<br/>Status : "+_attrs["status"]+"<br/>Text : "+_attrs["status_text"]+"<br/>Subscription : "+_attrs["subscription"];
			if(buddy.getUI().textNode.setAttributeNS){
				buddy.getUI().textNode.setAttributeNS("ext", "qtip", qtip);
			}else{
		    	buddy.getUI().textNode.setAttribute("ext:qtip", qtip);
				}
		}
	}
}
