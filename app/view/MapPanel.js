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

Ext.define('PGP.view.MapPanel', {
    alias: 'widget.pgp_map',
    extend: 'GeoExt.panel.Map',
	requires: [
		'GeoExt.Action',
		'GeoExt.window.Popup',
		'GeoExt.state.PermalinkProvider',
		'PGP.view.ExportMap'
	],

	xtype: 'gx_mappanel', 
	id: 'mappanel',
	title: 'GeoExt Map Panel',
	layout: 'border',
	region: 'center',
	border: false,
	header: false,
	stateful: true,
    initComponent: function() {
		
		var me = this;
		
		console.log("server: 254.11");
		OpenLayers.ProxyHost = "/webapi/get.ashx?url=";
		
		var maxExtent = new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34);
		//var layerMaxExtent = new OpenLayers.Bounds(11128623.5489416,-55718.7227285097,16484559.8541582,3072210.74548981);
		var layerMaxExtent = PGP.settings.defaultExtent;
		var units = 'm';
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
							
		
		var resolutions2=[ 18000,17000,16000,15000,14000,13000,
						  2445.9849047851562,
						  1222.9924523925781,
						  611.4962261962891,
						  305.74811309814453,
						  52.87405654907226,
						  76.43702827453613,
						  38.218514137268066,
						  19.109257068634033,
						  9.554628534317017,
						  4.777314267158508,
						  2.388657133579254,
						  1.194328566789627,
						  0.5971642833948135,
						 ]
		
		
						  
		var tileSize = new OpenLayers.Size(256, 256);
		var projection = 'EPSG:900913';
		var tileOrigin = new OpenLayers.LonLat(-20037508.342787,20037508.342787);
		
		var mousePositionControl = new OpenLayers.Control.MousePosition();
		var map = new OpenLayers.Map('map', {
			controls: [
                        new OpenLayers.Control.Navigation(),
                        new OpenLayers.Control.ScaleLine(),
                        mousePositionControl
                    ]	,
			maxExtent: maxExtent,
			StartBounds: layerMaxExtent,
			units: units,
			resolutions: resolutions2,
			tileSize: tileSize,
			projection: projection,
			restrictedExtent: layerMaxExtent,			
			fallThrough: true,
			
			//change display projection to decimal degrees
			displayProjection: new OpenLayers.Projection('EPSG:4326')
		});
		
		map.events.register('moveend', map, function(e){
			var xy = map.getCenter().transform("EPSG:900913","EPSG:4326");
			var sql="select region  || ', ' || province || ', ' || municity as location  from admin_bnd_munic_psgc where st_intersects(wkb_geometry,st_setsrid(st_makepoint("+ xy.lon +","+ xy.lat +"),4326))";
			Ext.Ajax.request({
				url: "/webapi/api/util/querytableasjson",
				params: {
					database: '',
					sql: sql
				},
				method: 'GET',
				success: function(r){
					var obj = Ext.decode(r.responseText);
					if(obj.result.length > 0)
						mousePositionControl.prefix = obj.result[0].location + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ";
					else
						mousePositionControl.prefix = "";
				}
			});
		
		});
		
		debugMap = map;
		
		
		var pgp_basemap_cache = new OpenLayers.Layer.XYZ(					//Use NAMRIA Basemap Tiles
					'NAMRIA Basemaps',
					'http://v2.geoportal.gov.ph/tiles/v2/PGP/${z}/${x}/${y}.png',
					{
						isBaseLayer: true,						
						sphericalMercator:true,					
						transitionEffect: "resize",								
						tileOrigin: tileOrigin,
						displayInLayerSwitcher: false  
						
			
				}
			);
			
		map.addLayer(pgp_basemap_cache);
	
		//New Ortho Metro Manila 
		var pgp_ortho_mm_cache = new OpenLayers.Layer.XYZ(					//Use NAMRIA Basemap Tiles
				'Ortho Image 2011 (selected areas)',
				'http://v2.geoportal.gov.ph/tiles/v2/Orthoimage/${z}/${x}/${y}.png',
				{
					isBaseLayer: true,						
					sphericalMercator:true,
					displayInLayerSwitcher: false
						
			    }
		);
		map.addLayer(pgp_ortho_mm_cache);
		
		//Ortho Image 2013-2014 selected areas
		var pgp_ortho_yolanda = new OpenLayers.Layer.XYZ(					//Use NAMRIA Basemap Tiles
				'Ortho Image 2013-2014 (selected areas)',
				'http://v2.geoportal.gov.ph/tiles/v2/Ortho_Image_Yolanda/${z}/${x}/${y}.png',
				{
					isBaseLayer: true,						
					sphericalMercator:true,
					displayInLayerSwitcher: false
						
			    }
		);
		map.addLayer(pgp_ortho_yolanda);
		
		
		//New ORI Basemap
		var pgp_basemap_ORI = new OpenLayers.Layer.XYZ(					//Use NAMRIA Basemap Tiles
					'NAMRIA Ortho Rectified Radar Image',
					'http://v2.geoportal.gov.ph/tiles/v2/NAMRIA_ORI/${z}/${x}/${y}.png',
					{
						isBaseLayer: true,						
						sphericalMercator:true,					
						transitionEffect: "resize",								
						tileOrigin: tileOrigin,
						displayInLayerSwitcher: false  
						
			
				}
			);
			
		map.addLayer(pgp_basemap_ORI);
		
	
	
		// prepare other base map
		var bing_aerial = new OpenLayers.Layer.Bing({
			name: "BING Aerial Map",
			key: PGP.settings.BING_API_KEY,
			type: "Aerial",
			displayInLayerSwitcher: false
			
		}, {
			isBaseLayer: true,
			visibility: false,
			transitionEffect: "resize"
		});
		map.addLayer(bing_aerial);
		
		var arcgis_world_imagery = new OpenLayers.Layer.ArcGIS93Rest("ArcGIS Online - Imagery", 
		'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export',
		{
			layers: 'show:0,1,2,3',
			format: 'png24'
		}, 
		{
			//additional options
			transitionEffect: "resize",
			isBaseLayer: true,
			displayInLayerSwitcher: false
		});
		map.addLayer(arcgis_world_imagery);
		
		var osm  = new OpenLayers.Layer.OSM("","",
		{
			sphericalMercator: true,
			transitionEffect: "resize",
			isBaseLayer: true,
			displayInLayerSwitcher: false
		});
		map.addLayer(osm);
		
		
		var google_satellite = new OpenLayers.Layer.Google(
                "Google Map - Satellite",
                {
					type: google.maps.MapTypeId.SATELLITE, 
					//numZoomLevels: 22, changed on 6.5.15
					numZoomLevels: 19,
					sphericalMercator: true,
					transitionEffect: "resize",
					isBaseLayer: true,
					displayInLayerSwitcher: false
				}
        );
		map.addLayer(google_satellite);
		
		
		OpenLayers.Control.PGSGetFeatureInfo = OpenLayers.Class(OpenLayers.Control, {                
			defaultHandlerOptions: {
				'single': true,
				'double': false,
				'pixelTolerance': 0,
				'stopSingle': false,
				'stopDouble': false
			},
			maxFeatures: 1,
			queryVisible: true,
			initialize: function(options) {
				this.handlerOptions = OpenLayers.Util.extend(
					{}, this.defaultHandlerOptions
				);
				OpenLayers.Control.prototype.initialize.apply(
					this, arguments
				); 
				this.handler = new OpenLayers.Handler.Click(
					this, {
						'click': this.click
					}, this.handlerOptions
				);
			}, 
			queryLayer: function(e, layer){
				
				var layer_name = (layer.params.LAYERS || layer.params.layers).replace("geoportal:","");
				var url = layer.url + "?" + 
							"request=GetFeatureInfo" + 
							"&service=WMS" + 
							"&version=1.1.1" + 
							"&layers=" + layer_name + 
							"&styles=" + (layer.params.STYLES || layer.params.styles) +  
							"&srs=" + (layer.params.SRS || layer.params.srs) + 
							"&format=" + (layer.params.FORMAT || layer.params.format) + 
							"&bbox=" + map.getExtent().toString()+  
							"&width=" + map.getSize().w + 
							"&height=" + map.getSize().h + 
							"&query_layers=" + (layer.params.LAYERS || layer.params.layers) + 
							"&info_format=application/json" + 
							"&feature_count=" + this.maxFeatures + 
							"&x=" + e.xy.x + 
							"&y=" + e.xy.y + 
							"&exceptions=application/json";
							//"&exceptions=application%2Fvnd.ogc.se_xml";
				
				var retVal;
				
				
				Ext.Ajax.request({
					async: false,
					url: '/webapi/get.ashx?url=' + escape(url),
					success: function(response){
						var obj = Ext.decode(response.responseText);	
						retVal = obj.features;
 					}
				});
				
				return retVal;
			},
			click: function(e) {
				
				
				OpenLayers.Element.addClass(this.map.viewPortDiv, "olCursorWait");
				
				for(var index = map.layers.length-1;index >= 0;index--){
					var layer = this.map.layers[index];
					if(layer instanceof OpenLayers.Layer.WMS &&
						(!this.queryVisible || layer.getVisibility())) {
						// make sure this is a WMS layer and the layer is visible
						var features = this.queryLayer(e, layer);
						if(features.length == 0)
							continue;
						this.events.triggerEvent("getfeatureinfo", {xy: e.xy, 
																	layerName: (layer.params.LAYERS || layer.params.layers), 
																	layerTitle: layer.name, 
																	style: (layer.params.STYLES || layer.params.styles),
																	features: features});	
						OpenLayers.Element.removeClass(this.map.viewPortDiv, "olCursorWait");
						break;
					}
				}
				
				OpenLayers.Element.removeClass(this.map.viewPortDiv, "olCursorWait");
				
			}

		});

		
		var pgsGetFeatureInfo = new OpenLayers.Control.PGSGetFeatureInfo({
			eventListeners: {
				'getfeatureinfo' : function(e){
				
					if(e.features.length == 0)
						return;
						
					var feature = e.features[0];
				
					var layer_name = e.layerName.replace("geoportal:","");
					var style = e.style;
					var layer_config = PGP.common.Utilities.getLayerConfig2(layer_name, style);

					var data2=[]
					console.log(layer_config);
					console.log(feature);
					
					Ext.each(layer_config.config, function(item, index){
						
						if (feature.properties[item.attribute]==undefined){
							return;
						}else{	
							data2.push({"Name":item.alias,"Value" : feature.properties[item.attribute], "Description":item.description});
						}	
						
					});
					
		
					var data = Ext.create('Ext.data.Store', {
							storeId:'attributeStore',
							fields:['Name', 'Value', 'Description'],
					});
					
					data.loadData(data2,false);
				
					var grid=Ext.create('Ext.grid.Panel',{
						columns:[{
									text:'Name',
									dataIndex:'Name',
									sortable: false,
									hideable: false,
								 },
								 {
									text:'Value', 
									dataIndex:'Value',
									sortable: false,
									hideable: false,
								  }, 
								  {
									text:'Description', 
									dataIndex:'Description',
									flex:1,
									sortable: false,
									hideable: false,
								   }
								  ],
						store:data,
						overflow:true,
						hideHeaders: false,
						sortableColumns: false,
						viewConfig : 
									{
										enableTextSelection: true
									},
					}); 		

						
					var popup = Ext.create('GeoExt.window.Popup', {
						maximizable: false,
						//collapsible: true,
						anchorPosition: 'top-left',
						title: layer_config.title,
						maxHeight: 300,
						width: 340,
						layout: "fit",
						map: map,
						location: e.xy,
						tools:[
							{
								xtype:'button',
								text:'View metadata',
								handler:function(){
									getMetadata(e.layerName, e.layerTitle);
									//popup.close();
								}
							},
						],
						items: [
							
							grid
						
						],
						autoScroll:true,
					});
					popup.show();
				}
			}
		});
		
		map.addControl(pgsGetFeatureInfo);
		pgsGetFeatureInfo.activate();
		
		var items = [];
		
		// zoom in
		items.push(
			Ext.create('Ext.button.Button', Ext.create('GeoExt.Action', {
				control: new OpenLayers.Control.ZoomBox(),
				id: 'btnZoomIn',
				map: map,
				iconCls: 'add',
				iconAlign: 'top',
				icon: 'resources/img/zoom_in.png',
				scale: 'large',
				width: 35, 
				height: 35,
				toggleGroup: 'navigation',
				allowDepress: false,
				tooltip: 'Zoom in',
				handler: function() {
				  if (navigator.appName == "Microsoft Internet Explorer") {
					Ext.getCmp('mappanel').body.applyStyles('cursor:url("img/zoom_in.cur")');
				  }
				  else {
					Ext.getCmp('mappanel').body.applyStyles('cursor:crosshair');
				  }
				}
			}))
		);
		
		// zoom out
		items.push(
			Ext.create('Ext.button.Button', Ext.create('GeoExt.Action', {
				control: new OpenLayers.Control.ZoomBox({out: true}),
				id: 'btnZoomOut',
				map: map,
				iconCls: 'add',
				iconAlign: 'top',
				icon: 'resources/img/zoom_out.png',
				toggleGroup: 'navigation',
				tooltip: 'Zoom out',
				scale: 'large',
				width: 35, 
				height: 35,
				handler: function() {
				  if (navigator.appName == "Microsoft Internet Explorer") {
					Ext.getCmp('mappanel').body.applyStyles('cursor:url("img/zoom_in.cur")');
				  }
				  else {
					Ext.getCmp('mappanel').body.applyStyles('cursor:crosshair');
				  }
				}
			}))
		);
		
		// pan
		items.push(
			Ext.create('Ext.button.Button', Ext.create('GeoExt.Action', {
				control: new OpenLayers.Control.DragPan(),
				id: 'btnPan',
				map: map,
				iconCls: 'add',
				iconAlign: 'top',
				icon: 'resources/img/identify.png',
				scale: 'large',
				width: 35, 
				height: 35,
				toggleGroup: 'navigation',
				tooltip: 'Pan/Identify',
				pressed: true,
				handler: function() {
					Ext.getCmp('mappanel').body.applyStyles('cursor:default');
				},
				listeners: {
					toggle: function(e){
						if(e.pressed) {
							//info.activate();
							pgsGetFeatureInfo.activate();
						} else {
							//info.deactivate();
							pgsGetFeatureInfo.deactivate();
						}
					}
				}
			}))
		);
		
		// full extent
		items.push(
			Ext.create('Ext.button.Button', {
				id: 'btnFullExtent',
				iconAlign: 'top',
				icon: 'resources/img/phil.png',
				scale: 'large',
				width: 35, 
				height: 35,
				tooltip: 'Full extent',
				handler: function() {
					// set default zoom level
					var lonlat = new OpenLayers.LonLat(121,14).transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));
					map.setCenter(lonlat);
					if (map.baseLayer.name=="BING Aerial Map")
						map.zoomTo(5);
					else if (map.baseLayer.name=="OpenStreetMap")
						map.zoomTo(6);
					else if (map.baseLayer.name=="Google Map - Satellite")
						map.zoomTo(6);
					else if (map.baseLayer.name=="Ortho Image 2011 - Metro Manila")
						map.zoomTo(1);	
					else
						map.zoomTo(6);
					

					//console.log(map.baseLayer.name);		
				}
			})
		);
		
				
		// tools
		items.push(
			'-',
			{
				text: 'Tools',
				id: 'btnTools',
				icon: 'resources/img/tools.png',
				scale: 'large',
				width: 50, 
				height: 35,
				tooltip: 'Tools',
				menu: [
					{
						text: 'Goto XY',
						handler: function(){
							
							
							var win = Ext.create('PGP.view.GotoXY', { 
								title: 'Goto XY',
								map: map
							});
							
							win.show();
							
							
							
						}
					},
					{
						text: 'Measure',
						handler: function(){

							if(!Ext.getCmp('measureToolWindow')){
								var win = Ext.create('PGP.view.MeasureTool', { 
									map: map,
									id: 'measureToolWindow'
								});
								
								var rightpanel = Ext.getCmp('rightpanel');
								var x = rightpanel.getPosition()[0] - win.width - 10;

								
								win.showAt(x,85,false);
							}
							
							
							
							
						}
					},
					{
						text: 'Buffer',
						handler: function(){

							

							

							if(!Ext.getCmp('bufferToolWindow')){
								var win = Ext.create('PGP.view.BufferTool', { 
									map: map,
									id: 'bufferToolWindow',
									collapsible: true
								});
								
								var rightpanel = Ext.getCmp('rightpanel');
								var x = rightpanel.getPosition()[0] - win.width - 10;

								
								win.showAt(x,85,false);
							}
							
							
						}
					}
				]
			}
		);
		
		items.push(
			'-',
			{ 
				xtype: 'pgp_searchfield',
				id: 'txtSearch',
				listeners: {
					select: function(rec){
						var bounds = new OpenLayers.Bounds(rec.get('lng'), rec.get('lat'), rec.get('lng'), rec.get('lat'));	
						map.zoomToExtent(bounds.transform("EPSG:4326", "EPSG:900913"));
						
						var pgp_basemap = map.getLayersByName("NAMRIA Basemaps")[0];
						console.log('BASEMAP---',pgp_basemap_cache);
						for(var i = map.getNumZoomLevels(); i > 0; i--)
						
						{	
							
							var res =resolutions2[i-1];  															
															//tile center
															var originTileX = (pgp_basemap.tileOrigin.lon + (res * pgp_basemap.tileSize.w/2)); 
															var originTileY = (pgp_basemap.tileOrigin.lat - (res * pgp_basemap.tileSize.h/2));
															
															var center = bounds.getCenterLonLat();
															var point = { x: center.lon, y: center.lat };
															var x = (Math.round(Math.abs((center.lon - originTileX) / (res * pgp_basemap.tileSize.w)))); 
															var y = (Math.round(Math.abs((originTileY - center.lat) / (res * pgp_basemap.tileSize.h)))); 
															var z =i-1;                                                             
															
															
															 url = 'http://202.90.149.251/tiles/v2/PGP/' +  z + '/' + x + '/' + y + '.png';	
															
															var hasher = function(s){
															  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
															};
																															
															var hash;
															Ext.Ajax.request({
															  url:'/webapi/get.ashx?url=' + url,
															  async: false,
															  success:function(response, request) {
																
																
																// 720067505 == Map data not available
																hash = hasher(response.responseText);
															   },
															   failure:function(response, request){
																  hash = hasher(response.responseText)
															   }
															});
															//-1867004495 - not found
															//added hash for production server hash!='-1526219151'
															console.log('************************', hash)
															if(hash != "1786305461" && hash!="1821642261" && hash != "-1867004495" && hash!="1150645012" && hash!='-1526219151') {
															//if(hash != "720067505") {
													
																map.setCenter(center,i-1);
																break;
															}	
																							
						}
						
					}
				}
			}
		);
		
		items.push(
			'->',
			{
				//xtype:'label',
				
				xtype:'tbtext',
				id:'basemapLabel',
				text: 'Basemap: NAMRIA Basemaps'
				
			},
			'->'
		
		
		)

		
		// download
		items.push(
			Ext.create('Ext.button.Button', {
				id: 'btnDownload',
				text: 'Download',
				icon: 'resources/img/download.png',
				scale: 'large',
				width: 35, 
				height: 35,
				tooltip: 'Download with Passcode',
				handler: function() {
					var win = Ext.create('PGP.view.LayerDownload', { 
						title: 'Download', 
						map: map
					});
					win.show();
				}
			})
		);
		
		
		// save as
		items.push(
		{
			text: 'Export',
			id: 'btnExportTool', 
			icon: 'resources/img/save.png',
			scale: 'large',
			width: 35, 
			height: 35,
			tooltip: 'Export map',
			handler: function(){
				var win = Ext.create('PGP.view.ExportMap', { 
					title: 'Export options', 
					map: map
				});
				win.show();
			}
	
		});
		
		
	
		
	
		// basemap
		var basemaplabel =  'Basemap : '

		items.push(
			{
				text: 'Basemap',
				id: 'btnBasemap',
				icon: 'resources/img/layers.png',
				scale: 'large',
				width: 50, 
				height: 35,
				tooltip: 'Switch basemap',
				menu     : [
					{
						text: 'NAMRIA Basemaps',
						group: 'basemap',
						checked: true,
						handler: function(){
							map.setBaseLayer(pgp_basemap_cache);
							//this.up().up().up().items.items[9].setText(basemaplabel + this.text);
							this.up('toolbar').getComponent('basemapLabel').setText('Basemap : ' + this.text);
						}
					},
					{
						//text: 'Ortho Image 2011 (selected areas)',
						text: 'Ortho Image 2011 (selected areas)',
						disable: true,
						group: 'basemap',
						checked: false,
						handler: function(){
							map.setBaseLayer(pgp_ortho_mm_cache);
							//this.up().up().up().items.items[9].setText(basemaplabel + this.text);
							this.up('toolbar').getComponent('basemapLabel').setText('Basemap : ' + this.text);
						}
					},{
						//text: 'Ortho Image 2011 (selected areas)',
						text: 'Ortho Image 2013-2014 (selected areas)',
						disable: true,
						group: 'basemap',
						checked: false,
						handler: function(){
							map.setBaseLayer(pgp_ortho_yolanda);
							//this.up().up().up().items.items[9].setText(basemaplabel + this.text);
							this.up('toolbar').getComponent('basemapLabel').setText('Basemap : ' + this.text);
						}
					},{
						//text: 'NAMRIA Ortho Rectified Radar Image,
						text: 'NAMRIA Ortho Rectified Radar Image',
						disable: true,
						group: 'basemap',
						checked: false,
						handler: function(){
							map.setBaseLayer(pgp_basemap_ORI);
							//this.up().up().up().items.items[9].setText(basemaplabel + this.text);
							this.up('toolbar').getComponent('basemapLabel').setText('Basemap : ' + this.text);
						}
					},
					 {
						text: 'Bing Maps - Aerial',
						disable: true,
						group: 'basemap',
						checked: false,
						handler: function(){
							map.setBaseLayer(bing_aerial);
							//this.up().up().up().items.items[9].setText(basemaplabel + this.text);
							this.up('toolbar').getComponent('basemapLabel').setText('Basemap : ' + this.text);
						}
					}, 
					{
						text: 'ArcGIS Online - Aerial',
						disable: true,
						group: 'basemap',
						checked: false,
						handler: function(){
							map.setBaseLayer(arcgis_world_imagery);
							//this.up().up().up().items.items[9].setText(basemaplabel + this.text);
							this.up('toolbar').getComponent('basemapLabel').setText('Basemap : ' + this.text);
						}
					}, 
					{
						text: 'Open Street Map',
						group: 'basemap',
						checked: false,
						handler: function(){
							map.setBaseLayer(osm);
							//this.up().up().up().items.items[9].setText(basemaplabel + this.text);
							this.up('toolbar').getComponent('basemapLabel').setText('Basemap : ' + this.text);
						}
					},
					{
						text: 'Google Map - Satellite',
						group: 'basemap',
						checked: false,
						handler: function(){
							map.setBaseLayer(google_satellite);
							//this.up().up().up().items.items[9].setText(basemaplabel + this.text);
							this.up('toolbar').getComponent('basemapLabel').setText('Basemap : ' + this.text);
						}
					},
					'-',
					{
						text: '&nbsp &nbsp &nbsp &nbsp<b>NOTE:</b><br/>&nbsp &nbsp &nbsp &nbspWE HAVE OBSERVED SOME DISCREPANCIES <br/>&nbsp &nbsp &nbsp &nbspBY AS MUCH AS 10 METERS WHEN USING BASEMAPS<br/>&nbsp &nbsp &nbsp &nbspOTHER THAN THE NAMRIA BASEMAPS AND<br/>&nbsp &nbsp &nbsp &nbspORTHO IMAGE 2011-METRO MANILA.  USERS ARE <br/>&nbsp &nbsp &nbsp &nbspADVISED TO TAKE THE NECESSARY PRECAUTIONS<br/>&nbsp &nbsp &nbsp &nbspESPECIALLY WHEN VIEWING THE ACTIVE FAULTS<br/>&nbsp &nbsp &nbsp &nbsp(VALLEY FAULT SYSTEM) USING OTHER BASEMAPS.',
						plain: true
					}
			   ]
			}
		);
		
						function getMetadata(layerName, layerTitle){
								//TODO: put this in a separate file	
					FGDCSTD0011998 ={
							"idinfo":"Identification Information",
							"citation":"Citation",
							"descript":"Description",		
							"abstract":"Abstract", 
							"purpose":"Purpose",
							"supplinf":"Supplemental Information",
							"timeperd":"Time Period of Content",
							"current":"Currentness Reference",
							"status":"Status",
							"progress":"Progress",					
							"update":"Maintenance and Update Frequency",
							"spdom":"Spatial Domain",
							"bounding":"Bounding coordinates",
							"westbc":"West Bounding Coordinate",
							"eastbc":"East Bounding Coordinate",
							"northbc":"North Bounding Coordinate",
							"southbc":"South Bounding Coordinate",
							"dsgpoly":"Data Set G-Polygon",
							"dsgpolyo":"Data Set G-Polygon Outer G-Ring",
							"grngpoin":"G-Ring Point",					
							"gringlat":"G-Ring Latitude",
							"gringlon":"G-Ring Longitude",
							"gring":"G-Ring",
							"dsgpolyx":"Data Set G-Polygon Exclusion G -Ring",
							"keywords":"Keywords",
							"theme":"Theme",
							"themekt":"Theme Keyword Thesaurus",
							"themekey":"Theme Keyword",	
							"place":"Place",
							"placekt":"Place Keyword Thesaurus",	
							"placekey":"Place Keyword",
							"stratum":"Stratum",
							"stratkt":"Stratum Keyword Thesaurus",
							"stratkey":"Stratum Keyword",
							"temporal":"Temporal",
							"tempkt":"Temporal Keyword Thesaurus",	
							"tempkey":"Temporal Keyword",
							"accconst":"Access Constraints",
							"useconst":"Use Constraints",
							"ptcontac":"Point of Contact",
							"browse":"Browse Graphic",
							"browsen":"Browse Graphic File Name",
							"browsed":"Browse Graphic File Description",
							"browset":"Browse Graphic File Type",
							"datacred":"Data Set Credit",
							"secinfo":"Security Information",
							"secsys":"Security Classification System",
							"secclass":"Security Classification",
							"sechandl":"Security Handling Description",
							"native":"Native Data Set Environment",
							"crossref":"Cross Reference",
							"dataqual":"Data Quality Information",
							"attracc":"Attribute Accuracy",
							"attraccr":"Attribute Accuracy Report",
							"qattracc":"Quantitative Attribute Accuracy Assessment",
							"attraccv":"Attribute Accuracy Value",
							"attracce":"Attribute Accuracy Explanation",
							"logic":"Logical Consistency Report",
							"complete":"Completeness Report",
							"posacc":"Positional Accuracy",
							"horizpa":"Horizontal Positional Accuracy",
							"horizpar":"Horizontal Positional Accuracy Report",
							"qhorizpa":"Quantitative Horizontal Positional Accuracy Assessment",
							"horizpav":"Horizontal Positional Accuracy Value",
							"horizpae":"Horizontal Positional Accuracy Explanation",
							"vertacc":"Vertical Positional Accuracy",
							"vertaccr":"Vertical Positional Accuracy Report",
							"qvertpa":"Quantitative Vertical Positional Accuracy Assessment",
							"vertaccv":"Vertical Positional Accuracy Value",
							"vertacce":"Vertical Positional Accuracy Explanation",
							"lineage":"Lineage",
							"srcinfo":"Source Information",
							"srccite":"Source Citation",
							"srcscale":"Source Scale Denominator",
							"typesrc":"Type of Source Media",
							"srctime":"Source Time Period of Content",
							"srccurr":"Source Currentness Reference",
							"srccitea":"Source Citation Abbreviation",
							"srccontr":"Source Contribution",
							"procstep":"Process Step",
							"procdesc":"Process Description",
							"srcused":"Source Used Citation Abbreviation",
							"proctime":"Process Time",
							"srcprod":"Source Produced Citation Abbreviation",
							"proccont":"Process Contact",
							"cloud":"Cloud Cover",
							"spdoinfo":"Spatial Data Organization Information",
							"indspref":"Indirect Spatial Reference",
							"direct":"Direct Spatial Reference Method",
							"ptvctinf":"Point and Vector Object Information",
							"sdtsterm":"SDTS Terms Description",
							"sdtstype":"SDTS Point and Vector Object Type",
							"ptvctcnt":"Point and Vector Object Count",
							"vpfterm":"VPF Terms Description",
							"vpflevel":"VPF Topology Level",
							"vpfinfo":"VPF Point and Vector Object Information",
							"vpftype":"VPF Point and Vector Object Type",
							"rastinfo":"Raster Object Information",
							"rasttype":"Raster Object Type",
							"rowcount":"Row Count",
							"colcount":"Column Count",
							"vrtcount":"Vertical Count",
							"spref":"Spatial Reference Information",
							"horizsys":"Horizontal Coordinate System Definition",
							"geograph":"Geographic",
							"latres":"Latitude Resolution",
							"longres":"Longitude Resolution",
							"geogunit":"Geographic Coordinate Units",
							"planar":"Planar",
							"mapproj":"Map Projection",
							"mapprojn":"Map Projection Name",
							"albers":"Albers Conical Equal Area",
							"azimequi":"Azimuthal Equidistant",
							"equicon":"Equidistant Conic",
							"equirect":"Equirectangular",
							"gvnsp":"General Vertical Near-sided Perspective",
							"gnomonic":"Gnomonic",
							"lamberta":"Lambert Azimuthal Equal Area",
							"lambertc":"Lambert Conformal Conic",
							"mercator":"Mercator",
							"modsak":"Modified Stereographic for Alaska",
							"miller":"Miller Cylindrical",
							"obqmerc":"Oblique Mercator",
							"orthogr":"Orthographic",
							"polarst":"Polar Stereographic",
							"polycon":"Polyconic",
							"robinson":"Robinson",
							"sinusoid":"Sinusoidal",
							"spaceobq":"Space Oblique Mercator",
							"stereo":"Stereographic",
							"transmer":"Transverse Mercator",
							"vdgrin":"van der Grinten",
							"stdparll":"Standard Parallel",
							"longcm":"Longitude of Central Meridian",
							"latprjo":"Latitude of Projection Origin",
							"feast":"False Easting",
							"fnorth":"False Northing",
							"sfequat":"Scale Factor at Equator",
							"heightpt":"Height of Perspective Point Above Surface",
							"longpc":"Longitude of Projection Center",
							"latprjc":"Latitude of Projection Center",
							"sfctrlin":"Scale Factor at Center Line",
							"obqlazim":"Oblique Line Azimuth",
							"azimangl":"Azimuthal Angle",
							"azimptl":"Azimuth Measure Point Longitude",
							"obqlpt":"Oblique Line Point",
							"obqllat":"Oblique Line Latitude",
							"obqllong":"Oblique Line Longitude",
							"svlong":"Straight Vertical Longitude from Pole",
							"sfprjorg":"Scale Factor at Projection Origin",
							"landsat":"Landsat Number",
							"pathnum":"Path Number",
							"sfctrmer":"Scale Factor at Central Meridian",
							"gridsys":"Grid Coordinate System",
							"gridsysn":"Grid Coordinate System Name",
							"utm":"Universal Transverse Mercator",
							"utmzone":"UTM Zone Number",
							"ups":"Universal Polar Stereographic (UPS)",
							"upszone":"UPS Zone Identifier",
							"spcs":"State Plane Coordinate System (SPCS)",
							"spcszone":"SPCS Zone Identifier",
							"arcsys":"ARC Coordinate System",
							"arczone":"ARC System Zone Identifier",
							"othergrd":"Other Grid System's Definition",
							"localp":"Local Planar",
							"localpd":"Local Planar Description",
							"localpgi":"Local Planar Georeference Information",
							"planci":"Planar Coordinate Information",
							"plance":"Planar Coordinate Encoding Method",
							"coordrep":"Coordinate Representation",
							"absres":"Abscissa Resolution",
							"ordres":"Ordinate Resolution",
							"distbrep":"Distance and Bearing Representation",
							"distres":"Distance Resolution",
							"bearres":"Bearing Resolution",
							"bearunit":"Bearing Units",
							"bearrefd":"Bearing Reference Direction",
							"bearrefm":"Bearing Reference Meridian",
							"plandu":"Planar Distance Units",	
							"local":"Local",
							"localdes":"Local Description",	
							"localgeo":"Local Georeference Information",
							"geodetic":"Geodetic Model",
							"horizdn":"Horizontal Datum Name",
							"ellips":"Ellipsoid Name",
							"semiaxis":"Semi-major Axis",
							"denflat":"Denominator of Flattening Ratio",
							"vertdef":"Vertical Coordinate System Definition",
							"altsys":"Altitude System Definition",
							"altdatum":"Altitude Datum Name",
							"altres":"Altitude Resolution",
							"altunits":"Altitude Distance Units",
							"altenc":"Altitude Encoding Method",
							"depthsys":"Depth System Definition",
							"depthdn":"Depth Datum Name",
							"depthres":"Depth Resolution",
							"depthdu":"Depth Distance Units",
							"depthem":"Depth Encoding Method",
							"eainfo":"Entity and Attribute Information",
							"detailed":"Detailed Description",
							"enttyp":"Entity Type",
							"enttypl":"Entity Type Label",
							"enttypd":"Entity Type Definition",
							"enttypds":"Entity Type Definition Source",
							"attr":"Attribute",
							"attrlabl":"Attribute Label",
							"attrdef":"Attribute Definition",
							"attrdefs":"Attribute Definition Source",
							"attrdomv":"Attribute Domain Values",	
							"edom":"Enumerated Domain",
							"edomv":"Enumerated Domain Value",
							"edomvd":"Enumerated Domain Value Definition",
							"edomvds":"Enumerated Domain Value Definition Source",
							"rdom":"Range Domain",
							"rdommin":"Range Domain Minimum",
							"attrunit":"Attribute Units of Measure",
							"attrmres":"Attribute Measurement Resolution",
							"codesetd":"Codeset Domain",
							"codesetn":"Codeset Name",
							"codesets":"Codeset Source",
							"udom":"Unrepresentable Domain",
							"begdatea":"Beginning Date of Attribute Values",
							"attrvai":"Attribute Value Accuracy Information",
							"attrva":"Attribute Value Accuracy",
							"attrvae":"Attribute Value Accuracy Explanation",
							"attrmfrq":"Attribute Measurement Frequency",
							"overview":"Overview Description",
							"eaover":"Entity and Attribute Overview",
							"eadetcit":"Entity and Attribute Detail Citation",
							"distinfo":"Distribution Information",
							"distrib":"Distributor",
							"resdesc":"Resource Description",
							"distliab":"Distribution Liability",
							"stdorder":"Standard Order Process",
							"nondig":"Non-digital Form",
							"digform":"digform",
							"digtinfo":"Digital Transfer Information",
							"formname":"Format Name",
							"formvern":"Format Version Number",
							"formverd":"Format Version Date",
							"formspec":"Format Specification",
							"formcont":"Format Information Content",
							"filedec":"File Decompression Technique",
							"transize":"Transfer Size",
							"digtopt":"Digital Transfer Option",
							"onlinopt":"onlinopt",
							"computer":"Computer Contact Information",
							"networka":"Network Address",
							"networkr":"Network Resource Name",
							"dialinst":"Dialup Instructions",
							"lowbps":"Lowest BPS",
							"highbps":"Highest BPS",
							"numdata":"Number DataBits",
							"numstop":"Number StopBits",
							"parity":"Parity",
							"compress":"Compression Support",
							"dialtel":"Dialup Telephone",
							"dialfile":"Dialup File Name",
							"accinstr":"Access Instructions",
							"oncomp":"Online Computer and Operating System",
							"offoptn":"Offline Option",
							"offmedia":"Offline Media",
							"reccap":"Recording Capacity",
							"recden":"Recording Density",
							"recdenu":"Recording Density Units",
							"recfmt":"Recording Format",
							"compat":"Compatibility Information",
							"fees":"Fees",
							"ordering":"Ordering Instructions",
							"turnarnd":"Turnaround",
							"custom":"Custom Order Process",
							"techpreq":"Technical Prerequisites",
							"availabl":"Available Time Period",
							"metainfo":"Metadata Reference Information",
							"metd":"Metadata Date",
							"metrd":"Metadata Review Date",
							"metfrd":"Metadata Future Review Date",
							"metc":"Metadata Contact",
							"metstdn":"Metadata Standard Name",
							"metstdv":"Metadata Standard Version",
							"mettc":"Metadata Time Convention",
							"metac":"Metadata Access Constraints",
							"metuc":"Metadata Use Constraints",
							"metsi":"Metadata Security Information",
							"metscs":"Metadata Security Classification System",
							"metsc":"Metadata Security Classification",
							"metshd":"Metadata Security Handling Description",
							"metextns":"Metadata Extensions",
							"onlink":"Online Linkage",
							"metprof":"Profile Name",
							"citeinfo":"Citation Information",
							"origin":"Originator",
							"pubdate":"Publication Date",
							"pubtime":"Publication Time",
							"title":"Title",
							"edition":"Edition",
							"geoform":"Geospatial Data Presentation Form",
							"serinfo":"Series Information",
							"sername":"Series Name",
							"issue":"Issue Identification",
							"pubinfo":"Publication Information",
							"pubplace":"Publication Place",
							"publish":"Publisher",
							"othercit":"Other Citation Details",
							"onlink":"Online Linkage",
							"Online Linkage":"Larger Work Citation",
							"timeinfo":"Time Period Information",
							"sngdate":"Single Date/Time",
							"caldate":"Calendar Date",
							"time":"Time of Day",
							"mdattim":"Multiple Dates/Times",
							"rngdates":"Range of Dates/Times",
							"begdate":"Beginning Date",
							"begtime":"Beginning Time",
							"enddate":"Ending Date",
							"endtime":"Ending Time",
							"cntinfo":"Contact Information",
							"cntperp":"Contact Person Primary",
							"cntper":"Contact Person",
							"cntorg":"Contact Organization",
							"cntorgp":"Contact Organization Primary",
							"cntpos":"Contact Position",
							"cntaddr":"Contact Address",
							"addrtype":"Address Type",
							"address":"Address",
							"city":"City",
							"state":"State or Province",
							"postal":"Postal Code",
							"country":"Country",
							"cntvoice":"Contact Voice Telephone",
							"cnttdd":"Contact TDD/TTY Telephone",
							"cntfax":"Contact Facsimile Telephone",
							"cntemail":"Contact Electronic Mail Address",
							"hours":"Hours of Service",
							"cntinst":"Contact Instructions"
						}
				
						title=layerTitle;
						//var layer = record.raw.layer;
						//var title = record.raw.text;
						layerName = layerName.replace("geoportal:","");
						title=title.replace("%", "_");
						title=title.replace("/", "*");
						console.log(layerTitle);
						//console.log(record)
						//var url = "/webapi/get.ashx?url=http://s1.geoportal.gov.ph:8080/layer/" + layerName +'/' + title;
						var url = "/webapi/get.ashx?url=http://202.90.149.251/metadata/layer/" + layerName +'/' + title;
						console.log('URL---',url)
						//url = escape(url);
						Ext.Ajax.request({
							url:url,
							method: 'GET',
							success: function(response){
								if (response.responseText != 'No metadata' ){	
									var obj = Ext.decode(response.responseText); 
									var result=JSON.parse(obj)
									var name=[];
									var value=[];
									var string
									var data={};
									
									for (var key in result){
											//alert(key)
											if(typeof result[key]=='object'){											
												name.push(key.toUpperCase());
												value.push(' ');											
												var result2=result[key];
												
												for (var key2 in result2){
													//alert(key2)
													if(typeof result2[key2]=='object'){		
														name.push(key2);
														value.push(' ');	
														var result3 = result2[key2];
														
														for (var key3 in result3){
															if(typeof result3[key3]=='object'){		
																name.push(key3);
																value.push(' ');		
																var result4=result3[key3];
																
																for (var key4 in result4){
																	if(typeof result4[key4]=='object'){	
																		name.push(key4);
																		value.push(' ');
																		var result5 = result4[key4]
																		
																		for (var key5 in result5){
																			if(typeof result5[key5]=='object'){	
																				name.push(key5);
																				value.push(' ');
																				var result6 = result5[key5]
																				
																				for (var key6 in result6){
																					if(typeof result6[key6]=='object'){	
																						name.push(key6);
																						value.push(' ');
																						var result7 = result6[key6];
																						
																						for (key7 in result7){
																							if(typeof result7[key7]=='object'){	
																								name.push(key7);
																								value.push(' ');
																							}else{
																								name.push(key7);
																								value.push(result7[key7]);																							
																							}
																						} 
																						
																					}else{
																						name.push(key6);
																						value.push(result6[key6]);
																					}
																				}
																			}else{
																				name.push(key5);
																				value.push(result5[key5]);
																				
																			}
																		}
																	}else{
																		name.push(key4);
																		value.push(result4[key4]);
																	}
																	
																}	
																		
															}else{
																name.push(key3);
																value.push(result3[key3]);		
															}	
															
														}
														
													}else{
														name.push(key2);
														value.push(result2[key2]);		
													}	
												}
											}		
													
										
									}
								//
									
									
									 function getLongName(shortName){
										var value = FGDCSTD0011998[shortName]
										if(value){
											console.log(value)
											return value
										}else{
											console.log(value)
											return shortName
										}	
										
									}
									
									
									
									var attName, attValue
									
									
									for (i=0;i<name.length-1;i++){
										
											
										attName=getLongName((name[i]))
										attValue=value[i]
										console.log(attValue);
										
										if (!isNaN(attName)){
											continue
										}
										
										if (attValue !=  ' '){
											string = string + '<br>' + attName + '  :  '+ (value[i]) +'<br>'; 
										}else{
											string = string + '<br>' + attName.bold() + '<br>'; 
										}
										
										
										
									}
									string.split(/\r\n|\r|\n/g)
								
									
								//
								
									string=string.replace('undefined','');
									var mappanel = Ext.getCmp("mappanel");
									
									
									var popup = Ext.create('Ext.window.Window', {
											title: layerName,
											width: '35%',	
											height:'60%',	
											html:string,		
											maximizable: false,
											collapsible: true,
											anchorPosition: 'top-left',	
											layout: "fit",												
											bodyStyle: {
													'text-align':'justify',																														
													'padding':'5px',
													
											},		 										
											autoScroll: true,
											
										})
									popup.show();
							    }else{
									Ext.MessageBox.show({
									msg: 'Metadata for ' + layerTitle + ' layer is not yet available',
									buttons: Ext.MessageBox.OK,
									icon: Ext.MessageBox.INFO
										
								});
								
								}  		
							},
							failure:function(res, err){																    
								
								Ext.MessageBox.show({
									msg: "Connection error. The server might be down or your're not connected to the internet",
									buttons: Ext.MessageBox.OK,
									//icon: Ext.MessageBox.INFO																																	
								});
								
							}		
						
						});
						//;
					}
		
		
		
		
		printMap = function(map, title, imageType, mapReadyCallback){

			var proxy = '/webapi/get.ashx?url=';
			
			// collect tile information
			var offsetX = parseInt(map.layerContainerDiv.style.left);
		    var offsetY = parseInt(map.layerContainerDiv.style.top);
		    var size  = map.getSize();
		    var tiles = [];
		    for (layername in map.layers) {
		        // if the layer isn't visible at this range, or is turned off, skip it
		        var layer = map.layers[layername];
		        if (!layer.getVisibility()) continue;
		        if (!layer.calculateInRange()) continue;

		        tiles[layername] = [];
		        console.log('processing ' + layername);
		        // iterate through their grid's tiles, collecting each tile's extent and pixel location at this moment
		        for (tilerow in layer.grid) {
		            for (tilei in layer.grid[tilerow]) {
		                var tile     = layer.grid[tilerow][tilei]
		                var url      = layer.getURL(tile.bounds);
		                //var url      = tile.url;
		                var position = tile.position;
		                var tilexpos = position.x + offsetX;
		                var tileypos = position.y + offsetY;
		                var opacity  = layer.opacity ? parseInt(100*layer.opacity) : 100;
		                console.log('adding ' + tiles.length + ' to ' + layername);
		                tiles[layername][tiles[layername].length] = { 
							url: url, 
							x: tilexpos, 
							y: tileypos, 
							opacity: opacity
						};
		            }
		        }
		    }
			
			var printConfig = {
				map: {
					w: map.size.w,
					h: map.size.h
				},
				tiles: tiles
			}
			console.log(printConfig);



			var layerCanvases = [];

			for(layer in printConfig.tiles){
				layerCanvases[layer] = document.createElement('canvas');
				layerCanvases[layer].width = printConfig.map.w;
				layerCanvases[layer].height = printConfig.map.h;
			}
				
			var totalTiles = 0;
			for(layer in printConfig.tiles){
				totalTiles += printConfig.tiles[layer].length;
			}


			var imageLoadedCount = 0;
			function imageLoaded(){
				imageLoadedCount++;
				if(imageLoadedCount == totalTiles)
				{
					// all images loaded!
					console.log('all images loaded!');

					// compose main canvas
					var mainCanvas = document.createElement('canvas');

					mainCanvas.width = printConfig.map.w;
					mainCanvas.height = printConfig.map.h; // add 20px for map title

					var mainCanvasContext = mainCanvas.getContext('2d');

					mainCanvasContext.fillStyle = "#ffffff";
					mainCanvasContext.fillRect(0,0,mainCanvas.width,mainCanvas.height + 20);

					mainCanvasContext.fillStyle = '#000000';
					mainCanvasContext.font = '16px Arial';
					mainCanvasContext.textAlign = 'center';
					mainCanvasContext.fillText(title, mainCanvas.width/2,16);


					for(canvas in layerCanvases){
						mainCanvasContext.drawImage(layerCanvases[canvas],0,20);
					}

					mainCanvasContext.fillStyle = 'rgba(0,0,0,0.5)';
					mainCanvasContext.font = '10px Arial';
					mainCanvasContext.textAlign = 'left'
					mainCanvasContext.fillText('http://geoportal.gov.ph', 10, mainCanvas.height - 10);

					mapReadyCallback({
						imageDataUri: mainCanvas.toDataURL('image/' + (imageType == 'pdf' ? 'jpeg' : imageType)),
						imageType: imageType,
						imageSize: {
							w: mainCanvas.width,
							h: mainCanvas.height
						}
					});
			
					//mainCanvas.toDataURL('image/' + (imageType == 'pdf' ? 'jpeg' : imageType)), imageType
					
				}
			}
			
			var draw = function(tile, layerCanvas){

				if(tile.url == null){
					imageLoaded();
					return;
				}

				var image = new Image();

				var url = proxy + escape(tile.url);
				image.src = url;
				console.log('drawing ' + url);
				
				image.onload = function(){
					layerCanvas.getContext('2d').drawImage(this, tile.x, tile.y);
					imageLoaded();
				};
			};
		

			for(layer in printConfig.tiles){
				for(item in printConfig.tiles[layer]){
					var currentTile = printConfig.tiles[layer][item];
					//console.log(currentTile);
					draw(currentTile, layerCanvases[layer]);
					
				}
			}

	
		
			
			return null;
			
			
		};
		
		
		
	
		PGP.common.Utilities.applyPermalink(map);

		
		Ext.apply(me, {
			map: map,
			dockedItems: [
				{ xtype: 'toolbar',
				  dock: 'top',
				  enableOverflow: true, 	
				  items: items
				}
			],
			center: new OpenLayers.LonLat(13610082.099764,1403622.1394924),
			zoom: 6
		});


	
		this.callParent(arguments);
		
    }
});



