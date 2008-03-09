/**
*	Licence	:	GPL
*	Author	:	Robert Schönthal
*	Date	:	16.08.2007
*/

/**
 * @class ExtJame.ui.ChatDialog
 * @description provides a dialog, which is able to store Chats ( ChatForms) in Tabs, you can drop buddy on it for new chats
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
	            layoutOnTabChange:true,
	        }]
		});
		extDialog.getComponent(0).on("tabchange", tabChange,extDialog.getComponent(0));		
		extDialog.setTitle(jid);
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
	var pullResponse = function(f){
		window.test = f.ownerCt.ownerCt.getComponent(0);
	}

	/**
	 * @method submit
	 * @private
	 * @description submits a form
	 */
	var submit = function(){
		var form = this.ownerCt.form;
 		var myText = "["+ExtJame.myJid+"] "+this.ownerCt.getComponent(0).getValue()+"<br/>";
		this.ownerCt.ownerCt.getComponent(0).body.insertHtml("beforeEnd",myText);
		form.submit({
			reset:true,
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
					bodyBorder:false,
					layout:'border',
					items:[{
						region:'center',
						border:0,
						height:150,
						xtype:'panel'
					},{
						region:'south',
						minHeight:150,
						split:true,
						xtype:'form',
						hideLabels:true,
						hideBorders:true,
						height:150,
						method:'POST',
				        layout:'form',
						url:ExtJame.backend.url.sendmessage,
						items:[{
				                xtype:'htmleditor',
				                fieldLabel: '',
				                name: 'message',
								allowBlank:false,
								enableSourceEdit:false,
								anchor:'0-50'
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