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

Ext.define('PGP.controller.Map', {
    extend: 'Ext.app.Controller',

	requires: ['PGP.common.Utilities'],
	
	stores: [
	],
    views: [
		'MapPanel',
		'SearchField',
		'Header'
    ],
	models: [
	],
	
	init: function(){
		this.control({
			'gx_mappanel': {
				render: this.initMap
			}
		});
	},
	initMap: function(){
		
		// initialization of map was done in MapPanel view instead
		
				
	}
	

});