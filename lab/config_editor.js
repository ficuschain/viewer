Ext.require([
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.util.*',
    'Ext.state.*',
    'Ext.form.*'
]);

Ext.onReady(function(){

	Ext.create('Ext.data.Store', {
		storeId:'layer_metadata',
		fields:['attribute', 'alias'],
		data:[
			{ 'attribute': 'stat_name',  "alias":"Station name" },
			{ 'attribute': 'region',  "alias":"Region" }
		],
		_data:{'items':[
			{ 'attribute': 'stat_name',  "alias":"Station name" },
			{ 'attribute': 'region',  "alias":"Region" }
		]},
		proxy: {
			type: 'memory',
			reader: {
				type: 'json',
				root: 'items'
			}
		}
	});
	

	var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
		clicksToMoveEditor: 1,
		autoCancel: false
	});
	var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1
    });
	
	var grid = 	Ext.create('Ext.grid.Panel', {
		title: 'Layer config: mgd_geodeticcontrol',
		store: Ext.data.StoreManager.lookup('layer_metadata'),
		columns: [
			{ text: 'Attribute',  dataIndex: 'attribute' },
			{ text: 'Alias', dataIndex: 'alias', flex: 1, editor: {}}
		],
		height: 200,
		width: 400,
		sortableColumns: false,
		renderTo: Ext.getBody(),
		plugins: [cellEditing],
		listeners: {
			edit: function(item, e){
				console.log(1,grid.store);
				e.record.commit();
				grid.store.commitChanges();
				console.log(2,grid.store);
			}
		}
	});
	/* grid.on('edit', function(editor, e) {
		// commit the changes right after editing finished
		//e.record.commit();
		console.log(e);	
	}); */



});



/*

[{
	attribute:'stat_name',
	alias:'Station name',
	search:true
},
{
	attribute:'region',
	alias:'Region',
	search:true
}]

*/