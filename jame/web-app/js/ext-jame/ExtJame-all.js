/**
*	Licence	:	GPL
*	Author	:	Robert Schönthal
*  version 0.1
*/

//ExtJame Core
var ExtJame={ui:{},backend:{},factory:{},chats:new Hash(),connected:false,roster:null,myJid:"",hud:Ext.getBody(),init:function(){Ext.QuickTips.init();if(!ExtJame.connected)
ExtJame.backend.Connection.isConnected();else{if(Ext.WindowMgr.getActive())
Ext.WindowMgr.hideAll();else
Ext.WindowMgr.each(function(win){win.show();})}}}
Ext.onReady(function(){ExtJame.hud=Ext.get('jame-hud');if(ExtJame.hud)
ExtJame.hud.on('click',ExtJame.init);});Ext.override(Ext.Element,{scrollTo:function(side,value,animate){var side=side.toLowerCase();var prop;switch(side){case"left":prop="scrollLeft";break;case"right":prop="scrollLeft";value=this.dom.scrollWidth-(value+this.dom.clientWidth);break;case"top":prop="scrollTop";break;case"bottom":prop="scrollTop";value=this.dom.scrollHeight-(value+this.dom.clientHeight);break;}
if(value<0)value=0;if(!animate||!A){this.dom[prop]=value;}else{var to=prop=="scrollLeft"?[value,this.dom.scrollTop]:[this.dom.scrollLeft,value];this.anim({scroll:{"to":to}},this.preanim(arguments,2),'scroll');}
return this;}});
//ExtJame.backend.xml
ExtJame.backend.Xml={getUserFromResponse:function(el){if(el.getElementsByTagName("methodResponse")[0]){var response=el.getElementsByTagName("methodResponse")[0];var me=response.getElementsByTagName("you")[0];if(me){ExtJame.myJid=me.getElementsByTagName("name")[0].firstChild.nodeValue;return true;}}else{return false;}},getBuddyFromResponse:function(el){var buddy=el;var buddy_attrs=new Object();buddy_attrs["jid"]=buddy.getAttribute("jid");for(var x=0;x<buddy.childNodes.length;x++){if(buddy.childNodes[x].nodeType==1){switch(buddy.childNodes[x].nodeName){case"name":{buddy_attrs["name"]=buddy.childNodes[x].firstChild?buddy.childNodes[x].firstChild.nodeValue:"";break;}
case"status":{buddy_attrs["status"]=buddy.childNodes[x].getAttribute("type")?buddy.childNodes[x].getAttribute("type"):"";buddy_attrs["subscription"]=buddy.childNodes[x].getAttribute("subscription")?buddy.childNodes[x].getAttribute("subscription"):"";buddy_attrs["status_text"]=buddy.childNodes[x].firstChild?buddy.childNodes[x].firstChild.nodeValue:"";break;}
case"group":{buddy_attrs["group"]=buddy.childNodes[x].firstChild?buddy.childNodes[x].firstChild.nodeValue:"";break;}
default:break;}}}
return buddy_attrs;},getBuddysFromResponse:function(el){var buddys=el.getElementsByTagName("buddys")[0].childNodes;var ret=Array();if(buddys.length>0){for(var b=0;b<buddys.length;b++){if(buddys[b].nodeName=="buddy"){var temp=ExtJame.backend.Xml.getBuddyFromResponse(buddys[b]);ret.push(temp);}}}
return ret;},getGroupsFromResponse:function(el){var groups=el.getElementsByTagName("groups")[0].childNodes;var ret=new Array();if(groups.length>0){for(var b=0;b<groups.length;b++){if(groups[b].nodeType==1&&groups[b].firstChild){ret.push(groups[b].firstChild.nodeValue);}}}
return ret;},getMessagesFromResponse:function(el){var msg=el.getElementsByTagName("messages")[0].childNodes;var ret=new Array();if(msg.length>0){for(var b=0;b<msg.length;b++){if(msg[b].nodeType==1&&msg[b].nodeName=="message"){var tmp=new Array();if(msg[b].getAttribute("from").indexOf("/"))
tmp['from']=msg[b].getAttribute("from").substr(0,msg[b].getAttribute("from").indexOf("/"));else
tmp['from']=msg[b].getAttribute("from");tmp['msg']=msg[b].getElementsByTagName("body")[0].firstChild.nodeValue;ret.push(tmp);}}}
return ret;},parseNotifications:function(XmlEl){if(XmlEl.nodeName=="response"&&XmlEl.getAttribute("type")=="success"){var response=XmlEl.getElementsByTagName("methodResponse")[0];var messages=ExtJame.backend.Xml.getMessagesFromResponse(response);var buddys=ExtJame.backend.Xml.getBuddysFromResponse(response);if(messages.length>0){ExtJame.backend.Xml.updateMessages(messages);}
if(buddys.length>0){ExtJame.backend.Xml.updateBuddys(buddys);}}else{}},updateMessages:function(messages){for(var i=0;i<messages.length;i++){if(Ext.ComponentMgr.get(messages[i]["from"])){var pDlg=Ext.ComponentMgr.get(messages[i]["from"]).parent;Ext.WindowMgr.get(pDlg).show();Ext.WindowMgr.get(pDlg).getComponent(0).activate(messages[i]["from"]);}else{new ExtJame.ui.ChatDialog(ExtJame.hud,ExtJame.ui.UiConfig.ChatLayout,messages[i]["from"]).init();}
var panel=Ext.ComponentMgr.get(messages[i]["from"]).getComponent(0);var d=new Date();var ts=d.getHours()+":"+d.getMinutes();var btext="<b style='color:red;'>["+ExtJame.factory.cutJid(messages[i]["from"])+" "+ts+"] </b>"+messages[i]["msg"]+"<br/>";panel.body.insertHtml("beforeEnd",btext);panel.getEl().scroll("bottom",1000,true);}},updateBuddys:function(buddys){for(var i=0;i<buddys.length;i++){if(buddys[i]["status"]=="subscribe"){var buddy=buddys[i];var addem=function(btn){if(btn=="yes"){var node=ExtJame.roster.getBuddy(buddy["jid"]);ExtJame.backend.Connection.sendSubscription(buddy["jid"],"subscribe");ExtJame.backend.Connection.sendSubscription(buddy["jid"],"subscribed");if(node){if(Ext.ComponentMgr.get(buddy["jid"])){ExtJame.roster.updateBuddy(node,buddy);}else
ExtJame.roster.addBuddys(null,XmlEl);}}else{ExtJame.backend.Connection.sendSubscription(buddy["jid"],"unsubscribe");ExtJame.backend.Connection.sendSubscription(buddy["jid"],"unsubscribed");}}
Ext.MessageBox.show({title:'Authorization Request',msg:'Accept Authorization Request from '+buddy["jid"]+" ?",buttons:Ext.MessageBox.YESNO,icon:Ext.MessageBox.QUESTION,fn:addem});}else{var buddy=ExtJame.roster.getBuddy(buddys[i]["jid"]);if(buddy){ExtJame.roster.updateBuddy(buddy,buddys[i]);if(Ext.ComponentMgr.get(buddys[i]["jid"])){var oldIconClass=Ext.ComponentMgr.get(buddys[i]["jid"]).iconCls;var tabSpan=Ext.fly(Ext.ComponentMgr.get(buddys[i]["jid"]).ownerCt.getTabEl(Ext.ComponentMgr.get(buddys[i]["jid"]))).child('span.x-tab-strip-text');tabSpan.removeClass(oldIconClass);Ext.ComponentMgr.get(buddys[i]["jid"]).iconCls=buddys[i]["status"];tabSpan.addClass(buddys[i]["status"]);}}else{}}}}}
//ExtJame.backend.connection
ExtJame.backend.Connection={getNotifications:function(){var container=null;if(!$('update-container')){container=document.createElement("DIV");container.id="update-container";document.body.appendChild(container);}
var update=function(el,ret){ExtJame.backend.Xml.parseNotifications(ret.responseXML.firstChild);}
var mgr=new Ext.Updater("update-container");mgr.startAutoRefresh(2,ExtJame.backend.url.getnotifications);mgr.on("update",update);},login:function(f,a){f.ownerCt.form.submit({reset:false,scope:this,success:function(r){ExtJame.backend.Connection.loadXmlFromUrl(ExtJame.backend.url.isconnected,ExtJame.factory.loginORclient);}});},sendSubscription:function(_buddy,_type){var url=ExtJame.backend.url.subscribe;var parseDom=function(XmlEl){}
ExtJame.backend.Connection.loadXmlFromUrl(url,parseDom,$H({name:_buddy,type:_type}));},isConnected:function(){ExtJame.backend.Connection.loadXmlFromUrl(ExtJame.backend.url.isconnected,ExtJame.factory.loginORclient);},logout:function(){var exit=function(btn){Ext.Msg.getDialog().close();if(btn=="yes"){var parseDom=function(e){if(e.getAttribute("type")=="success"){window.location.reload();}else{window.location.reload();}}
ExtJame.backend.Connection.loadXmlFromUrl(ExtJame.backend.url.logout,parseDom);}}
Ext.Msg.show({title:'Really Logout?',msg:'do you really want to quit?',buttons:Ext.Msg.YESNO,fn:exit,icon:Ext.MessageBox.QUESTION});},addBuddy:function(f,a){f.ownerCt.form.submit({reset:false,scope:this,success:ExtJame.roster.addBuddys});},addGroup:function(f,a){f.ownerCt.form.submit({reset:false,scope:this,success:ExtJame.roster.addGroups});},removeGroup:function(e,a){var deleteem=function(btn){if(btn=="yes"){var url=ExtJame.backend.url.deletegroup;var parseDom=function(XmlEl){if(XmlEl.nodeName=="response"&&XmlEl.getAttribute("type")=="success"){ExtJame.roster.removeGroup(e.node.text);}}
ExtJame.backend.Connection.loadXmlFromUrl(url,parseDom,$H({name:e.node.text}));}}
Ext.MessageBox.show({title:'Really Delete',msg:'do you really want to delete '+e.node.text,buttons:Ext.MessageBox.YESNOCANCEL,fn:deleteem,icon:Ext.MessageBox.QUESTION,group:e.node.text});},removeBuddy:function(e,a){var deleteem=function(btn){if(btn=="yes"){var url=ExtJame.backend.url.deletebuddy;var parseDom=function(XmlEl){if(XmlEl.nodeName=="response"&&XmlEl.getAttribute("type")=="success"){ExtJame.roster.removeBuddy(e.node.id);}}
ExtJame.backend.Connection.loadXmlFromUrl(url,parseDom,$H({name:e.node.id}));}}
Ext.MessageBox.show({title:'Really Delete',msg:'do you really want to delete '+e.node.text,buttons:Ext.MessageBox.YESNOCANCEL,fn:deleteem,icon:Ext.MessageBox.QUESTION});},renameBuddy:function(_te,_new,_old){var jid=_te.editNode.id;var url=ExtJame.backend.url.renamebuddy;var parseDom=function(XmlEl){}
ExtJame.backend.Connection.loadXmlFromUrl(url,parseDom,$H({name:jid,newname:_new}));},renameGroup:function(_te,_new,_old){var url=ExtJame.backend.url.renamegroup;var parseDom=function(XmlEl){}
ExtJame.backend.Connection.loadXmlFromUrl(url,parseDom,$H({name:_old,newname:_new}));},switchUserGroup:function(_jid,_new,_old){var url=ExtJame.backend.url.switchusergroup;var parseDom=function(XmlEl){}
ExtJame.backend.Connection.loadXmlFromUrl(url,parseDom,$H({newg:_new,oldg:_old,name:_jid}));},loadXmlFromUrl:function(_url,callback,args){if(!args)
args=new Hash();new Ajax.Request(_url,{method:"get",parameters:args.toQueryString(),onComplete:function(transport){if(transport.responseXML){callback(transport.responseXML.firstChild);}},onFailure:function(transport){Ext.Msg.show({title:'Error Occured',msg:'Backend URL unreachable!',buttons:Ext.MessageBox.OK,fn:callback,icon:Ext.MessageBox.ERROR});}});}}
ExtJame.backend.url={baseurl:"/jame/",isconnected:"/jame/adapter/isconnected",login:"/jame/adapter/login",getbuddys:"/jame/adapter/getbuddys",logout:"/jame/adapter/logout",sendmessage:"/jame/adapter/sendmessage",setpresence:"/jame/adapter/sendpresence",getnotifications:"/jame/adapter/notifications",addbuddy:"/jame/adapter/addbuddy",addgroup:"/jame/adapter/addgroup",deletebuddy:"/jame/adapter/deletebuddy",deletegroup:"/jame/adapter/deletegroup",renamebuddy:"/jame/adapter/renamebuddy",renamegroup:"/jame/adapter/renamegroup",switchusergroup:"/jame/adapter/switchusergroup",subscribe:"/jame/adapter/subscribe"}
//ExtJame.factory
ExtJame.factory={statusStore:new Ext.data.SimpleStore({fields:["value","text"],data:[["available","Online"],["away","Away"],["dnd","DND"],["chat","Chat"],["xa","XA"],["unavailable","Unavailable"]]}),sendMessage:function(e){},enterChat:function(e){},showAbout:function(e){if(!Ext.WindowMgr.get("AboutDialog"))
new ExtJame.ui.SimpleDialog(ExtJame.hud,ExtJame.ui.UiConfig.AboutLayout).init();else
Ext.WindowMgr.get("AboutDialog").show();},showOffline:function(e,state){var buddys=ExtJame.roster.getBuddys();buddys.each(function(b){if(state==false&&b.value.attributes.status=="unavailable"){b.value.ui.ctNode.parentNode.style.display='none';b.value.attributes.hide=true;}else{b.value.parentNode.ui.ctNode.parentNode.style.display='block';b.value.ui.ctNode.parentNode.style.display='block';b.value.attributes.hide=false;}});if(!Ext.WindowMgr.get("ClientDialog").getTopToolbar().items.items[0].menu.items.items[3].checked){var groups=ExtJame.roster.getGroups();groups.each(function(g){if(g.value.findChild("hide",false)==null)
g.value.ui.ctNode.parentNode.style.display='none';});}},showEmpty:function(e,state){var groups=ExtJame.roster.getGroups();groups.each(function(g){if(state==true){g.value.ui.ctNode.parentNode.style.display='block';}
else{if(g.value.findChild("hide",false)==null){g.value.ui.ctNode.parentNode.style.display='none';}}});},addBuddy:function(e){if(!Ext.WindowMgr.get("AddBuddyDialog")){new ExtJame.ui.SimpleDialog(ExtJame.hud,ExtJame.ui.UiConfig.AddBuddyLayout).init();Ext.WindowMgr.get("AddBuddyDialog").getComponent(0).findByType("combo")[0].store.loadData(ExtJame.roster.groupsArr());}else
Ext.WindowMgr.get("AddBuddyDialog").show();},addGroup:function(e){if(!Ext.WindowMgr.get("AddGroupDialog"))
new ExtJame.ui.SimpleDialog(ExtJame.hud,ExtJame.ui.UiConfig.AddGroupLayout).init();else
Ext.WindowMgr.get("AddGroupDialog").show();},showPreferences:function(e){},showVCard:function(e){},loginORclient:function(e){if(e!=null&&e.getAttribute("type")=="success"&&ExtJame.backend.Xml.getUserFromResponse(e)){ExtJame.connected=true;if(!Ext.WindowMgr.get("ClientDialog"))
new ExtJame.ui.ClientDialog(ExtJame.hud,ExtJame.ui.UiConfig.ClientLayout).init();else
Ext.WindowMgr.get("ClientDialog").show();ExtJame.connected=true;if(Ext.WindowMgr.get("LoginDialog"))
Ext.WindowMgr.get("LoginDialog").close();ExtJame.backend.Connection.getNotifications();}else{ExtJame.connected=false;if(!Ext.WindowMgr.get("LoginDialog"))
new ExtJame.ui.SimpleDialog(ExtJame.hud,ExtJame.ui.UiConfig.LoginLayout).init();else
Ext.WindowMgr.get("LoginDialog").show();}},cutJid:function(jid){return jid.substring(0,jid.indexOf("@"));}}
//ExtJame.ui.UiConfig
ExtJame.ui.UiConfig={LoginLayout:{title:"Login",id:'LoginDialog',width:320,height:230,collapsible:true,plain:true,layout:'fit',items:[{xtype:'form',labelAlign:'left',method:'POST',url:ExtJame.backend.url.login,bodyStyle:'background:transparent;padding:10px;',border:false,defaultType:'textfield',items:[{fieldLabel:'Username',name:'name',allowBlank:false,anchor:'90%',msgTarget:"side"},{inputType:'password',fieldLabel:'Password',name:'password',allowBlank:false,anchor:'90%',msgTarget:"side"},{fieldLabel:'Server',name:'server',allowBlank:false,anchor:'90%',msgTarget:"side"},{xtype:'numberfield',fieldLabel:'Port',name:'port',value:"5222",allowBlank:false,grow:true,msgTarget:"side"},{xtype:'checkbox',fieldLabel:'Register new User?',name:'newuser',checked:false}],buttons:[{text:"Login",handler:ExtJame.backend.Connection.login}]}]},ClientLayout:{id:'ClientDialog',width:188,height:400,collapsible:true,closable:false,plain:true,border:false,iconCls:"available",layout:'border',tbar:new Ext.Toolbar({items:[{xtype:'tbbutton',icon:'images/jame/information.png',handler:ExtJame.factory.showAbout,tooltip:'About',cls:'x-btn-icon',},{xtype:'tbseparator'},{text:'Profile',tooltip:'my personal settings',menu:{id:'ToolMenu',items:[{text:'Preferences',icon:'images/jame/cog_edit.png',disabled:true,handler:ExtJame.factory.showPreferences},{text:'Profile',icon:'images/jame/vcard_edit.png',disabled:true,handler:ExtJame.factory.showVCard}]}},{xtype:'tbseparator'},{text:'Roster',tooltip:'manage my buddys',menu:{id:"BuddysMenu",items:[{text:'Send Message',icon:'images/jame/message-pending.png',disabled:true,handler:ExtJame.factory.sendMessage},{text:'Enter a Chat',disabled:true,icon:'images/jame/comments.png',handler:ExtJame.factory.enterChat},{text:'Show Offline Buddys',checked:true,checkHandler:ExtJame.factory.showOffline},{text:'Show Empty Groups',checked:true,checkHandler:ExtJame.factory.showEmpty},{text:'Add Buddy',icon:'images/jame/user_add.png',handler:ExtJame.factory.addBuddy},{text:'Add Group',icon:'images/jame/group_add.png',handler:ExtJame.factory.addGroup},{text:'Logout',icon:'images/jame/cancel.png',handler:ExtJame.backend.Connection.logout}]}}]}),items:[{region:'center',minHeight:150,id:'buddy-panel',border:false,layout:'fit'},{region:'south',id:'status-container',height:30,bodyStyle:'background:transparent;padding-top:5px;',layout:'fit',border:false}]},AddGroupLayout:{id:'AddGroupDialog',title:"Add Group",width:250,height:100,collapsible:true,plain:true,layout:'fit',items:[{xtype:'form',method:'POST',url:ExtJame.backend.url.addgroup,bodyStyle:'background:transparent;padding:10px;',border:false,items:[{xtype:'textfield',fieldLabel:'Name',name:'name',allowBlank:false,msgTarget:'side',anchor:"90%",}],buttons:[{text:"Add Group",handler:ExtJame.backend.Connection.addGroup}]}]},AboutLayout:{id:'AboutDialog',title:"About",width:300,height:180,collapsible:true,bodyStyle:'background:transparent;padding:10px;',layout:'fit',items:[{xtype:'panel',html:'<center><h2>ext-jame</h2><p>a javascript jabber messenger</p><p>&copy; 2008 by Robert Schoenthal</p><p>caziel@digitalkaoz.net</p><p>licence: GPL</p></center>',bodyStyle:'background:transparent;',bodyBorder:false,border:false,}],buttons:[{text:"Close",handler:function(){Ext.WindowMgr.get("AboutDialog").close();}}]},AddBuddyLayout:{title:"Add Buddy",id:"AddBuddyDialog",width:350,height:150,collapsible:true,layout:'fit',plain:true,items:[{xtype:'form',method:'POST',url:ExtJame.backend.url.addbuddy,bodyStyle:'background:transparent;padding:10px;',border:false,items:[{xtype:'textfield',fieldLabel:'JID',name:'name',allowBlank:false,msgTarget:'side',anchor:'90%'},{xtype:'combo',fieldLabel:"Group",store:new Ext.data.SimpleStore({fields:["value","text"]}),name:'group',displayField:'value',valueField:'value',typeAhead:false,allowBlank:false,mode:'local',msgTarget:'side',anchor:'90%'}],buttons:[{text:"Add Buddy",handler:ExtJame.backend.Connection.addBuddy}]}]}}
//ExtJame.ui.ClientDialog
ExtJame.ui.ClientDialog=function(_opener,_config){var extDialog=null;var config=_config;var id="ClientDialog";var opener=_opener;var status;var createDialog=function(){extDialog=new Ext.Window(config);extDialog.setTitle(ExtJame.myJid);extDialog.show(opener);status=new Ext.form.FormPanel({hideLabels:true,method:'POST',url:ExtJame.backend.url.setpresence,bodyStyle:'background:transparent;',bodyBorder:false,border:false,layout:'fit',items:[{xtype:'combo',store:ExtJame.factory.statusStore,displayField:'text',valueField:'value',typeAhead:true,name:'message',mode:'local',triggerAction:'all',id:'status-box',emptyText:'your Status...',selectOnFocus:true}]});extDialog.getComponent(1).add(status);status.findById("status-box").on("select",changeState,status);status.findById("status-box").on("specialkey",changeState,status);ExtJame.roster=new ExtJame.ui.RosterTree(extDialog.getComponent('buddy-panel'));ExtJame.roster.init();extDialog.doLayout();}
var changeState=function(_box,_newval,_oldval){Ext.WindowMgr.get("ClientDialog").setIconClass(_box.value);try{if(_newval.ENTER){_box.ownerCt.form.submit({params:{mode:_box.value},reset:false,scope:this});}else if(_newval.data){_box.ownerCt.form.submit({params:{mode:_box.value},reset:false,scope:this});}}catch(e){}}
return{init:function(){if(!extDialog){createDialog();}}}}
//ExtJame.ui.ChatDialog
ExtJame.ui.ChatDialog=function(_opener,_config,_jid){var extDialog=null;var config=_config;var opener=_opener;var dd=null;var jid=_jid;var createDialog=function(){extDialog=new Ext.Window({title:"ChatDialog",width:530,height:400,closable:true,collapsible:true,layout:'fit',items:[{xtype:'tabpanel',border:false,animScroll:true,autoScroll:true,enableTabScroll:true,layoutOnTabChange:true}]});extDialog.getComponent(0).on("tabchange",tabChange,extDialog.getComponent(0));extDialog.setTitle(jid);extDialog.on("destroy",removeChats);addPanel(extDialog.getComponent(0),jid);extDialog.show(opener);tabpanel=extDialog.getComponent(0);dd=new Ext.dd.DropTarget(tabpanel.getId(),{ddGroup:"buddys",parent:extDialog.getId(),notifyDrop:pushPanel});extDialog.doLayout();}
var closeTab=function(e){Ext.ComponentMgr.unregister(e);if(extDialog.getComponent(0).items.getCount()==0){extDialog.close();}}
var removeChats=function(){extDialog.getComponent(0).items.each(function(item,index,length){Ext.ComponentMgr.unregister(item);return true;})}
var tabChange=function(e){extDialog.setTitle(e.getActiveTab().title);}
var pullResponse=function(){var d=new Date();var ts=d.getHours()+":"+d.getMinutes();var myText="<b style='color:blue;'>["+ExtJame.myJid+" "+ts+"]</b> "+this.ownerCt.form.items.items[0].getValue()+"<br/>";this.ownerCt.ownerCt.getComponent(0).body.insertHtml("beforeEnd",myText);this.ownerCt.form.items.items[0].reset();p=this.ownerCt.ownerCt.getComponent(0);p.getEl().scroll("bottom",p.getY()-p.dom.scrollTop,true)}
var submit=function(el,event,d){try{if(event.ENTER){el.ownerCt.form.submit({reset:false,scope:this,success:pullResponse});}else if(el.text){el.ownerCt.form.submit({reset:false,scope:this,success:pullResponse});}}catch(e){}}
var pushPanel=function(dd,e,data){var jid=data.node.attributes.jid;tabpanel=Ext.WindowMgr.get(dd.cachedTarget.parent).getComponent(0);addPanel(tabpanel,jid);}
var createPanel=function(jid){return new Ext.Panel({id:jid,title:ExtJame.factory.cutJid(jid),parent:extDialog.getId(),closable:true,border:false,layout:'border',iconCls:'',items:[{region:'center',border:0,height:150,xtype:'panel',autoScroll:true,border:false,layout:'fit',bodyStyle:'padding:10px;'},{region:'south',minHeight:150,split:true,xtype:'form',border:false,hideLabels:true,bodyStyle:'background:transparent;',height:150,method:'POST',url:ExtJame.backend.url.sendmessage,items:[{xtype:'htmleditor',fieldLabel:'',name:'body',allowBlank:false,anchor:'0-50',border:false},{xtype:'hidden',fieldLabel:'',name:'to',value:jid,allowBlank:false}],buttons:[{text:"Send",handler:submit}]}]});}
var addPanel=function(tabpanel,jid){if(!Ext.ComponentMgr.get(jid)){var chatPanel=createPanel(jid);chatPanel.setIconClass(ExtJame.roster.getBuddy(jid).attributes.status);tabpanel.add(chatPanel);Ext.ComponentMgr.register(chatPanel);tabpanel.activate(chatPanel.id);extDialog.doLayout();chatPanel.on("destroy",closeTab,chatPanel);tabpanel.doLayout();}else{var pDlg=Ext.ComponentMgr.get(jid).parent;Ext.WindowMgr.get(pDlg).show();Ext.WindowMgr.get(pDlg).getComponent(0).activate(jid);}}
return{init:function(){if(!extDialog)
createDialog();else
extDialog.show();}}}
//ExtJame.ui.RosterTree
ExtJame.ui.RosterTree=function(_parent){var extTree=null;var parent=_parent;var rosterGroups=new Hash();var rosterBuddys=new Hash();var createTree=function(url){extTree=new Ext.tree.TreePanel({enableDD:true,animate:true,rootVisible:false,lines:false,ddGroup:"buddys",border:false,});extTree.setRootNode(new Ext.tree.TreeNode({text:"buddys",allowDrag:false,expanded:true}));var p=new Ext.data.HttpProxy({url:url});p.load(null,{read:function(response){if(response&&response.responseXML){var doc=response.responseXML;addGroupToTree(null,doc.documentElement);addBuddyToTree(null,doc.documentElement);}}},function(){parent.add(extTree)},extTree);return extTree;}
var renameBuddy=function(_node,e){var treeEditor=new Ext.tree.TreeEditor(extTree,{allowBlank:false,blankText:'A name is required',selectOnFocus:true});treeEditor.on("complete",ExtJame.backend.Connection.renameBuddy,this);treeEditor.triggerEdit(_node.node);}
var renameGroup=function(_node,e){var treeEditor=new Ext.tree.TreeEditor(extTree,{allowBlank:false,blankText:'A name is required',selectOnFocus:true});treeEditor.on("complete",ExtJame.backend.Connection.renameGroup,this);treeEditor.triggerEdit(_node.node);}
var subscribedBuddy=function(_node,e){ExtJame.backend.Connection.sendSubscription(_node.node.attributes.jid,"subscribed");}
var subscribeBuddy=function(_node,e){ExtJame.backend.Connection.sendSubscription(_node.node.attributes.jid,"subscribe");}
var buddyContext=function(_node,e){var items=Array();items.push({text:'message',handler:initChat,node:_node,focus:this,icon:'images/jame/message-pending.png'});items.push({text:'edit',handler:renameBuddy,node:_node,icon:"images/jame/user_edit.png"});items.push({text:'delete',handler:ExtJame.backend.Connection.removeBuddy,node:_node,icon:"images/jame/user_delete.png"});if(_node.attributes.subscription=="none"||_node.attributes.subscription=="to"||_node.attributes.subscription=="from")
items.push({text:'subscribe',handler:subscribedBuddy,node:_node,icon:"images/jame/group_go.png"});var menu=new Ext.menu.Menu({id:'menuContext',items:items});menu.show(_node.ui.getAnchor());}
var groupContext=function(_node,e){var menu=new Ext.menu.Menu({id:'menuContext',items:[{text:'edit',handler:renameGroup,node:_node,icon:"images/jame/group_edit.png"},{text:'delete',handler:ExtJame.backend.Connection.removeGroup,node:_node,icon:"images/jame/group_delete.png"}]});menu.show(_node.ui.getAnchor());}
var initChat=function(e){if(this.node){var jid=this.node.id;var anchor=this.node.ui.anchor;}else{var jid=e.id;var anchor=e.ui.anchor;}
if(!anchor)
anchor=ExtJame.hud;if(Ext.ComponentMgr.get(jid)){Ext.WindowMgr.get(Ext.ComponentMgr.get(jid).parent).show();Ext.WindowMgr.get(Ext.ComponentMgr.get(jid).parent).getComponent(0).activate(jid);}else{new ExtJame.ui.ChatDialog(anchor,ExtJame.ui.UiConfig.ChatLayout,jid).init();}}
var addGroupToTree=function(f,a){var e=null;if(a&&a.response)
e=a.response.responseXML.firstChild;else
e=a;if(e.getAttribute("type")=="success"){if(f){var _group=new Ext.tree.TreeNode({text:f.findField("name").getValue(),iconCls:"display:none;",expanded:true,expandable:true,allowDrag:false,"gname":f.findField("name").getValue(),qtip:"Group:"+f.findField("name").getValue()});_group.on("contextmenu",groupContext,this);rosterGroups.set(f.findField("name").getValue(),_group);extTree.root.appendChild(_group);}else{var groups=ExtJame.backend.Xml.getGroupsFromResponse(e.getElementsByTagName("methodResponse")[0]);for(var i=0;i<groups.length;i++){var _group=new Ext.tree.TreeNode({text:groups[i],iconCls:"display:none;",expanded:true,expandable:true,allowDrag:false,"gname":groups[i],qtip:"Group:"+groups[i]});_group.on("contextmenu",groupContext,this);rosterGroups.set(groups[i],_group);extTree.root.appendChild(_group);}}}}
var switchUserGroup=function(_tree,_buddy,_old,_new,_pos){ExtJame.backend.Connection.switchUserGroup(_buddy.id,_new.text,_old.text);}
var removeGroupFromTree=function(_name){extTree.root.removeChild(rosterGroups.get(_name));rosterGroups.remove(_name);}
var removeBuddyFromTree=function(_jid){rosterBuddys.get(_jid).parentNode.removeChild(rosterBuddys.get(_jid));rosterBuddys.remove(_key);}
var addBuddyToTree=function(f,a){var e=null;if(a&&a.response)
e=a.response.responseXML.firstChild;else
e=a;if(e.getAttribute("type")=="success"||e.getAttribute("type")=="push"){if(f){var _buddy=new Ext.tree.TreeNode({id:f.findField("name").getValue(),status:"subscription pending",status_text:"offline",jid:f.findField("name").getValue(),subscription:"subscribe",hide:false,text:f.findField("name").getValue(),icon:"images/jame/icon_invisible.png",allowDrag:true,allowDrop:false,qtip:"JID : "+f.findField("name").getValue(),});_buddy.on("contextmenu",buddyContext,this);_buddy.on("dblclick",initChat,this);if(rosterGroups[f.findField("group").getValue()]){$H(rosterGroups).each(function(g){if(buddy["group"]==g.key){extTree.root.findChild("gname",g.key).appendChild(_buddy);appended=true;}});}
if(!appended)
extTree.root.appendChild(_buddy);_buddy.on("move",switchUserGroup,this);rosterBuddys.set(f.findField("name").getValue(),_buddy);}else{var buddys=ExtJame.backend.Xml.getBuddysFromResponse(e.getElementsByTagName("methodResponse")[0]);for(var i=0;i<buddys.length;i++){var buddy=buddys[i];var appended=false;if(buddy["name"])
var label=buddy["name"];else{var label=buddy["jid"];}
var _buddy=new Ext.tree.TreeNode({id:buddy["jid"],status:buddy["status"],status_text:buddy["status_text"],jid:buddy["jid"],subscription:buddy["subscription"],hide:false,text:label,icon:ExtJame.backend.url.baseurl+"images/jame/icon_"+buddy["status"]+".png",allowDrag:true,allowDrop:false,qtip:"JID : "+buddy["jid"]+"<br/>Status : "+buddy["status"]+"<br/>Text : "+buddy["status_text"]+"<br/>Subscription : "+buddy["subscription"]});_buddy.on("contextmenu",buddyContext,this);_buddy.on("dblclick",initChat,this);if(buddy["group"]){$H(rosterGroups).each(function(g){if(buddy["group"]==g.key){extTree.root.findChild("gname",g.key).appendChild(_buddy);appended=true;}});}
if(!appended)
extTree.root.appendChild(_buddy);_buddy.on("move",switchUserGroup,this);rosterBuddys.set(buddy["jid"],_buddy);}}}}
return{init:function(){if(!extTree)
extTree=createTree(ExtJame.backend.url.getbuddys);},getGroup:function(_name){return rosterGroups.get(_name);},getBuddy:function(_name){return rosterBuddys.get(_name);},getGroups:function(){return rosterGroups;},getBuddys:function(){return rosterBuddys;},addGroups:function(f,a){addGroupToTree(f,a);if(Ext.WindowMgr.get("AddGroupDialog"))
Ext.WindowMgr.get("AddGroupDialog").close();},addBuddys:function(f,a){addBuddyToTree(f,a);if(Ext.WindowMgr.get("AddBuddyDialog"))
Ext.WindowMgr.get("AddBuddyDialog").close();},removeGroup:function(_group){removeGroupFromTree(_group);},removeBuddy:function(_jid){removeBuddyFromTree(_jid);},groupsArr:function(){var groupsArr=Array();rosterGroups.each(function(group){var g=Array();g.push(group.key);g.push(group.key);groupsArr.push(g);});return groupsArr;},updateBuddy:function(buddy,_attrs){buddy.getUI().iconNode.src=ExtJame.backend.url.baseurl+"images/jame/icon_"+_attrs["status"]+".png",buddy.attributes.status=_attrs['status'];buddy.attributes.subscription=_attrs['subscription'];var qtip="JID : "+_attrs["jid"]+"<br/>Status : "+_attrs["status"]+"<br/>Text : "+_attrs["status_text"]+"<br/>Subscription : "+_attrs["subscription"];if(buddy.getUI().textNode.setAttributeNS){buddy.getUI().textNode.setAttributeNS("ext","qtip",qtip);}else{buddy.getUI().textNode.setAttribute("ext:qtip",qtip);}}}}
//ExtJame.ui.SimpleDialog
ExtJame.ui.SimpleDialog=function(_opener,_config){var extDialog=null;var config=_config;var opener=_opener;var createDialog=function(){extDialog=new Ext.Window(config);extDialog.show(opener);extDialog.doLayout();}
return{init:function(){if(!extDialog){createDialog();}}}}
















