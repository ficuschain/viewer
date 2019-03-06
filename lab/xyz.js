function init(){


	var mapConfig = {
		tileOrigin: new OpenLayers.LonLat(-20037508.342787,20037508.342787),
		resolutions: [ 3968.75793751588, 
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
					   0.661459656252646 ],
		sphericalMercator: true,
		maxExtent: new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34),
		useArcGISServer: false,
		isBaseLayer: true,
		type: 'png',
		projection: 'EPSG: 102100'
	};

	var layerExtent = new OpenLayers.Bounds( 11377751.943643,  688772.5488894,  16032461.217449 , 1843277.423948);
	map = new OpenLayers.Map( 'map', {
		//restrictedExtent: layerExtent,
		controls: [
			new OpenLayers.Control.Navigation(
				{dragPanOptions: {enableKinetic: true}}
			),
			new OpenLayers.Control.LayerSwitcher(), 
			new OpenLayers.Control.PanZoomBar(),
			new OpenLayers.Control.MousePosition()
		]
	} );
	layer = new OpenLayers.Layer.XYZ( "ESRI",
			//"http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${z}/${y}/${x}",
			"http://geoportal.gov.ph/ArcGIS/rest/services/Basemap/PGS_Basemap/MapServer/tile/${z}/${y}/${x}",
			mapConfig );
	map.addLayer(layer);
	//map.zoomToExtent(map.restrictedExtent);
	map.zoomToExtent(layerExtent);
}