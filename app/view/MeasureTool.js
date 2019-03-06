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

Ext.define('PGP.view.MeasureTool', {
	alias: 'widget.pgp_measuretool',
	extend: 'Ext.Window',	
	title: 'Measure tool',
	height: 220,
	width: 200,
	layout: 'fit',
	initComponent: function() {
	
		var me = this;

		 var sketchSymbolizers = {
			"Point": {
				pointRadius: 0,
				graphicName: "square",
				fillColor: "white",
				fillOpacity: 1,
				strokeWidth: 1,
				strokeOpacity: 1,
				strokeColor: "#333333"
			},
			"Line": {
				strokeWidth: 2,
				strokeOpacity: 1,
				strokeColor: "#666666",
				strokeDashstyle: "dash"
			},
			"Polygon": {
				strokeWidth: 2,
				strokeOpacity: 1,
				strokeColor: "#666666",
				fillColor: "#FF8000",
				fillOpacity: 0.75
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
		
		
		
		OpenLayers.Control.Measure.prototype.displaySystemUnits = {
			 geographic: ['dd'],
			 english: ['mi', 'ft', 'in'],
			 metric: ['km', 'm'],
			 namriaUnit: ['km']
		};
		
		var eventHandlerArea = function(event){
			
				var result = event.measure;
				var lblResult = Ext.getCmp('lblResult');
				
				var km = result.toFixed(5) + " km<sup>2</sup>";
				var m = (result * 1000000).toFixed(3) + " m<sup>2</sup>";
				var mi = (result * 0.386102).toFixed(5) + " mi<sup>2</sup>";
				var ft = (result * 10763900).toFixed(3) + " ft<sup>2</sup>";
				
				var out = km + "<br/>" +
						  m + "<br/>" +
						  mi + "<br/>" +
						  ft + "<br/>";
				
				lblResult.setText(out, false);
			};
			
			var eventHandlerDistance = function(event){
			
					var result = event.measure;
					var lblResult = Ext.getCmp('lblResult');
				
					var km = result.toFixed(5) + " km";
					var m = (result * 1000).toFixed(3) + " m";
					var mi = (result * 0.621371).toFixed(5) + " mi";
					var ft = (result * 3280.84).toFixed(3) + " ft";
				
					var out = km + "<br/>" +
							  m + "<br/>" +
							  mi + "<br/>" +
							  ft + "<br/>";
				
					lblResult.setText(out, false);
				};
		
		var measureDistanceControl = new OpenLayers.Control.Measure(
				OpenLayers.Handler.Path, {
					persist: true,
					handlerOptions: {
						layerOptions: {
							renderers: renderer,
							styleMap: styleMap
						}
					},
					displaySystem: 'namriaUnit',
					immediate: true
				}
			);
		measureDistanceControl.events.on({
			measurepartial: eventHandlerDistance
		});	
		var measureAreaControl = new OpenLayers.Control.Measure(
				OpenLayers.Handler.Polygon, {
					persist: true,
					handlerOptions: {
						layerOptions: {
							renderers: renderer,
							styleMap: styleMap
						}
					},
					displaySystem: 'namriaUnit',
					immediate: true
				}
			);
		measureAreaControl.events.on({
			measurepartial: eventHandlerArea
		});	
		
	
		
		this.map.addControl(measureDistanceControl);
		this.map.addControl(measureAreaControl);
		
		//measureDistanceControl.activate();
		
		
		
		
		
		
		
		Ext.apply(me, {
			
			items: [ 
				{ 	
					xtype: 'panel',
					layout: {
						type: 'vbox',
						align: 'stretch'
					},
					defaults: {	
						margin: '5 5 2.5 5',
						labelWidth: 55,
					},
					items: [
					////////////////////////
					Ext.create('Ext.button.Button', Ext.create('GeoExt.Action', {
						control: measureDistanceControl,
						map: this.map,
						iconCls: 'add',
						iconAlign: 'left',
						icon: 'resources/img/line.png',
						scale: 'large',
						toggleGroup: 'navigation',
						allowDepress: false,
						textAlign: 'left',
						text: 'Distance',
						handler: this.clear
					})),
					Ext.create('Ext.button.Button', Ext.create('GeoExt.Action', {
						control: measureAreaControl,
						map: this.map,
						iconCls: 'add',
						iconAlign: 'left',
						icon: 'resources/img/polygon.png',
						scale: 'large',
						toggleGroup: 'navigation',
						allowDepress: false,
						textAlign: 'left',
						text: 'Area',
						handler: this.clear
					})),			
						{
							xtype: 'label',
							id: 'lblResult',
							style: 'text-align: right'
						},
						{
							xtype: 'label',
							id: 'lblInfo',
							style: 'font-size: smaller',
							text: '* double click to end'
						}
					]
					
				}
			]					
		});
		this.callParent(arguments);
       
		this.on("close",function(){
			measureDistanceControl.deactivate();
			this.map.removeControl(measureDistanceControl);
			
			measureAreaControl.deactivate();
			this.map.removeControl(measureAreaControl);
		});
		
	},
	clear: function(){
		var lblResult = Ext.getCmp("lblResult");
		lblResult.setText("");
	}

});

