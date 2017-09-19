// nztopomaps:
//      Sur Z=5..9, c'est une photo d'assemblage de cartes => légende illisible (trop petit)
//      Les Z=10,11,12 ont le meme detail, le 10 est illisible (légende minuscule)
//      Les Z=13,14,15 ont le meme detail, le 13 est illisible (légende minuscule)
//      Il vaut mieux alors utiliser OTM a ces Z.
//
// LINZ Data Service    https://data.linz.govt.nz/layer/767-nz-topo50-maps/webservices/
//      http://tiles-{s}.data-cdn.linz.govt.nz/services;key='   // s='abcd'
//		+ 'b0542c447ceb4901a8363b54f2441727'
//		+ '/tiles/v4/layer=xxx/EPSG:3857/{z}/{x}/{y}.png';
//    layer 2343 : NZ Topo50  gridless   details constants 1cm=500m
//                 valable pour Z=13..14 légendes et routes illisibles a Z<=12
//    layer 2324 : NZ Topo250 gridless   details constant 1cm=2500m
//                 valable pour Z=10..12 légendes et routes illisibles a Z<=9, limite pour 10
//
// Meilleure carte de Nouvelle-Zelande selon Z :
//  <=8   OTM
//    9
//   10   OSM ou outdoors
//   11   nztopomaps  (un peu petit)
//   12   nztopomaps
//   13   nztopomaps (plus de nom), ou OTM (camp mieux visibles)
//   14   nztopomaps  (mais camp pas tous marques)
//   15   nztopomaps
//   16   OSM         (ou outdoors mais le TA y est en dur)
//   17   OSM
// On peut construire cet empilement avec MOBAC et ses customMapSource/minZoom/maxZoom, ou bien avec
// un server HTTP local dedie
//
// Cf http://wiki.openstreetmap.org/wiki/Zoom_levels
//    Z    m/pixel    km/tile   (256pixels/tile, m pour lat=0)
//   10    152        39
//   11     76        19
//   12     38        10
//   13     19         4.9
//   14      9.5       2.440
//   15      4.8       1.220
//   16      2.4       0.610
//   17      1.2       0.306
//   18      0.6       0.153

var tilesNztopomaps = new L.TileLayer(
	'http://nz1.nztopomaps.com/{z}/{x}/{y}.png',
	{	maxZoom: 15,		// Offre du z=15 mais 15 n'a pas plus de detail que 14 et 13.
		continuousWorld: true,
		tms: true, //true pour nztopomaps
		attribution: 'nztopomaps.com, Sourced from LINZ. CC-BY 3.0' });

var tilesLDS50 = new L.TileLayer(
    'https://tiles-{s}.data-cdn.linz.govt.nz/services;key='
        + 'b0542c447ceb4901a8363b54f2441727'
        + '/tiles/v4/layer=2343,style=auto/{z}/{x}/{y}.png',
	{	maxZoom: 18,
		subdomains: 'ab',
		continuousWorld: true,
		tms: true,
		attribution: 'LINZ Data Service, CC-BY 3.0' });

var tilesLDS250 = new L.TileLayer(
    'http://tiles-{s}.data-cdn.linz.govt.nz/services;key='
					+ 'b0542c447ceb4901a8363b54f2441727'
					+ '/tiles/v4/layer=2324/EPSG:3857/{z}/{x}/{y}.png',
	{	maxZoom: 18,
		subdomains: 'ab',
		continuousWorld: true,
		tms: true,
		attribution: 'LINZ Data Service, CC-BY 3.0' });

var tilesWatercolor = new L.TileLayer(
	'http://tile.stamen.com/watercolor/{z}/{x}/{y}.jpg',
	{   maxZoom: 17,
		attribution: 'Stamen.com, Sourced from LINZ. CC-BY 3.0' });

var tilesToner = new L.TileLayer(
	'http://tile.stamen.com/toner/{z}/{x}/{y}.png',
	{   maxZoom: 15,
		attribution: 'Stamen.com, Sourced from LINZ. CC-BY 3.0' });

// StamenTerrain

var tilesOSM = new L.TileLayer(
	'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
	{   maxZoom: 19,
		subdomains: 'abc',
		attribution: 'OpenStreetMap. CC-BY 3.0' });

var tilesOCM = new L.TileLayer(
	'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
	{   maxZoom: 19,
		subdomains: 'ab',
		attribution: 'OpenCycleMap. CC-BY 3.0' });

var tilesOTM = new L.TileLayer(
	'http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',  /* https pour le site OTM uniquement */
	{   maxZoom: 17,
		subdomains: 'abc',
		attribution: '&copy; <a href="http://opentopomap.org/credits">OpenTopoMap</a> CC-BY-SA' });

var tilesOutdoors = new L.TileLayer(
	'https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=d2842e9679314b55a9c0a84e94961f0e',
	{   maxZoom: 17,
		subdomains: 'ab',
		attribution: 'Thunderforest.com. CC-BY 3.0' });

var tilesHikeBike = new L.TileLayer(
	'http://{s}.tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png',
	{   maxZoom: 17,
		subdomains: 'abc',
		attribution: 'Thunderforest.com. CC-BY 3.0' });

var tilesDelorme = new L.TileLayer(
	'http://server.arcgisonline.com/ArcGIS/rest/services/Specialty/DeLorme_World_Base_Map/MapServer/tile/{z}/{y}/{x}',
	{   minZoom: 1, maxZoom: 11,
		attribution: 'Tiles &copy; Esri &mdash; Copyright: &copy;2012 DeLorme' });

var tilesKorona = new L.TileLayer(
	'http://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}',
	{   minZoom: 1, maxZoom: 18,
		attribution: 'Tiles &copy; Korona Uni-Heidelberg' });
		
var tilesLocal = new L.TileLayer(                   // Special : server HTTP local pour mix
	'http://localhost:3000/tiles/{z}/{x}/{y}.png',
	{   maxZoom: 19,
		attribution: 'OSM, LINZ, et al., CC-BY-SA' });

var basemaps = {
	'<i>local</i>': tilesLocal,
	'nztopomaps': tilesNztopomaps,
	'NZ Topo50': tilesLDS50,
	'NZ Topo250': tilesLDS250,
	'nztopomaps': tilesNztopomaps,
	'OCM': tilesOCM,
	'OSM': tilesOSM,
	'OTM': tilesOTM,
	'Hike,Bike': tilesHikeBike,
	'Outdoors': tilesOutdoors,
    'DeLorme': tilesDelorme,
    'Korona': tilesKorona,
	'watercolor': tilesWatercolor,
	'toner': tilesToner
};

// Overlays
var tilesLonvia = new L.TileLayer(
	'http://tile.lonvia.de/hiking/{z}/{x}/{y}.png',
	{   maxZoom: 17,
		attribution: '<a hrf="http://lonvia.de/">Lonvia</a>, et al. CC-BY 3.0' });

var overlays = {
	'Lonvia': tilesLonvia
};


const CEN = [-41.228249, 174.484863];
const CDG = [49.023433, 2.565565];
const AKL = [-37.01184, 174.786966];
const INV = [-46.418097, 168.30338];


var map = new L.Map('eltmap', {
  crs: L.CRS.EPSG3857,
  layers: [tilesOutdoors],
  continuousWorld: true,
  worldCopyJump: false,
  zoomControl: false,
//zoomSnap: 0.5,
//zoomDelta: 0.5,
  attributionControl: true
});

L.control.layers(basemaps, overlays, { collapsed: true }).addTo(map);
L.control.scale({metric: true, imperial: true }).addTo(map);


/*--------------------------------------------------------------------
 * custom Control pour juste afficher du texte
 *
 */
 
//var TextControl = L.Control.extend({
//    options: {
//        // Default control position
//        position: 'topleft'
//    },
//    onAdd: function (map) {
//        // Create a container with classname and return it
//        return L.DomUtil.create('div', 'text-control');
//    },
//    setContent: function (content) {
//        // Set the innerHTML of the container
//        this.getContainer().innerHTML = content;
//    }
//});
//var textinfo =  new TextControl().addTo(map);
//function setInfo (content) {
//	textinfo.setContent(content);
//}
const msgelt = document.getElementById('msgmap');
function setInfo (content) {
	msgelt.innerHTML = content;
}


function floatImage(value) {
    const power = 1000000.0;
    return String(Math.round(value * power) / power);
}
function latlonImage(latlng) {
    return floatImage(latlng.lat) + " " + floatImage(latlng.lng);
}


//map.on('mousemove', function onMouseMove(e) {
//  msgelt.innerHTML = 'Current Zoom ' + map.getZoom() + "   " + latlonImage(e.latlng); });

map.on('zoomend', function onZoomChanged (e) {
	setInfo('zoom ' + map.getZoom()); });


map.on('keypress', function onKeyPressed (e) {
	console.log(e);
	console.log(e.originalEvent.charCode);
	if (e.originalEvent.code == 'KeyC') {
		setInfo('Lat Lon: ' + latlonImage(e.latlng)); } });

map.on('click', function onMapClick(e) {
	setInfo(latlonImage(e.latlng)); });


/* Emploi du plugin FileLayer pour charger du KML sur la carte
 */
var control = L.Control.fileLayerLoad({
  //Allows you to use a customized version of L.geoJson.
  //For example if you are using the Proj4Leaflet leaflet plugin,
  //you can pass L.Proj.geoJson and load the files into the
  //L.Proj.GeoJson instead of the L.geoJson.
  layer: L.geoJson,
  //See http://leafletjs.com/reference.html#geojson-options
  layerOptions: {
    style: { color: 'black' },
    filter: function (feature) {
      return (feature.geometry.type == "LineString"); }	
    },
  //Add to map after loading (default: true) ?
  addToMap: true,
  //File size limit in kb (default: 1024) ?
  fileSizeLimit: 4096,
  //Restrict accepted file formats (default: .geojson, .kml, and .gpx) ?
  formats: ['.geojson', '.kml', '.gpx']
}).addTo(map);

control.loader.on('data:loaded', function(e) {
  //Add to map layer switcher
  layerswitcher.addOverlay(e.layer, e.filename);
});

var zanim = null; //setInterval(zAnim,1000);


map.setView(CEN, (zanim) ? 1 : 6);


function addGpx(f, n, c='red') {
  omnivore.gpx("tracks/" + f,
		null,
		L.geoJson(null, {
			filter: function(f) { return (f.geometry.type == "LineString"); },
			style:  function(f) { return { color: c}; }}))
	.bindPopup(n).addTo(map);
}

function addKml(f, n, c='blue') {
  omnivore.kml("tracks/" + f,
		null,
		L.geoJson(null, {
			filter: function(f) { return (f.geometry.type == "LineString"); },
			style:  function(f) { return { color: c}; }}))
	.bindPopup(n).addTo(map);
}


function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {

    // Check if the XMLHttpRequest object has a "withCredentials" property.
    // "withCredentials" only exists on XMLHTTPRequest2 objects.
    xhr.open(method, url, true);

  } else if (typeof XDomainRequest != "undefined") {

    // Otherwise, check if XDomainRequest.
    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
    xhr = new XDomainRequest();
    xhr.open(method, url);

  } else {

    // Otherwise, CORS is not supported by the browser.
    xhr = null;

  }
  return xhr;
}


function loadInfos() {
  if (zanim) { clearInterval(zanim); zanim = null; }
  
//new L.circle(CEN, {radius: 20000}).bindPopup("Circle").addTo(map);
  new L.polyline([CDG,AKL], {color:'#A8A8A8', weight:1 }).addTo(map);
  new L.polyline([INV,CDG], {color:'#A8A8A8', weight:1 }).addTo(map);

  addGpx("TeAraroaTrail.gpx", 		"<P>Official Te Araroa</p><p>2016/17 (v35)</p>");

  addKml("pyke-track.kml", 			"Pyke");
  addKml("hollyford-track.kml",		"Hollyford");
  addKml("caples-track.kml",		"Caples");
  addKml("greenstone-track.kml",	"Greenstone");
  addKml("routeburn-track-2.kml",	"Routeburn");

  addKml("FrenchRidge.kml",			"French Ridge");
  addKml("aspiring.kml",			"Aspiring");
//addKml("MatukitukiW.kml",			"West Matukituki");
//addKml("MatukitukiW2.kml",		"West Matukituki");
//addKml("MatukitukiE.kml",			"East Matukituki");

  const inreachfeed = "https://inreach.garmin.com/Feed/Share/ThierryBernier?d1=2017-01-01T00:00Z";
  
  // CORS problem : le site de garmin n'allume pas "Access-Control-Allow-Origin"
  // Cf http://geographika.co.uk/archive/accessing-cross-domain-data-with-yql.html
  // https://files.delorme.com/support/inreachwebdocs/KML%20Feeds.pdf
//  console.log("download omnivore");
//  omnivore.kml(inreachfeed).bindPopup("Thierry's holidays").addTo(map);

/***
  console.log("download raw");
  var xhr = createCORSRequest('GET', inreachfeed);
  if (!xhr) {
    console.log('CORS not supported');
  } else {
    xhr.onload  = function() { console.log(xhr.responseText); };
    xhr.onerror = function() { console.log("error"); };
    xhr.withCredentials = true;
    xhr.send();
  }
***/

  console.log("download ajax");
  $.ajax({
    type: 'GET',
    url: inreachfeed,

    // The 'contentType' property sets the 'Content-Type' header.
    // The JQuery default for this property is
    // 'application/x-www-form-urlencoded; charset=UTF-8', which does not trigger
    // a preflight. If you set this value to anything other than
    // application/x-www-form-urlencoded, multipart/form-data, or text/plain,
    // you will trigger a preflight request.
    contentType: 'text/plain',

    xhrFields: { withCredentials: true  },

    headers: { },

    success: function() { console.log("success"); },
    error:   function() { console.log("error"); },
  });

/***
  console.log("download YQL");
  function GetMessagesCB(data) { console.debug("downloaded !\n" + data); }
  $.getJSON("http://query.yahooapis.com/v1/public/yql",
    {  q:      'select * from xml where url="' + inreachfeed + '"',
       format: 'xml' },
    function (data) {
      if (data.query.results) { GetMessagesCB(data.query.results.json); }
	  else { console.log('bad'); }
    }
  );
***/
}


function zAnim() { map.zoomIn(1); if (map.getZoom() >= 5) loadInfos(); }
if (! zanim) loadInfos();
