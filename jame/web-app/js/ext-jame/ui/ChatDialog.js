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
		var panel = addPanel(extDialog.getComponent(0),jid);
		extDialog.show(opener);
		var editor = panel.getComponent(1).findByType("htmleditor")[0];
		bindSpecialKeys(editor);
		editor.onEditorEvent = submit;
		
		tabpanel = extDialog.getComponent(0);
		dd = new Ext.dd.DropTarget(tabpanel.getId(),{
			ddGroup:"buddys",
			parent:extDialog.getId(),
			notifyDrop : pushPanel
		});
		extDialog.doLayout();
	}
	
	/**
	 * @method submit
	 * @private
	 * @description submits a form
	 */
	var submit = function(el,B,d){
	   var keyCode = (document.layers) ? keyStroke.which : el.keyCode;
	   if((keyCode == 13)){
	   		this.syncValue();
	   		this.setValue(this.getRawValue().replace(/<br>/g, ""));
	   		var form = this.ownerCt.form;
	   		var panel = this.ownerCt.ownerCt;
	   }
		else if(B && !B.nodeName && B.getKey()==13){
			var form = this.form;
			var panel = this.ownerCt;
		}
		try{
			if( form && panel && panel.getComponent(1).findByType("htmleditor")[0].getValue().length > 0){
				form.submit({
					reset:false,
					scope: panel,
					success : pullResponse
				});
			}
		}catch(e){
			//TODO
		}
	}
	
	/**
	 * 
	 */
	var bindSpecialKeys = function(editor){
		var panel = editor.ownerCt.ownerCt;
		//event for sourcediting
		editor.listener = new Ext.KeyMap(editor.el.dom, {
	   			key: 13,
	   			alt:false,
	   			fn: submit,
	   			scope:panel.getComponent(1)
		});
		//event for normal mode
		//editor.focus();
		//editor.toggleSourceEdit(true);
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
		extDialog.getComponent(0).items.each(function(item,index,length){Ext.ComponentMgr.unregister(item);return true;});
	}
	
	/**
	 * @method tabChange
	 * @private
	 * @description changes the dialogs title (title of active tab)
	 */
	var tabChange = function(e){
		extDialog.setTitle(e.getActiveTab().title);
		var buddy = e.getActiveTab().id;
		if(Ext.ComponentMgr.get(buddy)){
			var oldIconClass = Ext.ComponentMgr.get(buddy).iconCls;
			var tabSpan = Ext.fly(Ext.ComponentMgr.get(buddy).ownerCt.getTabEl(Ext.ComponentMgr.get(buddy))).child('span.x-tab-strip-text');
			tabSpan.removeClass(oldIconClass);
			Ext.ComponentMgr.get(buddy).iconCls = ExtJame.roster.getBuddy(buddy).attributes.status;
			tabSpan.addClass(ExtJame.roster.getBuddy(buddy).attributes.status);
		}
	}

	/**
	 *
	 *
	 */
	var pullResponse = function(){
		var d = new Date();
		var ts = d.getHours()+":"+d.getMinutes();
		var output = this.getComponent(0);
		var editor = this.getComponent(1).findByType("htmleditor")[0];
		var val = editor.getValue().replace(/script|onclick/g, "");
 		var myText = "<b style='color:blue;'>["+ExtJame.myJid+" "+ts+"]</b> "+val+"<br/>";
		output.body.insertHtml("beforeEnd",myText);
		editor.reset();
		output.ownerCt.doLayout();
		output.body.scroll('b',output.body.dom.offsetHeight,false);
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
						waitMsgTarget:true,
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
								preventScrollBars:true,
								anchor:'0-50',
								border:false,
								enableLinks:false,
								enableLists:false,
								enableAlignments:false
				            },{
				                xtype:'hidden',
				                fieldLabel: '',
				                name: 'to',
				                value:jid,
								allowBlank:false
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
			if (ExtJame.roster && ExtJame.roster.getBuddy(jid)) {
				chatPanel.setIconClass(ExtJame.roster.getBuddy(jid).attributes.status);
			}
			else {
				chatPanel.setIconClass("unavailable");
			}
			tabpanel.add(chatPanel);
			Ext.ComponentMgr.register(chatPanel);
			chatPanel.show();
			extDialog.doLayout();
			tabpanel.activate(chatPanel.id);
			//events
			chatPanel.on("destroy", closeTab,chatPanel);
			var editor = chatPanel.getComponent(1).findByType("htmleditor")[0];
			if(editor.el){
				bindSpecialKeys(editor);
				editor.onEditorEvent = submit;
			}
			tabpanel.doLayout();
		}else{
			var pDlg = Ext.ComponentMgr.get(jid).parent;
			Ext.WindowMgr.get(pDlg).show();
			Ext.WindowMgr.get(pDlg).getComponent(0).activate(jid);
		}
		return chatPanel;
	}
	
	return {
		/**
		 * @method init
		 * @public
		 * @description initializes the dialog
		 */
		init : function(){
			if (!extDialog) {
				createDialog();
			}
			else {
				extDialog.show();
			}
		}
	}
}
