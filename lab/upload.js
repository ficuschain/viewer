/*

1. Upload shapefile
	- ask for projection: ["PRS 92", "WGS 1984", "PTM", "UTM (Zone 51N)"]
2. Server side: save file to temp
3. ogr2ogr -overwrite -skipfailures -f "PostgreSQL" PG:"host=myhost user=myuser dbname=mydb password=mypass" "C:\somefolder\BigFileGDB.gdb" "MyFeatureClass" 
4. register to GeoServer
5. Add layer

*/

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


Ext.define('PGP.view.OverlayFile', {
	alias: 'widget.pgp_mycomponent',
	extend: 'Ext.Window',	
	title: 'Overlay',
	height: 200,
	width: 300,
	layout: 'fit',
	modal: true,
	initComponent: function() {
		var layerParam = this.layers;
		
		var me = this;
		
		
		Ext.apply(me, {
		
			items: {
				xtype: 'form',
				defaults: {	
					margin: 10
				},
				items: 
					[{
						fieldLabel: 'Shape file',
						name: 'file',
						allowBlank: false,
						xtype: 'fileuploadfield',
						buttonText: '',
						buttonConfig: {
							icon: 'http://pgp.namria.gov.ph/resources/img/pan.png'
						}   
					},{
							xtype: 'textfield',
							name: 'title',
							id: 'title',
							fieldLabel: 'Title',
							emptyText: 'descriptive title'
					},{
					
						xtype: 'combo',
						fieldLabel: 'Projection',
						name: 'srs',
						id: 'srs',
						displayField: 'display',
						valueField: 'value',
						editable: false,
						labelWidth: 100,
						store: Ext.create('Ext.data.Store', {
							fields: ['display', 'value'],
							data : [{display: 'PRS92', value: '4683'},
									{display: 'WGS84', value: '4326'},
									{display: 'WGS84 Web Mercator', value: '3857'},
									{display: 'PTM Zone I', value: '25391'},
									{display: 'PTM Zone II', value: '25392'},
									{display: 'PTM Zone III', value: '25393'},
									{display: 'PTM Zone IV', value: '25394'},
									{display: 'PTM Zone V', value: '25395'}
							]
						}) 
					}],
				buttons: [{
					xtype: 'button',
					text: 'Upload',
					buttonAlign: 'right',
					handler: function(){
						
						//var cmbProjection = Ext.getCmp('projection');
						//var projection = cmbProjection.getValue();
						var form = this.up('form').getForm();
						
						if(form.isValid()){
							form.submit({
								method: 'POST',
								url: 'http://pgp.namria.gov.ph/webapi/api/upload/uploadfile',
								waitMsg: 'Uploading your file...',
								success: function(fp, o) {
									me.fireEvent("loaded", o.result.geometry);
									me.close();
								},
								failure: function(obj, o) {
									console.log(o.errors);
									me.close();
								}
								
								
							});
						}
						
						
						
					}
				}]
			}
		
		});
	

		this.callParent(arguments);
		
	}

});



var map;

Ext.onReady(function(){

	// Entry point
	
	OpenLayers.Format.GeoJSON.prototype.parseCoords.point = function(array) {
		return new OpenLayers.Geometry.Point(array[0], array[1]);
	}
	
	initMap();
	
	
	var win = Ext.create('PGP.view.OverlayFile', { 
		title: 'Maintenance module ',
		layers: mylayers
	});
	
	win.on("loaded",function(geom){
		console.log(geom);
		var geojson_format = new OpenLayers.Format.GeoJSON();
		var vector_layer = new OpenLayers.Layer.Vector(); 
		map.addLayer(vector_layer);
		vector_layer.addFeatures(geojson_format.read(geom));
	});
	win.show();
		
	
	
	
	
	
	
	
});


function initMap(){
var mapExtent = new OpenLayers.Bounds(
                    13020672, 521106.59375,
                    14091012, 2661799.75
                );
	
	map = new OpenLayers.Map('mapContainer', {
		maxExtent:mapExtent,
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
		"geoportal:adminbnd_prov - Tiled", "http://geoserver.namria.gov.ph:8080/geoserver/geoportal/wms",
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
	
}


