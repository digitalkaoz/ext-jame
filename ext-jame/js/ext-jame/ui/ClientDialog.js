/**
*	Licence	:	GPL
*	Author	:	Robert Schoenthal
*	Date	:	16.08.2007
*/

/**
 * @class ExtJame.ui.ClientDialog
 * @description provides a dialog to store the ClientMenu RosterTree and StatusForm
 */
ExtJame.ui.ClientDialog = function(_opener, _config){

	var extDialog = null;
	var config = _config;
	var id = "ClientDialog";
	var opener = _opener;
	var status;

	/**
	 * @method createDialog
	 * @private
	 * @description creates the dialog and appends it to the opener
	 */
	var createDialog = function(){
		extDialog = new Ext.Window(config);
		extDialog.setTitle(ExtJame.myJid);
		extDialog.show(opener);
		extDialog.getComponent('status-container').findById("status-box").on("select",changeState,status);
		extDialog.getComponent('status-container').findById("status-box").on("specialkey",changeState,status);
		ExtJame.roster = new ExtJame.ui.RosterTree(extDialog.getComponent('buddy-panel'));
		ExtJame.roster.init();
		extDialog.doLayout();
	}
	
	/**
	 * 
	 */
	var changeState = function(_box,_newval,_oldval){
		Ext.WindowMgr.get("ClientDialog").setIconClass(_box.value);
		try{
			if(_newval.ENTER){
				_box.ownerCt.form.submit({
					params:{mode:_box.value},
					reset:false,
					scope: this
				});
			}else if(_newval.data){
				_box.ownerCt.form.submit({
					params:{mode:_box.value},
					reset:false,
					scope: this
				});
			}
		}catch(e){
			//TODO
		}
	}

	return {
		/**
		 * @method init
		 * @public
		 * @description initializes the dialog
		 */
		init : function(){
			if(!extDialog){
				createDialog();
			}
		}	
	}
}