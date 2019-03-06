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

Ext.define('PGP.view.GotoXY', {
	alias: 'widget.pgp_gotoxy',
	extend: 'Ext.Window',		
	width: 250,
	layout: {
		type: 'vbox',
		align : 'stretch'
	},
	modal: false,
	listeners:{
        close:function(){
		
		var x = this.map.getLayersByName("Markers");
		x[0].destroy();
		//this.markers.destroy();
               
        }
        },
	initComponent: function() {
		var me = this;
		var map = this.map;
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
		
		var markers = new OpenLayers.Layer.Markers( "Markers" );
		map.addLayer(markers);
		
		Ext.apply(me, {
			
			
			
		items: [   
				{ 	
					xtype: 'panel',
					layout: 'anchor',		
					defaults: {	
						margin: '10 5 5 5',
						labelWidth: 55
					},					
					
					
					items: [
					
									{
									xtype: 'textfield',				//Textbox
									fieldLabel: 'Latitude',
									id: 'txtLatitude',
									emptyText: '14 00 00',
									anchor: '100%',
									},
							
							
									{
									xtype: 'textfield',				 //Textbox
									fieldLabel: 'Longitude',             
									id: 'txtLongitude',
									emptyText: '121 00 00',
									anchor: '100%',
									}
									,
									{
									xtype: 'checkbox',				//Checkbox					
									boxLabel: 'Zoom',		
									checked: true,
									id: 'checkboxZoom'
									}
				
									
							
							
						]
						
		                },
						{
						xtype: 'panel',
						frame: false,
						border: false,
						bodyStyle: 'background:transparent;',
						layout: {
						type: 'hbox',
						pack: 'end',
						align: 'right'
						},
						  
						
						items: [		
								
								{
									xtype: 'button',                                     //Button 
									text: 'Go',
									width: 100,
									
									
									
									handler: function()
									{
										var lat = Ext.getCmp("txtLatitude").getValue();
										var lon = Ext.getCmp("txtLongitude").getValue();
										var boolzoom =Ext.getCmp("checkboxZoom").getValue();
										
										var deg;
										var min;
										var sec;
										
										var projWGS84 = new OpenLayers.Projection("EPSG:4326");
										var proj900913 = new OpenLayers.Projection("EPSG:900913");
										
									      if(!lat || !lon)
										{
											return;
										}
										
										
										lat=lat.trim();
										if(isNaN(lat))
										{
											var buf= lat.split(" ");
												  if(buf.length==3 )
												  {
												  
														deg=parseInt(buf[0]);
													min=parseInt(buf[1]);
													sec=parseFloat(buf[2]);
													 
													 if(!isNaN(deg) && !isNaN(min) &&  !isNaN(sec) )
													 {
															 if(deg<=23  && deg>=3 && min<60 && sec<60)
															 {							 
															 
															 lat=deg+(min/60)+(sec/3600);
															 console.log(lat);
															 }
															 else
															 {
															 Ext.MessageBox.alert('Gotoxy', 'Latitude: Invalid range');
															 return;
															 }
													}	
													else
													{
													Ext.MessageBox.alert('Gotoxy', 'Latitude : Not a number');
															 return;
													}
												 }
												 else
												 {
													Ext.MessageBox.alert('Gotoxy', 'Latitude: Invalid Format e.g 4 59 59.99');
													return;
												 }
										}
										
										 lon=lon.trim();
										
										if(isNaN(lon))
										{
											  
											var buf2= lon.split(" ");
												  if(buf2.length==3 )
												  {
												  
													deg=parseInt(buf2[0]);
													min=parseInt(buf2[1]);
													sec=parseFloat(buf2[2]);
													 
													 if(!isNaN(deg) && !isNaN(min) &&  !isNaN(sec) )
													 {
															 if(deg<=127 && deg>=115 && min<60 && sec<60)
															 {							 
															 
															 lon=deg+(min/60)+(sec/3600);
															 console.log(lon);
															 }
															 else
															 {
															 Ext.MessageBox.alert('Gotoxy', 'Longitude: Invalid range');
															 return;
															 }
													}	
													else
													{
													Ext.MessageBox.alert('Gotoxy', 'Longitude : Not a number');
															 return;
													}
												 }
												 else
												 {
													Ext.MessageBox.alert('Gotoxy', 'Longitude: Invalid Format e.g 4 59 59.99');
													return;
												 }
										}
										
										if(lon>127 || lon<115  || lat >23 || lat <3)
										{
											Ext.MessageBox.alert('Gotoxy', 'Coordinate is out of range');
											return;
										}
										
										var pointCenter = new OpenLayers.LonLat(lon,lat);
										pointCenter.transform(projWGS84,proj900913 );					
										if(boolzoom==false)
										{
											map.panTo(pointCenter);
										}
										else
										{
											var pgp_basemap_cache =map.getLayersByName("NAMRIA Basemaps")[0];
											var  bounds = new OpenLayers.Bounds(pointCenter.lon,pointCenter.lat,pointCenter.lon,pointCenter.lat);
												
												for(var i = map.getNumZoomLevels(); i > 0; i--)
												{
																																	
															var res =resolutions2[i-1];   
															//tile center
															var originTileX = (pgp_basemap_cache.tileOrigin.lon + (res * pgp_basemap_cache.tileSize.w/2)); 
															var originTileY = (pgp_basemap_cache.tileOrigin.lat - (res * pgp_basemap_cache.tileSize.h/2));

															var center = bounds.getCenterLonLat();
															var point = { x: center.lon, y: center.lat };
															var x = (Math.round(Math.abs((center.lon - originTileX) / (res * pgp_basemap_cache.tileSize.w)))); 
															var y = (Math.round(Math.abs((originTileY - center.lat) / (res * pgp_basemap_cache.tileSize.h)))); 
															var z =i-1;                                                             
															
															
															// url = pgp_basemap_cache.url + '/tile/' + z + '/' + y + '/' + x;		
													     	 url = 'http://202.90.149.231/tiles/v2/PGP/' +  z + '/' + x + '/' + y + '.png';
															/*
															var request = OpenLayers.Request.HEAD({
																//url: "http://202.90.149.252/ArcGIS/rest/services/Basemap/PGS_Basemap/MapServer/tile/2/55/99",
																url:url,
																proxy: "/webapi/get.ashx?url=",											
																async: false
																//callback: handler
															});
															*/
															
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
															
															
															//if(hash != "720067505") {
															// for production server hash!='-1526219151'
															if(hash != "1786305461" && hash!="1821642261" && hash != "-1867004495" && hash!="1150645012" && hash!='-1526219151') {	
																map.setCenter(pointCenter,i-1);
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
										
										console.log(pointCenter);								
										
										
									
										
										markers.clearMarkers();
										
										var size = new OpenLayers.Size(21,25);
										var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
										var icon = new OpenLayers.Icon('./resources/img/location48.png', size, offset);
										markers.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(pointCenter.lon,pointCenter.lat),icon));
										markers.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(pointCenter.lon,pointCenter.lat),icon.clone()));
										
									}
						
								}
						
						
						
						 ]
						}
		           ]
		
		});
		
		

		this.callParent(arguments);
		Ext.getCmp('txtLatitude').focus(false, 200);
		
	},
	
	

});