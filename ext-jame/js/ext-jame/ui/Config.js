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
		width: 300,
		height: 210,
		closable:true,
		resizable:false,
		collapsible:true,
		plain:true,
		layout:'fit',
		items:[{
			xtype:'form',
			labelWidth: 120,
			labelAlign:'left',
			hideBorders:true,
			layout:'form',
			plain:true,
			method:'POST',
			url:ExtJame.backend.url.login,
			bodyStyle:'background:transparent;',
			bodyBorder:false,
			border:false,
			items:[{
				xtype:'textfield',
				fieldLabel: 'Username',
				name: 'name',
				allowBlank:false
			}, {
				xtype:'textfield',
				fieldLabel: 'Password',
				name: 'password',
				allowBlank:false
			}, {
				xtype:'textfield',
				fieldLabel:'Server',
				name:'server',
				allowBlank:false
			}, {
				xtype:'numberfield',
				fieldLabel:'Port',
				name:'port',
				value: "5222",
				allowBlank:false
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
		pageX:0,
		pageY:30,
		closable:false,
		collapsible:true,
		resizable:true,
		plain:true,
		layout:'border',
		tbar: new Ext.Toolbar({
			items:[{
				cls: 'x-btn-text-icon bmenu', // icon and text class
				text:'Buddys',
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
			},{
				cls: 'x-btn-text-icon bmenu', // icon and text class
				text:'Tools',
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
					 },{
					    text: 'About',
						icon: 'images/jame/information.png',
						handler:ExtJame.factory.showAbout
					 }]
				}
			}]
		}),
		items:[{
			region:'center',
			minHeight:150,
			id:'buddy-panel'
		},{
			region:'south',
			height:25
		}
		],
		minimizable: true,
		plain:true,
		x:200,
		y:150
	},
	AddGroupLayout : {
		id:'AddGroupDialog',
		title:"Add Group",
		width: 250,
		height: 100,
		closable:true,
		collapsible:true,
		plain:true,
		layout:'fit',
		items:[{
			xtype:'form',
			labelWidth: 80,
			labelAlign:'left',
			hideBorders:true,
			plain:true,
			layout:'form',
			method:'POST',
			url:ExtJame.backend.url.addgroup,
			bodyStyle:'background:transparent;',
			bodyBorder:false,
			border:false,
			items:[{
				xtype:'textfield',
				fieldLabel: 'Name',
				name: 'name',
				allowBlank:false
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
		height: 400,
		closable:true,
		resizable:false,
		collapsible:true,
		layout:'fit',
		items:[{
			xtype:'panel',
			html:'he here comes some text',
			bodyStyle:'background:transparent;',
			bodyBorder:false,
			border:false,
		}]
	},
	AddBuddyLayout : {
		title:"Add Buddy",
		id:"AddBuddyDialog",
		width: 350,
		closable:true,
		collapsible:true,
		layout:'fit',
		plain:true,
		items:[{
			xtype:'form',
			height:100,
	        	labelWidth: 75,
	        	method:'POST',
			url:ExtJame.backend.url.addbuddy,
			layout:'form',
			bodyStyle:'background:transparent;',
			bodyBorder:false,
			border:false,
			items:[{
				xtype:'textfield',
			        fieldLabel: 'JID',
			        name: 'name',
			        allowBlank:false
			},{
				xtype:'combo',
			        //triggerAction: 'all',
				fieldLabel: "Group",
				store:ExtJame.factory.groupsStore, 
				name: 'group',
				displayField: 'value',
				valueField : 'value',
				typeAhead: false,
				allowBlank:false,
				forceSelection:true,
				mode: 'local',
			}],
			buttons :[{
				text:"Add Buddy",
				handler:ExtJame.backend.Connection.addBuddy
			}]
		}]
	}
}