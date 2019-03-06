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

Ext.define('PGP.view.Viewport', {
    extend: 'Ext.Viewport',
    layout: 'fit',
    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            items: [{
                xtype: 'panel',
				id: 'mainPanel', 
                border: false,
                layout: 'border',
				//html: '<div class="ribbon-wrapper-green"><div class="ribbon-green">BETA</div></div>',
                items: [
				{
					xtype: 'pgp_header',
					region: 'north',
					title: 'Map Viewer'
				},{
					xtype: 'pgp_map'
                },{
                    xtype: 'panel',
					id: 'rightpanel',
					border: false,
					layout: 'border',
					title: 'Right',
					header: false,
					region: 'east',
					width: '25%',
					collapsible : true,
					collapseMode: 'mini',
					padding: '10 10 10 5',
					split: true,
					items: [ {
								xtype: 'available_layers',
								id: 'availableLayers',
								flex: 1,
								border:false,
								render: function(){
									console.log("render from inline!");
								}
							 },
							 {
								xtype: 'loadedlayers',
								border: false,
								flex: 1
							 },  
							 {
								xtype: 'gx_legendpanel',
								id: 'legendpanel',
								title: 'Legend',
								region: 'south',
								flex: 1,
								autoScroll: true,
								split: true,
								border: false,
								bodyPadding: 10,
							    defaults: {
							           showTitle: true,
							           baseParams: {
							               FORMAT: 'image/png'
							           }
							       }
							 }
							 
							 
							 ]
                }]
            }]
        });

        me.callParent(arguments);
    }
});
