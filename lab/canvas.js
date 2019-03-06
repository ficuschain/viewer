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
var exportMapControl;

Ext.onReady(function(){

	init();


	return; 

	// Entry point
	
	
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
		"geoportal:mgd_geodeticcontrol - Tiled", "http://202.90.149.233:8082/geoserver/geoportal/wms",
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
			yx : {'EPSG:3857' : false},
			useCanvas: OpenLayers.Layer.Grid.ONECANVASPERLAYER
		} 
	);
	
	map.addLayer(gnis);
	
	map.zoomToExtent(mapExtent);
	
	
	
	
	var win = Ext.create('PGP.view.MyComponent', { 
		title: 'test',
		layers: mylayers
	});
	
	win.show();
	
	
	
	
	
	
	
	
	
});



 function init(){
                map = new OpenLayers.Map('mapContainer');
                
                var wmsBase = new OpenLayers.Layer.WMS("OpenLayers WMS", 
                    "http://labs.metacarta.com/wms/vmap0?", 
//                    "proxy.cgi?url=http://labs.metacarta.com/wms/vmap0?",
                    {
                        layers: 'basic'
                    }, 
                    {
                        useCanvas: OpenLayers.Layer.Grid.ONECANVASPERLAYER
                    });
                
                var wmsOverlay = new OpenLayers.Layer.WMS("FAO GeoNetwork: Suitability of currently available land for rainfed production of oil crops", 
                    "http://geonetwork3.fao.org/ows/14097?",
//                    "proxy.cgi?url=http://geonetwork3.fao.org/ows/14097?", 
                    {
                        layers: "currently_oil_crops_intermediate_level_inputs",
                        transparent: true
                    }, 
                    {
                        useCanvas: OpenLayers.Layer.Grid.ONECANVASPERLAYER,
                        isBaseLayer: false
                    });
                
               /*  var vector = new OpenLayers.Layer.Vector("GML", {
                    strategies: [new OpenLayers.Strategy.Fixed()],
                    protocol: new OpenLayers.Protocol.HTTP({
                        url: "gml/polygon.xml",
                        format: new OpenLayers.Format.GML()
                    }),
                    styleMap: new OpenLayers.StyleMap({
                        "default": new OpenLayers.Style({
                            fillColor: "#ffffff",
                            strokeColor: "#000000",
                            strokeWidth: 2
                        })
                    }),
                    renderers: ["Canvas", "SVG", "VML"]
                }); */
                
                map.addLayers([wmsBase, wmsOverlay]);
                
                //exportMapControl = new OpenLayers.Control.ExportMap();
                //map.addControl(exportMapControl);
                map.addControl(new OpenLayers.Control.LayerSwitcher());
                
                map.zoomToExtent(new OpenLayers.Bounds(-11.8296875, 39.54021484375, 10.6703125, 50.79021484375));
            }
            
            function exportMap() {
                var canvas = OpenLayers.Util.getElement("exportedImage");
                exportMapControl.trigger(canvas);   
                
//                // set download url (toDataURL() requires the use of a proxy)
//                OpenLayers.Util.getElement("downloadLink").href = canvas.toDataURL();
            }
