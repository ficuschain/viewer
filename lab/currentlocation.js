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

		this.callParent(arguments);
		
	}

});



var map;

Ext.onReady(function(){

	// Entry point
	
	
	var mapExtent = new OpenLayers.Bounds(
                    13020672, 521106.59375,
                    14091012, 2661799.75
                );
	x = new OpenLayers.Control.MousePosition();
	map = new OpenLayers.Map('mapContainer', {
		maxExtent:mapExtent,
		projection: 'EPSG:3857',
		controls: [
			new OpenLayers.Control.Navigation(
				{dragPanOptions: {enableKinetic: true}}
			),
			new OpenLayers.Control.LayerSwitcher(), 
			new OpenLayers.Control.PanZoomBar(),
			x]
	});
	
	
	var gnis = new OpenLayers.Layer.WMS(
		"admin_bnd_munic_psgc", "http://202.90.149.232/geoserver/geoportal/wms",
		{
			LAYERS: 'geoportal:admin_bnd_munic_psgc',
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
	
	//map.zoomToExtent(mapExtent);
	map.setCenter((new OpenLayers.LonLat(121,14)).transform("EPSG:4326","EPSG:900913"),8);
	
	
	
	map.events.register('moveend', map, function(e){
		var xy = map.getCenter().transform("EPSG:900913","EPSG:4326");
		var sql="select region  || ', ' || province || ', ' || municity as location  from admin_bnd_munic_psgc where st_intersects(geom,st_setsrid(st_makepoint("+ xy.lon +","+ xy.lat +"),4326))";
		Ext.Ajax.request({
			url: "http://geoportal.gov.ph/webapi/api/util/querytableasjson",
			params: {
				database: '',
				sql: sql
			},
			method: 'GET',
			success: function(r){
				var obj = Ext.decode(r.responseText);
				//var bounds= new OpenLayers.Bounds(obj.result[0].xmin,obj.result[0].ymin,obj.result[0].xmax,obj.result[0].ymax);
				//map.zoomToExtent(bounds);
				
				if(obj.result.length > 0)
					x.prefix = obj.result[0].location + " ";
				else
					x.prefix = "";
			}
		});
		
	});
	
	
	
	//select region,province, municity from admin_bnd_munic_psgc where st_intersects(geom,st_setsrid(st_makepoint(121.444,14.122),4326)) 
	
	
	
	var win = Ext.create('PGP.view.MyComponent', { 
		title: 'test',
		layers: mylayers
	});
	
	//win.show();
	
	
	
	
	
	
	
	
	
});


