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
	connected : false,
	roster: null,
	myJid:"",
	hud:Ext.getBody(),
	mgr:null,
	timer: null,

	/**
	 * @method initSession
	 * @public
	 * @description initializes the Session Object if not present
	 */
	init : function(){
		//turn on quicktips
		Ext.QuickTips.init();
    	
		if(!ExtJame.connected)
			ExtJame.backend.Connection.isConnected();
		else{
			if(Ext.WindowMgr.getActive())
				Ext.WindowMgr.hideAll();
			else{
				Ext.WindowMgr.each(function(win){
					if(!win.initialConfig.modal)
						win.show();
				})
			}
		}
	}
}

/**
 * binds the application to the hud element (id)
 */
Ext.onReady(function(){
	$("jame-container").innerHTML= '<input type="button" id="jame-hud" value="start Client" />';
    ExtJame.hud = Ext.get('jame-hud');
    if(ExtJame.hud)
    	ExtJame.hud.on('click', ExtJame.init);
});


Ext.override(Ext.form.HtmlEditor, {
    pushValue : function(){
        if(this.initialized){
            var v = this.el.dom.value;
            if(this.fireEvent('beforepush', this, v) !== false){
                (this.doc.body || this.doc.documentElement).innerHTML = v;
                this.fireEvent('push', this, v);
            }
        }
    }
});