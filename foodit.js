let $countrySelect = $('#countrySelect');

let $citiesList = {};
$citiesList['Germany'] = ["Erlangen","Hildesheim","Chemnitz","Dresden","Hamburg","Köln","Bremen","Herne","Leipzig","Kiel","Dortmund","Lübeck","Würzburg","Moers","Bonn","Heilbronn","Essen","Frankfurt am Main","Siegen","Neuss","Bergisch Gladbach","Braunschweig","Recklinghausen","Pinneberg","Wolfsburg","Trier","Reutlingen","Magdeburg","Salzgitter","Bottrop","Wiesbaden","Bielefeld","Erfurt","Aachen","Pforzheim","Krefeld","Gelsenkirchen","Duisburg","Osnabrück","Heidelberg","Mannheim",
"Mönchengladbach","Remscheid","Offenbach am Main","Solingen","Darmstadt","Jena","Wuppertal","Freiburg im Breisgau","Kaiserslautern","Kleve","Bochum","Koblenz","Berlin","Hagen","Paderborn","Mainz","Karlsruhe","Regensburg","Ludwigshafen am Rhein","Düsseldorf","Münster","Oldenburg","Gütersloh","Bremerhaven","Saarbrücken","Augsburg","Nürnberg","Mülheim an der Ruhr","Kassel","Fürth","Oberhausen","Cottbus - Chóśebuz","Hannover","Leverkusen","Halle (Saale)","Stuttgart","Göttingen","Hanau","Rostock","Potsdam","Ulm","München","Hamm","Ingolstadt","Neumünster"];

var start_pt;
var start_marker = null;

function editFeature(feature, layer) {
    console.log(JSON.stringify(feature.properties));
}

function showAssetInfo(e) {
    AssetMouseClick(e.target.feature.properties.objectid, e.latlng);
}

function startMap (e) {
    if(start_marker !=null)
    {
        map.removeLayer(start_marker);
    }
    start_marker = new L.Marker(e.latlng);
    start_marker.addTo(map);
    start_pt=e.latlng;
}
var routingControl = null;
var removeRoutingControl = function () {
    if (routingControl != null) {
        map.removeControl(routingControl);
        routingControl = null;
    }
};

var redIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  var blueIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
function endMap (e) {
    if (routingControl != null)
    {
       removeRoutingControl();
    }
    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(start_pt),
            L.latLng(e.latlng.lat,e.latlng.lng)
        ],
        routeWhileDragging: true,
        //collapsible: true,
        //autoRoute: true, // possibility to take autoRoute
        createMarker: function(i, wp, nWps) {
            if(i==0){
            return L.marker(wp.latLng, {icon: blueIcon , draggable:true});
            }
            else{
                return L.marker(wp.latLng, {icon: redIcon , draggable:true});
            }
          },
    }).addTo(map);
    map.removeLayer(start_marker);
    
}

function intermediateMap (e) {
    map.zoomIn();
}

function closeMap (e) {
    map.zoomOut();
}

var map = L.map( 'map', {
    center: [53.0388500,8.8379610],
    minZoom: 2,
    zoom: 12
    ,
    contextmenu: true,
        contextmenuInheritItems: false,
        contextmenuWidth: 140,
        contextmenuItems: [
            {   
                text: 'START', 
                callback: startMap
            },
            { 
                text: 'END', 
                //icon: 'cut', 
                callback: endMap
            },
            { 
                text: 'Intermediate', 
                //icon: 'copy', 
                callback: intermediateMap
            },
            { 
                separator: true 
            },
            { 
                text: 'CLOSE', 
                //icon: 'close.jpg', 
                callback: closeMap 
            },
        ]
});

map.on('click', function(e){
    map.contextmenu.showAt(e.latlng)
});

L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: ['a','b','c']
}).addTo( map );

//   var style1 = [
//     new ol.style.Style({
//         image: new ol.style.Icon({
//             scale: .07,
//             src: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Green_Dot.svg",
//           }),
//         zIndex: 5,
//     }), 
// ];

// var style2 = [
//     new ol.style.Style({
//         image: new ol.style.Icon({
//             scale: .05,
//             src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Red_Dot.svg/180px-Red_Dot.svg.png",
//           }),
//         zIndex: 5,
//     }), 
// ];

var marker = {};


function centerLeafletMapOnMarker(map, marker) {
    var latLngs = [ marker.getLatLng() ];
    var markerBounds = L.latLngBounds(latLngs);
    map.fitBounds(markerBounds);
  }

let $overpassUrl = 'https://overpass-api.de/api/interpreter?data=';
$countrySelect.change(function() {
    let $country = $countrySelect.val();
    let $citiesSelect = $('#citySelect');
    switch ($country) {
        case 'Germany':
            $citiesSelect.empty();
            $citiesList['Germany'].forEach(function(city) {
                $citiesSelect.append(`<option value="${city}">${city}</option>`);
            });
            break;
        case 'France':
            $citiesSelect.empty();
            $citiesList['France'].forEach(function(city) {
                $citiesSelect.append(`<option value="${city}">${city}</option>`);
            });
            break;
    }
});

let $citySelect = $('#citySelect');
$citySelect.change(function() {
    let $city = $citySelect.val();
    let $suburbSelect = $('#suburbSelect');
    let query = `[out:csv(name,::lat,::lon;false;'@')];area[name="${$city}"];(node[place="suburb"](area););out;`;
    let url = $overpassUrl + query;

    $suburbSelect.empty();
    $suburbSelect.append(`<option value="">Select a suburb</option>`);
    $.get(url, function(data) {
        console.log(data);
        data = data.split("\n");
        data.forEach(function(item) {
            item = item.split("@");
            $suburbSelect.append(`<option value="${item[0]}"data-lat="${item[1]}"data-long="${item[2]}">${item[0]}</option>`);
        });
    });
});

let $suburbSelect = $('#suburbSelect');
$suburbSelect.change(function() {
    let $city = $citySelect.val();
    let $suburb = $suburbSelect.val();
 
    if (marker != undefined) {
        map.removeLayer(marker);
     };
    //get selected latlong
    let $suburb_lat = parseFloat($(this).find(':selected').attr("data-lat"));
    let $suburb_long = parseFloat($(this).find(':selected').attr("data-long"));

	start_marker = L.marker( [$suburb_lat, $suburb_long]);
    start_marker.addTo( map );
    start_pt = start_marker.getLatLng.latLng;
    centerLeafletMapOnMarker(map,start_marker);

    let $postcodeSelect = $('#postcodeSelect');
    let query = `[out:csv(name,::lat,::lon;false;'@')];area[name="${$city}"];(node[postal_code](area););out;`;
    $postcodeSelect.empty();
    $postcodeSelect.append(`<option value="">Select a postcode</option>`);
    let url = $overpassUrl + query;
    $.get(url, function(data) {
        console.log("suburb",data);
        data = data.split("\n");
        let i=1;      
        data.forEach(function(item) {
            item = item.split("@");
            $postcodeSelect.append(`<option value="${item[0]}"data-lat="${item[1]}"data-long="${item[2]}">${item[0]}</option>`);
        });
    });
});

let $postcodeSelect = $('#postcodeSelect');

$postcodeSelect.change(function() {

    if (marker != undefined) {
        map.removeLayer(marker);
     };
    //get selected latlong
    let $suburb_lat = parseFloat($(this).find(':selected').attr("data-lat"));
    let $suburb_long = parseFloat($(this).find(':selected').attr("data-long"));

	marker = L.marker( [$suburb_lat, $suburb_long] )
    marker.addTo( map );
    centerLeafletMapOnMarker(map,marker);
    
});