let $countrySelect = $("#countrySelect");

let $citiesList = {};

var map = L.map("map", {
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
      separator: true,
    },
    {
      text: "CLOSE",
      //icon: 'close.jpg',
      callback: closeMap,
    },
  ],
});

map.on("click", function (e) {
  map.contextmenu.showAt(e.latlng);
});

L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: ["a", "b", "c"],
}).addTo(map);

$.ajax({
  url: "data/cities&towns&villages_south2.csv",
  // url: "data/cities&towns&villages.csv",
  beforeSend: function () {
    console.log("Loading cities and towns...");
  },
  success: function (data) {
    // debugger;
    let lines = data.split("\r\n");
    for (let i = 1; i < lines.length; i++) {
      let line = lines[i];
      let parts = line.split(",");
      let lng = parts[0];
      let lat = parts[1];
      let osm_id = parts[2];
      let name = parts[3];
      if (!$citiesList["Germany"]) {
        $citiesList["Germany"] = {};
      }
      $citiesList["Germany"][name ? name.trimEnd() : ""] = {
        lat: lat,
        lng: lng,
        osm_id: osm_id,
        name: name ? name.trimEnd() : "",
      };
    }
  },
  error: function (error) {
    alert("Error loading cities and towns");
  },
});

let $overpassUrl = "https://overpass-api.de/api/interpreter?data=";
$countrySelect.change(function () {
  map.spin(true);
  let $country = $countrySelect.val();
  let $citiesSelect = $("#citySelect");
  switch ($country) {
    case "Germany":
      $citiesSelect.empty();
      // debugger;
      Object.keys($citiesList.Germany)
        .sort()
        .forEach(function (city) {
          $citiesSelect.append(
            `<option value = '${city}' data-lat="${$citiesList["Germany"][city]["lat"]}" data-lng="${$citiesList["Germany"][city]["lng"]}">${city}</option>`
          );
        });
      break;
    case "France":
      $citiesSelect.empty();
      $citiesList["France"].forEach(function (city) {
        $citiesSelect.append(
          `<option value='${city}' data-lat="${$citiesList["Germany"][city]["lat"]}" data-lng="${$citiesList["Germany"][city]["lng"]}">${city} onclick="alert();"</option>`
        );
      });
      break;
  }
  map.spin(false);
});

let $citySelect = $("#citySelect");
$citySelect.change(function () {
  map.spin(true);
  let $city = $citySelect.val();

  //get selected latlng
  let $city_lat = parseFloat($(this).find(":selected").attr("data-lat"));
  let $city_lng = parseFloat($(this).find(":selected").attr("data-lng"));

  if (marker != undefined) {
    map.removeLayer(marker);
  }
  marker = L.marker([$city_lat, $city_lng]);
  marker.addTo(map);
  centerLeafletMapOnMarker(map, marker);
  map.setZoom(15);

  // load suburbs
  let $suburbSelect = $("#suburbSelect");
  let suburbQuery = `[out:csv(name,::lat,::lon;false;'@')];area[name="${$city}"];(node[place="suburb"](around:2000,${$city_lat},${$city_lng}););out;`;

  let url = $overpassUrl + suburbQuery;

  $suburbSelect.empty();
  $suburbSelect.append(`<option value="">Select a suburb</option>`);
  $.ajax({
    url: url,
    success: function (data) {
      console.log(data);
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
  let streetQuery = `[out:csv(name,::lat,::lon;false;'@')];area[name="${$city}"];(way[highway][name](around:2000,${$city_lat},${$city_lng}););out center;`;

  url = $overpassUrl + streetQuery;

  $streetSelect.empty();
  $streetSelect.append(`<option value="">Select a Street</option>`);
  $.get(url)
    .done(function (data) {
      console.log(data);
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
});

let $suburbSelect = $("#suburbSelect");
$suburbSelect.change(function () {
  let $city = $citySelect.val();
  let $suburb = $suburbSelect.val();

  if (marker != undefined) {
    map.removeLayer(marker);
  }
  //get selected latlng
  let $suburb_lat = parseFloat($(this).find(":selected").attr("data-lat"));
  let $suburb_lng = parseFloat($(this).find(":selected").attr("data-lng"));

  start_marker = L.marker([$suburb_lat, $suburb_lng]);
  start_marker.addTo(map);
  start_pt = start_marker.getLatLng.latLng;
  centerLeafletMapOnMarker(map, start_marker);

  let $streetSelect = $("#streetSelect");
  let streetQuery = `[out:csv(name,::lat,::lon;false;'@')];area[name="${$city}"];(way[highway][name](around:1000,${$city_lat},${$city_lng}););out center;`;

  $streetSelect.empty();
  $streetSelect.append(`<option value="">Select a street</option>`);
  let url = $overpassUrl + query;
  $.get(url, function (data) {
    console.log("suburb", data);
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
  if (marker != undefined) {
    map.removeLayer(marker);
  }
  //get selected latlng
  let $suburb_lat = parseFloat($(this).find(":selected").attr("data-lat"));
  let $suburb_lng = parseFloat($(this).find(":selected").attr("data-lng"));

  marker = L.marker([$suburb_lat, $suburb_lng]);
  marker.addTo(map);
  map.setZoom(17);
  // centerLeafletMapOnMarker(map, marker);
});

// routing

routingControl = L.Routing.control({
  // waypoints: [L.latLng(start_pt), L.latLng(e.latlng.lat, e.latlng.lng)],
  routeWhileDragging: true,
  collapsible: true,
  //autoRoute: true, // possibility to take autoRoute
  // createMarker: function (i, wp, nWps) {
  //   if (i == 0) {
  //     return L.marker(wp.latLng, { icon: greenIcon, draggable: true });
  //   } else {
  //     return L.marker(wp.latLng, { icon: redIcon, draggable: true });
  //   }
  // },
}).addTo(map);
var start_pt;
var start_marker = null;

function editFeature(feature, layer) {
  console.log(JSON.stringify(feature.properties));
}

function showAssetInfo(e) {
  AssetMouseClick(e.target.feature.properties.objectid, e.latlng);
}

function startMap(e) {
  if (start_marker != null) {
    map.removeLayer(start_marker);
  }
  start_marker = new L.Marker(e.latlng);
  start_marker.addTo(map);
  start_pt = e.latlng;
}
var routingControl = null;
var removeRoutingControl = function () {
  if (routingControl != null) {
    map.removeControl(routingControl);
    routingControl = null;
  }
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
function endMap(e) {
  if (routingControl != null) {
    removeRoutingControl();
  }
  map.removeLayer(start_marker);
}

function intermediateMap(e) {
  map.zoomIn();
}

function closeMap(e) {
  map.zoomOut();
}

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
  var latLngs = [marker.getLatLng()];
  var markerBounds = L.latLngBounds(latLngs);
  map.fitBounds(markerBounds);
}
