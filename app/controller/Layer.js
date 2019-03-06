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

Ext.define('PGP.controller.Layer', {
    extend: 'Ext.app.Controller',
	requires: [
		'GeoExt.panel.Map',
		'GeoExt.panel.Legend',
		'GeoExt.container.WmsLegend',

		'GeoExt.tree.LayerContainer',
		'GeoExt.data.LayerTreeModel',
		'Ext.data.StoreManager'
		
	],
	stores: [
		'AZLayers',
		'ByAgencyLayers',
		'BySectorLayers',
		'LoadedLayers',
		'AllLayers',
		'WmsSite'
	],
    views: [
		'AvailableLayers',
		'LoadedLayers',
		'LoadedLayerContextMenu',
		'LayerFilter'
    ],
	models: [
		'Layer',
		'WmsSite'
	],
	init: function(){
		
		
		
		this.control({
			'treepanel': {
				itemclick: function(node, record){
					console.log(record);
					this.loadLayer(record.raw);
				}
			},
			'panel > combo':{
				select: function(combo, record){
					this.loadLayer(record[0].raw);
				}
			},
			
			'button[action=debug]': {
				click: this.debug
			},
			
			'loadedlayers': {
							
				itemcontextmenu: function(view, record, item, index, event, options) {
					event.stopEvent();
					this.showContextMenu(record, event.getXY());
				}
			},
			
			'#resetLayers': {
				click: function(e){
					var mappanel = Ext.getCmp("mappanel");
					var layerCount = mappanel.map.layers.length;
					
					if(layerCount > 4){
						Ext.Msg.show({
							 title:'Wait!',
							 msg: 'You are about to remove all loaded layers.<br/>Do you want to continue?',
							 buttons: Ext.Msg.YESNO,
							 icon: Ext.Msg.QUESTION,
							 fn: function(btn){
								if(btn == 'yes'){
									for(var i = layerCount;i>4;i--){
										mappanel.map.removeLayer(mappanel.map.layers[i-1]);
									}
								}
									
							 }
						});
						
					}
				}
			}
		
		});
		
		
		this.initSearchCombo();
		

		
	},
	
	initSearchCombo: function(){
			
		var allLayersStore = this.getAllLayersStore();
		this.getAZLayersStore().on('load', function(store, records){
			allLayersStore.loadData(records.childNodes);
		});
	
	},
	
	showContextMenu: function(record, coord){
	
		var contextMenu = Ext.create('PGP.view.LoadedLayerContextMenu', {
			width: 160,
			items: [
				{
					text        : '0%&nbsp;&nbsp;&nbsp;&nbsp;Opacity&nbsp;&nbsp;&nbsp;&nbsp;100%',
					canActivate : false,
					hideOnClick : true,
					shadow: true,
					style       : {
							marginTop  : '-5px',
							fontSize   : '9px'
						}
				},
				Ext.create('Ext.slider.Single', {
					width: 100,
					value: 100,
					increment: 1,
					minValue: 0,
					maxValue: 100,
					listeners : {
									change : function(slider,newVal) {
										record.raw.layer.setOpacity(newVal/100)
									}
								} 
				}),
				{
					text: 'Move to top',
					handler: function(){
						record.raw.layer.map.setLayerIndex(record.raw.layer, record.raw.layer.map.layers.length-1);
					}
				
				},
				{
					text: 'Filter',
					handler: function(){
						var layer = record.raw.layer;
						var filterData = [];
						
						if(layer.filterData)
							filterData = layer.filterData;
						
						// remove prefix "geoportal:"
						var layerName = layer.params.LAYERS.replace("geoportal:","");
						var style = (layer.params.STYLES || layer.params.styles);


						var win = Ext.create('PGP.view.LayerFilter', { 
							title: 'Filter', 
							layerName: layerName,
							filterData: filterData,
							style: style,
							listeners: {
								close: function(){
									layer.params.cql_filter = win.getCQL();
									layer.filterData = win.getFilterData(); 
									layer.redraw(true);
								}
							}
						});
						win.show();
							
					}
				
				},
				{
					text: 'Zoom to extent',
					handler: function(){
					
						var layer = record.raw.layer;
						var layerName = layer.params.LAYERS.replace("geoportal:","");
						
						var mapProjection = record.raw.layer.map.projection.replace("EPSG:","");
						
						var sql = "select st_xmin(st_extent(st_transform(wkb_geometry, " + mapProjection + "))) as xmin,st_ymin(st_extent(st_transform(wkb_geometry, " + mapProjection + "))) as ymin,st_xmax(st_extent(st_transform(wkb_geometry, " + mapProjection + "))) as xmax,st_ymax(st_extent(st_transform(wkb_geometry, " + mapProjection + "))) as ymax from " + layerName;

						Ext.Ajax.request({
							url: "/webapi/api/util/querytableasjson?database=geoportal&sql=" + sql,
							method: 'GET',
							success: function(r){
								var obj = Ext.decode(r.responseText);
								var bounds= new OpenLayers.Bounds(obj.result[0].xmin,obj.result[0].ymin,obj.result[0].xmax,obj.result[0].ymax);
								record.raw.layer.map.zoomToExtent(bounds);
							}
						});
						
						
						
					}
				
				},
				{
					text: 'Zoom to make visible',
					handler: function(){
						
						//define resolution
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
						 
						var layer = record.raw.layer;
						var layerName = layer.params.LAYERS.replace("geoportal:","");
						
						var mapProjection = record.raw.layer.map.projection.replace("EPSG:","");
						
						var sql = "select st_xmin(st_extent(st_transform(wkb_geometry, " + mapProjection + "))) as xmin,st_ymin(st_extent(st_transform(wkb_geometry, " + mapProjection + "))) as ymin,st_xmax(st_extent(st_transform(wkb_geometry, " + mapProjection + "))) as xmax,st_ymax(st_extent(st_transform(wkb_geometry, " + mapProjection + "))) as ymax from " + layerName + " group by ogc_fid limit 1";

						Ext.Ajax.request({
							url: "/webapi/api/util/querytableasjson?database=geoportal&sql=" + sql,
							method: 'GET',
							success: function(r){
								var obj = Ext.decode(r.responseText);
								var bounds= new OpenLayers.Bounds(obj.result[0].xmin,obj.result[0].ymin,obj.result[0].xmax,obj.result[0].ymax);
								//record.raw.layer.map.zoomToExtent(bounds);
								var mappanel = Ext.getCmp('mappanel')
								//xxxx
								//var bounds = new OpenLayers.Bounds(rec.get('lng'), rec.get('lat'), rec.get('lng'), rec.get('lat'));	
								mappanel.map.zoomToExtent(bounds);
								
								var pgp_basemap = mappanel.map.getLayersByName("NAMRIA Basemaps")[0];
								
								for(var i = mappanel.map.getNumZoomLevels(); i > 0; i--)
								
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
							
										mappanel.map.setCenter(center,i-1);
										break;
									}	
																									
								}
								//xxxx
							}
						});
						
						
						
					}
				
				},
				{
					text: 'Remove layer',
					handler: function(){
						record.raw.layer.map.removeLayer(record.raw.layer);
					}
				
				},
				{
					text:'View metadata',
					handler:function(){
						
						
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
				
						
						var layer = record.raw.layer;
						var title = record.raw.text;
						var layerName = layer.params.LAYERS.replace("geoportal:","");
						title=title.replace("%", "_");
						title=title.replace("/", "*");			
						console.log(title);																
						//console.log(record)
						var url = "/webapi/get.ashx?url=" + encodeURIComponent("http://202.90.149.251/metadata/layer/" + layerName +'/' + title);
						//url=encodeURI(url);
						//console.log(url);
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
											title: layer.name,
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
									msg: 'Metadata for ' + title + ' layer is not yet available',
									buttons: Ext.MessageBox.OK,
									icon: Ext.MessageBox.INFO
										
								});
								
								}  		
							},
							failure:function(res, err){																    
								
								Ext.MessageBox.show({
									msg: 'Connection error. Please check your Internet connection',
									buttons: Ext.MessageBox.OK,
									//icon: Ext.MessageBox.INFO																																	
								});
								
							}		
						
						});
						//;
					}
				}				
			] 
		});
		
		contextMenu.showAt(coord);
	
	
	
	
	
	},
	debug: function(){
			
	
			
		
	},
	
	loadLayer: function(record){
	
		
		if(!record.leaf)
			return;
			
		var title = record.title;
		var layer_name = record.layer_name;
		var style = record.style;
		var singleTile = !record.tiled;
		console.log(layer_name);
		var wmsLayer = new OpenLayers.Layer.WMS(
				title, 
				PGP.settings.WMS_URL,
				{
					layers: 'geoportal:' + layer_name,
					styles: style,
					tiled:true,
					format:'image/png8',
					transparent: true
					//tiled: record.tiled
				},
				{
				   singleTile: singleTile, 
				   ratio: 1, 
				   isBaseLayer: false,
				   transitionEffect: 'resize'
				} 
		);
		
		wmsLayer.metadata = { agency: record.agency };		
		var mappanel = Ext.getCmp('mappanel');
		mappanel.map.addLayer(wmsLayer);
		
	}
	

});
