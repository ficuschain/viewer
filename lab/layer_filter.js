Ext.Loader.setConfig({
	enabled: true,
	// Don't set to true, it's easier to use the debugger option to disable caching
	disableCaching: false,
	paths: {
		'PGP': '../app/'
	}
});


Ext.require([
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.util.*',
    'Ext.state.*',
    'Ext.form.*',
	'PGP.common.Utilities'
]);




var layers = [ {name:'layer1'}, {name: 'layer2'} ]

Ext.define('PGP.view.LayerFilter', {
	alias: 'widget.pgp_layerfilter',
	extend: 'Ext.Window',	
	title: 'Hello',
	height: 300,
	width: 500,
	layout: 'fit',
	modal: true,
	layerName: 'layerName',
	initComponent: function() {
		

		
		var layer_config = PGP.common.Utilities.getLayerConfig(this.layerName);

		var attributeStore = Ext.create('Ext.data.Store', {
			fields: ['attribute', 'alias'],
			data : layer_config.config
		});
	
	
	
		var Filter = function(alias, attribute, operator, value, andOr){
			return {alias: alias, attribute: attribute, operator: operator, value: value, displayValue:value, andOr: andOr}
		}
		
		var me = this;
		
		
		
		
		var filterStore = Ext.create('Ext.data.Store', {
			fields:['alias','attribute', 'operator', 'value', 'andOr']
		});
			
		
		
		
		var cellEditingPlugin = Ext.create('Ext.grid.plugin.CellEditing', {
										clicksToEdit: 1
									});
		
		function setAndOrBehaviour(){
			var andOr = Ext.getCmp('cmbAndOr');
			if(filterStore.getCount() < 1){
				andOr.setDisabled(true);
				andOr.setValue(null);
			} else {
				andOr.setDisabled(false);
				andOr.setValue('AND');

			}
			// make sure AND/OR is set to null on first items
			var firstItem = filterStore.getAt(0);
			if(firstItem){
				firstItem.set('andOr',null);
				filterStore.commitChanges();
			}
			

			
		}
		
		
		Ext.apply(me, {
			
			items: {
					 xtype: 'panel',
					 layout: {
						type: 'vbox',
						align : 'stretch'
					},
					 width: 500,
					 margin: '10 10 10 10',
						 items: [ 
								{ 	xtype: 'panel',
									layout: {
										type: 'hbox',
										align: 'stretch'
									},
									defaults: {	
										margin: '5 5 5 5'
									},
									items: [
									{
										xtype: 'combo',
										id: 'cmbAndOr',
										editable: false,
										width: 50,
										store: ['AND', 'OR'],
										fieldLabel: 'And/Or',
										labelAlign: 'top',
										disabled: true
									},
									{
										xtype: 'combo',
										id: 'cmbAttribute',
										editable: false,
										width: 120,
										store: attributeStore,
										displayField: 'alias',
										valueField: 'attribute',
										fieldLabel: 'Attribute',
										labelAlign: 'top',
										flex: 2
									},
									{
										xtype: 'combo',
										id: 'cmbOperator',
										editable: false,
										width: 80,
										store: ['=', 'LIKE'],
										flex: 1,
										fieldLabel: 'Operator',
										labelAlign: 'top',
									},
									{
										xtype: 'textfield',
										id: 'txtValue',
										width: 80,
										flex: 1,
										fieldLabel: 'Value',
										labelAlign: 'top',
									},
									{
										xtype: 'button',
										text: 'Add',
										handler: function(){
											
										
											var value = txtValue.getValue();
											var newFilter = Filter(
												cmbAlias.getDisplayValue(),
												cmbAttribute.getValue(),
												cmbOperator.getValue(),
												value,
												cmbAndOr.getValue()
											);
										
											filterStore.loadData([newFilter], true);
											setAndOrBehaviour();
										}
									}],
									
								},
								{
									xtype: 'grid',
									id:'filterGrid',
									border: false,
									columns: [
										{ text: 'And/Or', dataIndex: 'andOr', width: 50 },
										{ text: 'Attribute',  dataIndex: 'alias' },
										{ text: 'Operator', dataIndex: 'operator', flex: 1 },
										{ text: 'Value', dataIndex: 'value', flex: 1, editor: {} },
										{
											xtype: 'actioncolumn',
											width:30,
											sortable: false,
											items: [{
												icon: 'http://pgp.namria.gov.ph/resources/img/pan.png',
												tooltip: 'Delete',
												handler: function(grid, rowIndex, colIndex) {

													filterStore.removeAt(rowIndex); 
													setAndOrBehaviour();	

												}
											}]
										}
									],
									flex: 2,
									store: filterStore,
									plugins: [ cellEditingPlugin ],
									listeners:{
										edit: function(){
											filterStore.commitChanges();
										}
									}
								},
								{ 	xtype: 'panel',
									layout: {
										type: 'hbox',
										align: 'stretch',
										pack: 'center'
									},
									defaults: {	
										margin: '5 5 5 5'
									},
									items: [
										{
											xtype: 'button',
											text: 'Ok',
											align: 'bottom',
											handler: function(){
												me.close();
											}
										},
										{
											xtype: 'button',
											text: 'Reset',
											align: 'bottom',
											handler: function(){
												cmbAlias.setValue(null);
												cmbAttribute.setValue(null);
												cmbOperator.setValue(null);
												txtValue.setValue(null);
												cmbAndOr.setValue(null);
												filterStore.removeAll();
												setAndOrBehaviour();
											}
										}
									]
								}
								
							]
			}

	
		});
		this.callParent(arguments);
		
		
		var cmbAlias = Ext.getCmp('cmbAttribute');
		var cmbAttribute = Ext.getCmp('cmbAttribute');
		var cmbOperator = Ext.getCmp('cmbOperator');
		var txtValue = Ext.getCmp('txtValue');
		var cmbAndOr = Ext.getCmp('cmbAndOr');
		
		this.getCQL = function(){
			var retVal = "";
			filterStore.each(function(row,index){
				
				var value = row.get('value');
				var operator = row.get('operator');
				
				if (operator === "LIKE") {
					value = "'%" + value + "%'";
				} else {
					value = "'" + value + "'";
				}
				retVal += (row.get('andOr')?' ' + row.get('andOr') + ' ':'') +
						  row.get('attribute') +
						  operator +
						  value;
			});
			return retVal;
		};
	}
});





Ext.onReady(function(){

	var win = Ext.create('PGP.view.LayerFilter', { 
		title: 'test', 
		layerName: 'mgd_geodeticcontrol',
		listeners: {
			close: function(){
				console.log(win.getCQL());
			}
		}
	});
	
	win.show();
	

});


