/*
 * Copyright (c) 2008-2011 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/** api: example[print-form]
 *  Print Configuration with a Form
 *  -------------------------------
 *  Use form field plugins to control print output.
 */
 
Ext.Loader.setConfig({
    enabled: true,
    disableCaching: false,
    paths: {
        GeoExt: "../lib/geoext",
        //Ext: "http://cdn.sencha.io/ext-4.1.0-gpl/src"
		Ext:  "../lib/extjs/src",
    }
});

 
 
Ext.require([
    'Ext.layout.container.Border',
    'Ext.Panel',
    'Ext.form.FormPanel',
    'GeoExt.data.MapfishPrintProvider',
    'GeoExt.panel.Map',
    'GeoExt.data.PrintPage',
    'GeoExt.plugins.PrintPageField',
    'GeoExt.plugins.PrintProviderField'
]);

var mapPanel, printPage;

Ext.application({
    name: 'PrintPageFieldAndPrintProviderField',
    launch: function() {
	
	
	
	
		var maxExtent = new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34);
		//var layerMaxExtent = new OpenLayers.Bounds(11128623.5489416,-55718.7227285097,16484559.8541582,3072210.74548981);
		var layerMaxExtent = new OpenLayers.Bounds( 11516520.903064, 482870.29798867,  15821300.345956,  2448728.3963715);
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
		var tileSize = new OpenLayers.Size(256, 256);
		var projection = 'EPSG:900913';
		var tileOrigin = new OpenLayers.LonLat(-20037508.342787,20037508.342787);

	
	
	
		var pgp_basemap_cache = new OpenLayers.Layer.ArcGISCache( "Philippine Geoportal Basemap",
			"http://202.90.149.252/ArcGIS/rest/services/Basemap/PGS_Basemap/MapServer", {
			isBaseLayer: true,

			//From layerInfo above                        
			resolutions: resolutions,                        
			tileSize: tileSize,
			tileOrigin: tileOrigin,
			maxExtent: layerMaxExtent,                        
			projection: projection,
			displayInLayerSwitcher: false
		},
		{
			//additional options
			transitionEffect: "resize"
		});
	
	
	

        // The printProvider that connects us to the print service
        var printProvider = Ext.create('GeoExt.data.MapfishPrintProvider', {
            method: "GET", // "POST" recommended for production use
            capabilities: printCapabilities, // from the info.json script in the html
            customParams: {
                mapTitle: "Printing Demo"
            }
        });
        // Our print page. Stores scale, center and rotation and gives us a page
        // extent feature that we can add to a layer.
        printPage = Ext.create('GeoExt.data.PrintPage', {
            printProvider: printProvider
        });
        // A layer to display the print page extent
        var pageLayer = new OpenLayers.Layer.Vector();
        pageLayer.addFeatures(printPage.feature);
    
        // The map we want to print
        mapPanel = Ext.create('GeoExt.panel.Map', {
            region: "center",
            map: {
                eventListeners: {
                    // recenter/resize page extent after pan/zoom
                    "moveend": function(){ 
								printPage.fit(this, {mode: "screen"}); 
							  },
				},
				maxExtent: maxExtent,
				StartBounds: layerMaxExtent,
				units: units,
				resolutions: resolutions,
				tileSize: tileSize,
				projection: projection,
				restrictedExtent: layerMaxExtent

            },
            layers: [
				
                //new OpenLayers.Layer.WMS("GCPS", "http://geoserver.namria.gov.ph:8080/geoserver/geoportal/wms",
                //   {layers: "geoportal:mgd_geodeticcontrol"}, {singleTile: true, isBaseLayer: false}),
				//pgp_basemap_cache,
                pageLayer
				
            ]
        });
		var gcps = new OpenLayers.Layer.WMS("GCPS", "http://202.90.149.233:8082/geoserver/geoportal/wms", 
			{
				layers: "geoportal:mgd_geodeticcontrol",
				transparent: true
			}, 
			{
			   singleTile: false
			    
			}
		);
		
		mapPanel.map.addLayers([pgp_basemap_cache, gcps]);

		mapPanel.map.zoomToExtent(layerMaxExtent);
		
		
        // The form with fields controlling the print output
        var formPanel = Ext.create('Ext.form.FormPanel', {
            region: "west",
            width: 250,
            bodyStyle: "padding:5px",
            labelAlign: "top",
            defaults: {anchor: "100%"},
            items: [{
                xtype: "textarea",
                name: "comment",
                value: "",
                fieldLabel: "Comment",
                plugins: Ext.create('GeoExt.plugins.PrintPageField', {
                    printPage: printPage
                })
            }, {
                xtype: "combo",
                store: printProvider.layouts,
                displayField: "name",
                fieldLabel: "Layout",
                typeAhead: true,
                queryMode: "local",
                triggerAction: "all",
                plugins: Ext.create('GeoExt.plugins.PrintProviderField', {
                    printProvider: printProvider
                })
            }, {
                xtype: "combo",
                store: printProvider.dpis,
                displayField: "name",
                fieldLabel: "Resolution",
                displayTpl: Ext.create('Ext.XTemplate', '<tpl for=".">{name} dpi</tpl>'),
                tpl: '<tpl for="."><li role="option" class="x-boundlist-item">{name} dpi</li></tpl>',
                typeAhead: true,
                queryMode: "local",
                triggerAction: "all",
                plugins: Ext.create('GeoExt.plugins.PrintProviderField', {
                    printProvider: printProvider
                })
            }, {
                xtype: "combo",
                store: printProvider.scales,
                displayField: "name",
                fieldLabel: "Scale",
                typeAhead: true,
                queryMode: "local",
                triggerAction: "all",
                plugins: Ext.create('GeoExt.plugins.PrintPageField',{
                    printPage: printPage
                })
            }, {
                xtype: "textfield",
                name: "rotation",
                fieldLabel: "Rotation",
                plugins: Ext.create('GeoExt.plugins.PrintPageField',{
                    printPage: printPage
                })
            }],
            buttons: [{
                text: "Create PDF",
                handler: function() {
                    printProvider.print(mapPanel, printPage);
                }
            }]
        });
        // The main panel
        Ext.create('Ext.Panel', {
            renderTo: "content",
            layout: "border",
            width: 700,
            height: 420,
            items: [mapPanel, formPanel]
        });
    }
});
