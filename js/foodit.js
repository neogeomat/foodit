// const { geocoder } = require("./Control.Geocoder");

let $countrySelect = $("#countrySelect");

let $citiesList = {};

const $overpass_radius = 1500;

const $overpass_radius_suburb = 5000;

let map = L.map("map", {
  center: [53.03885, 8.837961],
  minZoom: 2,
  zoom: 12,
  contextmenu: true,
  contextmenuInheritItems: false,
  contextmenuWidth: 140,
  contextmenuItems: [
    {
      text: "START",
      callback: startMap,
    },
    {
      text: "END",
      //icon: 'cut',
      callback: endMap,
    },
    {
      text: "Intermediate",
      //icon: 'copy',
      callback: intermediateMap,
    },
    {
      text: "Optional",
      //icon: 'copy',
      callback: optionalMap,
    },
    {
      separator: true,
    },
    {
      text: "CLOSE",
      //icon: 'close.jpg',
      callback: closeMap,
    },
  ],
});

osm = new L.Control.Geocoder.Nominatim({
  geocodingQueryParams: { limit: 1 },
});
geocoder = L.Control.geocoder({
  collapsed: false,
  suggestMinLength: 3,
  errorMessage: "error",
  geocoder: L.Control.Geocoder.photon({
    geocodingQueryParams: {
      osm_tag: ["place:city", "place:town", "place:village"],
      lat: 48.9987,
      lon: 8.4045,
      zoom: 10,
      location_bias_scale: 0.5,
    },
    // htmlTemplate: function (r) {
    //   if (r.properties.country == "Germany") {
    //     return r.properties.country;
    //   } else {
    //     return null;
    //   }
    // },
  }),
}).addTo(map);
geocoder.options.geocoder._decodeFeatures = function (data) {
  var results = [];
  // debugger;
  var selectedCountry = $("#countrySelect").val();
  if (!selectedCountry) {
    // alert("Please select a country first");
    geocoder.options.geocoder.__proto__.options = {};
    geocoder.options.geocoder.__proto__.options.nameProperties = ['name', 'street', 'suburb', 'hamlet', 'town', 'city', 'state', 'country'];
    results = geocoder.options.geocoder.__proto__._decodeFeatures(data);
  }else
  if (data && data.features) {
    for (var i = 0; i < data.features.length; i++) {
      var f = data.features[i];

      if (selectedCountry && f.properties.countrycode == selectedCountry) {
        var c = f.geometry.coordinates;
        var center = L.latLng(c[1], c[0]);
        var extent = f.properties.extent;
        var bbox = extent ? L.latLngBounds([extent[1], extent[0]], [extent[3], extent[2]])
          : L.latLngBounds(center, center);
        results.push({
          name: this._decodeFeatureName(f),
          html: this.options.htmlTemplate ? this.options.htmlTemplate(f): undefined,
          center: center,
          bbox: bbox,
          properties: f.properties,
        });
      }
    }
  }
  // console.log(data.features);
  // console.table(results);
  return results;
};
geocoder.on("markgeocode", function (e) {
  // console.log(e);
  feature = e.geocode;
  let $city = feature.properties.name;
  // this.input.value = $city;
  // debugger;
  this._form.children[0].innerText = $city;
  // this._form.innerText = $city;

  // //get selected latlng
  // let $city_lat = parseFloat($(this).find(":selected").attr("data-lat"));
  // let $city_lng = parseFloat($(this).find(":selected").attr("data-lng"));
  // let $city_lat = feature.geometry.coordinates[1];
  // let $city_lng = feature.geometry.coordinates[0];
  let $city_lat = feature.center.lat;
  let $city_lng = feature.center.lng;

  if (marker != undefined) {
    map.removeLayer(marker);
  }
  marker = L.marker([$city_lat, $city_lng]);
  marker.feature = {};
  marker.feature.type = 'Feature';
  marker.feature.properties = {};
  marker.feature.properties['city'] = $city;
  // marker.addTo(map);
  centerLeafletMapOnMarker(map, marker);
  map.setZoom(15);

  // load nearby citys
  let $nearbyPlaceSelect = $("#nearbyPlaceSelect");
  let nearbyPlaceQuery = `[out:csv(name,::lat,::lon;false;'@')];(node[place~"city|town|village"](around:${$overpass_radius_suburb},${$city_lat},${$city_lng}););out;`;

  $nearbyPlaceSelect.empty();
  $nearbyPlaceSelect.append(`<option value="">Select a nearby place</option>`);
  $.ajax({
    url: $overpassUrl + encodeURIComponent(nearbyPlaceQuery),
    beforeSend: function () {
      console.log("Loading nearby cities...");
      map.spin(true);
    },
    success: function (data) {
      console.log("Nearby cities loaded");
      // console.log(data);
      data = data.split("\n");
      data.forEach(function (item) {
        item = item.split("@");
        $nearbyPlaceSelect.append(
          `<option value='${item[0]}' data-lat="${item[1]}" data-lng="${item[2]}">${item[0]}</option>`
        );
      });
      map.spin(false);
    },
    error: function (error) {
      alert("Error loading nearby cities");
      map.spin(false);
    },
  });

  // load suburbs
  let $suburbSelect = $("#suburbSelect");
  let suburbQuery = `[out:csv(name,::lat,::lon;false;'@')];(node[place="suburb"](around:${$overpass_radius_suburb},${$city_lat},${$city_lng}););out;`;

  let url = $overpassUrl + encodeURIComponent(suburbQuery);

  $suburbSelect.empty();
  $suburbSelect.append(`<option value="">Select a suburb</option>`);
  $.ajax({
    url: url,
    success: function (data) {
      // console.log(data);
      data = data.split("\n");
      data.forEach(function (item) {
        item = item.split("@");
        $suburbSelect.append(
          `<option value="${item[0]}"data-lat="${item[1]}"data-lng="${item[2]}">${item[0]}</option>`
        );
      });
      map.spin(false);
    },
  }).fail(function (error) {
    alert("Error loading suburbs");
    map.spin(false);
  });

  // load streets
  let $streetSelect = $("#streetSelect");
  let streetQuery = `[out:csv(name,::lat,::lon;false;'@')];area[name="${$city}"];(way[highway][name](around:${$overpass_radius},${$city_lat},${$city_lng}););out center;`;

  url = $overpassUrl + encodeURIComponent(streetQuery);

  $streetSelect.empty();
  $streetSelect.append(`<option value="">Select a Street</option>`);
  $.get(url)
    .done(function (data) {
      // console.log(data);
      data = data.split("\n");
      data.forEach(function (item) {
        item = item.split("@");
        $streetSelect.append(
          `<option value="${item[0]}"data-lat="${item[1]}"data-lng="${item[2]}">${item[0]}</option>`
        );
      });
      map.spin(false);
    })
    .fail(function (error) {
      alert("Error loading suburbs");
      map.spin(false);
    });

  // add coordinates to button
  $("#routingAddButton").attr("data-lat", $city_lat);
  $("#routingAddButton").attr("data-lng", $city_lng);
});

document.getElementById("citySelect").appendChild(geocoder.getContainer());
map.on("click", function (e) {
  map.contextmenu.showAt(e.latlng);
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: ["a", "b", "c"],
}).addTo(map);

// let $overpassUrl = "https://overpass-api.de/api/interpreter?data=";
let $overpassUrl = "https://overpass.kumi.systems/api/interpreter?data=";

let $nearbyPlaceSelect = $("#nearbyPlaceSelect");
$nearbyPlaceSelect.change(function () {
  let $city = $nearbyPlaceSelect.val();
  let $city_lat = parseFloat($(this).find(":selected").attr("data-lat"));
  let $city_lng = parseFloat($(this).find(":selected").attr("data-lng"));
  if (marker != undefined) {
    map.removeLayer(marker);
  }
  marker = L.marker([$city_lat, $city_lng]);
  marker.feature = {};
  marker.feature.type = 'Feature';
  marker.feature.properties = {};
  marker.feature.properties['city'] = $city;
  // marker.addTo(map);
  centerLeafletMapOnMarker(map, marker);
  map.setZoom(15);

  // add coordinates to button
  $("#routingAddButton").attr("data-lat", $city_lat);
  $("#routingAddButton").attr("data-lng", $city_lng);
});

let $suburbSelect = $("#suburbSelect");
$suburbSelect.change(function () {
  let $city = geocoder._form.innerText;
  let $suburb = $suburbSelect.val();

  if (marker != undefined) {
    map.removeLayer(marker);
  }
  //get selected latlng
  let $suburb_lat = parseFloat($(this).find(":selected").attr("data-lat"));
  let $suburb_lng = parseFloat($(this).find(":selected").attr("data-lng"));

  marker = L.marker([$suburb_lat, $suburb_lng]);
  marker.feature = {};
  marker.feature.type = 'Feature';
  marker.feature.properties = {};
  marker.feature.properties['city'] = $city;
  marker.feature.properties['suburb'] = $suburb;
  marker.addTo(map);
  centerLeafletMapOnMarker(map, marker);
  map.setZoom(16);

  // add coordinates to button
  $("#routingAddButton").attr("data-lat", $suburb_lat);
  $("#routingAddButton").attr("data-lng", $suburb_lng);

  let $streetSelect = $("#streetSelect");
  let streetQuery = `[out:csv(name,::lat,::lon;false;'@')];area[name="${$city}"];(way[highway][name](around:${
    $overpass_radius / 2
  },${$suburb_lat},${$suburb_lng}););out center;`;

  $streetSelect.empty();
  $streetSelect.append(`<option value="">Select a street</option>`);
  let url = $overpassUrl + encodeURIComponent(query);
  $.get(url, function (data) {
    // console.log("suburb", data);
    data = data.split("\n");
    let i = 1;
    data.forEach(function (item) {
      item = item.split("@");
      $streetSelect.append(
        `<option value="${item[0]}"data-lat="${item[1]}"data-lng="${item[2]}">${item[0]}</option>`
      );
    });
  });
});

let $streetSelect = $("#streetSelect");
$streetSelect.change(function () {
  let $city = geocoder._form.innerText;
  let $suburb = $suburbSelect.val();
  let $street = $streetSelect.val();
  if (marker != undefined) {
    map.removeLayer(marker);
  }
  //get selected latlng
  let $street_lat = parseFloat($(this).find(":selected").attr("data-lat"));
  let $street_lng = parseFloat($(this).find(":selected").attr("data-lng"));

  marker = L.marker([$street_lat, $street_lng]);
  marker.feature = {};
  marker.feature.type = 'Feature';
  marker.feature.properties = {};
  marker.feature.properties['city'] = $city;
  marker.feature.properties['suburb'] = $suburb;
  marker.feature.properties['street'] = $street;
  // marker.addTo(map);
  centerLeafletMapOnMarker(map, marker);
  map.setZoom(17);

  // add coordinates to button
  $("#routingAddButton").attr("data-lat", $street_lat);
  $("#routingAddButton").attr("data-lng", $street_lng);
});

// routing
window.LRM = {
  apiKey: '6020c86335mshe95b784272ac769p101741jsndd55ce126215',
tileLayerUrl: 'https://retina-tiles.p.rapidapi.com/local/osm{r}/v1/{z}/{x}/{y}.png?rapidapi-key=6020c86335mshe95b784272ac769p101741jsndd55ce126215',
osmServiceUrl: 'https://fast-routing.p.rapidapi.com/route/v1',
geocodeServiceUrl: 'https://forward-reverse-geocoding.p.rapidapi.com/v1/'
};

var redIcon = new L.Icon({
  iconUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

var greenIcon = new L.Icon({
  iconUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

var orangeIcon = new L.Icon({
  iconUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

var yellowIcon = new L.Icon({
  iconUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

var optionalMarkerGroup = L.layerGroup().addTo(map);
routingControl = L.Routing.control({
  geocodersClassName: "routing_geocoders",
  routeWhileDragging: true,
  collapsible: true,
  geocoder: geocoder.options.geocoder,
  reverseWaypoints: true,
  //autoRoute: true, // possibility to take autoRoute
  router: L.routing.osrmv1({
    requestParameters: {'rapidapi-key':LRM.apiKey},
    hints: false,
    // language: lang,
    serviceUrl: LRM.osmServiceUrl
  }),
  // waypoints: [
  //   L.latLng(57.74, 11.94),
  //   L.latLng(57.6792, 11.949)
  // ],
  createMarker: function (i, m, n) {
    var marker_icon = null;
    if (i == 0) {
      // This is the first marker, indicating the start point.
      marker_icon = greenIcon;
    } else if (i == n - 1) {
      //This is the last marker indicating destination
      marker_icon = redIcon;
    } else {
      //This is a intermediary marker
      marker_icon = orangeIcon;
    }
    var marker = L.marker(m.latLng, {
      draggable: true,
      bounceOnAdd: false,
      bounceOnAddOptions: {
        duration: 1000,
        height: 800,
        function() {
          bindPopup(myPopup).openOn(map);
        },
      },
      icon: marker_icon,
    });
    return marker;
  },
  geocoderClass: function (index, n, plan) {
    var geocoder_class = "";
    if (index == 0) {
      // This is the first marker, indicating the start point.
      geocoder_class = "start_geocoder";
    } else if (index == n - 1) {
      //This is the last marker indicating destination
      geocoder_class = "end_geocoder";
    } else {
      //This is a intermediary marker
      geocoder_class = "intermediary_geocoder";
    }
    return geocoder_class;
  },
}).addTo(map);
$(".start_geocoder").before($('<img src = "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png">'));
$(".end_geocoder").before($('<img src = "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png">'))


// routingControl.getContainer().style.display = 'none';
function editFeature(feature, layer) {
  console.log(JSON.stringify(feature.properties));
}

function showAssetInfo(e) {
  AssetMouseClick(e.target.feature.properties.objectid, e.latlng);
}

function startMap(e) {
  routingControl.spliceWaypoints(0, 1, e.latlng);
  let $removeStartButton = $('#removeStartBtn');
  $removeStartButton.on('click',removeStart);
  $removeStartButton.show();
}

function removeStart() {
  // alert();
  routingControl.spliceWaypoints(0, 1,null);
  $('#start').val('');
  let $removeStartButton = $('#removeStartBtn');
  $removeStartButton.hide();
}
// var routingControl = null;
var removeRoutingControl = function () {
  if (routingControl != null) {
    map.removeControl(routingControl);
    routingControl = null;
  }
};
function endMap(e) {
  routingControl.spliceWaypoints(
    routingControl.getWaypoints().length - 1,
    1,
    e.latlng
  );
  let $removeEndButton = $('#removeEndBtn');
  $removeEndButton.on('click',removeEnd);
  $removeEndButton.show();
}

function removeEnd() {
  // alert();
  routingControl.spliceWaypoints(routingControl.getWaypoints().length - 1, 1,null);
  $('#end').val('');
  let $removeEndButton = $('#removeEndBtn');
  $removeEndButton.hide();
}

function intermediateMap(e) {
  routingControl.spliceWaypoints(
    routingControl.getWaypoints().length - 1,
    0,
    e.latlng
  );
  $("#intermediate").empty();
  // populate intermediate list
  for (var i = 1; i < routingControl.getWaypoints().length - 1; i++) {
    let $li = $("<li>");
    let $input = $("<input>");
    $input.attr("id", "intermediate" + i);
    $input.attr("type", "text");
    $input.attr("value", routingControl.getWaypoints()[i].name);
    $input.attr("class", "intermediate");
    $input.attr("onchange", "updateIntermediate(" + i + ")");
    $li.append($input);

    let $removeIntermediateBtn = $('<button>');
    $removeIntermediateBtn.attr("id","removeintermediate" + i);
    $removeIntermediateBtn.attr("class", "removeintermediate");
    $removeIntermediateBtn.text('Remove');
    $removeIntermediateBtn.attr("onclick","removeintermediate("+i+")");
    $li.append($removeIntermediateBtn);
    $("#intermediate").append($li);
  }
  // option to add more
  $li = $("<li>");
  $input = $("<input>");
  $li.append($input);
  $("#intermediate").append($li);
}

function removeintermediate(index) {
  // alert(index);
  routingControl.spliceWaypoints(index, 1);
  $('#intermediate' + index).val('');
  $('#intermediate' + index).parent().remove();

  // fukang list nhugu dekeu
  ll = $('#intermediate>li');
  ll.each(l => {
    const i = l+1;
    ll[l].children[0].setAttribute('id','intermediate' + i);
    ll[l].children[0].setAttribute('onchange','updateIntermediate('+i+')');
    ll[l].children[1].setAttribute('id','removeintermediate' + i);
    ll[l].children[1].setAttribute('onclick','removeintermediate('+i+')');
    // console.log(ll[l]);
  });

  // let $removeEndButton = $('#removeEndBtn');
  // $removeEndButton.hide();
}

function optionalMap(e) {
  optionalMarker = new L.Marker(e.latlng, { icon: yellowIcon });
  optionalMarker.addTo(optionalMarkerGroup);
  // $("#optional").empty();
  osm.reverse(optionalMarker.getLatLng(), 18, (e) => {
    console.log(e);
    optionalMarker.name = e[0].name;
    _optionallistdraw(optionalMarkerGroup);
  });
  routingControl.fire('routesfound',{ routes: routingControl._routes});
}

function removeOptional(index){
  optionalMarkerGroup.removeLayer(optionalMarkerGroup.getLayers()[index]);
  _optionallistdraw(optionalMarkerGroup);
}

function _optionallistdraw(optionalMarkerGroup){
  $("#optional").empty();
  for (var i = 0; i < optionalMarkerGroup.getLayers().length; i++) {
    let $li = $("<li>");
    let $input = $("<input>");
    $input.attr("id", "optional" + i);
    $input.attr("type", "text");
    $input.attr("value", optionalMarkerGroup.getLayers()[i].name);
    $input.attr("class", "optional");
    $input.attr("onchange", "updateOptional(" + i + ")");
    $li.append($input);

    let $removeOptionalBtn = $('<button>');
    $removeOptionalBtn.attr("id","removeOptional" + i);
    $removeOptionalBtn.attr("class", "removeOptional");
    $removeOptionalBtn.text('Remove');
    $removeOptionalBtn.attr("onclick","removeOptional("+i+")");
    $li.append($removeOptionalBtn);
    $("#optional").append($li);
  }
  // option to add more
  $li = $("<li>");
  $input = $("<input>");
  $li.append($input);
  $("#optional").append($li);
}

routingControl.getPlan().on("waypointgeocoded", function (e) {
  if (e.waypointIndex == 0) {
    $("#start").val(e.waypoint.name);
  } else if (e.waypointIndex == routingControl.getWaypoints().length - 1) {
    $("#end").val(e.waypoint.name);
  } else {
    $("#intermediate" + e.waypointIndex).val(e.waypoint.name);
    // console.log($("#intermediate"+e.waypointIndex));
  }
});
function closeMap(e) {
  map.zoomOut();
}

var marker = {};

function centerLeafletMapOnMarker(map, marker) {
  var latLngs = [marker.getLatLng()];
  var markerBounds = L.latLngBounds(latLngs);
  map.fitBounds(markerBounds);
}

routingControl.on('routesfound', route => {
  // console.log(route);
  // map.spin(false);
  // map._spinner.stop();
  // setTimeout(function() { map.spin(false); }, 1000);
  var itineraryDiv = document.getElementById('routeExport');
  var g = L.geoJSON();
  g.addLayer(L.polyline(route.routes[0].coordinates));
  // itineraryDiv.innerHTML = `<div>${JSON.stringify(g.toGeoJSON())}</div>`;

  var waypointsDiv = document.getElementById('waypointsExport');
  var p = L.geoJSON();
  for(let o in route.routes[0].inputWaypoints){
    // console.log(o);
    let marker = L.marker(route.routes[0].inputWaypoints[o].latLng);
    marker.feature = {};
    marker.feature.type = 'Feature';
    marker.feature.properties = {};
    marker.feature.properties.type = 'routePoint';

    p.addLayer(marker);
  }
  optionalMarkerGroup.eachLayer(marker=>{
    console.log(marker);
    marker.feature = {};
    marker.feature.type = 'Feature';    
    marker.feature.properties = {};
    marker.feature.properties.type = 'optionalPoint';

    p.addLayer(marker);
  });
  // waypointsDiv.innerHTML = `<div>${JSON.stringify(p.toGeoJSON())}</div>`;
  waypointsDiv.innerHTML = `{"routePoints":${JSON.stringify(route.routes[0].inputWaypoints)},"optionalpoints":${JSON.stringify(optionalMarkerGroup.getLayers())}}`;

  var combinedExportDiv = document.getElementById('combinedExport');
  var e = L.geoJSON();
  for(let o in route.routes[0].inputWaypoints){
    // console.log(o);
    let marker = L.marker(route.routes[0].inputWaypoints[o].latLng);
    marker.feature = {};
    marker.feature.type = 'Feature';
    marker.feature.properties = {};
    marker.feature.properties.type = 'routePoint';

    e.addLayer(marker);
  }
  optionalMarkerGroup.eachLayer(marker=>{
    console.log(marker);
    marker.feature = {};
    marker.feature.type = 'Feature';    
    marker.feature.properties = {};
    marker.feature.properties.type = 'optionalPoint';

    e.addLayer(marker);
  });
  e.addLayer(L.polyline(route.routes[0].coordinates));
  // combinedExportDiv.innerHTML = `<div>${JSON.stringify(e.toGeoJSON())}</div>`;
  // debugger;
});