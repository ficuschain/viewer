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
		

		var layerParam = this.layers;
		
		var me = this;

		this.callParent(arguments);
		
	}

});



var map;

Ext.onReady(function(){

	// Entry point
	
	
	var maxExtent = new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34);
		var layerMaxExtent = new OpenLayers.Bounds( 11516520.903064, 482870.29798867,  15821300.345956,  2448728.3963715);
		//var layerMaxExtent = PGP.settings.defaultExtent;
		var units = 'm';
		var resolutions = [ 3968.75793751588, 
							2645.83862501058, 
							1322.91931250529, 
							661.459656252646, 
							264.583862501058, 
							132.291931250529, 
							66.1459656252646, 
							26.4583862501058, 
							13.2291931250529, 
							6.61459656252646, 
							2.64583862501058, 
							1.32291931250529, 
							0.661459656252646 ];
		var tileSize = new OpenLayers.Size(256, 256);
		var projection = 'EPSG:900913';
		var tileOrigin = new OpenLayers.LonLat(-20037508.342787,20037508.342787);
		
		var map = new OpenLayers.Map('map', {
			xcontrols: [
                        new OpenLayers.Control.Navigation(),
                        new OpenLayers.Control.ScaleLine(),
                        new OpenLayers.Control.MousePosition()
                    ]	,
			maxExtent: maxExtent,
			StartBounds: layerMaxExtent,
			units: units,
			resolutions: resolutions,
			tileSize: tileSize,
			projection: projection,
			restrictedExtent: layerMaxExtent,
			fallThrough: true
		});
		
		
		
		debugMap = map;
		
		
		var pgp_ortho_mm_cache = new OpenLayers.Layer.ArcGISCache( "Philippine Geoportal Basemap",
			"http://202.90.149.252/ArcGIS/rest/services/Basemap/PGS_OrthoImage/MapServer", {
			//"http://202.90.149.252/ArcGIS/rest/services/Basemap/PGS_Basemap/MapServer", {
			isBaseLayer: true,

			//From layerInfo above                        
			resolutions: resolutions,                        
			tileSize: tileSize,
			tileOrigin: tileOrigin,
			maxExtent: layerMaxExtent, 
			projection: projection,
			displayInLayerSwitcher: false
		},
		{
			//additional options
			transitionEffect: "resize"
		});
		
		//map.addLayer(pgp_ortho_mm_cache);
	
	
	
		var google_satellite = new OpenLayers.Layer.Google(
                "Google Satellite",
                {type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 22}
            );
		map.addLayer(google_satellite);
	
		map.setCenter((new OpenLayers.LonLat(121,14.6)).transform("EPSG:4326","EPSG:900913"), 6);
		//map.zoomToExtent(layerMaxExtent);
	
	
	
	
	
});


