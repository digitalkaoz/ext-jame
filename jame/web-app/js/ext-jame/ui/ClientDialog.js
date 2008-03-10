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
		status = new Ext.form.FormPanel({
			hideLabels:true,
			method:'POST',
			url:ExtJame.backend.url.setpresence,
			bodyStyle:'background:transparent;',
			bodyBorder:false,
			border:false,
			layout:'fit',
			items:[{
				xtype:'combo',
				store:ExtJame.factory.statusStore, 
				displayField:'text',
				valueField:'value',
				typeAhead: true,
				name:'mode',
				mode: 'local',
				triggerAction: 'all',
				id:'status-box',
				emptyText:'your Status...',
				selectOnFocus:true
			}]
		});
		extDialog.getComponent(1).add(status);
		status.findById("status-box").on("select",changeState,status);
		status.findById("status-box").on("specialkey",changeState,status);
		ExtJame.roster = new ExtJame.ui.RosterTree(extDialog.getComponent('buddy-panel'));
		ExtJame.roster.init();
		extDialog.doLayout();
	}
	
	/**
	 * 
	 */
	var changeState = function(_box,_newval,_oldval){
		if(_newval.ENTER){
			_box.ownerCt.form.submit({
				baseParams:{message:_box.findById("status-box").lastSelectionText},
				reset:false,
				scope: this
			});
		}else if(_newval.data){
			_box.ownerCt.form.submit({
				baseParams:{message:_box.lastSelectionText},
				reset:false,
				scope: this
			});
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