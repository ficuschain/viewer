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
	'PGP.common.Utilities',
	'PGP.view.Header'
]);



Ext.define('PGP.view.MyComponent', {
	alias: 'widget.pgp_mycomponent',
	extend: 'Ext.Container',	
	showLayerList: false,
	getLayerMetadata: function(layer_name, style){
		return PGP.common.Utilities.queryTableAsJson("select * from configuration.layer_metadata where layer_name = '" + layer_name + "' and style = '" + style + "'");
	},
	initComponent: function() {
	
		var me = this;
		
		var layerListStore = Ext.create('Ext.data.Store', {
			fields:['id','layer_name','title'],
			proxy: {
				type: 'ajax',
				url: 'http://geoportal.gov.ph/webapi/editor/layerconfig/',
				reader: {
					type: 'json'
				}
			}
		});
		layerListStore.load();
		
		Ext.define('Ext.ux.CustomTrigger', {
			extend: 'Ext.form.field.Trigger',
			alias: 'widget.customtrigger',
			initComponent: function () {
				var me = this;
				// native ExtJS class & icon
				me.triggerCls = 'x-form-clear-trigger';
				me.callParent(arguments);
			},
			// override onTriggerClick
			onTriggerClick: function() {
				this.setRawValue('');
				layerListStore.clearFilter();
			}
		});
		var search = {
			xtype: 'customtrigger',
			emptyText: 'Filter layers',
			padding: 10,
			listeners: {
				change: function(me, newValue, oldValue){
					layerListStore.clearFilter();
					layerListStore.filter([
						{
							filterFn: function(item) { 
								return (item.data["title"] + ' ' + item.data["layer_name"]).toLowerCase().indexOf(newValue.toLowerCase()) > -1;
								//return item.get("age") > 10; 
							}
						}
					]);
				}
			}
		};

		
		/*
		var layerStore = Ext.create('Ext.data.Store', {
			fields:['layer_name', 'style','title','tiled','listed'],
			proxy: {
				type: 'ajax',
				//url: 'http://geoportal.gov.ph/webapi/api/editor/',
				api: {
					read: '/webapi/editor/layerconfig/',
					update:'/webapi/editor//updatelayer?layer_name=a&style=b'
				},
				reader: {
					type: 'json'
				}
			}
		});
		*/
		
		Ext.define('LayerConfig', {
			extend: 'Ext.data.Model',
			fields:[
				'layer_name', 
				'style',
				'title',
				'description',
				'date_updated',
				'tags',
				'config',
				'agency',
				'sector',
				'tiled',
				'listed'
			],
			
																			
			proxy: {
				type: 'rest',
				url : '/webapi/editor/layerconfig/',
				/*
				reader:
				{
					type: 'json',
					root: 'data',
					successProperty: 'success'
				},
				writer:
				{
					type: 'json',
					writeAllFields: true
				},
				*/
				afterRequest: function (request, success) 
				{
					console.log(request,success);
					return;
					if (request.action == 'read') {
						this.readCallback(request);
					}
					
					else if (request.action == 'create') {
						this.createCallback(request);
					}
					
					else if (request.action == 'update') {
						this.updateCallback(request);
					}
					
					else if (request.action == 'destroy') {
						this.deleteCallback(request);
					}
				}
			}
		});
		

		
		var grid = Ext.create('Ext.grid.Panel',{
			title: 'Layers',
			region: 'west',
			flex: 0.75/3,
			split: true,
			collapsible: true,
			store: layerListStore,
			columns: [
				{ text: 'Title',  dataIndex: 'title', flex: 1}
			],
			hideHeaders: true,
			border: false,
			dockedItems: [
				search
			],
			listeners: {
				select: function(control, item){
					var id = item.data["id"];
					Ext.ModelManager.getModel('LayerConfig').load(id, {
						success: function(layer) {
							//console.log(user.getId()); //outputs 123
							var pnlGeneral = Ext.getCmp('pnlGeneral');
							pnlGeneral.loadRecord(layer);
						}
					});
					/*
					layerStore.load({
						callback: function(records, operation, success) {
						        // the operation object
						        // contains all of the details of the load operation
								var pnlGeneral = Ext.getCmp('pnlGeneral');
								pnlGeneral.loadRecord(records[0]);
						},
					    params: {
					        layer_name: item.data.layer_name,
							style: item.data.style
					    }
					});
					*/
				}
			}
		});
		
		grid.setVisible(this.showLayerList);
		
		var formPanel = Ext.create('Ext.form.Panel', {
			id:'pnlGeneral',
			frame: true,
			title: 'General',
			width: 340,
			bodyPadding: 5,

			fieldDefaults: {
				labelAlign: 'left',
				labelWidth: 90,
				anchor: '100%'
			},

			items: [{
				xtype: 'textfield',
				name: 'layer_name',
				fieldLabel: 'Layer name',
				readOnly: true
			},{
				xtype: 'textfield',
				name: 'style',
				fieldLabel: 'Style'
			},{
				xtype: 'textfield',
				name: 'title',
				fieldLabel: 'Title'
			},{
				xtype: 'textareafield',
				name: 'description',
				fieldLabel: 'Description'
			},{
				xtype: 'datefield',
				name: 'date_updated',
				fieldLabel: 'Date updated'
			},{
				xtype: 'combo',
				name: 'cmbAgency',
				fieldLabel: 'Agency'
			},{
				xtype: 'combo',
				name: 'cmbSector',
				fieldLabel: 'Category'
			},{
				xtype: 'textfield',
				name: 'tags',
				fieldLabel: 'Tags'
			},{
				xtype: 'checkboxfield',
				name: 'tiled',
				fieldLabel: 'Tiled'
				
			},{
				xtype: 'checkboxfield',
				name: 'listed',
				fieldLabel: 'Listed'
			}]
		});

		
		var tabpanel = {
			xtype:'tabpanel',
			title: 'Layer: denr_aqms',
			region: 'center',
			defaults: {
				margin: 10,
			},
			items: [
				formPanel
			,{
				title: 'Attributes',
				html: 'Panel content 2',
				items:[
					{ 
						xtype:'button',
						text: 'save',
						handler: function(){
							var record = formPanel.getForm().getRecord();
							formPanel.getForm().updateRecord(record);
							record.save();
						}
					}
				]
			},{
				title: 'Style',
				html: 'Panel content 3'
			},{
				title: 'Metadata',
				html: 'Panel content 4',
				hidden: true
			}],
			flex: 2/3
		};
		
		var content = {
			xtype: 'panel',
			region: 'east', 
			split: true,
			border: false,
			title: 'Map',
			flex: 2/3
		};
		
		

		
		Ext.apply(this, {
			items: [
				grid,tabpanel,content
			]
		});
		this.callParent(arguments);
	}

});



var map;

Ext.onReady(function(){	
	
	// Entry point
	Ext.create('Ext.Viewport', {
        layout: 'border',
        title: 'Ext Layout Browser',
        items: [{
			xtype: 'pgp_header',
			region: 'north',
			title: 'PGP Map Editor'
		},{
			xtype: 'pgp_mycomponent',
			region: 'center',
			layout: 'border',
			showLayerList: true
		}],
		renderTo: Ext.getBody()
    });
	
	

	
	
});


function createMap(){

	var mapExtent = new OpenLayers.Bounds(
						13020672, 521106.59375,
						14091012, 2661799.75
					);
	
	map = new OpenLayers.Map('mapContainer', {
		maxExtent:mapExtent,
		projection: 'EPSG:3857',
		controls: [
			new OpenLayers.Control.Navigation(
				{dragPanOptions: {enableKinetic: true}}
			),
			new OpenLayers.Control.LayerSwitcher(), 
			new OpenLayers.Control.PanZoomBar(),
			new OpenLayers.Control.MousePosition()]
	});
	
	
	var gnis = new OpenLayers.Layer.WMS(
		"geoportal:mgd_geodeticcontrol - Tiled", "http://geoserver.namria.gov.ph:8080/geoserver/geoportal/wms",
		{
			LAYERS: 'geoportal:adminbnd_prov',
			STYLES: '',
			format: 'image/png',
			tiled: true,
			tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom
		},
		{
			buffer: 0,
			displayOutsideMaxExtent: true,
			isBaseLayer: true,
			yx : {'EPSG:3857' : false}
		} 
	);
	
	map.addLayer(gnis);
	
	map.zoomToExtent(mapExtent);
	
	return map;

}

