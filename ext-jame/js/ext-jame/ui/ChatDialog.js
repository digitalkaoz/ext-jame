/**
*	Licence	:	GPL
*	Author	:	Robert Schönthal
*	Date	:	16.08.2007
*/

/**
 * @class ExtJame.ui.ChatDialog
 * @description provides a dialog, which is able to store Chats (ChatForms) in Tabs, you can drop buddy on it for new chats
 */
ExtJame.ui.ChatDialog = function(_id, _opener, _config, _jid){

	var extDialog = null;
	var config = _config;
	var id = _id;
	var opener = _opener;
	var dd = null;
	var jid = _jid;

	/**
	 * @method createDialog
	 * @private
	 * @description creates the Ext Dialog and appends it to the parent element (opener) 
	 */
	var createDialog = function(){
		extDialog = new Ext.Window({
			id :id,
			title:"ChatDialog",
			width:520,
			height:400,
			closable:true,
			collapsible:true,
			layout:'fit',
			items: [{
				xtype:'tabpanel',
	            border:false,
	            animScroll:true,
	            autoScroll:true,
	            enableTabScroll:true,
	            layoutOnTabChange:true
	        }]
		});
		extDialog.getComponent(0).on("tabchange", tabChange,extDialog.getComponent(0));		
		extDialog.setTitle(jid);
		extDialog.on("destroy", removeChats);
		addPanel(extDialog.getComponent(0),id,jid);
		extDialog.show(opener);
		tabpanel = extDialog.getComponent(0);
		dd = new Ext.dd.DropTarget(tabpanel.getId(),{
			ddGroup:"buddys",
			parent:id,
			notifyDrop : addPanel
		});
	}
	
	/**
	 * @method closeTab
	 * @private
	 * @description removes a tab from the dialog
	 */
	var closeTab = function(e){
		Ext.ComponentMgr.unregister(e);
		if(extDialog.getComponent(0).items.getCount() == 0){
			extDialog.close();
		}
	}
	
	/**
	 * @method removeChats
	 * @private
	 * @description removes all chats, if window is closed
	 */
	var removeChats = function(){
		extDialog.getComponent(0).items.each(function(item,index,length){Ext.ComponentMgr.unregister(item);return true;})
	}
	
	/**
	 * @method tabChange
	 * @private
	 * @description changes the dialogs title (title of active tab)
	 */
	var tabChange = function(e){
		extDialog.setTitle(e.getActiveTab().title);
	}

	/**
	 *
	 *
	 */
	var pullResponse = function(){
 		var myText = "["+ExtJame.myJid+"] "+this.ownerCt.form.items.items[0].getValue()+"<br/>";
		this.ownerCt.ownerCt.getComponent(0).body.insertHtml("beforeEnd",myText);
		this.ownerCt.form.items.items[0].reset();
	}

	/**
	 * @method submit
	 * @private
	 * @description submits a form
	 */
	var submit = function(){
		var form = this.ownerCt.form;
		form.submit({
			reset:false,
			scope: this,
			success : pullResponse
		});
	}
	
	/**
	 * @method addPanel
	 * @private
	 * @description adds a tab to the dialog (creates a ChatForm)
	 */
	var addPanel = function(dd,e,data){
		if(data.node)
			var jid = data.node.attributes.jid;
		else
			var jid = data;
		if(dd.cachedTarget){
			tabpanel = Ext.WindowMgr.get(dd.cachedTarget.parent).getComponent(0);
		}
		else
			tabpanel = dd;
		if(!Ext.ComponentMgr.get(jid)){
			var item = new Ext.Panel({
					id:jid,
					title:jid,
					parent:id,
					closable:true,
					border:false,
					layout:'border',
					iconCls : ExtJame.roster ? ExtJame.roster.getBuddy(jid).attributes.status: '',
					items:[{
						region:'center',
						border:0,
						height:150,
						xtype:'panel',
						autoScroll : true,
						border:false,
						layout:'fit'
					},{
						region:'south',
						minHeight:150,
						split:true,
						xtype:'form',
						border:false,
						hideLabels:true,
						bodyStyle:'background:transparent;',
						height:150,
						method:'POST',
						url:ExtJame.backend.url.sendmessage,
						items:[{
				                xtype:'htmleditor',
				                fieldLabel: '',
				                name: 'body',
								allowBlank:false,
								enableSourceEdit:false,
								anchor:'0-50',
								border:false
				            },{
				                xtype:'hidden',
				                fieldLabel: '',
				                name: 'to',
				                value:jid,
								allowBlank:false
						}
						],
						buttons:[{
							text:"Send",
							handler:submit
						}]
					}]
			});
			item.on("destroy", closeTab, item);
			tabpanel.add(item);
			Ext.ComponentMgr.register(item);
			tabpanel.activate(item.id);
			tabpanel.doLayout();
			extDialog.doLayout();
		}else{
			var pDlg = Ext.ComponentMgr.get(jid).parent;
			Ext.WindowMgr.get(pDlg).show();
			Ext.WindowMgr.get(pDlg).getComponent(0).activate(jid);
		}
	}
	
	return {
		/**
		 * @method init
		 * @public
		 * @description initializes the dialog
		 */
		init : function(){
			if(!extDialog)
				createDialog();
			else
				extDialog.show();
		}
	}
}
