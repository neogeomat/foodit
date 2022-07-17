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
// function myHandler(geojson) {
//   console.debug(geojson);
// }

let photonControlOptions = {
  url: "https://photon.komoot.de/api/",
  placeholder: "Select a city",
  formatResult: function (feature, el) {
    var title = L.DomUtil.create("strong", "", el),
      detailsContainer = L.DomUtil.create("small", "", el),
      details = [],
      type = this.formatType(feature);
    if (feature.properties.name) {
      title.innerHTML = feature.properties.name;
    } else if (feature.properties.housenumber) {
      title.innerHTML = feature.properties.housenumber;
      if (feature.properties.street) {
        title.innerHTML += " " + feature.properties.street;
      }
    }
    // if (type) details.push(type);
    if (
      feature.properties.city &&
      feature.properties.city !== feature.properties.name
    ) {
      details.push(feature.properties.city);
    }
    if (feature.properties.country) details.push(feature.properties.country);
    // detailsContainer.innerHTML = details.join(', ');
    title.innerHTML += ", " + details.join(", ");
  },
  onSelected: function (feature) {
    // map.spin(true);
    // let $city = $citySelect.val();
    let $city = feature.properties.name;
    this.input.value = $city;

    // //get selected latlng
    // let $city_lat = parseFloat($(this).find(":selected").attr("data-lat"));
    // let $city_lng = parseFloat($(this).find(":selected").attr("data-lng"));
    let $city_lat = feature.geometry.coordinates[1];
    let $city_lng = feature.geometry.coordinates[0];

    if (marker != undefined) {
      map.removeLayer(marker);
    }
    marker = L.marker([$city_lat, $city_lng]);
    marker.addTo(map);
    centerLeafletMapOnMarker(map, marker);
    map.setZoom(15);

    // load nearby citys
    let $nearbyPlaceSelect = $("#nearbyPlaceSelect");
    let nearbyPlaceQuery = `[out:csv(name,::lat,::lon;false;'@')];(node[place~"city|town|village"](around:${$overpass_radius_suburb},${$city_lat},${$city_lng}););out;`;

    $nearbyPlaceSelect.empty();
    $nearbyPlaceSelect.append(
      `<option value="">Select a nearby place</option>`
    );
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
  },
};

// var searchControl = L.control.photon(photonControlOptions);
// searchControl.addTo(map);
// document.getElementById("citySelect").appendChild(searchControl.getContainer());

geocoder = L.Control.geocoder({
  collapsed: false,
  suggestMinLength: 3,
  errorMessage: "",
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
(geocoder.options.geocoder._decodeFeatures = function (data) {
  var results = [];
  // debugger;
  if (data && data.features) {
    for (var i = 0; i < data.features.length; i++) {
      var f = data.features[i];

      if (f.properties.countryCode == "DE") {
        var c = f.geometry.coordinates;
        var center = L.latLng(c[1], c[0]);
        var extent = f.properties.extent;
        var bbox = extent
          ? L.latLngBounds([extent[1], extent[0]], [extent[3], extent[2]])
          : L.latLngBounds(center, center);
        results.push({
          name: this._decodeFeatureName(f),
          html: this.options.htmlTemplate
            ? this.options.htmlTemplate(f)
            : undefined,
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
}),
  geocoder.on("markgeocode", function (e) {
    // console.log(e);
    feature = e.geocode;
    let $city = feature.properties.name;
    // this.input.value = $city;
    this._form.innerText = $city;

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
    marker.addTo(map);
    centerLeafletMapOnMarker(map, marker);
    map.setZoom(15);

    // load nearby citys
    let $nearbyPlaceSelect = $("#nearbyPlaceSelect");
    let nearbyPlaceQuery = `[out:csv(name,::lat,::lon;false;'@')];(node[place~"city|town|village"](around:${$overpass_radius_suburb},${$city_lat},${$city_lng}););out;`;

    $nearbyPlaceSelect.empty();
    $nearbyPlaceSelect.append(
      `<option value="">Select a nearby place</option>`
    );
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

// let $citySelect = $("#citySelect");
// $citySelect.change(function () {
//   map.spin(true);
//   let $city = $citySelect.val();

//   //get selected latlng
//   let $city_lat = parseFloat($(this).find(":selected").attr("data-lat"));
//   let $city_lng = parseFloat($(this).find(":selected").attr("data-lng"));

//   if (marker != undefined) {
//     map.removeLayer(marker);
//   }
//   marker = L.marker([$city_lat, $city_lng]);
//   marker.addTo(map);
//   centerLeafletMapOnMarker(map, marker);
//   map.setZoom(15);

//   // load nearby citys
//   let $nearbyPlaceSelect = $("#nearbyPlaceSelect");
//   let nearbyPlaceQuery = `[out:csv(name,::lat,::lon;false;'@')];(node[place~"city|town|village"](around:${$overpass_radius},${$city_lat},${$city_lng}););out;`;

//   $nearbyPlaceSelect.empty();
//   $nearbyPlaceSelect.append(`<option value="">Select a nearby place</option>`);
//   $.ajax({
//     url: $overpassUrl + encodeURIComponent(nearbyPlaceQuery),
//     beforeSend: function () {
//       console.log("Loading nearby cities...");
//     },
//     success: function (data) {
//       console.log("Nearby cities loaded");
//       console.log(data);
//       data = data.split("\n");
//       data.forEach(function (item) {
//         item = item.split("@");
//         $nearbyPlaceSelect.append(
//           `<option value='${item[0]}' data-lat="${item[1]}" data-lng="${item[2]}">${item[0]}</option>`
//         );
//       });
//       map.spin(false);
//     },
//     error: function (error) {
//       alert("Error loading nearby cities");
//       map.spin(false);
//     },
//   });

//   // load suburbs
//   let $suburbSelect = $("#suburbSelect");
//   let suburbQuery = `[out:csv(name,::lat,::lon;false;'@')];(node[place="suburb"](around:${$overpass_radius},${$city_lat},${$city_lng}););out;`;

//   let url = $overpassUrl + encodeURIComponent(suburbQuery);

//   $suburbSelect.empty();
//   $suburbSelect.append(`<option value="">Select a suburb</option>`);
//   $.ajax({
//     url: url,
//     success: function (data) {
//       console.log(data);
//       data = data.split("\n");
//       data.forEach(function (item) {
//         item = item.split("@");
//         $suburbSelect.append(
//           `<option value="${item[0]}"data-lat="${item[1]}"data-lng="${item[2]}">${item[0]}</option>`
//         );
//       });
//       map.spin(false);
//     },
//   }).fail(function (error) {
//     alert("Error loading suburbs");
//     map.spin(false);
//   });

//   // load streets
//   let $streetSelect = $("#streetSelect");
//   let streetQuery = `[out:csv(name,::lat,::lon;false;'@')];area[name="${$city}"];(way[highway][name](around:${$overpass_radius},${$city_lat},${$city_lng}););out center;`;

//   url = $overpassUrl + encodeURIComponent(streetQuery);

//   $streetSelect.empty();
//   $streetSelect.append(`<option value="">Select a Street</option>`);
//   $.get(url)
//     .done(function (data) {
//       console.log(data);
//       data = data.split("\n");
//       data.forEach(function (item) {
//         item = item.split("@");
//         $streetSelect.append(
//           `<option value="${item[0]}"data-lat="${item[1]}"data-lng="${item[2]}">${item[0]}</option>`
//         );
//       });
//       map.spin(false);
//     })
//     .fail(function (error) {
//       alert("Error loading suburbs");
//       map.spin(false);
//     });
// });

let $nearbyPlaceSelect = $("#nearbyPlaceSelect");
$nearbyPlaceSelect.change(function () {
  let $city = $nearbyPlaceSelect.val();
  let $city_lat = parseFloat($(this).find(":selected").attr("data-lat"));
  let $city_lng = parseFloat($(this).find(":selected").attr("data-lng"));
  if (marker != undefined) {
    map.removeLayer(marker);
  }
  marker = L.marker([$city_lat, $city_lng]);
  marker.addTo(map);
  centerLeafletMapOnMarker(map, marker);
  map.setZoom(15);
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

  start_marker = L.marker([$suburb_lat, $suburb_lng]);
  start_marker.addTo(map);
  start_pt = start_marker.getLatLng.latLng;
  centerLeafletMapOnMarker(map, start_marker);

  let $streetSelect = $("#streetSelect");
  let streetQuery = `[out:csv(name,::lat,::lon;false;'@')];area[name="${$city}"];(way[highway][name](around:${
    $overpass_radius / 2
  },${$city_lat},${$city_lng}););out center;`;

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
  if (marker != undefined) {
    map.removeLayer(marker);
  }
  //get selected latlng
  let $suburb_lat = parseFloat($(this).find(":selected").attr("data-lat"));
  let $suburb_lng = parseFloat($(this).find(":selected").attr("data-lng"));

  marker = L.marker([$suburb_lat, $suburb_lng]);
  marker.addTo(map);
  centerLeafletMapOnMarker(map, marker);
  map.setZoom(17);
});

// routing
var optionalMarkerGroup = L.layerGroup().addTo(map);
routingControl = L.Routing.control({
  // waypoints: [L.latLng(start_pt), L.latLng(e.latlng.lat, e.latlng.lng)],
  routeWhileDragging: true,
  collapsible: true,
  geocoder: geocoder.options.geocoder,
  // plan: L.Routing.Plan({
  //   reverseWaypoints: true,
  // })
  //autoRoute: true, // possibility to take autoRoute
  createMarker: function (i, start, n){
    var marker_icon = null;
    if (i == 0) {
        // This is the first marker, indicating start
        marker_icon = greenIcon;
    } else if (i == n -1) {
        //This is the last marker indicating destination
        marker_icon = redIcon;
    }else{
        //This is a intermediary marker
        marker_icon = orangeIcon;
    }
    var marker = L.marker (start.latLng, {
                draggable: true,
                bounceOnAdd: false,
                bounceOnAddOptions: {
                    duration: 1000,
                    height: 800, 
                    function(){
                        (bindPopup(myPopup).openOn(map))
                    }
                },
                icon: marker_icon
              });
    return marker
  },
}).addTo(map);
var start_pt;
var end_pt;
var start_marker = null;
var end_marker = null;

function editFeature(feature, layer) {
  console.log(JSON.stringify(feature.properties));
}

function showAssetInfo(e) {
  AssetMouseClick(e.target.feature.properties.objectid, e.latlng);
}

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

function startMap(e) {
  // if (start_marker != null) {
  //   map.removeLayer(start_marker);
  // }
  // start_marker = new L.Marker(e.latlng,{icon: greenIcon});
  // start_marker.addTo(map);
  start_pt = e.latlng;
  routingControl.spliceWaypoints(0, 1, e.latlng);
}
// var routingControl = null;
var removeRoutingControl = function () {
  if (routingControl != null) {
    map.removeControl(routingControl);
    routingControl = null;
  }
};
function endMap(e) {
  // if(end_marker != null){
  //   map.removeLayer(end_marker);
  // }
  // end_marker = new L.Marker(e.latlng,{icon: redIcon});
  // end_marker.addTo(map);
  routingControl.spliceWaypoints(routingControl.getWaypoints().length - 1, 1, e.latlng);
}

function intermediateMap(e) {
  routingControl.spliceWaypoints(routingControl.getWaypoints().length - 1, 0, e.latlng);
}

function optionalMap(e) {
  optionalMarker = new L.Marker(e.latlng,{icon: yellowIcon});
  optionalMarker.addTo(optionalMarkerGroup);
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
