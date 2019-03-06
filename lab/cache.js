/* First 4 variables extracted from conf.xml file */

/* Tile layers & map MUST have same projection */
var proj='EPSG:26915';


/* Layer can also accept serverResolutions array
 * to deal with situation in which layer resolution array & map resolution
 * array are out of sync*/
var mapResolutions = [33.0729828126323,16.9333672000677,8.46668360003387,4.23334180001693,2.11667090000847,1.05833545000423];

/* For this example this next line is not really needed, 256x256 is default.
 * However, you would need to change this if your layer had different tile sizes */
var tileSize = new OpenLayers.Size(256,256);

/* Tile Origin is required unless it is the same as the implicit map origin
 * which can be affected by several variables including maxExtent for map or base layer */
var agsTileOrigin = new OpenLayers.LonLat(-5120900,9998100);

/* This can really be any valid bounds that the map would reasonably be within */
/*  var mapExtent = new OpenLayers.Bounds(293449.454286,4307691.661132,314827.830376,4323381.484178); */
var mapExtent = new OpenLayers.Bounds(289310.8204,4300021.937,314710.8712,4325421.988);

var aerialsUrl = 'http://serverx.esri.com/arcgiscache/dgaerials/Layers/_alllayers';
var roadsUrl = 'http://serverx.esri.com/arcgiscache/DG_County_roads_yesA_backgroundDark/Layers/_alllayers';

var philExtent = new OpenLayers.Bounds(12180908.39350, 2155975.87538,14972268.14289, 531430.95962);

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
	projection: 'EPSG:900913'
};


var map;

function init(){
	map = new OpenLayers.Map('map', {
		maxExtent:mapExtent,
		controls: [
			new OpenLayers.Control.Navigation(
				{dragPanOptions: {enableKinetic: true}}
			),
			new OpenLayers.Control.LayerSwitcher(), 
			new OpenLayers.Control.PanZoomBar(),
			new OpenLayers.Control.MousePosition()]
	});
	
	var baseLayer = new OpenLayers.Layer.ArcGISCache('Aerials', 'http://pgp.namria.gov.ph/cache', mapConfig);
	/* var baseLayer = new OpenLayers.Layer.ArcGISCache('Aerials', aerialsUrl, {
		tileOrigin: agsTileOrigin,
		resolutions: mapResolutions,
		sphericalMercator: true,
		maxExtent: mapExtent,
		useArcGISServer: false,
		isBaseLayer: true,
		type: 'jpg',
		projection: proj
	}); */
	
	var overlayLayer = new OpenLayers.Layer.ArcGISCache('Roads', roadsUrl, {
		tileOrigin: agsTileOrigin,
		resolutions: mapResolutions,
		sphericalMercator: true,
		maxExtent: mapExtent,
		useArcGISServer: false,
		isBaseLayer: false,
		projection: proj
	});
	//map.addLayers([baseLayer, overlayLayer]);
	map.addLayers([baseLayer]);
	
	//map.zoomToExtent(new OpenLayers.Bounds(295892.34, 4308521.69, 312825.71, 4316988.37));
   // map.zoomToExtent(new OpenLayers.Bounds(-8341644, 4711236, -8339198, 4712459));
   map.zoomToExtent(philExtent);
}