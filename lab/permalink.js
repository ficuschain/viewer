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

var mylayers = [ {name:'layer1'}, {name: 'layer2'} ];


Ext.define('PGP.view.MyComponent', {
	alias: 'widget.pgp_mycomponent',
	extend: 'Ext.Window',	
	title: 'Hello',
	height: 300,
	width: 500,
	layout: 'fit',
	modal: true,
	permaLink: '',
	parseUrl: function(){
		//http://192.168.8.13:82/lab/permalink.html?p=13668910.62451%2C1173434.1791164%7C0%7CPhilippine%20Geoportal%20Basemap%7CGeodetic%20control%20points%2Cgeoportal%3Amgd_geodeticcontrol%2C1%2C%2Cfalse%2Cstation_no%3D%271%27%3BAir%20Quality%20Monitoring%20Station%2Cgeoportal%3Adenr_aqms%2C1%2C%2Cfalse%2Cundefined
		//http://geoportal.gov.ph/?p=x,y|z|basemap|name,opacity,cql;name,opacity,cql
		
		var url = unescape(document.URL);
		console.log(url);
		if(url.indexOf("?p=") == -1){
			return;
		}
		
		var p = url.substr(url.lastIndexOf("?p=") + 3,url.length - url.lastIndexOf("?p="));
		var params = p.split("|");
		
		var center = new OpenLayers.LonLat(params[0].split(","));

		var zoom = parseInt(params[1]);
		
		var basemap = params[2];
		
		var layersParam = params[3].split(";");
		var layers = [];
		
		for(var item in layersParam){
			var layerInfo = layersParam[item].split(",");
			var layerTitle = layerInfo[0];
			var layerName = layerInfo[1];
			var opacity = layerInfo[2];
			var style = layerInfo[3]== "undefined" ? "":layerInfo[3];
			var singleTile = layerInfo[4];
			var cql = layerInfo[5]== "undefined" ? "":layerInfo[5];
			
			var wmsLayer = new OpenLayers.Layer.WMS(
					layerTitle, 
					"http://202.90.149.232/geoserver/geoportal/wms",
					{
						layers: layerName,
						styles: style,
						transparent: true,
						cql: cql
					},
					{
					   singleTile: singleTile, 
					   ratio: 1, 
					   isBaseLayer: false
					   //transitionEffect: 'resize'
					} 
			);
		
			
			layers.push(wmsLayer);
		}

		this.map.addLayers(layers);
		this.map.setCenter(center,zoom);
		
	},
	generateLink: function(map){

		//http://geoportal.gov.ph/?p=x,y|z|basemap|title,name,opacity,style,tiled,cql;name,opacity,style,tiled,cql
		
		var layers = [];
		
		for(var i = 1; i < map.layers.length; i++){
			var layer = map.layers[i];
			//layers.push({name: layer.params.LAYERS, opacity: layer.opacity, cql: layer.params.CQL || '' });
			layers.push(layer.name + "," + 
						layer.params.LAYERS + "," + 
						layer.opacity + "," + 
						layer.params.STYLES + "," + 
						layer.singleTile + "," +
						layer.params.CQL);
		}

		var link =	map.getCenter().lon + "," + map.getCenter().lat + "|" +
					map.getZoom() + "|" +
					map.layers[0].name + "|" + 
					layers.join(";");
		var origin = document.location.origin;
		link = origin + "?p=" + escape(link);
		this.permaLink = link;
		
	},
	initComponent: function() {
		var me = this;
		
		//this.generateLink(this.map);
		//console.log(this.permaLink);
		this.callParent(arguments);
		
	}

});



var map;
var layerName;

Ext.onReady(function(){

	// Entry point

	
	var maxExtent = new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34);
	//var layerMaxExtent = new OpenLayers.Bounds(11128623.5489416,-55718.7227285097,16484559.8541582,3072210.74548981);
	var layerMaxExtent =  new OpenLayers.Bounds( 11516520.903064, 482870.29798867,  15821300.345956,  2448728.3963715);
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
	
	 map = new OpenLayers.Map('mapContainer', {
		controls: [
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
	
	
	var pgp_basemap_cache = new OpenLayers.Layer.ArcGISCache( "Philippine Geoportal Basemap",
		//"http://geoportal.gov.ph/ArcGIS/rest/services/Basemap/PGS_Basemap/MapServer", {
		"http://202.90.149.252/ArcGIS/rest/services/Basemap/PGS_Basemap/MapServer", {
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
	
	map.addLayer(pgp_basemap_cache);
	
	
    var gnis = new OpenLayers.Layer.WMS(
   		"Geodetic control points", "http://202.90.149.232/geoserver/geoportal/wms",
   		{
   			LAYERS: 'geoportal:mgd_geodeticcontrol',
   			STYLES: '',
   			format: 'image/png',
   			tiled: true,
   			transparent: true,
   			CQL: 'station_no=\'1\''
   			//tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom 
   		},
   		{
   			buffer: 0,
   			displayOutsideMaxExtent: true,
   			isBaseLayer: false,
   			yx : {'EPSG:3857' : false}
   		}
   	);
	
    var denr = new OpenLayers.Layer.WMS(
   		"Air Quality Monitoring Station", "http://202.90.149.232/geoserver/geoportal/wms",
   		{
   			LAYERS: 'geoportal:denr_aqms',
   			STYLES: '',
   			format: 'image/png',
   			tiled: true,
   			transparent: true
   			//tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom 
   		},
   		{
   			buffer: 0,
   			displayOutsideMaxExtent: true,
   			isBaseLayer: false,
   			yx : {'EPSG:3857' : false}
   		}
   	);

	//map.addLayers([gnis,denr]); 
	
	
	map.setCenter();
	//map.setCenter(13668910.62451,1436187.5986596, 1);
	//map.setCenter(13610082.099764,1403622.13949,5);
	
	var win = Ext.create('PGP.view.MyComponent', { 
		title: 'test',
		map: map
	});
	
	win.show();
	win.parseUrl();
});

