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


Ext.define('PGP.view.MeasureTool', {
	alias: 'widget.pgp_measuretool',
	extend: 'Ext.Window',	
	title: 'Measure tool',
	height: 200,
	width: 200,
	layout: 'fit',
	initComponent: function() {
	
		var me = this;
		
		     var sketchSymbolizers = {
                "Point": {
                    pointRadius: 0,
                    graphicName: "square",
                    fillColor: "white",
                    fillOpacity: 1,
                    strokeWidth: 1,
                    strokeOpacity: 1,
                    strokeColor: "#333333"
                },
                "Line": {
                    strokeWidth: 1,
                    strokeOpacity: 1,
                    strokeColor: "#666666",
                    strokeDashstyle: "dash"
                },
                "Polygon": {
                    strokeWidth: 2,
                    strokeOpacity: 1,
                    strokeColor: "#666666",
                    fillColor: "#FF8000",
                    fillOpacity: 0.75
                }
            };
            var style = new OpenLayers.Style();
            style.addRules([
                new OpenLayers.Rule({symbolizer: sketchSymbolizers})
            ]);
            var styleMap = new OpenLayers.StyleMap({"default": style});
            
            // allow testing of specific renderers via "?renderer=Canvas", etc
            var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
            renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;
			
			
			
			OpenLayers.Control.Measure.prototype.displaySystemUnits = {
				 geographic: ['dd'],
				 english: ['mi', 'ft', 'in'],
				 metric: ['km', 'm'],
				 namriaUnit: ['km']
			};
			
			var eventHandler = function(event){
					console.log(event);
					var result = event.measure;
					var lblResult = Ext.getCmp('lblResult');
					
					var km = result.toFixed(3) + " km" + (event.order == 2 ? "<sup>2</sup>" : "");
					var m = (result * 1000000).toFixed(3) + " m" + (event.order == 2 ? "<sup>2</sup>" : "");
					var mi = (result * 0.386102).toFixed(3) + " mi" + (event.order == 2 ? "<sup>2</sup>" : "");
					var ft = (result * 10763900).toFixed(3) + " ft" + (event.order == 2 ? "<sup>2</sup>" : "");
					
					var out = km + "<br/>" +
							  m + "<br/>" +
							  mi + "<br/>" +
							  ft + "<br/>";
					
					lblResult.setText(out, false);
				};
			
			var measureDistanceControl = new OpenLayers.Control.Measure(
                    OpenLayers.Handler.Path, {
                        persist: true,
                        handlerOptions: {
                            layerOptions: {
                                renderers: renderer,
                                styleMap: styleMap
                            }
                        },
						displaySystem: 'namriaUnit'
                    }
                );
			measureDistanceControl.events.on({
				measurepartial: eventHandler
			});	
			var measureAreaControl = new OpenLayers.Control.Measure(
                    OpenLayers.Handler.Polygon, {
                        persist: true,
                        handlerOptions: {
                            layerOptions: {
                                renderers: renderer,
                                styleMap: styleMap
                            }
                        },
						displaySystem: 'namriaUnit'
                    }
                );
			measureAreaControl.events.on({
				measurepartial: eventHandler
			});	
			
		
			
			this.map.addControl(measureDistanceControl);
			this.map.addControl(measureAreaControl);
			
			measureDistanceControl.activate();
		
		
		
		
		
		
		
		Ext.apply(me, {
			
			items: [ 
				{ 	
					xtype: 'panel',
					layout: {
						type: 'vbox',
						align: 'stretch'
					},
					defaults: {	
						margin: '10 5 5 5',
						labelWidth: 55,
					},
					items: [
					
						{
							xtype: 'combo',
							id: 'cmbMeasure',
							store: ['Distance', 'Area'],
							editable: false,
							fieldLabel: 'Measure',
							value: 'Distance',
							listeners: {
								change: function(field, newValue, oldValue){
									if(newValue == 'Distance'){
										measureAreaControl.deactivate();
										measureDistanceControl.activate();
									}else{
										measureDistanceControl.deactivate();
										measureAreaControl.activate();
									}
								}
							}
						},
						{
							xtype: 'label',
							id: 'lblResult',
							style: 'text-align: right'
						},
						{
							xtype: 'label',
							id: 'lblInfo',
							style: 'font-size: smaller',
							text: '* double click to end'
						}
					]
					
				}
			]					
		});
		this.callParent(arguments);
       
		this.on("close",function(){
			measureDistanceControl.deactivate();
			this.map.removeControl(measureDistanceControl);
			
			measureAreaControl.deactivate();
			this.map.removeControl(measureAreaControl);
		});
		
	}

});



var map;

Ext.onReady(function(){

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
		"geoportal:mgd_geodeticcontrol - Tiled", "http://geoserver.namria.gov.ph:8080/geoserver/geoportal/wms",
		{
			LAYERS: 'geoportal:adminbnd_prov',
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
	
	
	
	
	var win = Ext.create('PGP.view.MeasureTool', { 
		map: map
	});
	
	win.show();
	
	
	
	
	
	
	
	
	
});


