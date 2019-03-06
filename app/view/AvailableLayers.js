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

Ext.define('PGP.view.AvailableLayers', {
    extend: 'Ext.Panel',
	alias: 'widget.available_layers',
    layout: 'fit',
	
	store: [ 
		'Layers'
	],
	
    requires: [
		'Ext.form.ComboBox'
    ],
	
	border: false,
	layout: 'border',
	title: 'Available layers',
	region: 'north',
	height: 100,
	split: true,
	title: 'Available Layers',
	/* getWMS: function(cb, nameIn, nameOut){     
		try{
			var r = cb.getStore().find(nameIn,cb.getValue());
			return cb.getStore().getAt(r).get(nameOut);
		}
			catch(err){
			return'error';
		}
	}, */

	items: [ { xtype: 'panel',
			   layout: 'hbox',
			   region: 'north',
			   border: false,
			   padding: '5 5 5 5',  // top right bottom left
			   items: [
						  { 	
							xtype: 'combo',
							id: 'searchCombo',
							store: 'AllLayers',
							queryMode: 'local',
							displayField: 'title',
							valueField: 'layer_name',
							emptyText: 'Search...',
							width: '100%',
							hideTrigger: true,
							tpl: Ext.create('Ext.XTemplate',
								'<tpl for=".">',
									'<div class="x-boundlist-item">',
										'<div class="{[xindex % 2 === 0 ? "pgp-even" :  "pgp-odd"]}">{title}</div>',
										//'<hr class="pgp-hr">',
									'</div>',
								'</tpl>'
							),
							// template for the content inside text field
							displayTpl: Ext.create('Ext.XTemplate',
								'<tpl for=".">',
									'{title}',
								'</tpl>'
							),
							listeners: {
								change: function(){
									var value = this.getValue();
									if (!value || value == '') {
										return;
									}
									this.store.clearFilter(true);
									this.store.filterBy(function(record,id){
										var stringToMatch = (record.get('title') + '|' + 
															 record.get('description') +  '|' + 
															 record.get('tags') +  '|' + 
															 record.get('agency')).toLowerCase();
										
										var match = (stringToMatch.indexOf(value.toLowerCase()) >= 0 );
										return match; 
									});
								}
							}
						} 

					]
			 },
			 {
				xtype: 'tabpanel',
				layout: 'fit',
				region: 'center',
				border: false,
				items: [
						{
							title: 'A-Z',
							id: 'tabAZ',
							layout: 'fit',
							border: false,
							items: [
								{ 
								   xtype: 'treepanel',
								   id: 'treeAZ',
								   rootVisible: false,
								   store: 'AZLayers'
								} 
							]
						},
						{
							title: 'by Agency',
							id: 'tabByAgency',
							layout: 'fit',
							border: false,
							items: [
							
								{ 
								   xtype: 'treepanel',
								   rootVisible: false,
								   store: 'ByAgencyLayers'
								}
							
							
							]
						},
						{
							title: 'by Category',
							id: 'tabBySector',
							layout: 'fit',
							border: false,
							items: [
							
								{ 
								   xtype: 'treepanel',
								   rootVisible: false,
								   store: 'BySectorLayers'
								}
							
							
							]
						},
						{
							title: 'by Agency Node',
							id: 'tabCatalog',
							layout: 'fit',
							border: false,
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
											id: 'cmbWMS',
										 	store: 'WmsSite',
											editable: false,
											fieldLabel: 'WMS',
											queryMode: 'local',
											
											//value: '',
											displayField: 'agency',
											valueField: 'site',
											listeners: {								
												change: function(field, newValue, oldValue){
													//var value = this.getValue();
													
																										
													if(!newValue == ''){
														
														var	gridStore = Ext.create('GeoExt.data.WmsCapabilitiesLayerStore', {
															url: '/webapi/get.ashx?url=' + encodeURIComponent(newValue),
															autoLoad: true,															
															
														});
														
														//console.log(gridStore);														
														var wmsGrid = Ext.getCmp('gridWms');			
														
														//gridStore.sort('title', 'ASC');													
														
														wmsGrid.getView().bindStore(gridStore);														
													
														
														 /*var grid = Ext.create('Ext.grid.Panel', {
															store: gridStore,
															columns: [
																		{header: "Title", dataIndex: "title", sortable: true},
																		//{header: "Name", dataIndex: "name", sortable: true},
																		//{header: "Queryable", dataIndex: "queryable", sortable: true, width: 70},
																		{header: "Description", dataIndex: "abstract", flex: 1}
																	],
															listeners: {
																itemclick: function(cmp, record){
																	
																	// TODO: do a cleaner loading
									
																	var title = record.get('title');
																	var layer_name = record.get('name');
																	var style = record.get('styles')[0].name;

																	var singleTile = false;

																	var wmsLayer = new OpenLayers.Layer.WMS(
																			title, 
																			wms,
																			{
																				layers: layer_name,
																				styles: style,
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
																	
																	//var mappanel = Ext.getCmp('mappanel');
																	//mappanel.map.addLayer(wmsLayer);
																	map.addLayer(wmsLayer);
																}
															}
														});
														
														var pnlResult = Ext.getCmp('pnlResult');
														pnlResult.add([grid]); 
														 */
													
													}
												}
											}
										},
										{
											xtype: 'gridpanel',
											id: 'gridWms',
											//layout: 'fit',
											//remoteSort:true,
											autoScroll: true,
											height: 115,
											width: 350,
											//store: '',
											columns: [
														//{header: "Title", dataIndex: "title", sortable: true,flex:1},
														{header: "Title", dataIndex: "title", flex:1},
														//{header: "Name", dataIndex: "name", sortable: true},
														//{header: "Queryable", dataIndex: "queryable", sortable: true, width: 70},
														{header: "Description", dataIndex: "abstract", flex: 1}
													],
											listeners: {
												itemclick: function(cmp, record){
													
													// to get wms value from combo
													var comboW= Ext.getCmp('cmbWMS');
													var r = comboW.getStore().find('site',comboW.getValue());
													var wms = comboW.getStore().getAt(r).get('wms');
													console.log('yyy',comboW.getValue());
													//var wms = getWMS(Ext.getCmp('cmbWMS'), 'site', 'wms');
													
													// TODO: do a cleaner loading
													var title = record.get('title');
													var layer_name = record.get('name');
													var style = record.get('styles')[0].name;

													var singleTile = false;

													var wmsLayer = new OpenLayers.Layer.WMS(
															title, 
															wms,
															{
																layers: layer_name,
																styles: style,
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
													//map.addLayer(wmsLayer);
												}
											}
										}
									
									]
									
								}
							]
						}
					]
			 }
				
			 
		   ],
	
    initComponent: function() {
		
		//NOTE: findout whar arguments are for
		//this.callParent(arguments);
		this.callParent();
	}
	
	
});




		
		
		