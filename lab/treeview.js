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
	'PGP.store.AllLayers'
]);

var mylayers = [ {name:'layer1'}, {name: 'layer2'} ];


Ext.define('PGP.view.MyComponent', {
	alias: 'widget.pgp_mycomponent',
	extend: 'Ext.Window',	
	title: 'Hello',
	height: 300,
	width: 500,
	layout: 'fit',
	modal: true,
	initComponent: function() {
	
		var me = this;
		

		// Set up a model to use in our Store
		Ext.define('PGP.model.Layer',{
			extend: 'Ext.data.Model',
			fields: ['text','layer_name','title', 'description', 'agency', 'tags', {name: 'qtip', type: 'string', mapping:'agency_name' }]
			//fields: ['text','title']
		});

		Ext.define('PGP.store.AZLayers',{
			extend: 'Ext.data.TreeStore',
			model: 'PGP.model.Layer',
			proxy: {
					type: 'ajax',
					url: '../../webapi/api/layers/getlayersaz',
					//url: 'treedata.js',
					headers: { 'Content-Type': 'application/json' },
					reader: {
						type: 'json'
					}
				},
			root: {
				text: 'ROOT',
				id: 'src',
				expanded: true
			},
			folderSort: true,
			sorters: [{
				property: 'text',
				direction: 'ASC'
			}]
		});
				
		var store = Ext.create('PGP.store.AZLayers', { 
		});
		
		store.on('load',function(data){
			console.log(data.tree.root.childNodes);
		});

		
		

	
		var tree = Ext.create('Ext.tree.Panel', {
			border: false,
			store: store,
			rootVisible: true,
			folderSort: true
		});

		Ext.apply(me, {
			items: [tree]
		});

		this.callParent(arguments);
		
	}

});



var map;

Ext.onReady(function(){

	// Entry point
	
	
	// var mapExtent = new OpenLayers.Bounds(
                    // 13020672, 521106.59375,
                    // 14091012, 2661799.75
                // );
	
	// map = new OpenLayers.Map('mapContainer', {
		// maxExtent:mapExtent,
		// projection: 'EPSG:3857',
		// controls: [
			// new OpenLayers.Control.Navigation(
				// {dragPanOptions: {enableKinetic: true}}
			// ),
			// new OpenLayers.Control.LayerSwitcher(), 
			// new OpenLayers.Control.PanZoomBar(),
			// new OpenLayers.Control.MousePosition()]
	// });
	
	
	// var gnis = new OpenLayers.Layer.WMS(
		// "geoportal:mgd_geodeticcontrol - Tiled", "http://geoserver.namria.gov.ph:8080/geoserver/geoportal/wms",
		// {
			// LAYERS: 'geoportal:adminbnd_prov',
			// STYLES: '',
			// format: 'image/png',
			// tiled: true,
			// tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom
		// },
		// {
			// buffer: 0,
			// displayOutsideMaxExtent: true,
			// isBaseLayer: true,
			// yx : {'EPSG:3857' : false}
		// } 
	// );
	
	// map.addLayer(gnis);
	
	// map.zoomToExtent(mapExtent);
	
	
	
	
	var win = Ext.create('PGP.view.MyComponent', { 
		title: 'test',
		layers: mylayers
	});
	
	win.show();
	
	
	
	
	
	
	
	
	
});


