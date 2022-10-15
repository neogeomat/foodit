let map2 = L.map("map2", {
    center: [53.03885, 8.837961],
    minZoom: 2,
    zoom: 12
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: ["a", "b", "c"],
}).addTo(map2);

routingControl2 = L.Routing.control({
    
});
routingControl2.addTo(map2);

$('#loadGeojson').click(()=>{
    let $waypointsGeojson = JSON.parse($('#waypointsExport').text());
    // alert($waypointsGeojson);
    let $routePoints = $waypointsGeojson['routePoints'];
    let $optionalPoints = $waypointsGeojson['optionalpoints'];

    routingControl2.setWaypoints($routePoints);
});

