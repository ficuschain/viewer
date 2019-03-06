/*
This file is part of PG Map Viewer.

Copyright (c) 2013 National Mapping and Resource Information Authority

PG Map Viewer is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

PG Map Viewer is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with PG Map Viewer.  If not, see <http://www.gnu.org/licenses/>.
*/

Ext.define('PGP.view.DownloadLayer', {
	alias: 'widget.pgp_downloadlayer',
	extend: 'Ext.Window',	
	width: 250,
	layout: 'fit',
	modal: true,
	map: null,
	initComponent: function() {
		var me = this;

		
		
		var layers = [];
		
		Ext.each(me.map.layers, function(layer, index){ 
			if(!layer.isBaseLayer)
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
				//{display:'PDF (.pdf)', value:'pdf', ext: '.pdf'},
				//{display:'JPG (.jpg)', value:'jpg', ext: '.jpg'},
				//{display:'PNG (.png)', value:'png', ext: '.png'}
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
							emptyText: 'Select file type',
							listeners: {
								change: function(){
									var txtSecret = Ext.getCmp("txtSecret");
									if(this.getValue() == "pdf" ||
									   this.getValue() == "jpg" ||
									   this.getValue() == "png" ){
									   txtSecret.hide();
									} else {
										txtSecret.show();
									}
										
								}
							}
						},
						{
							xtype: 'textfield',
							id: 'txtFilename',
							fieldLabel: 'Filename',
							emptyText: 'enter a filename'
						},
						{
							xtype: 'textfield',
							id: 'txtSecret',
							fieldLabel: 'Secret',
							inputType: 'password'
						},
						{
							xtype: 'button',
							text: 'Download',
							height: 30,
							handler: function(){
							
								

								var cmbType = Ext.getCmp("cmbType");
							
								var layerId = Ext.getCmp("cmbLayer").getValue();
								var outputFormat = cmbType.getValue();
								var layer = me.map.getLayer(layerId);
								var typeName = (layer.params.layers || layer.params.LAYERS);
								var cql_filter = (layer.params.cql_filter || layer.params.CQL_FILTER);
								var styles = (layer.params.styles || layer.params.STYLES);
								var bbox = me.map.getExtent().toString();
								
								var record = cmbType.findRecordByValue(outputFormat);
								var ext = record.get("ext");
								
								var fileName = Ext.getCmp("txtFilename").getValue();
							
								
								var fileName = fileName + ext;
			
								var secret = Ext.getCmp("txtSecret").getValue();
								
								var params= [
									['typeName', typeName],
									['outputFormat', outputFormat],
									['cql_filter', cql_filter],
									['fileName', fileName],
									['secret', secret],
									['styles', styles],
									['bbox', bbox]
								];
								
							
								// TODO: Fix this! This is temporary!
								
								if(layer.metadata.agency != "NAMRIA" && secret == ""){
									Ext.Msg.alert('Sorry!', 'At the moment, only PDF, JPG, and PNG format from <br> NAMRIA dataset are available for download.');
									return;
								}
							   
								try {
									var hidden_form = PGP.common.Utilities.download("/webapi/api/util/download/", params);
								} catch(err){
									console.log(err);
								}
								me.close();
								
								
								
							}
						},
						{
							xtype: 'label',
							text: 'Downloading of datasets in GIS or machine-processable format is not permitted at this time pending finalization of data licensing agreement between NAMRIA and the data sources.  For further clarification, please email geoportal@namria.gov.ph.'
							
						}
					
					]
				}
			]					
		});
		this.callParent(arguments);
	}

});