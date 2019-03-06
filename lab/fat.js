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

function drawCircle(){ 
         var circleLayer = new OpenLayers.Layer.Vector("Circle Layer"); 
/* //	var centre = new OpenLayers.Geometry.Point(lonlat.lon,lonlat.lat); 
//	var centre = new OpenLayers.Geometry.Point(-15625.623028515,6711188.8770829); 
       // var centre = new OpenLayers.Geometry.Point(p1); 
        //var options = [centre, 10, 20, 90]; 
		console.log(xy);
        var circul = new OpenLayers.Geometry.Polygon.createRegularPolygon(xy,1000,20); 
        var circleStyle = { 
                        strokeColor: "#00ff00", 
                        fillColor: "#00ff00", 
                        fillOpacity: 1, 
                        strokeWidth: 3, 
                        strokeDashstyle: "solid", 
                }; 
        var addCircul = new OpenLayers.Feature.Vector(circul); 
        circleLayer.addFeatures([addCircul]); 
        map.addLayer(circleLayer);  */
		var center =new OpenLayers.Geometry.Point(121,14);
		
	var circle = OpenLayers.Geometry.Polygon.createRegularPolygon(center.transform("EPSG:4326", "EPSG:3857"),10000,20,30);
	var feature = new OpenLayers.Feature.Vector(circle);
	circleLayer.addFeatures(feature);
	map.addLayers([gnis,circleLayer]);
		
		
} 

var map;

Ext.onReady(function(){

	// Entry point
	
	 OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
                defaultHandlerOptions: {
                    'single': true,
                    'double': false,
                    'pixelTolerance': 0,
                    'stopSingle': false,
                    'stopDouble': false
                },

                initialize: function(options) {
                    this.handlerOptions = OpenLayers.Util.extend(
                        {}, this.defaultHandlerOptions
                    );
                    OpenLayers.Control.prototype.initialize.apply(
                        this, arguments
                    ); 
                    this.handler = new OpenLayers.Handler.Click(
                        this, {
                            'click': this.trigger
                        }, this.handlerOptions
                    );
                }, 

                trigger: function(e) {
					var circleLayer = new OpenLayers.Layer.Vector("Circle Layer"); 
                    var lonlat = map.getLonLatFromPixel(e.xy);
                    /*alert("You clicked near " + lonlat.lat + " N, " +
                                              + lonlat.lon + " E"); */
					var center =  new OpenLayers.Geometry.Point(lonlat.lon,lonlat.lat);
					//var center =  new OpenLayers.Geometry.Point(121,14);
					console.log(center);
					var circle = OpenLayers.Geometry.Polygon.createRegularPolygon(center.transform("EPSG:3857", "EPSG:3857"),100000,20,30);
					//var circle = OpenLayers.Geometry.Polygon.createRegularPolygon(center.transform("EPSG:4326", "EPSG:3857"),100000,20,30);
					var feature = new OpenLayers.Feature.Vector(circle);
					circleLayer.addFeatures(feature);
					map.addLayers([gnis,circleLayer]);
                },
				
				
            });
	
	
	
	
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
	);
	
	map.addLayer(gnis);

	
	map.zoomToExtent(mapExtent);
	
	
	var click = new OpenLayers.Control.Click();
	map.addControl(click);
	click.activate();
	
	var win = Ext.create('PGP.view.MyComponent', { 
		title: 'test',
		layers: mylayers
	});
	
	//win.show();
	
	
});






/* var centre =  new OpenLayers.Geometry.Point(lonlat.lon,lonlat.lat);
//console.log(centre);
//centre.transform("EPSG:4326","EPSG:3857");
centre.transform("EPSG:4326","EPSG:3857");				
console.log(centre);
var circleLayer = new OpenLayers.Layer.Vector("Circle");
var circul = new OpenLayers.Geometry.Polygon.createRegularPolygon(centre, 1000, 20, 90);
//circleLayer.addFeatures([new OpenLayers.Feature.Vector(circul)]);
circleLayer.addFeatures(circul);
map.addLayer(circleLayer); */