
var Zoom = 0;

const map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -5,
  maxZoom: -3,
  zoomDelta: 0.5,
  zoomSnap: 0.5,
  attributionControl: false
});

const boundLimit = 10000
const bounds = [[-15000, -15000], [15000, 15000]];
map.setMaxBounds([[bounds[0][0]-boundLimit*2, bounds[0][1]-boundLimit], [bounds[1][0] + boundLimit*2, bounds[1][1] + boundLimit]]);
map.setView([0, 0], -4);

map.on('zoomanim', onZoomAnim);
map.on('zoomend', onZoomEnd);

var Layers = {}
Layers.islandLayer = new L.LayerGroup();
Layers.islandLayer.addTo(map);
Layers.markerLayer = new L.LayerGroup();
// Layers.markerLayer.addTo(map);


map.getRenderer(map).options.padding = 100;


L.rectangle(bounds, { color: "#ff0044", weight: 1, fillColor: '#3a4466' }).addTo(map)

fetchJSON("data/IslandData.json")
  .then(data => onIslandDataReceived(data))


function onIslandDataReceived(data) {
  for (let i = 0; i < data.length; i++) {
    var island = data[i],
      cos = Math.cos(Math.PI/2),
      sin = Math.sin(Math.PI/2),
      x = (cos * island.X) + (sin * island.Z),
      z = (cos * island.Z) - (sin * island.X);

    
    x = Math.round(x * 100) / 100
    z = Math.round(z * 100) / 100
    // console.log('{"ID": ' + island.ID + ', "X": '+ x + ', "y": ' + island.Y+  ', "Z": ' + z + '},')

    var markerOptions = {
      "fill": true,
      "fillColor": '#c0cbdc', //IslandType[(island.Type)].Color,
      "fillOpacity": 1,
      "stroke": true,
      "color": '#8b9bb4',
      "opacity": 1,
      "radius": 16
    }
    var marker = new L.circleMarker([x, z], markerOptions).addTo(Layers.markerLayer);

    var image = 'img/' + island.ID + '.webp'
    var myIcon = L.icon({
      iconUrl: image,
      iconSize: [96, 96]
    });
    var islandMarker = L.marker([x, z], { icon: myIcon }).addTo(Layers.islandLayer);

    popup = '<b>#' + island.ID + ' - '

    if (island.WorkshopLink != null) {
      popup += '<a href="' + island.WorkshopLink + '" target="_blank">' + island.Name + '</a></b><br>'
    } else {
      popup += island.Name + '</b><br>'
    }

    popup += 'By: ' + island.Creator + '<br><br>' +
      'Has an Ark: ' + (island.hasArk ? "✅" : "❌") + '<br>' +
      'Databanks: ' + island.Databank + '<br>' +
      'Large Chest: ' + island.LargeChest + '<br>' +
      'Metals: ' + island.Metals + '<br>' +
      'Woods: ' + island.Woods + '<br>' +
      '<img src="' + image + '" width="320"></a><br>'


    marker.bindPopup(popup, { minWidth: '320' });
    islandMarker.bindPopup(popup, { minWidth: '320' });


    var idMarkerOptions = {
      "interactive": false,
      icon: new L.divIcon({ html: island.ID, className: 'point-label' }),
      pane: 'markerPane',
      zIndexOffset: 1000
    }
    var idMarker = new L.Marker([x, z], idMarkerOptions).addTo(map);
  }
}

async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching JSON:', error);
  }
}

function onZoomAnim(e) {
  Zoom = e.zoom;

  if (Zoom <= -5) {
    map.removeLayer(Layers.islandLayer)
  }
  else if (Zoom > -5) {
    map.removeLayer(Layers.markerLayer)
  }
}

function onZoomEnd(e) {

  if (Zoom <= -5) {
    map.addLayer(Layers.markerLayer);
  }
  else if (Zoom > -5) {
    map.addLayer(Layers.islandLayer);
  }
}