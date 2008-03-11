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
	myJid:"",
	hud:Ext.getBody(),

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
			else
				Ext.WindowMgr.each(function(win){win.show();})
		}
	}
}

/**
 * binds the application to the hud element (id)
 */
Ext.onReady(function(){
    ExtJame.hud = Ext.get('jame-hud');
    if(ExtJame.hud)
    	ExtJame.hud.on('click', ExtJame.init);
});

/**
 * provides scrollTo for panels
 */
/*Ext.override(Ext.Element, {
    scrollTo : function(side, value, animate){
    	var side = side.toLowerCase();
        var prop;
    	switch (side) {
    		case "left":
    			prop = "scrollLeft";
    			break;
    		case "right":
    			prop = "scrollLeft";
    			value = this.dom.scrollWidth - (value + this.dom.clientWidth);
    			break;
    		case "top":
    			prop = "scrollTop";
    			break;
    		case "bottom":
    			prop = "scrollTop";
    			value = this.dom.scrollHeight - (value + this.dom.clientHeight);
    			break;
    	}
    	if (value < 0) value = 0;
        if(!animate || !A){
            this.dom[prop] = value;
        }else{
            var to = prop == "scrollLeft" ? [value, this.dom.scrollTop] : [this.dom.scrollLeft, value];
            this.anim({scroll: {"to": to}}, this.preanim(arguments, 2), 'scroll');
        }
        return this;
    }
});*/