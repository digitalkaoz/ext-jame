/**
*	Licence	:	GPL
*	Author	:	Robert Schoenthal
*	Date	:	16.08.2007
*/

/**
 * @class ExtJame.ui.UiConfig
 * @description stores the config options for the Ext Framework
 */
ExtJame.ui.UiConfig = {
	//Login Dialog
	LoginLayout : {
		title:"Login",
		id:'LoginDialog',
		width: 320,
		height: 230,
		collapsible:true,
		plain:true,
		layout:'fit',
		items:[{
			xtype:'form',
			labelAlign:'left',
			method:'POST',
			url:ExtJame.backend.url.login,
			bodyStyle:'background:transparent;padding:10px;',
			border:false,
			defaultType: 'textfield',
			items:[{
				fieldLabel: 'Username',
				name: 'name',
				allowBlank:false,
				anchor:'90%',
				msgTarget : "side" 
			}, {
				inputType:'password',
				fieldLabel: 'Password',
				name: 'password',
				allowBlank:false,
				anchor:'90%',
				msgTarget : "side" 
			}, {
				fieldLabel:'Server',
				name:'server',
				allowBlank:false,
				anchor:'90%',
				msgTarget : "side" 
			}, {
				xtype:'numberfield',
				fieldLabel:'Port',
				name:'port',
				value: "5222",
				allowBlank:false,
				grow:true,
				msgTarget : "side" 
			}, {
				xtype:'checkbox',
				fieldLabel:'Register new User?',
				name:'newuser',
				checked:false
			}],
			buttons:[{
				text:"Login",
				handler:ExtJame.backend.Connection.login
			}]
		}]
	},
	//Client Layout
	ClientLayout : {
		id:'ClientDialog',
		width:188,
		height:400,
		collapsible:true,
		closable:false,
		plain:true,
		border:false,
		iconCls : "available",
		layout:'border',
		tbar: [{
				xtype:'tbbutton',
				icon: 'images/jame/information.png',
				handler:ExtJame.factory.showAbout,
				tooltip:'About',
				cls: 'x-btn-icon'
			},{xtype: 'tbseparator'},{
				text:'Profile',
				tooltip:'my personal settings',
				menu: {
					id: 'ToolMenu',
					items: [{
						text: 'Preferences',
						icon: 'images/jame/cog_edit.png',
						disabled:true,
						handler:ExtJame.factory.showPreferences
					},{
					 	text: 'Profile',
						icon: 'images/jame/vcard_edit.png',
						disabled:true,
						handler:ExtJame.factory.showVCard
					 }]
				}
			},{xtype: 'tbseparator'},{
					text:'Roster',
					tooltip:'manage my buddys',
					menu: {
					id:"BuddysMenu",
					items:[{
		        		text: 'Send Message',
						icon: 'images/jame/message-pending.png',
						disabled:true,
						handler:ExtJame.factory.sendMessage
					},{
			        	text: 'Enter a Chat',
						disabled:true,
						icon: 'images/jame/comments.png',
						handler:ExtJame.factory.enterChat
					},{
						text: 'Show Offline Buddys',
						checked:true,
						checkHandler:ExtJame.factory.showOffline
					},{
						text: 'Show Empty Groups',
						checked:true,
						checkHandler:ExtJame.factory.showEmpty
					},{
				    	text: 'Add Buddy',
						icon: 'images/jame/user_add.png',
						handler:ExtJame.factory.addBuddy
					},{
						text: 'Add Group',
						icon: 'images/jame/group_add.png',
						handler:ExtJame.factory.addGroup
					},{
				        text: 'Logout',
						icon: 'images/jame/cancel.png',
						handler:ExtJame.backend.Connection.logout
					}]
				}
		}],
		items:[{
			region:'center',
			minHeight:150,
			id:'buddy-panel',
			border:false,
			layout:'fit'
		},{
			region:'south',
			id:'status-container',
			height:27,
			bodyStyle:'background:transparent;padding:5px;',
			border:false,
			xtype:'form',
			hideLabels:true,
			method:'POST',
			url:ExtJame.backend.url.setpresence,
			bodyBorder:false,
			items:[{
				xtype:'combo',
				store:ExtJame.factory.statusStore, 
				displayField:'text',
				valueField:'value',
				tpl:'<tpl for="."><div class="x-combo-list-item"><img src="{icon}" alt="{text}"/> {text}</div></tpl>',
				value:'available',
				typeAhead: true,
				name:'message',
				mode: 'local',
				triggerAction: 'all',
				id:'status-box',
				emptyText:'your Status...',
				selectOnFocus:true
			}]
		}]
	},
	AddGroupLayout : {
		id:'AddGroupDialog',
		title:"Add Group",
		width: 250,
		height: 100,
		collapsible:true,
		plain:true,
		layout:'fit',
		items:[{
			xtype:'form',
			method:'POST',
			url:ExtJame.backend.url.addgroup,
			bodyStyle:'background:transparent;padding:10px;',
			border:false,
			items:[{
				xtype:'textfield',
				fieldLabel: 'Name',
				name: 'name',
				allowBlank:false,
				msgTarget:'side',
				anchor:"90%"
			}],
			buttons :[{
				text:"Add Group",
				handler:ExtJame.backend.Connection.addGroup
			}]
		}]
	},
	AboutLayout : {
		id:'AboutDialog',
		title:"About",
		width: 300,
		height: 180,
		collapsible:true,
		bodyStyle:'background:transparent;padding:10px;',
		layout:'fit',
		items:[{
			xtype:'panel',
			html:'<center><h2>ext-jame</h2><p>a javascript jabber messenger</p><p>&copy; 2008 by Robert Schoenthal</p><p>caziel@digitalkaoz.net</p><p>licence: GPL / Commercial (mail me)</p></center>',
			bodyStyle:'background:transparent;',
			bodyBorder:false,
			border:false
		}],
		buttons:[{
			text:"Close",
			handler:function(){Ext.WindowMgr.get("AboutDialog").close();}
		}]
	},
	AddBuddyLayout : {
		title:"Add Buddy",
		id:"AddBuddyDialog",
		width: 350,
		height:150,
		collapsible:true,
		layout:'fit',
		plain:true,
		items:[{
			xtype:'form',
	        method:'POST',
			url:ExtJame.backend.url.addbuddy,
			bodyStyle:'background:transparent;padding:10px;',
			border:false,
			items:[{
				xtype:'textfield',
		        fieldLabel: 'JID',
		        name: 'name',
		        allowBlank:false,
		        msgTarget:'side',
		        anchor:'90%'
			},{
				xtype:'combo',
				fieldLabel: "Group",
				store:new Ext.data.SimpleStore({
					fields: ["value", "text"]
				}),
				name: 'group',
				displayField: 'value',
				valueField : 'value',
				typeAhead: false,
				allowBlank:false,
				mode: 'local',
		        msgTarget:'side',
		        anchor:'90%'
			}],
			buttons :[{
				text:"Add Buddy",
				handler:ExtJame.backend.Connection.addBuddy
			}]
		}]
	}
}
