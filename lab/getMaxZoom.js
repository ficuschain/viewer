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
	width: 500,
	layout: 'fit',
	items:[{
	xtype: 'pgp_map'
	}],
	modal: true,
	initComponent: function() {
		

		var layerParam = this.layers;
		
		var me = this;
		
		//me.title = layerParam[0].name;

		this.callParent(arguments);
		
	}

});



var map;

Ext.onReady(function(){

	// Entry point
	
	
	
	
	
	
	
	
	
	var win = Ext.create('PGP.view.MyComponent', { 
		title: 'Goto XY',
		layers: mylayers,	
		width: 250,
		layout: {
		type: 'vbox',
		align : 'stretch',
		
		},
		
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
									value: '14.5353',
									anchor: '100%',
									},
							
							
									{
									xtype: 'textfield',				 //Textbox
									fieldLabel: 'Longitude',             
									id: 'txtLongitude',
									value: '121.040',
									anchor: '100%',
									}
									,
									{
									xtype: 'checkbox',				//Checkbox					
									boxLabel: 'Zoom',								 
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
															 if(deg<90 && min<60 && sec<60)
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
															 if(deg<180 && min<60 && sec<60)
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
										var pointCenter = new OpenLayers.LonLat(lon,lat);
										pointCenter.transform(projWGS84,proj900913 );					
										if(boolzoom==false)
										{
											map.panTo(pointCenter);
										}
										else
										{
											map.setCenter(pointCenter,8);
										}
										
										

										console.log("zoom= "  +	boolzoom);
										console.log(pointCenter);
										this.up('.window').close(); 
									}
						
								}
						
						
						
						 ]
						}
		           ]
	});
	
	win.show();
	
	
	
	
	
	
	
	
	
});


