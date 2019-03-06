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
 
Ext.define('PGP.view.LayerDownload',{
	extend: 'Ext.window.Window',	
	title: 'Download',
	
	alias: 'widget.LayerDownload',
	height: 200,
	width:390,	
	layout:'fit',
	
	
	initComponent: function(){
	
	var me = this;
	
	Ext.apply(me,{
	
	items:[{
		xtype:'form',
		url:'http://s1.geoportal.gov.ph/transaction/order',
		method:'POST',
		standardSubmit:true,
		layout:'vbox',
		//margin:'20 20 20 20',
	    defaults:
		 {
			margin: '10px'
		 },
	
		border:false,
		
		
		items:[
		{
			xtype:'fieldcontainer',
			layout:'hbox',
			items:[
				{
					xtype:'textfield',
					name:'passcode',
					//labelWidth: 200,
					fieldLabel:'<b>Enter Passcode<b>'		
				},
				{
					xtype: 'button',
					text: 'Submit',
					handler: function(){
					
						var myform=this.up('form').getForm();
								myform.submit({
										target:'_blank',
										success: function(form, action) {
										   Ext.Msg.alert('Success', action.result.message);
										},
										failure: function(form, action) {
											Ext.Msg.alert('Failed', action.result ? action.result.message : 'No response');
										}
									});
								
						
					}
				}
			]
		},
		{
			xtype:'label',
			withd:200,
			html:'For data request, please send a letter using agency letterhead to </br> NAMRIA Administrator  indicating the data needed; purpose of use; </br> Agency / Department; name of requesting party; contact number; </br>and email address. <p> You may send a scanned copy of the letter duly signed by head </br>of agency or his/her representative to geoportal@namria.gov.ph'
		}
		
		]
		
	
	
	
	
	
	}
	
	
	],
	
	
	
	})
	this.callParent();
	
	}

})


