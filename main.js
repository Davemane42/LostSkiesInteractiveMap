
var Zoom = -4;

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
map.setView([0, 0], Zoom);

map.on('zoomanim', onZoomAnim);
map.on('zoomend', onZoomEnd);

var Layers = {}
Layers.zoomedIslandLayer = new L.LayerGroup();
Layers.islandLayer = new L.LayerGroup();
Layers.labelLayer = new L.LayerGroup();
Layers.markerLayer = new L.LayerGroup();


Layers.islandLayer.addTo(map);
Layers.labelLayer.addTo(map);


map.getRenderer(map).options.padding = 100;


L.rectangle(bounds, { color: "#ff0044", weight: 1, fillColor: '#3a4466' }).addTo(map)

asyncFetch("data/IslandData.csv")
  .then(data => onIslandDataReceived(data))


function onIslandDataReceived(data) {
  var rows = data.replace(/\r/g, '').split('\n');
  for (let i = 1; i < data.length; i++) {
    islandData = rows[i].split(',')
    var island = {
      ID: islandData[0],
      Name: islandData[1],
      Creator: islandData[2],
      Workshop: islandData[3],
      X: islandData[4],
      Y: islandData[5],
      Z: islandData[6],
      Difficulty: islandData[7],
      Ark: islandData[8],
      Databank: islandData[9],
      Chest: islandData[10],
      Metals: islandData[11],
      Woods: islandData[12]
    }


    // var cos = Math.cos(Math.PI/2)
    // var sin = Math.sin(Math.PI/2)
    // var x = (cos * island.X) + (sin * island.Z)
    // var z = (cos * island.Z) - (sin * island.X)
    // x = Math.round(x * 100) / 100
    // z = Math.round(z * 100) / 100
    // console.log('{"ID": ' + island.ID + ', "X": '+ x + ', "y": ' + island.Y+  ', "Z": ' + z + '},')

    var color = getDifficultyColor(island.Difficulty)
    var darkenColor = '#' + color.replace(/^#/, '').replace(/../g, colorComponent => ('0'+Math.min(255, Math.max(0, parseInt(colorComponent, 16) -64)).toString(16)).substr(-2));
    

    var basicMarkerOptions = {
      "fill": true,
      "fillColor": color,
      "fillOpacity": 1,
      "stroke": true,
      "color": darkenColor,
      "opacity": 1,
      "radius": 16
    }
    var basicMarker = new L.circleMarker([island.X, island.Z], basicMarkerOptions).addTo(Layers.markerLayer);

    // Island
    var islandIcon = L.divIcon({
      iconSize: [96, 96],
      className: 'island-marker',
      html: '<img src="'+'img/islands/' + island.ID + '_square.webp'+'"/>'
    })
    var islandMarker = L.marker([island.X, island.Z], { icon: islandIcon }).addTo(Layers.islandLayer);


    // ID Marker
    var idMarkerOptions = {
      "interactive": false,
      icon: new L.divIcon({ html: island.ID, className: 'point-label' }),
      pane: 'markerPane',
      zIndexOffset: 1000
    }
    var idMarker = new L.Marker([island.X, island.Z], idMarkerOptions).addTo(Layers.labelLayer);

    // Zoomed in island
    var zoomedIslandIcon = L.divIcon({
      iconSize: [96, 96],
      className: 'island-marker',
      html: '<h1>' + island.ID + ' - ' + island.Name + '</h1>' + '<img src="'+'img/islands/' + island.ID + '_square.webp'+'"/>'
            
    })
    var zoomedIslandMarker = new L.Marker([island.X, island.Z], { icon: zoomedIslandIcon }).addTo(Layers.zoomedIslandLayer);

    // Popup
    popup = '<b>#' + island.ID + ' - '

    if (island.Workshop != '') {
      popup += '<a href="' + island.Workshop + '" target="_blank">' + island.Name + '</a>'
    } else {
      popup += island.Name
    }

    popup += ' - <span style="color:'+color+'">' + island.Difficulty + ' ' + getDifficultyName(island.Difficulty) +'<span/></b><br>'

    popup += 'By: ' + island.Creator + '<br><br>' +
      'Altitute: ' + (1200+Math.round(island.Y/100)*100) +'m<br>'+
      'Has an Ark: ' + (island.hasArk ? "✅" : "❌") + '<br>' +
      'Databanks: ' + (island.Databank!==''?island.Databank:'Not Reported') + '<br>' +
      'Large Chest: ' + (island.Chest!==''?island.Chest:'Not Reported') + '<br>' +
      'Metals: ' + (island.Metals!==''?island.Metals.replace(/;/g, ','):'Not Reported') + '<br>' +
      'Woods: ' + (island.Woods!==''?island.Woods.replace(/;/g, ','):'Not Reported') + '<br>' +
      '<a href="img/islands/' + island.ID + '.webp" target="_blank"><img src="img/islands/' + island.ID + '_small.webp" width="320"></a><br>'

    var popupOptions = {
      minWidth: '320' 
    }

    basicMarker.bindPopup(popup, popupOptions);
    islandMarker.bindPopup(popup, popupOptions);
    zoomedIslandMarker.bindPopup(popup, popupOptions);
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

async function asyncFetch(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.text();
    return data;
  } catch (error) {
    console.error('Error fetching URL:', error);
  }
}

function getDifficultyColor(difficulty) {
  if (difficulty >= 14) {
    // Very-Hard
    return '#e43b44'
  } else if (difficulty >= 11) {
    // Hard
    return '#f77622'
  } else if (difficulty >= 8) {
    // Medium
    return '#feae34'
  } else if (difficulty >= 0) {
    // Easy
    return '#63c74d'
  }
  return '#2ce8f5'
}

function getDifficultyName(difficulty) {
  if (difficulty >= 14) {
    return 'VeryHard'
  } else if (difficulty >= 11) {
    return 'Hard'
  } else if (difficulty >= 8) {
    return 'Medium'
  } else if (difficulty >= 0) {
    return 'easy'
  }
  return 'ERROR'
}

function onZoomAnim(e) {
  Zoom = e.zoom;
}

function onZoomEnd(e) {

  if (Zoom == -5) {
    map.addLayer(Layers.markerLayer);
  } else {
    map.removeLayer(Layers.markerLayer)
  }

  if (Zoom > -5 && Zoom <= -4) {
    map.addLayer(Layers.islandLayer);
  } else {
    map.removeLayer(Layers.islandLayer);
  }

  if (Zoom >= -5 && Zoom <= -4) {
    map.addLayer(Layers.labelLayer);
  } else {
    map.removeLayer(Layers.labelLayer);
  }

  if (Zoom > -4) {
    map.addLayer(Layers.zoomedIslandLayer);
  } else {
    map.removeLayer(Layers.zoomedIslandLayer);
  }
}