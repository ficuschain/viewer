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

Ext.define('PGP.view.SearchField', {
    alias: 'widget.pgp_searchfield',
    extend: 'Ext.container.Container',
	requires: [
		'Ext.form.TextField',
		'Ext.button.Button'
	],
	layout: 'hbox',
	padding: '5 15 5 15',
    initComponent: function() {
		var me = this;
		this.addEvents("select");

		Ext.apply(me, {
			items: [
				{ 
					xtype: 'textfield',
					id: 'txtKeyword',
					emptyText: 'location search...',
					listeners: {
						specialkey: function(field, e){
							// e.HOME, e.END, e.PAGE_UP, e.PAGE_DOWN,
							// e.TAB, e.ESC, arrow keys: e.LEFT, e.RIGHT, e.UP, e.DOWN
							if (e.getKey() == e.ENTER) {
								var keyword = Ext.getCmp('txtKeyword');
								keyword.disable(false);
								me.search(me, keyword.getValue());
								keyword.enable(false);	
							}
						}
					}
				},
				{ 
					xtype: 'button',
					text: 'go',
					handler: function(){
						var keyword = Ext.getCmp('txtKeyword');
						keyword.disable(false);
						me.search(me, keyword.getValue());
						keyword.enable(false);						
					}
				},
			]
		});
		
		
        this.callParent(arguments);
		
    },
	///////////////////////////////////////////////////////
	
	
	search: function(me, keyword) {
		
		
		var GEONAMES = 0, 
			BING = 1,
			GOOGLE = 2;
			
		var service = [{ url: "http://api.geonames.org/searchJSON",
						 done: false,
						 response: null
					   },
					   { url: "http://dev.virtualearth.net/REST/v1/Locations",
						 done: false,
						 response: null
					   },
					   { url: "http://maps.googleapis.com/maps/api/geocode/json",
						 done: false,
						 response: null
					   }];

		// Task
		var task = new Ext.util.DelayedTask(function(){
			// Check for success
			if (service[GEONAMES].done && 
				service[BING].done && 
				service[GOOGLE].done) {
				
				// show result
				var geonames = Ext.decode(service[GEONAMES].response.responseText);
				var bing = Ext.decode(service[BING].response.responseText);
				var google = Ext.decode(service[GOOGLE].response.responseText);

				var data = [];

				if(geonames.totalResultsCount > 0) {
					data.push([ geonames.geonames[0].name,
								'Geonames.org',
								geonames.geonames[0].lat,
								geonames.geonames[0].lng 
							  ]);
				}

				if(bing.resourceSets[0].estimatedTotal > 0) {
					data.push([ bing.resourceSets[0].resources[0].name,
								'Bing',
								bing.resourceSets[0].resources[0].point.coordinates[0],
								bing.resourceSets[0].resources[0].point.coordinates[1] 
							  ]);
				}
				
				if(google.results.length > 0) {
					data.push([ google.results[0].formatted_address,
								'Google',
								google.results[0].geometry.location.lat,
								google.results[0].geometry.location.lng,
							  ]);
				}
			  
				////////////////////////////////////////////////////////////////////////////////////////////////

			
				// create the data store
				var store = new Ext.data.ArrayStore({
					fields: [
					   {name: 'name'},
					   {name: 'provider'},
					   {name: 'lat', type: 'float'},
					   {name: 'lng', type: 'float'}
					]
				});

				// manually load local data
				store.loadData(data);

				// create the Grid
				var grid = new Ext.grid.GridPanel({
					store: store,
					columns: [
						{
							id       :'name',
							header   : 'Location', 
							width    : 180, 
							sortable : true, 
							dataIndex: 'name'
						},
						{
							header   : 'Provider', 
							width    : 100, 
							sortable : false, 
							dataIndex: 'provider'
						},
						{
							header: 'Zoom in',
							xtype: 'actioncolumn',
							sortable: false,
							width: 50,
							items: [{
								icon   : 'resources/img/goto.png',  // Use a URL in the icon config
								tooltip: 'Zoom in',
								handler: function(grid, rowIndex, colIndex) {
									var rec = store.getAt(rowIndex);
									
									me.fireEvent("select", rec);
									
									//var bounds = new OpenLayers.Bounds(rec.get('lng'), rec.get('lat'), rec.get('lng'), rec.get('lat'));
									
									//map.zoomToExtent(bounds.transform(projWGS84, projMERCATOR));
									//map.zoomOut();
									//map.zoomTo(10);
									
								}
							}]
							
						}
					],
					stripeRows: true,
					autoExpandColumn: 'name',
					height: 350,
					width: 400,
					//title: 'Location search result',
					// config options for stateful behavior
					stateful: true,
					stateId: 'grid',
					listeners: {
						selectionchange: function(grid,rec) {	
							me.fireEvent("select", rec[0]);
						}
					}
				});
			  
			  
				
				if(data.length > 0) {
					
					var win = new Ext.Window({
						title: 'Search result',
						layout:'fit',
						width:350,
						height:200,
						//closeAction:'hide',
						plain: true,
						items: grid,
						buttons: [{
									text: 'Close',
									handler: function(){
										win.hide();
									}
								 }]
					});
					win.show();
				} else {
					Ext.Msg.alert("My apologies","No match was found for '" + keyword + "'");
				}
			  
			  
				////////////////////////////////////////////////////////////////////////////////////////////////
					  
			} else {
			  task.delay(500);
			}
		});
		task.delay(500);

		var params, url;
		
		// Geonames
		//"http://api.geonames.org/searchJSON?q=" + keyword + "&maxRows=10&country=PH&username=ghelobytes",
		params = { q: keyword,
				   username: 'ghelobytes',
				   maxRows: 1,
				   country: 'PH'
				 };
		url = PGP.PROXY + (service[GEONAMES].url + '?' + encodeURIComponent(Ext.urlEncode(params)));
		console.log('geonames', url);
		Ext.Ajax.request({
		   url:  url,
		   method: 'GET',
		   success: function(r) {
			  service[GEONAMES].done = true;
			  service[GEONAMES].response = r;
		   },
		   failure: function(o){
				console.log("Error Geonames", o);
		   }
		});
		

		// Bing
		params = { key: PGP.settings.BING_API_KEY, 
				   q: keyword + " philippines"
				 };
		url = PGP.PROXY + (service[BING].url + '?' + encodeURIComponent(Ext.urlEncode(params)));
		console.log('bing', url);
		Ext.Ajax.request({
		   url:  url,
		   method: 'GET',
		   success: function(r) {
			  service[BING].done = true;
			  service[BING].response = r;
		   },
		   failure: function(o){
				console.log("Error Bing", o);
		   }
		});
		
		
		// Google
		params = { address: keyword + " philippines", 
					 sensor: false,
					 region: 'ph'
				   };
		url = PGP.PROXY + (service[GOOGLE].url + '?' + encodeURIComponent(Ext.urlEncode(params)));
		console.log('Google', url);
		Ext.Ajax.request({
		   url:  url,
		   method: 'GET',
		   success: function(r) {
			  service[GOOGLE].done = true;
			  service[GOOGLE].response = r;
		   },
		   failure: function(o){
				console.log("Error Google", o);
		   }
		});

	}

	
	
	

});



