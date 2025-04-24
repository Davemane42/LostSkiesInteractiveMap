
const IslandData = [
  {ID: 1, X: 10000, Y: 10000, Name: "Test1", Type:1},
  {ID: 2, X: 12000, Y: 12000, Name: "Test2", Type: 1},
  {ID: 3, X: 8000, Y: 8000, Name: "Test3", Type: 2},
  {ID: 4, X: 1889, Y: 16987, Name: "Test4", Type: 2},
  {ID: 5, X: 13589, Y: 9691, Name: "Test5", Type: 3},
]

const IslandType = {
  1: {Name: "Green Pines", Color: "#63c74d"},
  2: {Name: "Azure Grove", Color: "#124e89"},
  3: {Name: "Atlas Plains", Color: "#2ce8f5"},
}

const map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -4,
  maxZoom: -1,
  zoomDelta: 0.5,
  zoomSnap: 0.5,
  attributionControl: false
});

map.getRenderer(map).options.padding = 100;

const bounds = [[0, 0], [20000, 20000]];
map.setMaxBounds([[-1000, -1000], [bounds[1][0]+1000, bounds[1][1]+1000]]);
map.fitBounds(bounds);
map.setView([10000, 10000], -6);
L.rectangle(bounds, {color: "#ff0044", weight: 1, fillColor: '#3a4466'}).addTo(map)
// const image = L.imageOverlay('image.png', bounds).addTo(map);

for (let i = 0; i < IslandData.length; i++) {
  var island = IslandData[i]
  // var labelOptions = {
  //   "fill": true,
  //   "stroke": false,
  //   "fillcolor": "#ffffff",
  //   "fillopacity": 0.2,
  //   "interactive": false,
  //   icon : new L.divIcon({ html: island.ID, className: 'point-label'}),
  //   color : 'white',
  //   pane : 'markerPane'
  // }
  // var label = new L.Marker([island.X, island.Y], labelOptions).addTo(map);


  var markerOptions = {
    "fill": true,
    "fillColor": IslandType[(island.Type)].Color,
    "fillOpacity": 1,
    "stroke": true,
    "width": 3,
    "color": '#fff',
    "opacity": 1,
    "radius": 10
  }
  var marker = new L.circleMarker([island.X, island.Y], markerOptions).addTo(map);

  popup = '<b>' + island.Name + '</b><br>' + IslandType[(island.Type)].Name

  marker.bindPopup(popup, {minWidth: '320'});
}



console.log("Hello")