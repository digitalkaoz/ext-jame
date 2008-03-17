/**
/**
*	Licence	:	GPL
*	Author	:	Robert Schönthal
*	Date	:	16.08.2007
*/

/**
 * @class ExtJame.ui.ChatDialog
 * @description provides a dialog, which is able to store Chats (ChatForms) in Tabs, you can drop buddy on it for new chats
 */
ExtJame.ui.ChatDialog = function(_opener, _config, _jid){

	var extDialog = null;
	var config = _config;
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
			title:"ChatDialog",
			width:530,
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
		addPanel(extDialog.getComponent(0),jid);
		extDialog.show(opener);
		//panel.getComponent(1).findByType("htmleditor")[0].toggleSourceEdit(true);
		tabpanel = extDialog.getComponent(0);
		dd = new Ext.dd.DropTarget(tabpanel.getId(),{
			ddGroup:"buddys",
			parent:extDialog.getId(),
			notifyDrop : pushPanel
		});
		extDialog.doLayout();
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
		var d = new Date();
		var ts = d.getHours()+":"+d.getMinutes();
 		var myText = "<b style='color:blue;'>["+ExtJame.myJid+" "+ts+"]</b> "+this.ownerCt.form.items.items[0].getValue()+"<br/>";
		this.ownerCt.ownerCt.getComponent(0).body.insertHtml("beforeEnd",myText);
		this.ownerCt.form.items.items[0].reset();
		p = this.ownerCt.ownerCt.getComponent(0); 
		//p.getEl().scroll("bottom",p.getEl().getY() - p.getEl().dom.scrollTop,true)
	}

	/**
	 * @method submit
	 * @private
	 * @description submits a form
	 */
	var submit = function(el,event,d){
		try{
			if(event.ENTER){
				el.ownerCt.form.submit({
					reset:false,
					scope: this,
					success : pullResponse
				});
			}else if(el.text){
				el.ownerCt.form.submit({
					reset:false,
					scope: this,
					success : pullResponse
				});
			}
		}catch(e){
			//TODO
		}
	}
	
	/**
	 * trigger a panel add from drag
	 */
	 var pushPanel = function(dd,e,data){
			var jid = data.node.attributes.jid;
			tabpanel = Ext.WindowMgr.get(dd.cachedTarget.parent).getComponent(0);
			addPanel(tabpanel,jid);
	 }
	 
	 /**
	  * create new Panel
	  */
	  var createPanel = function(jid){
			return new Ext.Panel({
					id:jid,
					title:ExtJame.factory.cutJid(jid),
					parent:extDialog.getId(),
					closable:true,
					border:false,
					layout:'border',
					iconCls : '',
					items:[{
						region:'center',
						border:0,
						height:150,
						xtype:'panel',
						autoScroll : true,
						border:false,
						layout:'fit',
						bodyStyle:'padding:10px;'
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
	  }
	  
	/**
	 * @method addPanel
	 * @private
	 * @description adds a tab to the dialog (creates a ChatForm)
	 */
	var addPanel = function(tabpanel,jid){
		if(!Ext.ComponentMgr.get(jid)){
			var chatPanel = createPanel(jid);
			chatPanel.setIconClass(ExtJame.roster.getBuddy(jid).attributes.status);
			tabpanel.add(chatPanel);
			Ext.ComponentMgr.register(chatPanel);
			tabpanel.activate(chatPanel.id);
			extDialog.doLayout();
			//events
			chatPanel.on("destroy", closeTab,chatPanel);
			//chatPanel.getComponent(1).findByType("htmleditor")[0].on("specialkey",submit,item);
			//chatPanel.getComponent(1).findByType("htmleditor")[0].toggleSourceEdit(true);
			tabpanel.doLayout();
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
