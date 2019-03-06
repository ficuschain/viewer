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

function GetDataExtent(layerName){
	var sql = "select st_xmin(st_extent(st_transform(wkb_geometry, 3857))) as xmin,st_ymin(st_extent(st_transform(wkb_geometry, 3857))) as ymin,st_xmax(st_extent(st_transform(wkb_geometry, 3857))) as xmax,st_ymax(st_extent(st_transform(wkb_geometry, 3857))) as ymax from " + layerName;

	Ext.Ajax.request({
			//url: "http://202.90.149.233:8081/webapi/api/util/querytableasjson?database=geoportal&sql=" + sql,
				url: "http://pgp.namria.gov.ph/webapi/api/util/querytableasjson?database=geoportal&sql=" + sql,
				method: 'GET',

			success: function(r){
				var obj = Ext.decode(r.responseText);
				var bounds= new OpenLayers.Bounds(obj.result[0].xmin,obj.result[0].ymin,obj.result[0].xmax,obj.result[0].ymax);
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
	//GetDataExtent("deped_beis");
	//map.zoomToExtent(mapExtent);
	
	
	var win = Ext.create('PGP.view.MyComponent', { 
		title: 'test',
		layers: mylayers
	});
	
	//win.show();
	
});

