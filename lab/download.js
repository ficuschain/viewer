var map, layer;

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




var layers = [ {name:'layer1'}, {name: 'layer2'} ]

Ext.define('PGP.view.DownloadLayer', {
	alias: 'widget.pgp_layerfilter',
	extend: 'Ext.Window',	
	width: 250,
	layout: 'fit',
	modal: true,
	initComponent: function() {
		var me = this;
		
		var layers = [];
		Ext.each(map.layers, function(layer, index){
			layers.push({display: layer.name, value: layer.id});
		});
		
		var layerStore = Ext.create('Ext.data.Store', {
			fields: ['display', 'value'],
			data : layers
		});
		var typeStore = Ext.create('Ext.data.Store', {
			fields: ['display', 'value', 'ext'],
			data: [
					{display:'KML (.kml)', value:'GML2', ext: '.kml'},
					{display:'Shapefile (.shp)', value:'shape-zip', ext: '.zip'},
					{display:'GeoJson (.geojson)', value:'json', ext: '.geojson'},
					{display:'CSV (.csv)', value:'csv', ext: '.csv'}
			]
		});
		
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
							id: 'cmbLayer',
							editable: false,
							store: layerStore,
							displayField: 'display',
							valueField: 'value',
							fieldLabel: 'Layer',
							emptyText: 'Select layer to download'
						},
						{
							xtype: 'combo',
							id: 'cmbType',
							editable: false,
							store: typeStore,
							displayField: 'display',
							valueField: 'value',
							fieldLabel: 'Save as',
							emptyText: 'Select file type'
						},
						{
							xtype: 'textfield',
							id: 'txtFilename',
							fieldLabel: 'Filename',
							emptyText: 'enter a filename'
						},
						{
							xtype: 'button',
							text: 'Download',
							height: 30,
							handler: function(){

								var cmbType = Ext.getCmp("cmbType");
							
								var layerId = Ext.getCmp("cmbLayer").getValue();
								var outputFormat = cmbType.getValue();
								var layer = map.getLayer(layerId);
								var typeName = layer.params.LAYERS;
								var cql_filter = layer.params.CQL_FILTER;
								
								var record = cmbType.findRecordByValue(outputFormat);
								var ext = record.get("ext");
								
								var fileName = Ext.getCmp("txtFilename").getValue();
							
								
								var fileName = fileName + ext;
			
								
								
								var params= [
									['typeName', typeName],
									['outputFormat', outputFormat],
									['cql_filter', cql_filter],
									['fileName', fileName],
								];
								
								
								
								var hidden_form = PGP.common.Utilities.download("/webapi/api/util/download/", params);
								
								
							}
						}
					
					]
				}
			]					
		});
		this.callParent(arguments);
	}

});


/*
service:WFS
version:1.0.0
request:GetFeature
typeName:geoportal:mgd_geodeticcontrol
maxFeatures:50
outputFormat:json
cql_filter:stat_name

http://geoserver.namria.gov.ph:8080/geoserver/geoportal/ows?service=WFS&version=1.0.0&request=GetFeature
&typeName=geoportal:mgd_geodeticcontrol
&outputFormat=json
&cql_filter=stat_name='MMA-1'

*/


Ext.onReady(function(){

	initMap();

	var win = Ext.create('PGP.view.DownloadLayer', { 
		title: 'Set download options', 
		map: map
	});
	
	win.show();
	
	

});


function initMap(){
	map = new OpenLayers.Map( 'map' );
	
	var gnis = new OpenLayers.Layer.WMS(
		"Geodetic control points", 
		"http://geoserver.namria.gov.ph:8080/geoserver/geoportal/wms",
		{
			layers: 'geoportal:mgd_geodeticcontrol',
			styles: '',
			transparent: true,
			cql_filter: 'stat_name=\'MMA-1\''
		},
		{
		   singleTile: false, 
		   ratio: 1, 
		   isBaseLayer: false
		} 
	);
	var schools = new OpenLayers.Layer.WMS(
		"Schools", 
		"http://geoserver.namria.gov.ph:8080/geoserver/geoportal/wms",
		{
			layers: 'geoportal:deped_school',
			styles: '',
			transparent: true
		},
		{
		   singleTile: false, 
		   ratio: 1, 
		   isBaseLayer: true
		} 
	);
	map.addLayers([schools,gnis]);
	
	var extent = new OpenLayers.Bounds(105.50514892578,1.750910644531,138.99147705078,22.932551269531);
	
	map.zoomToExtent(extent);	

}

