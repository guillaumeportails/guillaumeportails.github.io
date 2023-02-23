// Carte Leaflet comprenant :
// + un fond a choisir, possiblement depuis un serveur local (localhost:3000)
// + des traces linestrings des chemins heberges sur le meme site que ce script
// + le feed InReach (points)
//
// Refs :
//  https://geojson.org/geojson-spec.html



// Decoder un parametre "?param=valeur" de l'URI
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function addslashes(str) {
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

// Source de tuiles/cartes 
//
// Cf https://leaflet-extras.github.io/leaflet-providers/preview/
//
// Cf http://wiki.openstreetmap.org/wiki/Zoom_levels
//    Z    m/pixel    km/tile   (256pixels/tile, m pour lat=0)
//    9                 80.0
//   10    152.0        39.0
//   11     76.0        19.0
//   12     38.0        10.0
//   13     19.0         4.9
//   14      9.5         2.440
//   15      4.8         1.220
//   16      2.4         0.610
//   17      1.2         0.306
//   18      0.6         0.153

const Zoom2Mile = [ 
//     0     1     2     3     4    5    6
    1000, 1000, 1000, 1000, 1000, 500, 200, 
//    7    8    9  10  11  12 13 14 15 16 17 18 19 20 21 22 23 24 25
    100,  50,  20, 10,  5,  5, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ];


const tilesWatercolor = new L.TileLayer(
    'http://tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', {
    maxZoom: 17,
    attribution: 'Stamen.com, Sourced from LINZ. CC-BY 3.0'
});

const tilesToner = new L.TileLayer(
    'http://tile.stamen.com/toner/{z}/{x}/{y}.png', {
    maxZoom: 15,
    attribution: 'Stamen.com, Sourced from LINZ. CC-BY 3.0'
});

const tilesTerrain = L.tileLayer(
    'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.{ext}', {
    maxZoom: 18,
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    ext: 'png'
});

const tilesOSM = new L.TileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    subdomains: 'abc',
    attribution: 'OpenStreetMap. CC-BY 3.0'
});

const tilesOTM = new L.TileLayer(
    'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', /* https pour le site OTM uniquement ?*/ {
    maxZoom: 17,
    subdomains: 'abc',
    attribution: '&copy; <a href="http://opentopomap.org/credits">OpenTopoMap</a> CC-BY-SA'
});

const tilesUSGS = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}', {
	maxZoom: 16,    // said 20, but seems 16
	attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
});

const tilesUSGSimageryTopo = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}', {
	maxZoom: 16,    // said 20 but seems 16
	attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
});

const tilesOutdoors = new L.TileLayer(
    'https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=d2842e9679314b55a9c0a84e94961f0e', {
    maxZoom: 17,
    subdomains: 'ab',
    attribution: '<a href="https://www.thunderforest.com">Thunderforest, CC-BY 3.0</a>'
});

const tilesHikeBike = new L.TileLayer(
    'http://{s}.tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png', {
    maxZoom: 17,
    subdomains: 'abc',
    attribution: '<a href="https://www.thunderforest.com">Thunderforest, CC-BY 3.0</a>'
});

const tilesDelorme = new L.TileLayer(
    'http://server.arcgisonline.com/ArcGIS/rest/services/Specialty/DeLorme_World_Base_Map/MapServer/tile/{z}/{y}/{x}', {
    minZoom: 1,
    maxZoom: 11,
    attribution: 'Tiles &copy; Esri &mdash; Copyright: &copy;2012 DeLorme'
});

const tilesWorldStreets = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});

const tilesImagery = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

const tilesKorona = new L.TileLayer(
    'http://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}', {
    minZoom: 1,
    maxZoom: 18,
    attribution: 'Tiles &copy; Korona Uni-Heidelberg'
});

const tilesLocal = new L.TileLayer( // Special : server HTTP local pour mix
    'http://localhost:3000/tiles/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'OSM, LINZ, et al., CC-BY-SA'
});

const basemaps = {
    'OSM': tilesOSM,
    'OTM (m)': tilesOTM,
//  'Hike,Bike': tilesHikeBike,
    'USGS (ft)': tilesUSGS,
    'USGS imagery': tilesUSGSimageryTopo,
    'Outdoors (m)': tilesOutdoors,
    'DeLorme': tilesDelorme,
    'WorldStreets': tilesWorldStreets,
//  'Korona': tilesKorona,
    'watercolor': tilesWatercolor,
    'toner': tilesToner,
    'terrain': tilesTerrain,
    'imagery': tilesImagery
};

// Overlays
const tilesWayMarkedTrails = new L.TileLayer(
    'https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '<a href="hiking.waymarkedtrails.org">waymarkedtrails.org</a>. CC-SA 3.0'
});


const overlays = {
    'Waymarkedtrails': tilesWayMarkedTrails
};


const iconPoint = L.icon({
    iconUrl: 'icon-walk.png',
    iconAnchor: [5, 5]
});
const iconCamp = L.icon({
    iconUrl: 'icon-camp.png',
    iconAnchor: [5, 5]
});
const iconTarget = L.icon({
    iconUrl: 'icon-target.png',
    iconAnchor: [15, 15]
});


var firstfly = true;
var flownTo = new Set();
var ttMilestone = [];            // Tootip array : miles mark

// Approx bounds of the CDT, geoJSON format  [ lng lat ]
const cdtBounds = [
    [-114.0, 49.0],
    [-105.0, 49.0],
    [-105.0, 31.0],
    [-114.0, 31.0]
];
// less approx
const cdtPolygon = [
    [-113.326252,46.375386],
    [-114.775113,48.992727],
    [-114.695734,45.700459],
    [-113.460733,44.118182],
    [-107.028708,39.752045],
    [-108.408835,37.928690],
    [-107.100957,36.536929],
    [-108.790538,35.000747],
    [-108.965692,31.299239],
    [-107.743995,31.297717],
    [-107.198116,34.979334],
    [-105.709069,36.582693],
    [-105.207683,40.708463],
    [-111.465271,45.531042],
    [-112.300283,49.037458],
    [-114.775113,48.992727]
];

const map = new L.Map('eltmap', {
    crs: L.CRS.EPSG3857,
    layers: [tilesOutdoors],
    continuousWorld: true,
    worldCopyJump: false,
    zoomControl: false,
    //zoomSnap: 0.5,
    //zoomDelta: 0.5,
    attributionControl: true
});

const mapCtrlLayers = L.control.layers(basemaps, overlays, {
    collapsed: true
}).addTo(map);

var lgPlaces = null;
//mapCtrlLayers.addOverlay(lgPlaces, 'Places');

L.control.scale({
    metric: true,
    imperial: true
}).addTo(map);


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
//  textinfo.setContent(content);
//}
const msgelt = document.getElementById('msgmap');

function setInfo(content) {
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

map.on('zoomend', function onZoomChanged(e) {
    //setInfo('zoom ' + map.getZoom());
});


map.on('keypress', function onKeyPressed(e) {
    console.log(e);
    console.log(e.originalEvent.charCode);
    if (e.originalEvent.code == 'KeyC') {
        setInfo('Lat Lon: ' + latlonImage(e.latlng));
    }
});

map.on('click', e => {
    setInfo(`${latlonImage(e.latlng)}  z${map.getZoom()}`);
});


// Emploi du plugin FileLayer pour charger du KML local sur la carte
// + Cas ou l'utilisateur voudrait ajouter ses propres GPX/KML
var control = L.Control.fileLayerLoad({
    //Allows you to use a customized version of L.geoJson.
    //For example if you are using the Proj4Leaflet leaflet plugin,
    //you can pass L.Proj.geoJson and load the files into the
    //L.Proj.GeoJson instead of the L.geoJson.
    layer: L.geoJson,
    //See http://leafletjs.com/reference.html#geojson-options
    layerOptions: {
        style: {
            color: 'black'
        },
        filter: function (feature) {
            return (feature.geometry.type == "LineString");
        }
    },
    //Add to map after loading (default: true) ?
    addToMap: true,
    //File size limit in kb (default: 1024) ?
    fileSizeLimit: 4096,
    //Restrict accepted file formats (default: .geojson, .kml, and .gpx) ?
    formats: ['.geojson', '.kml', '.gpx']
}).addTo(map);

control.loader.on('data:loaded', function (e) {
    //Add to map layer switcher
    layerswitcher.addOverlay(e.layer, e.filename);
});

var zanim = null; //setInterval(zAnim,1000);


// Commencer avec :
// + une vue globale trajet     [31.803, -42.367]   z3
map.setView([31.803, -42.367], (zanim) ? 1 : 3);


function addGpx(f, n, s = { color: 'red' }) {
    const layer = omnivore.gpx('tracks/' + f,
        null,
        L.geoJson(null, {
//            filter: function (f) {
//                return (f.geometry.type == 'LineString');
//            },
            style: function (f) { return s; }
//            onEachFeature: function (f, layer) {
//                console.log(f);
//            }
        }));
    layer.bindTooltip(n);
    // layer.addTo(map);
    return layer;
}


function addKml(f, c = 'blue') {
    const layer = omnivore.kml('tracks/' + f,
        null,
        L.geoJson(null, {
            style: function (f) {   // https://leafletjs.com/reference.html#path-option
                return {            // Transcode the styling found in KML  !Placemarks not caught here
                    color: (f.properties.stroke) ? '#' + f.properties.stroke : c,
                    opacity: (f.properties['stroke-opacity']) ? f.properties['stroke-opacity'] : 1.0,
                    weight: (f.properties['stroke-width']) ? f.properties['stroke-width'] : 1.0
                };
            },
            onEachFeature: function (f, layer) {
                var tt = '';
                if (f.properties && f.properties.name) {
                    tt = '<strong><center>' + f.properties.name + '</center></strong>';
                }
                if (f.properties && f.properties.description) {
                    tt = tt + '<p>' + f.properties.description + '</p>';
                }
                if (tt != '') layer.bindTooltip(tt);
                if (f.geometry.type == 'Point') layer.setIcon(iconTarget);
            }
        }));
    // layer.addTo(map);
    return layer;

}


function inreachBubble(prop) {
    return "<table>"
        + "<tr><td><h6>Time</h6></td><td><h6>"
        + (new Date(prop.timestamp)).toLocaleString() + "</h6></td></tr>"
        + "</table>"
        + ((prop.Text) ? ("<h5>" + prop.Text + "</h5>") : "");
}


// Cf https://github.com/mapbox/leaflet-omnivore/blob/master/index.js
//  pour les param de kml.Parse, qui est kmlParse, qui appelle toGEOJSON mais sans lui passer
//  d'options : fait a la main en incluant ici le code d'appel de toGeoJSON

function myKmlParse(xmldoc, title, cmt) {
    var line = []; // Pour reconstruire une L.Polyline des kml <Placemark>
    var prev = null;
    var wasz = false;
    var timl = new Date();
    var mgrp = L.markerClusterGroup({
        animate: true,
        disableClusteringAtZoom: 12
    });
    // Convertir le XMLDocument data en texte geoJSON puis en layer geojson
    // ! toGeoJson.kml() de mapbox 0.3.1 perd les <TimeStamp>
    //   La spec KML dit juste que TimeStamp est au format std de date XML,
    //   qui demande que le suffixe indique le type de temps, ex: Z = UTC
    //   Cf https://developers.google.com/kml/documentation/kmlreference#timestamp
    //      https://www.w3.org/TR/xmlschema-2/#isoformats
    // TODO : si on peut filter-out YQL de ExtendedData pour permettre plus de Placemark,
    //        alors suivre le TimeStamp pour trouver les "Je dors ici".
    var lgeo = L.geoJson(toGeoJSON.kml(xmldoc), options = {
        filter: function (f) {
            // L'objet LineString du XML n'est pas inclus il est redondant avec l'ensemble de Point
            return f.geometry.type == 'Point';
        },
        pointToLayer: function (p, latlng) {
            line.push([latlng.lat, latlng.lng]);
            const ts = new Date(p.properties.timestamp);
            wasz = (ts > timl); //(p.properties.Text == 'OK, je dors ici.');
            timl.setTime(ts.getTime() + 5 * 3600 * 1000); // Arret de plus de 5h = Zzzz
            if (prev && wasz) {
                prev.setIcon(iconCamp);
                prev.setZIndexOffset(100);
            }
            //console.log("togeoJson.pointToLayer " + p.properties.timestamp + " " + wasz + " " + p.properties.Text);
            var t = null;
            if (p.properties.timestamp)
                t = new Date(p.properties.timestamp).toLocaleString();
            else
                t = "UTC: " + new Date(p.properties['Time UTC']).toLocaleString();
            prev = L.marker(latlng, options = {
                title: t, // no HTML
                icon: iconPoint,
                zIndexOffset: 0
            });
            //mgrp.addLayer(prev);
            return prev;
        }
    });
    setInfo(line.length + " InReach points " + cmt);
    if (line.length > 0) {
        mlin = L.polyline(line, {
            color: 'firebrick',
            weight: 2,
            smoothFactor: 2
        }).bindPopup(title).addTo(mgrp);
        lgeo.bindPopup(function (layer) {
            return inreachBubble(layer.feature.properties);
        }).addTo(mgrp);
        map.addLayer(mgrp);
    }
}


async function loadInfos() {
    if (zanim) {
        clearInterval(zanim);
        zanim = null;
    }

    const s = {
        radius: 100000.0,
        color: '#A8A8A8',
        weight: 1
    };

    //------ Layer : Going there from home
    // Ref: https://github.com/henrythasler/Leaflet.Geodesic
    var lgStart = L.featureGroup();
    const CDG = { lng: 2.5509443, lat: 49.0080713 };
    const YYC = { lng: -114.0101401, lat: 51.131069 };
    const PHX = { lng: -112.010124, lat: 33.435249 };
    const g1 = new L.Geodesic([[CDG, YYC], [YYC, PHX]], {
        steps: 6, weight: 5, opacity: 0.5
    }).bindTooltip('CDG to PHX via YYC');
    lgStart.addLayer(g1);
    lgStart.addLayer(addKml('CDG_CrazyCook.kml'));
    mapCtrlLayers.addOverlay(lgStart, 'Going to Crazy Cook');
    lgStart.addTo(map);

    // Layer : The Plan
    var lgPlan = addGpx('CDT2023_plan.gpx', 'The Plan (hopefully)', { color: 'DarkOrchid', weight: 3, opacity: 1.0 });
    mapCtrlLayers.addOverlay(lgPlan, 'The Plan (hopefully)');
    lgPlan.addTo(map);

    //------ Layer : Offical trail
    // ! Le GPX lu est "en dur" avec un point par 0.5mi, donc on peut reconstruire les 3000 tooltip
    //   de chaque mile
    //   Les milestone doivent etre filtrees : faire des openTooltip ne suffit pas, du moment qu'il y
    //   a 3000 Tooltip dans map, ca rame. Il ne faut en inclure qu'un nombre limite (qq 10),
    //   seulement ceux qui sont visible au zoom/position actuelle
    //   Comme il n'y a pas de plugin adequat, on controle le pseudo groupe de milestone de facon
    //   liee a la polyline Red Line
    //
    // Alternatives :
    // + https://github.com/adoroszlai/leaflet-distance-markers
    //   <script src="leaflet-distance-marker.js"></script>
    //   => KO, le calcul de distance ne convient pas car le GPX est trop grossier
    //      utiliser les noms du GPX
    // + var lgMI = L.markerClusterGroup({ spiderfyOnMaxZoom: false, showCoverageOnHover: false, zoomToBoundsOnClick: false });
    //   var lgMI = L.featureGroup();
    //  mapCtrlLayers.addOverlay(lgMI, 'Official CDT Miles');
    //  map.addLayer(lgMI);
    //
    // lgRL.getBounds() ... il faut attendre hm.once('ready') => C'est aussi simple d'avoir en dur ce Bounds
    var lgRL = L.featureGroup(null, { attribution: 'CDTC'});
    ttMilestone = [];
    const rlStyle = { color: 'red', weight: 8, opacity: 0.7 };
    const hm = addGpx('CDT_HalfMile_2020.gpx', 'The Official "Red Line" CDT'); //, rlStyle);
    hm.once('ready', function (e) {
        const fc = e.target.toGeoJSON();
        // ? Qui a inverse lng,lat ?
        const coords = fc.features[0].geometry.coordinates.map(x => { return [ x[1], x[0]]; });
        const line = L.polyline(coords, rlStyle);
        lgRL.addLayer(line);
        const z = map.getZoom(); // e.zoom;
        const m = Zoom2Mile[z];
        for (let i = 0; i < coords.length; i += 2) {
            const mile = i / 2;
            const tt = L.tooltip(coords[i], { content: mile.toString(), className: 'milestone'});
            ttMilestone[mile] = tt;
        }
    });
    mapCtrlLayers.addOverlay(lgRL, 'Official CDT Milestones');

    function toggleMilestone(data) {
        if (data.layer && (data.layer != lgRL)) return;
        if (map.hasLayer(lgRL)) {
            const z = map.getZoom(); // e.zoom;
            const m = Zoom2Mile[z];
            ttMilestone.forEach((tt, i) => {
                if ( ((i % m) == 0) && map.getBounds().contains(tt.getLatLng()))
                    tt.addTo(map);
                else
                    tt.remove();
            });
            ttMilestone[ttMilestone.length-1].addTo(map);
        } else
            ttMilestone.forEach((tt) => tt.remove());
    }
    map.on('zoomend', toggleMilestone);
    map.on('moveend', toggleMilestone);
    map.on('overlayadd', toggleMilestone);
    map.on('overlayremove', toggleMilestone);


    //------ Layer : Native Land
    // Ref:     https://native-land.ca/resources/api-docs/
    //          geoJsonFeature.properties: 
    //​             ID: 12345,
    //​             Name: "Newe Sogobia (Eastern Shoshone)"
    //​             Slug: "eastern-shoshone"
    //​             color: "#386ECB"
    //​             description: "https://native-land.ca/maps/territories/eastern-shoshone/"
    var lgNative = L.featureGroup(null, { attribution: '<a href="https://native-land.ca">native-land.ca</a>' });
    fetch('https://native-land.ca/wp-json/nativeland/v1/api/index.php', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'maps': 'territories',
            'polygon_geojson': {
                'type': 'FeatureCollection',
                'features': [{
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': [cdtPolygon]
                    }
                }]
            }
        })
    }).then(resp => resp.json()
    ).then(json => {
        const layerNative = L.geoJson({'type': 'FeatureCollection', 'features': json }, {
            style: f => { return { color: f.properties.color }; }
        }).bindPopup(layer => layer.feature.properties.Name);
        setTimeout(function() {
            lgNative.addLayer(layerNative).addTo(map);
            mapCtrlLayers.addOverlay(lgNative, 'Native Land');
        }, 4*1000);
    });



    // // Lecture du eventuel tracks/feed.kml qui serait arrive ici par ses propres moyens ...
    // $.ajax({
    //     type: 'GET',
    //     url: 'tracks/feed.kml',
    //     dataType: 'xml',
    //     contentType: 'text/plain',
    //     xhrFields: {
    //         withCredentials: true
    //     },
    //     headers: {},
    //     success: function(data, textstatus, xhdr) { // data : XMLDocument
    //         console.log("GOT " + data.getElementsByTagName(
    //                 '*').length +
    //             " elements (same-domain)");
    //         myKmlParse(xmldoc = data, title = "InReach feed", cmt = "(hosted)");
    //     },
    //     error: function() {
    //         console.log("GET tracks/feed.kml error");
    //     }
    // });

    // Recherche du feed sur le domaine InReach
    //
    // + Expansion XML du feed InReach = 47 eltXML par Placemark
    // + YQL accepte au moins 84 Placemark = 8 jours
    //       vu un succes avec 320 points (14764 eltXML)
    const days = getParameterByName('days') || 30;
    console.log('days = ' + days);
    var d1 = new Date();
    d1.setTime(Date.now() - days * 86400 * 1000)

    // KML du tracking emis par la balise InReach :
    // Cf https://files.delorme.com/support/inreachwebdocs/KML%20Feeds.pdf
    const inreachfeed = 'https://inreach.garmin.com/Feed/Share/' +
        'ThierryBernier?d1=' + d1.toJSON();
    //                                  + '%26d2=' + d2.toJSON();

    // Tentative de GET Cross-Domain (en principe cela echoue avec un browser moderne / par defaut)
    // omnivore.kml(inreachfeed).addTo(map);
    // $.ajax({
    //     type: 'GET',
    //     url: inreachfeed,
    //     dataType: 'xml',
    //     contentType: 'text/plain',
    //     xhrFields: {
    //         withCredentials: true
    //     },
    //     headers: {},
    //     crossDomain: true,
    //     success: function (data, textstatus, xhdr) { // data : XMLDocument
    //         console.log("GOT " + data.getElementsByTagName(
    //             '*').length + " elements (CORS)");
    //         myKmlParse(xmldoc = data, title = "InReach since " + d1, cmt = "(CORS)");
    //     },
    //     error: function () {
    //         // => CORS problem : le site de garmin n'allume pas "Access-Control-Allow-Origin"
    //         //    On ne peut donc pas lire le feed InReach depuis ce JS qui provient d'un domaine
    //         //    (meme localhost) different de inreachfeed.
    //         // Quelques contournement possibles :
    //         // 1) Utiliser un proxy
    //         //  Cf http://geographika.co.uk/archive/accessing-cross-domain-data-with-yql.html
    //         //    Mais le proxy YQL est limite en taille par requete. Il faudrait en concatener
    //         //    plusieurs, en trouvant la taille limite
    //         // 2) Amener par le InReachFeed par un autre moyen sur le serveur de ce JS :
    //         //  2.1) si ce JS est execute sur un PC local et non pas en provenance du Web,
    //         //         alors il suffit de precharger le inreachfeed.
    //         //         Par exemple en profitant du code node.js qui permet de servir localement
    //         //         des tuiles de a Leaflet.
    //         //    2.2) si ce JS provient du Web, alors il faut qu'un PC y uploade le InReachFeed.
    //         // 3) ?
    //         //    Cf https://github.com/rndme/download : hors-sujet
    //         //    var xhr = createCORSRequest('GET', inreachfeed);
    //         //    if (!xhr) { console.log('CORS not supported'); } else {
    //         //      xhr.onload  = function() { console.log(xhr.responseText); };
    //         //      xhr.onerror = function() { console.log("error"); };
    //         //      xhr.withCredentials = true;
    //         //      xhr.send();
    //         //    }
    //         // 4) Faire que le browser accepte un GET cross domain.
    //         //    C'est possible pour firefox avec ce plugin :
    //         //      https://addons.mozilla.org/fr/firefox/addon/cross-domain-cors/
    //         console.log(
    //             "GET tracks/feed.kml error reverting to YQL"
    //         );
    //         // Emploi du web service publique YQL pour resoudre CORS :
    //         // + limite en taille  25 Placemark = 1194 XMLelt : 48 eltXML / Placemark
    //         // Limiter via https://developer.yahoo.com/yql/guide/paging.html ne semble pas marcher
    //         // => Changer les dates d1 et d2 dans l'URL de feed inreach
    //         //    Ex: chartreuse 2017/07 3 jours = 658 items, 1608 Document.elements : ok

    //         const yql_query =
    //             'https://query.yahooapis.com/v1/public/' +
    //             encodeURI(
    //                 'yql?q=select * from xml where url=') +
    //             "%22" + inreachfeed + '%22';
    //         console.log("ajax GET " + yql_query);
    //         $.ajax({
    //             type: 'GET',
    //             url: yql_query,
    //             dataType: 'xml',
    //             contentType: 'text/plain',
    //             xhrFields: {
    //                 withCredentials: true
    //             },
    //             headers: {},
    //             crossDomain: true,
    //             timeout: 7 * 1000, // YQL peut etre lent
    //             success: function (data,
    //                 textstatus, xhdr) { // data : XMLDocument
    //                 console.log("GOT " + data
    //                     .getElementsByTagName(
    //                         '*').length +
    //                     " XML elements (proxyed)"
    //                 );
    //                 if (data.getElementsByTagName(
    //                     '*').length < 40)
    //                     console.log(data); // TODO: recommencer avec 0.8*days
    //                 myKmlParse(xmldoc = data, title = "Inreach since " + d1, cmt = "(proxyed)");
    //             },
    //             error: function () {
    //                 console.log(
    //                     "ajax/YQL error");
    //             }
    //         });
    //     } // Cas error du ajax.GET direct
    // });


} // loadInfos()


function zAnim() {
    map.zoomIn(1);
    if (map.getZoom() >= 5) loadInfos();
}
if (!zanim) loadInfos();


// External call (from divphoto / drive.js)
function mapFlyTo(lat, lon, ref) {
    const s = `${lat} ${lon}`;
    if (!flownTo.has(s)) {
        flownTo.add(s);
        if (lgPlaces == null) {
            lgPlaces = L.markerClusterGroup();
            mapCtrlLayers.addOverlay(lgPlaces, 'Places');
        }
        const p = L.circleMarker([lat, lon], { interactive: true, radius: 8 }).bindTooltip(ref);
        lgPlaces.addLayer(p).addTo(map);
    }
    const z = (firstfly) ? 8 : map.getZoom();
    firstfly = false;
    map.setView(L.latLng(lat, lon), z, { animate: true, duration: 1.5 });
}
