let $countrySelect = $('#countrySelect');

let $citiesList = {};
$citiesList['Germany'] = ["Erlangen","Hildesheim","Chemnitz","Dresden","Hamburg","Köln","Bremen","Herne","Leipzig","Kiel","Dortmund","Lübeck","Würzburg","Moers","Bonn","Heilbronn","Essen","Frankfurt am Main","Siegen","Neuss","Bergisch Gladbach","Braunschweig","Recklinghausen","Pinneberg","Wolfsburg","Trier","Reutlingen","Magdeburg","Salzgitter","Bottrop","Wiesbaden","Bielefeld","Erfurt","Aachen","Pforzheim","Krefeld","Gelsenkirchen","Duisburg","Osnabrück","Heidelberg","Mannheim",
"Mönchengladbach","Remscheid","Offenbach am Main","Solingen","Darmstadt","Jena","Wuppertal","Freiburg im Breisgau","Kaiserslautern","Kleve","Bochum","Koblenz","Berlin","Hagen","Paderborn","Mainz","Karlsruhe","Regensburg","Ludwigshafen am Rhein","Düsseldorf","Münster","Oldenburg","Gütersloh","Bremerhaven","Saarbrücken","Augsburg","Nürnberg","Mülheim an der Ruhr","Kassel","Fürth","Oberhausen","Cottbus - Chóśebuz","Hannover","Leverkusen","Halle (Saale)","Stuttgart","Göttingen","Hanau","Rostock","Potsdam","Ulm","München","Hamm","Ingolstadt","Neumünster"];

var map = L.map( 'map', {
    center: [53.0388500,8.8379610],
    minZoom: 2,
    zoom: 12
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

	marker = L.marker( [$suburb_lat, $suburb_long] )
    marker.addTo( map );
    centerLeafletMapOnMarker(map,marker);

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