/**
*	Licence	:	GPL
*	Author	:	Robert Schoenthal
*	Date	:	16.08.2007
*/

/**
 * @class ExtJame.ui.SimpleDialog
 * @description provides a simple form with default functions
 */
ExtJame.ui.SimpleDialog = function( _opener, _config){

	var extDialog = null;
	var config = _config;
	var opener = _opener;

	/**
	 * @method createDialog
	 * @private
	 * @description creates the dialog and appends it to the parent element
	 */
	var createDialog = function(){
		extDialog = new Ext.Window(config);
		extDialog.show(opener);
		extDialog.doLayout();
	}
	
	return {
		/**
		 * 
		 */
		init : function(){
			if(!extDialog){
				createDialog();
			}
		}
	}
}