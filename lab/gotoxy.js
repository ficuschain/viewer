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

var mylayers = [ {name:'layer1'}, {name: 'layer2'} ]
var map;

Ext.define('PGP.view.MyComponent', {
	alias: 'widget.pgp_mycomponent',
	extend: 'Ext.Window',	
	title: 'Hello',
	height: 300,
	width: 500,
	layout: 'fit',
	modal: true,
	initComponent: function() {
		

		var layerParam = this.layers;
		
		var me = this;
		
		

		this.callParent(arguments);
		
	}

});





Ext.onReady(function(){

	// Entry point
	initMap();
	
	var win = Ext.create('PGP.view.MyComponent', { 
		title: 'gotoXY',
		//layers: mylayers,
		map:map
	});
	//map.setCenter(new OpenLayers.LonLat(121.05,14.5));
	win.show();
	
	
});


function initMap(){
	map = new OpenLayers.Map( 'map' );
	
	var gnis = new OpenLayers.Layer.WMS(
		"Geodetic control points", 
		"http://geoserver.namria.gov.ph:8080/geoserver/geoportal/wms",
		{
			layers: 'geoportal:mgd_geodeticcontrol',
			styles: '',
			transparent: true,
			cql_filter: 'stat_name=\'MMA-1\''
		},
		{
		   singleTile: false, 
		   ratio: 1, 
		   isBaseLayer: false
		} 
	);
	
	map.addLayer(gnis);
	
	//var extent = new OpenLayers.Bounds(105.50514892578,1.750910644531,138.99147705078,22.932551269531);
	
	//map.zoomToExtent(extent);	

}


