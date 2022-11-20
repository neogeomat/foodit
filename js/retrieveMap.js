let users = [2,3,4,5,6];
let maps = {};
let routingControls = {};

for (let index = 0; index < users.length; index++) {
  const element = users[index];
  maps[element] = L.map("map"+element, {
    center: [53.03885, 8.837961],
    minZoom: 2,
    zoom: 12
  });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: ["a", "b", "c"],
}).addTo(maps[element]);

  routingControls[element] = L.Routing.control({
    fitSelectedRoutes:true
  });
  routingControls[element].addTo(maps[element]);
}
// let map2 = L.map("map2", {
//     center: [53.03885, 8.837961],
//     minZoom: 2,
//     zoom: 12
// });

// L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//   attribution:
//     '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
//   subdomains: ["a", "b", "c"],
// }).addTo(map2);

// routingControl2 = L.Routing.control({
    
// });
// routingControl2.addTo(maps[2]);

$('#loadGeojson').click(()=>{
    let $waypointsGeojson = JSON.parse($('#waypointsExport').text());
    // alert($waypointsGeojson);
    let $routePoints = $waypointsGeojson['routePoints'];
    let $optionalPoints = $waypointsGeojson['optionalpoints'];
    for (let index = 0; index < users.length; index++) {
      const element = users[index];
      routingControls[element].setWaypoints($routePoints);
    routingControls[element].route();
    routingControls[element].on('routesfound',route=>{
      console.log(route);
      route.sourceTarget._map.fitBounds(L.polyline(route.routes[0].coordinates).getBounds());
    });
    }
    
});

