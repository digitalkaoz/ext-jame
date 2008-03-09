/**
*	Licence	:	GPL
*	Author	:	Robert Schönthal
*	Date	:	16.08.2007
*/

/**
 * @class ExtJame
 * @description handles the Session Object, and stores the ui, backend, helpers librarys
 */
var ExtJame = {
	ui : {},				// widgets, forms, uiconfigs
	backend : {},	// the backend Adapter with urls, functions and xml parsers
	factory : {},		// factory for generating dialogs
	chats : new Hash(),
	connected : false,
	roster: null,
	//id:null,
	myJid:"digitalkaoz",

	/**
	 * @method initSession
	 * @public
	 * @description initializes the Session Object if not present
	 */
	init : function(){
		if(!ExtJame.connected)
			ExtJame.backend.Connection.isConnected();
		else{
			if(Ext.WindowMgr.getActive())
				Ext.WindowMgr.hideAll();
			else
				Ext.WindowMgr.each(function(win){win.show();})
		}
	}
}

window.close = function(){
	alert("test");
}
