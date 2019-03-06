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

var distance;
var vectors;
var wpsClient;
Ext.define('PGP.view.MyComponent', {
	alias: 'widget.pgp_mycomponent',
	extend: 'Ext.Window',	
	title: 'Hello',
	//height: 300,
	//width: 500,
	layout: 'fit',
	//modal: true,
	initComponent: function() {
		

		var layerParam = this.layers;
		
		var me = this;
		OpenLayers.ProxyHost = "http://pgp.namria.gov.ph/webapi/get.ashx?url=";
		wpsClient = new OpenLayers.WPSClient({
			servers: {
				local: 'http://202.90.149.233:8082/geoserver/wps'
			}
		});
		
		
		// allow testing of specific renderers via "?renderer=Canvas", etc
		var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
		renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;

		 vectors = new OpenLayers.Layer.Vector("Vector Layer", {
			renderers: renderer
		});
		
		vectors.events.on({
                'featureselected': function(feature) {
                    console.log(this.features[0].geometry);
					
                },
                'featureunselected': function(feature) {
                     console.log(this.selectedFeatures.length);
                }
            });
		
		this.map.addLayer(vectors);
		
		var controls = {
			point: new OpenLayers.Control.DrawFeature(vectors,
						OpenLayers.Handler.Point),
			line: new OpenLayers.Control.DrawFeature(vectors,
						OpenLayers.Handler.Path),
			polygon: new OpenLayers.Control.DrawFeature(vectors,
						OpenLayers.Handler.Polygon),
			circle: new OpenLayers.Control.DrawFeature(vectors,
						OpenLayers.Handler.RegularPolygon,
						{handlerOptions: {sides: 40}}),
			rectangle: new OpenLayers.Control.DrawFeature(vectors,
						OpenLayers.Handler.RegularPolygon,
						{handlerOptions: {sides: 4, irregular: true}}),
			modify: new OpenLayers.Control.ModifyFeature(vectors),
			select: new OpenLayers.Control.SelectFeature(vectors)
		};

		for(var key in controls) {
			this.map.addControl(controls[key]);
		}
		
		Ext.apply(me, {
			activeControl: null,
			controls:controls,
			items: { 	
					xtype: 'panel',
					layout: {
						type: 'vbox',
						//align: 'stretch'
						},
						 items: [ 
								{ 	xtype: 'panel',
									layout: {
										type: 'hbox',
										align: 'stretch'
									},
									/* defaults: {	
										margin: '5 5 5 5'
									}, */						
									items: [
										{
											xtype: 'button',
											text: ' ',
											icon: 'http://pgp/resources/img/point.png',
											scale: 'large',
											toggleGroup: 'shape',
											handler: function(){
												//me.toggle('arrow');
												me.toggle('select');
											}
										},
										{
											xtype: 'button',
											text: 'Point',
											icon: 'http://pgp/resources/img/point.png',
											scale: 'large',
											toggleGroup: 'shape',
											handler: function(){
												me.toggle('point');
											}
										},
										{
											xtype: 'button',
											text: 'Line',
											icon: 'http://pgp/resources/img/line.png',
											scale: 'large',
											toggleGroup: 'shape',
											handler: function(){
												me.toggle('line');
											}
										},
										{
											xtype: 'button',
											text: 'Circle',
											icon: 'http://pgp/resources/img/circle.png',
											scale: 'large',
											toggleGroup: 'shape',
											handler: function(){
												me.toggle('circle');
											}
										},
										{
											xtype: 'button',
											text: 'Rectangle',
											icon: 'http://pgp/resources/img/square.png',
											scale: 'large',
											toggleGroup: 'shape',
											handler: function(){
												me.toggle('rectangle');
											}
										},
										{
											xtype: 'button',
											text: 'Polygon',
											icon: 'http://pgp/resources/img/polygon.png',
											scale: 'large',
											toggleGroup: 'shape',
											handler: function(){
												me.toggle('polygon');
											}
										}],
								},
								
								
								
								{
									xtype: 'textfield',
									id: 'txtDistance',
									width: 80,
									fieldLabel: 'Distance',
									labelAlign: 'top',
								},
								
								{
									xtype: 'button',
									text: 'Buffer',
									scale: 'large',
									 handler: function(){
										distance = txtDistance.getValue();
										buffer();
									} 
								},
								{
									xtype: 'button',
									text: 'Reset',
									scale: 'large',
									 handler: function(){
										txtDistance.setValue('');
										vectors.removeAllFeatures();
									} 
								}
							]		
				}
			
		});
		
		
		
		
		
		this.callParent(arguments);
		var txtDistance = Ext.getCmp('txtDistance');
	},
	toggle: function(shape){
		var controls = this.controls;
		for(key in controls) {
			var control = controls[key];
			if(shape == key) {
				control.activate();
				this.activeControl = control;
			} else {
				control.deactivate();
			}
		}
	},
	cleanup: function(){
		var controls = this.controls;
		for(key in controls) {
			var control = controls[key];
			control.deactivate();
			this.map.removeControl(control);
		}
		console.log(this.map);
	},
	listeners: {
		close: function(){
			this.cleanup();
		}
	}
	

});

function buffer(){
	
	var buffer = wpsClient.getProcess('local', 'JTS:buffer');
	buffer.execute({
		inputs: {
			
			geom: vectors.features[0].geometry,
			distance: distance * 1000
		},
		success: function(outputs){
			
			/* for (var i=0, ii=outputs.result.length; i<ii; ++i){
				//alert(outputs.result[i].geometry.toString());
				 features = outputs.result[i];
				
				 
			} */
			vectors.addFeatures(outputs.result);
			
		}
	});
};

var map;

Ext.onReady(function(){


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
	
		

	
	var win = Ext.create('PGP.view.MyComponent', { 
		map: map
	});
	
	win.show();
	
});


