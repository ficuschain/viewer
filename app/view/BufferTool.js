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

Ext.define('PGP.view.BufferTool', {
	alias: 'widget.pgp_buffer',
	extend: 'Ext.Window',	
	title: 'Buffer',
	layout: 'fit',
	vectorLayer: null,
	queryIntersection: function(sql){
		var retVal = null;
		var url = "/webapi/api/util/querytableasjson";
		Ext.Ajax.request({   
			async: false, 
	        method: "POST",
	        url: url,
			params: { '': sql},
	        success: function (response) {
	            var obj = Ext.decode(response.responseText);
				retVal = PGP.common.Utilities.queryToFeatureCollection(obj.result);
	        },
	        failure: function (e, jqxhr) {
	            console.log(e.status);
	        }
	    }); 
		return retVal;
	},
	/*
		distance = distance
		unit = unit
		geom = geometry to create buffer with
	*/
	buffer: function(distance, unit, geom){
		var me = this;
		var resolutions = [ 3968.75793751588, 
						2645.83862501058, 
						1322.91931250529, 
						661.459656252646, 
						264.583862501058, 
						132.291931250529, 
						66.1459656252646, 
						26.4583862501058, 
						13.2291931250529, 
						6.61459656252646, 
						2.64583862501058, 
						1.32291931250529, 
						0.661459656252646 ];
						
		console.log('buffer:254.12');
		var intersectLayers = [];

		for(var index = me.map.layers.length-1;index >= 0;index--){
			var layer = me.map.layers[index];
			if(layer instanceof OpenLayers.Layer.WMS &&
				(!this.queryVisible || layer.getVisibility()) &&
			     !layer.isBaseLayer) {
					
				// make sure this is a WMS layer and the layer is visible and the layer is an overlay
				var layerName = layer.params.LAYERS.replace("geoportal:","");
				var style = layer.params.STYLES;
				var title = layer.name;
				//xxx
				
				intersectLayers.push({layerName:layerName, style:style, title:title});
			}
		}
		
					 
		var displayLayer = me.vectorLayer;
		
		
		var wpsClient = new OpenLayers.WPSClient({
			servers: {
				//local: 'http://202.90.149.232/geoserver/wps'
				local: 'http://geoserver.namria.gov.ph/geoserver/wps'
				//local: 'http://192.168.8.20:8080/geoserver/wps'
			}
		});

		wpsClient.execute({
			server: 'local',
			process: 'JTS:buffer',
			inputs: {
				geom: geom,
				distance: distance * unit
			},
			success: function(outputs){
				
				var bufferFeature = outputs.result[0];
				bufferFeature.style = {
					strokeOpacity: 0.5,
					strokeColor: '#000000',
					strokeDashstyle: 'dot',
					fillOpacity: 0.5,
					fillColor: '#ffffff'
				};
				displayLayer.addFeatures([bufferFeature]);
	
				var geoJsonFormat = new OpenLayers.Format.GeoJSON();
				var geoJsonString = geoJsonFormat.write(outputs.result[0].geometry);
				
				for(var item in intersectLayers){
					var layer = intersectLayers[item];
					var config = PGP.common.Utilities.getLayerConfig(layer.layerName,layer.style)	
					var sql = me.generateSql(layer.layerName, config, geoJsonString);
					var result = me.queryIntersection(sql);	
					
					
					// TODO: review
					var geojsonString = JSON.stringify(result);
					var geojsonFormat = new OpenLayers.Format.GeoJSON();
					geojsonFormat.ignoreExtraDims = true;
					var features = geojsonFormat.read(geojsonString);
					
					console.log(geojsonString,result);
					displayLayer.addFeatures(features);
					
	
					var data = [];
					for(var item in features){
						var feature = features[item];
						var attributes = feature.attributes;
						attributes["WKB_GEOM_BOUNDS"] = feature.geometry.bounds;
						data.push(attributes);
						
					}

					var structure = data[0];
					var columns = [];
					var fields = [];
					for(var item in structure){
						fields.push(item);
						if(item === 'WKB_GEOM_BOUNDS') continue;
						columns.push({text:item, dataIndex:item, flex:1});
					}
					
					var store = Ext.create('Ext.data.Store', {
						fields: fields,
					    data: data,
					    proxy: {
					        type: 'memory',
					        reader: {
					            type: 'json'
					        }
					    }
					});
					
					var grid = Ext.create('Ext.grid.Panel', {
					    title:  layer.title + ' (' + data.length +')',
					    store: store,
					    columns: columns,
						listeners: {
							selectionchange: function(grid,record) {
								
								
								var bounds = record[0].data.WKB_GEOM_BOUNDS;
								//me.map.zoomToExtent(bounds);  --modified 3/19/2015
								var pgp_basemap_cache =me.map.getLayersByName("NAMRIA Basemaps")[0];
								for(var i = me.map.getNumZoomLevels(); i > 0; i--)
									{
										var res =resolutions[i-1];   

										//tile center
										var originTileX = (pgp_basemap_cache.tileOrigin.lon + (res * pgp_basemap_cache.tileSize.w/2)); 
										var originTileY = (pgp_basemap_cache.tileOrigin.lat - (res * pgp_basemap_cache.tileSize.h/2));

										var center = bounds.getCenterLonLat();
										var point = { x: center.lon, y: center.lat };
										var x = (Math.round(Math.abs((center.lon - originTileX) / (res * pgp_basemap_cache.tileSize.w)))); 
										var y = (Math.round(Math.abs((originTileY - center.lat) / (res * pgp_basemap_cache.tileSize.h)))); 
										var z =i-1;                                                             
										
										
										 url = pgp_basemap_cache.url + '/tile/' + z + '/' + y + '/' + x;		
									
										var request = OpenLayers.Request.HEAD({
											//url: "http://202.90.149.252/ArcGIS/rest/services/Basemap/PGS_Basemap/MapServer/tile/2/55/99",
											url:url,
											proxy: "/webapi/get.ashx?url=",											
											async: false
											//callback: handler
										});
										
										
										var hasher = function(s){
										  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
										};
																										
										var hash;
										//Ext.Ajax.cors=true;
										
										Ext.Ajax.request({
										  url:'/webapi/get.ashx?url=' + url,
										  //url:url,
										  async: false,
										  success:function(response, request) {
											
											console.log("sadasda");
											// 720067505 == Map data not available
											hash = hasher(response.responseText);
											
											
										  }
										});
										
										if(hash != "720067505") {
											me.map.setCenter(center,i-1);
											break;
										}																
					
																							
										/* if(request.status=='200')
										{
												console.log(url + ' - ' + request.status);
												map.setCenter(pointCenter,i-1);
												break;
										} */
											
									}
							}
						}
					});
					
					var pnlResult = Ext.getCmp('pnlResult');
					pnlResult.add([grid]);

				}
			
			}
		});

	},
	generateSql: function(layerName, layerConfig, buffer){
		var columns = [];
		for(var item in layerConfig.config){
			var column = layerConfig.config[item];
			columns.push(column.attribute + ' as "' + column.alias + '"');
		}
		return 'select st_asgeojson(st_transform(wkb_geometry,900913)) as geojson, ' + columns.join(',') + ' from ' + layerName + " where st_intersects(wkb_geometry,st_transform(st_setsrid(st_geomfromgeojson('" + buffer + "'),900913),st_srid(wkb_geometry)));";
	},
	initComponent: function() {
		var me = this;

		me.resultPanel = {
			xtype: 'panel',
			title: 'Result',
			layout: 'accordion'
			
		};
	
		var layerParam = this.layers; 	

		var sketchSymbolizers = {
            "Point": {
                pointRadius: 0,
                graphicName: "square",
                fillColor: "white",
                fillOpacity: 0,
                strokeWidth: 1,
                strokeOpacity: 1,
                strokeColor: "#333333"
            },
            "Line": {
                strokeWidth: 1,
                strokeOpacity: 1,
                strokeColor: "#666666",
                strokeDashstyle: "solid"
            },
            "Polygon": {
                strokeWidth: 2,
                strokeOpacity: 1,
                strokeColor: "#666666",
                fillColor: "#FF8000",
                fillOpacity: 0
            }
        };
		
        var style = new OpenLayers.Style();
        style.addRules([
            new OpenLayers.Rule({symbolizer: sketchSymbolizers})
        ]);
        var styleMap = new OpenLayers.StyleMap({"default": style});
		
		// allow testing of specific renderers via "?renderer=Canvas", etc
		var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
		//renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;
		renderer=["Canvas","SVG","VML"];
		console.log("renderer",renderer);
		this.vectorLayer = new OpenLayers.Layer.Vector("Vector Layer", {
			renderers: renderer,
			styleMap: new OpenLayers.StyleMap({ 
				fillOpacity: 0,
				strokeColor: '#ff0000',
				pointRadius: 5
			}),
			displayInLayerSwitcher: false
		});

		this.map.addLayer(this.vectorLayer);
		
		var selectControl = new OpenLayers.Control.SelectFeature(me.vectorLayer, { multiple: true});
		
		var controls = {
			point: new OpenLayers.Control.DrawFeature(me.vectorLayer,
						OpenLayers.Handler.Point, {
                        persist: true,
						featureAdded: function(feature){
							feature.style = {
								pointRadius: 2,
				                fillOpacity: 0.5,
								fillColor: '#ffffff',
								strokeColor: '#000000'
				            };
							selectControl.select(feature);
						},
                        handlerOptions: {
                            layerOptions: {
                                renderers: renderer,
                                styleMap: styleMap
                            }
                        }}),
			line: new OpenLayers.Control.DrawFeature(me.vectorLayer,
						OpenLayers.Handler.Path, {
                        persist: true,
						featureAdded: function(feature){
							feature.style = {
								strokeColor: '#000000',
								strokeOpacity: 0.5,
								strokeDashstyle: 'dash'
				            };
							selectControl.select(feature);
						},
                        handlerOptions: {
                            layerOptions: {
                                renderers: renderer,
                                styleMap: styleMap
                            }
                        }}),
			polygon: new OpenLayers.Control.DrawFeature(me.vectorLayer,
						OpenLayers.Handler.Polygon, {
                        persist: true,
						featureAdded: function(feature){
							feature.style = {
				                fillOpacity: 0.5,
								fillColor: '#ffffff',
								strokeColor: '#000000',
								strokeOpacity: 0.5,
								strokeDashstyle: 'dot'
				            };
							selectControl.select(feature);
						},
                        handlerOptions: {
                            layerOptions: {
                                renderers: renderer,
                                styleMap: styleMap
                            }
                        }}),
			circle: new OpenLayers.Control.DrawFeature(me.vectorLayer,
						OpenLayers.Handler.RegularPolygon,
						{
							featureAdded: function(feature){
								feature.style = {
					                fillOpacity: 0.5,
									fillColor: '#ffffff',
									strokeColor: '#000000',
									strokeOpacity: 0.5,
									strokeDashstyle: 'dot'
					            };
								selectControl.select(feature);
							},
							handlerOptions: {sides: 40}
						}),
			//modify: new OpenLayers.Control.ModifyFeature(me.vectorLayer),
			select: selectControl
		};

		for(var key in controls) {
			this.map.addControl(controls[key]);
		}
		
		var drawingButtons = [
			{
				xtype: 'button',
				text: 'Point',
				icon: 'resources/img/point.png',
				scale: 'large',
				toggleGroup: 'navigation',
				handler: function(){
					me.toggle('point');
					Ext.getCmp('mappanel').body.applyStyles('cursor:default');
				}
			},
			{
				xtype: 'button',
				text: 'Line',
				icon: 'resources/img/line.png',
				scale: 'large',
				toggleGroup: 'navigation',
				handler: function(){
					me.toggle('line');
					Ext.getCmp('mappanel').body.applyStyles('cursor:default');
				}
			},
			{
				xtype: 'button',
				text: 'Circle',
				icon: 'resources/img/circle.png',
				scale: 'large',
				toggleGroup: 'navigation',
				handler: function(){
					me.toggle('circle');
					Ext.getCmp('mappanel').body.applyStyles('cursor:default');
				}
			},
			{
				xtype: 'button',
				text: 'Polygon',
				icon: 'resources/img/polygon.png',
				scale: 'large',
				toggleGroup: 'navigation',
				handler: function(){
					me.toggle('polygon');
					Ext.getCmp('mappanel').body.applyStyles('cursor:default');
				}
			}
		];
		
		var bufferParameters = [
			{
				xtype: 'textfield',
				id: 'txtDistance',
				emptyText: 'Enter distance',
				width: 100
			},
			{
				xtype: 'combo',
				id: 'cmbUnit',
				store: ['Kilometers', 'Meters', 'Miles', 'Feet'],
				editable: false,
				width: 80,
				value: 'Kilometers'
			},
			{
				xtype: 'button',
				text: 'Buffer',
				handler: function(){
					var distance = txtDistance.getValue();
					var unit = 0;

					var newValue  = cmbUnit.getValue();
					if(newValue == 'Kilometers'){
						unit = 1000;
					} else if (newValue == 'Miles') {
						unit=1609.34;
					} else if (newValue == 'Feet') {
						unit=0.3048;
					} else {
						unit=1;
					}
					var geom = me.vectorLayer.selectedFeatures;
					me.buffer(distance,unit, geom);
				} 
			},{
				xtype: 'button',
				text: 'Reset',
				 handler: function(){
					txtDistance.setValue('');
					me.vectorLayer.removeAllFeatures();
					var pnlResult = Ext.getCmp('pnlResult');
					pnlResult.removeAll();
				} 
			}];
		
		
		Ext.apply(me, {
			activeControl: null,
			controls:controls,
			items: { 	
				xtype: 'panel',
				id: 'pnlParent',
				layout: {
					type: 'vbox',
					align: 'stretch'
				},
				defaults: {
					border: false
				},
			 	margin: '10 10 10 10',
			 	items: [ 
					{ 	xtype: 'panel',	
						title: 'Drawing tools',
						items: drawingButtons,
						defaults: {	
							margin: '5 5 5 5'
						},
					},{ 	
						xtype: 'panel',
						title: 'Buffer parameters',
						items: bufferParameters,
						defaults: {	
							margin: '5 5 5 5'
						},
						layout:{
							type:'hbox',
							pack: 'center'
						}
					
					},{
						xtype:'panel',
						id: 'pnlResult',
						title: 'Result',
						flex: 1,
						width: 350,
						height: 200,
						layout: {
					        type: 'accordion',
					        titleCollapse: false,
					        animate: true,
					        activeOnTop: true
						}
						
					}
				]
			}
			
		});
		
		this.callParent(arguments);
		var txtDistance = Ext.getCmp('txtDistance');
		var cmbUnit = Ext.getCmp('cmbUnit');
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
		this.map.removeLayer(this.vectorLayer);
		
	},
	listeners: {
		close: function(){
			this.cleanup();
		}
	}
	
});


