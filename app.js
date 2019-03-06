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

// debug
var debugObj;
var debugMap;
var debugE;

console.log('app.js:254.11');
var PGP = {
	settings: {
		WMS_URL: 'http://geoserver.namria.gov.ph/geoserver/geoportal/wms',
		defaultExtent: new OpenLayers.Bounds( 11516520.903064, 482870.29798867,  15821300.345956,  2448728.3963715),
		BING_API_KEY: 'BING_KEY'
	},
	layerAliases: {},
	PROXY: '/webapi/get.ashx?url='
}


Ext.Loader.setConfig({
    enabled: true,
    disableCaching: true,
    paths: {
        GeoExt: './lib/geoext/',
        Ext: './lib/extjs/src',
		OpenLayers: 'lib/openlayers'
    }
}); 

Ext.application({
    requires: ['Ext.container.Viewport'],
    name: 'PGP',

    appFolder: 'app',
	controllers: [
		'Layer',
		'Map'
	],
	
	autoCreateViewport: true,
	
	init: function(app){
		OpenLayers.ProxyHost = PGP.PROXY;
	}

});  





