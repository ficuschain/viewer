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
	initComponent: function() {
		

		var layerParam = this.layers;
		
		var me = this;
		
		//me.title = layerParam[0].name;

		this.callParent(arguments);
		
	}

});



var map;
var layerName;
var sql;

function GetDataExtent(layerName){
	sql = "select st_xmin(st_extent(st_transform(wkb_geometry, 3857))) as xmin,st_ymin(st_extent(st_transform(wkb_geometry, 3857))) as ymin,st_xmax(st_extent(st_transform(wkb_geometry, 3857))) as xmax,st_ymax(st_extent(st_transform(wkb_geometry, 3857))) as ymax from " + layerName;

	Ext.Ajax.request({
			//url: "http://202.90.149.233:8081/webapi/api/util/querytableasjson?database=geoportal&sql=" + sql,
				url: "http://pgp.namria.gov.ph/webapi/api/util/querytableasjson?database=geoportal&sql=" + sql,
				method: 'GET',

			success: function(r){
				var obj = Ext.decode(r.responseText);
				//console.log(obj.result[0].xmin,obj.result[0].ymin,obj.result[0].xmax,obj.result[0].ymax);
				var xmin = obj.result[0].xmin;
				var ymin= obj.result[0].ymin;
				var xmax = obj.result[0].xmax;
				var ymax=obj.result[0].ymax;
				var bounds = new OpenLayers.Bounds(xmin,ymin,xmax,ymax);
				map.zoomToExtent(bounds);
				}
	});

};

Ext.onReady(function(){

	// Entry point

	var mapExtent = new OpenLayers.Bounds(
                    13020672, 521106.59375,
                    14091012, 2661799.75
                );
	
	map = new OpenLayers.Map('mapContainer', {
		//maxExtent:mapExtent,
		projection: 'EPSG:900913',
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
			LAYERS: 'geoportal:mgd_geodeticcontrol',
			STYLES: '',
			format: 'image/png',
			tiled: true
			//tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom 
		},
		{
			buffer: 0,
			displayOutsideMaxExtent: true,
			isBaseLayer: true,
			yx : {'EPSG:3857' : false}
		}
	);

	map.addLayer(gnis); 
	
	GetDataExtent("mmeirs_landuse2003");
	//map.zoomToExtent(mapExtent);
	
	
	var win = Ext.create('PGP.view.MyComponent', { 
		title: 'test',
		layers: mylayers
	});
	
	//win.show();
	
});





/* 
function LayerExtent(layerName){
	console.log(layerName);
	OpenLayers.ProxyHost = "http://pgp.namria.gov.ph/webapi/get.ashx?url=";
	wms = new OpenLayers.Format.WMSCapabilities();
	OpenLayers.Request.GET(
		{
			url:"http://geoserver.namria.gov.ph:8080/geoserver/ows?service=wms&version=1.1.1&request=GetCapabilities",
			
			success: function(e)
			{
				var response = wms.read(e.responseText);
				var capability = response.capability;
				console.log(capability);
				for (var i=0, len=capability.layers.length; i<len; i+=1) 
					{	 
						var layerObj = capability.layers[i];
						if (layerObj.name === "geoportal:" + layerName) 
							{ 
								var bounds = OpenLayers.Bounds.fromArray(layerObj.llbbox);
								
								console.log(layerObj.name);
								map.zoomToExtent(bounds.transform("EPSG:4326","EPSG:900913")); 
							} 
					}
			}
		}); 

}; 

 */


//var sql = "select st_xmin(st_extent(st_transform(wkb_geometry, 3857))) as xmin,st_ymin(st_extent(st_transform(wkb_geometry, 3857))) as ymin,st_xmax(st_extent(st_transform(wkb_geometry, 3857))) as xmax,st_ymax(st_extent(st_transform(wkb_geometry, 3857))) as ymax from mmeirs_landuse2003";
//var sql = "select st_xmin(st_extent(wkb_geometry)) as xmin, st_ymin(st_extent(wkb_geometry)) as ymin,st_xmax(st_extent(wkb_geometry)) as xmax, st_ymax(st_extent(wkb_geometry)) as ymax from mmeirs_landuse2003"


//http://202.90.149.233:8081/webapi/api/util/querytableasjson?database=geoportal&sql=select st_extent(wkb_geometry) as data_extent from deped_beis

//http://192.168.5.78:8080/geoserver/ows?service=wms&version=1.1.1&request=GetCapabilities

/* 	OpenLayers.ProxyHost = "http://pgp.namria.gov.ph/webapi/get.ashx?url=";
	wms = new OpenLayers.Format.WMSCapabilities();
	OpenLayers.Request.GET(
		{
			url:"http://geoserver.namria.gov.ph:8080/geoserver/ows?service=wms&version=1.1.1&request=GetCapabilities",
			success: function(e)
			{
				var response = wms.read(e.responseText);
				var capability = response.capability;
				for (var i=0, len=capability.layers.length; i<len; i+=1) 
					{	 
						var layerObj = capability.layers[i]; 
						if (layerObj.name === "geoportal:mgd_geodeticcontrol") 
							{ 
								var bounds = OpenLayers.Bounds.fromArray(layerObj.llbbox);
								map.zoomToExtent(bounds.transform("EPSG:4326","EPSG:3857")); 
							} 
					}
			}
		});  */

/*  var gnis = new OpenLayers.Layer.WMS(
		"geoportal:mgd_geodeticcontrol - Tiled", "http://geoserver.namria.gov.ph:8080/geoserver/geoportal/wms",
		{
			LAYERS: 'geoportal:mgd_geodeticcontrol',
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
	); */


 /* wms = new OpenLayers.Format.WMSCapabilities();
	OpenLayers.Request.GET(
		{
			url:"http://geoserver.namria.gov.ph:8080/geoserver/geoportal/wms",
			success: function(e)
			{
				var response = wms.read(e.responseText);
				var capability = response.capability;
				for (var i=0, len=capability.layers.length; i<len; i+=1) 
					{	 
						var layerObj = capability.layers[i]; 
						if (layerObj.name === 'mgd_geodeticcontrol') 
							{ 
								map.zoomToExtent(OpenLayers.Bounds.fromArray(layerObj.llbbox)); 
								break; 
							} 
					}
			}
		});  */
		
