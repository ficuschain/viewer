Ext.Loader.setConfig({
	enabled: true,
	// Don't set to true, it's easier to use the debugger option to disable caching
	disableCaching: false,
	paths: {
		'PGP': '../../app/'
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
		
		//me.title = layerParam[0].name;

		this.callParent(arguments);
		
	}

});



//var map;
var map, layer, heatmap;

Ext.onReady(function(){

	// Entry point
	
	
	var mapExtent = new OpenLayers.Bounds(
                    116.928527832031, 4.64223909378052,
                    126.604156494141, 20.9373092651367
                );
	
	map = new OpenLayers.Map('mapContainer', {
		//maxExtent:mapExtent,
		projection: 'EPSG:4326',
		controls: [
			new OpenLayers.Control.Navigation(
				{dragPanOptions: {enableKinetic: true}}
			),
			new OpenLayers.Control.LayerSwitcher(), 
			new OpenLayers.Control.PanZoomBar(),
			new OpenLayers.Control.MousePosition()]
	});
	
	
	var basemap = new OpenLayers.Layer.WMS(
		"geoportal:adminbnd_munic - Tiled", "http://192.168.5.78:8080/geoserver/geoportal/wms",
		{
			LAYERS: 'geoportal:adminbnd_munic',
			STYLES: '',
			format: 'image/png',
			tiled: true,
			tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom
		},
		{
			buffer: 0,
			displayOutsideMaxExtent: true,
			isBaseLayer: true,
			opacity: 0,
			yx : {'EPSG:4326' : false}
		} 
	);
	
	map.addLayer(basemap);
	map.zoomToExtent(mapExtent);
	
	var myData = { max: 15, data:[] };
	
	Ext.Ajax.request({
		async: false,
		url: 'flood_data.js',
		success: function(response){
			var obj = Ext.decode(response.responseText);
			Ext.each(obj.features, function(feature){
				var prop = feature.properties;
				console.log(prop.Long, prop.Lat, prop.heightft);
				if(prop.heightft <= 6){
					myData.data.push({
										lonlat: new OpenLayers.LonLat(prop.Long, prop.Lat),
										count: prop.heightft
									 });
				}
			});
		}
	});
	
	
   
	
	
	// create our heatmap layer
   heatmap = new OpenLayers.Layer.Heatmap( "Heatmap Layer", map, basemap, {visible: true, radius:20}, {isBaseLayer: false, opacity: 0.3, projection: new OpenLayers.Projection("EPSG:4326")});
   
   //heatmap.setDataSet(transformedTestData);
   heatmap.setDataSet(myData);
   map.addLayer(heatmap);
   
   
	
	/*
	var win = Ext.create('PGP.view.MyComponent', { 
		title: 'test',
		layers: mylayers
	});
	
	win.show();
	*/
	
});




