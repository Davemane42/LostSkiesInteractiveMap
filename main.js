
var Zoom = -4;

const map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -5,
  maxZoom: -3,
  zoomDelta: 0.5,
  zoomSnap: 0.5,
  attributionControl: false
});


const bounds = [[-15000, -15000], [15000, 15000]];
L.rectangle(bounds, { color: "#ff0044", weight: 1, fillColor: '#3a4466' }).addTo(map)

const boundLimit = 10000
// map.setMaxBounds([[bounds[0][0] - boundLimit * 2, bounds[0][1] - boundLimit], [bounds[1][0] + boundLimit * 2, bounds[1][1] + boundLimit]]);

map.setView([0, 0], Zoom);
map.getRenderer(map).options.padding = 100;

map.on('zoomanim', onZoomAnim);
map.on('zoomend', onZoomEnd);


var Layers = {}
Layers.zoomedIslandLayer = new L.LayerGroup();
Layers.islandLayer = new L.LayerGroup();
Layers.markerLayer = new L.LayerGroup();

Layers.islandLayer.addTo(map);


L.control.mousePosition({ separator: ',', lngFirst: true, numDigits: -1 }).addTo(map);

var searchControl = new L.Control.Search({
  layer: Layers.zoomedIslandLayer,
  propertyName: 'name',
  textPlaceholder: 'Search island...',
  textErr: 'Island not found',
  marker: false,
  initial: false,
  moveToLocation: function (latlng, title, map) {
    Zoom = -3
    map.setView(latlng, -3);
  },
  buildTip: function (text, val) {
    var layer = val.layer;
    return  '<a href="#" class="search-tip">' +
              '<b>' + layer.options.id + ' - ' + layer.options.name + '</b><br/>' +
              'By: ' + layer.options.creator +
            '</a>';
  },
  filterData: function (text, records) {
    var filteredResults = {};
    var searchText = text.toLowerCase()

    Object.keys(records).forEach(function (key) {
      var props = records[key].layer.options
      if (
        props.name.toLowerCase().includes(searchText) ||
        props.creator.toLowerCase().includes(searchText) ||
        props.id.toLowerCase().includes(searchText)
      ) {
        filteredResults[key] = records[key]
      }
    });

    return filteredResults
  }
});
searchControl.on('search:locationfound', function (e) {
  setTimeout(function () {
    e.layer.openPopup();
  }, 300);
})

searchControl.addTo(map);
map.removeLayer(Layers.zoomedIslandLayer); // search add the layer back for some reason?


var staticOverlay = L.control({
  position: 'bottomright'
});

staticOverlay.onAdd = function(map) {
  var div = L.DomUtil.create('div', 'static-overlay');
  div.innerHTML = `
    <a target="_blank" href="https://github.com/Davemane42/LostSkiesInteractiveMap">
      <img width="48px" src="img/github-mark-white.svg">
    </a>
  `
  L.DomEvent.disableClickPropagation(div);
  L.DomEvent.disableScrollPropagation(div);
  return div;
};

staticOverlay.addTo(map);

asyncFetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vR6tqFj6KVN9H0WC9uLtJGuXzWN6zCiGNZQNMeWDl9HixL0Lf_dzvowD6-E6cexYyUFm1vU-w6Sf-m3/pub?gid=0&single=true&output=csv')
  .then(csv => parseSheetCSV(csv))


function parseSheetCSV(csv) {
  var rows = csv.replace(/\r/g, '').split('\n');
  for (let i = 0; i < rows.length; i++) {
    var regex = /(?:,|^)("(?:(?:"")*[^"]*)*"|[^",]*)/g;
    var values = [...rows[i].matchAll(regex)].map(m => m[1].replace(/"/g, ''));

    if (values[0] == '' || isNaN(values[0])) {
      continue
    }
    var islandData = {
      ID: values[0],
      Name: values[1],
      Creator: values[2],
      Workshop: (values[3] == 'missing in workshop' ? '' : values[3]),
      X: values[4],
      Y: values[5],
      Z: values[6],
      Difficulty: values[8].replace(/[^0-9]/g, ''),
      Databank: values[9],
      Ark: values[10],
      Metals: values[11],
      Woods: values[12],
      Plants: values[13],
      Items: values[14],
      Animals: values[15],
      Chest: values[17],
      Description: values[19]
    }
    createIslandMarker(islandData)
  }
}

function createIslandMarker(islandData) {

  var cos = Math.cos(Math.PI / 2)
  var sin = Math.sin(Math.PI / 2)
  var x = (cos * islandData.X) + (sin * islandData.Z)
  var z = (cos * islandData.Z) - (sin * islandData.X)
  islandData.X = Math.round(x * 100) / 100
  islandData.Z = Math.round(-z * 100) / 100

  var color = getDifficultyColor(islandData.Difficulty)
  var darkenColor = '#' + color.replace(/^#/, '').replace(/../g, colorComponent => ('0' + Math.min(255, Math.max(0, parseInt(colorComponent, 16) - 64)).toString(16)).substr(-2));


  var zoomedOutMarkerOptions = {
    icon : L.divIcon({
      iconSize: [48, 48],
      popupAnchor: [0, -24],
      className: 'marker',
      html: '<svg width="100%" height="100%">'+
              '<circle cx="50%" cy="50%" r="16" stroke="'+darkenColor+'" stroke-width="3" fill="'+color+'" />'+
            '</svg>'+
            '<h1 style="z-index: 201;">'+ islandData.ID +'</h1>'
    })
  }
  var zoomedOutMarker = L.marker([islandData.X, islandData.Z], zoomedOutMarkerOptions).addTo(Layers.markerLayer);


  var islandMarkerOptions = {
    icon: L.divIcon({
      iconSize: [96, 96],
      popupAnchor: [0, -48],
      className: 'marker',
      html: '<img src="img/islands/' + islandData.ID + '_square.webp"/>' +
            '<h1>'+ islandData.ID +'</h1>'
    })
  }
  var islandMarker = L.marker([islandData.X, islandData.Z], islandMarkerOptions).addTo(Layers.islandLayer);


  var zoomedIslandMarkerOptions = {
    icon: L.divIcon({
      iconSize: [96, 96],
      popupAnchor: [0, -48],
      className: 'marker-zoomedIn',
      html: '<h1>' + islandData.ID + ' - ' + islandData.Name + '</h1>' + 
            '<img src="img/islands/' + islandData.ID + '_square.webp"/>'
    }),
    name: islandData.Name,
    id: islandData.ID,
    creator: islandData.Creator
  }
  var zoomedIslandMarker = new L.Marker([islandData.X, islandData.Z], zoomedIslandMarkerOptions).addTo(Layers.zoomedIslandLayer);

  // Popup
  workshopLink = (islandData.Workshop != ''? '<a href="' + islandData.Workshop + '" target="_blank">' + islandData.Name + '</a>':islandData.Name)
  difficulty = '<span style="color:' + color + '">' + islandData.Difficulty + ' ' + getDifficultyName(islandData.Difficulty) + '<span/>'

  popup = `
    <b>#${islandData.ID} - ${workshopLink} - ${difficulty}</b><br>
    <b>By:</b> ${islandData.Creator}<br><br>
    ${(islandData.Description !== '' ? '<details><summary>Description:</summary>' + islandData.Description + '</details><br>' : '')}
    <b>Altitute:</b>${(1200 + Math.round(islandData.Y / 100) * 100)}m<br>
    <b>Has an Ark:</b>${(islandData.Ark == 'TRUE' ? "✅" : "❌")}<br>
    <b>Databanks:</b>${(islandData.Databank !== '' ? islandData.Databank : 'Not Reported')}<br>
    <b>Large Chest:</b>${(islandData.Chest !== '' ? islandData.Chest : 'Not Reported')}<br><br>
    <b>The following items are not a complete list:</b><br>
    <b>Metals:</b>${(islandData.Metals !== '' ? islandData.Metals : 'Not Reported')}<br>
    <b>Woods:</b>${(islandData.Woods !== '' ? islandData.Woods : 'Not Reported')}<br>
    <b>Plants:</b>${(islandData.Plants !== '' ? islandData.Plants : 'Not Reported')}<br>
    <b>Animals:</b>${(islandData.Animals !== '' ? islandData.Animals : 'Not Reported')}<br>
    <b>Items:</b>${(islandData.Items !== '' ? islandData.Items : 'Not Reported')}<br>
    <a href="img/islands/${islandData.ID}.webp" target="_blank"><img src="img/islands/${islandData.ID}_small.webp" width="320"></a><br>
    <a href="https://docs.google.com/spreadsheets/d/19hqTagUc_mKkPCioP0OQ_Dt7iesC4r_C5nMgRirHO8s" target="_blank">Report missing info</a> or
    <a href="https://discord.com/channels/947796968669851659/1363502652373209109" target="_blank">Discuss it on Discord</a>
  `.replace(/[\r\n\t]/g, '')

  var popupOptions = {
    minWidth: '320'
  }

  zoomedOutMarker.bindPopup(popup, popupOptions);
  islandMarker.bindPopup(popup, popupOptions);
  zoomedIslandMarker.bindPopup(popup, popupOptions);
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
  if (difficulty < 8) { return '#63c74d' }  // Easy
  if (difficulty < 11) { return '#feae34' } // Medium
  if (difficulty < 14) { return '#f77622' } // Hard
  return '#e43b44'                          // Very-Hard
}

function getDifficultyName(difficulty) {
  if (difficulty < 8) { return 'Easy' }
  if (difficulty < 11) { return 'Medium' }
  if (difficulty < 14) { return 'Hard' }
  return 'VeryHard'
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

  if (Zoom > -4) {
    map.addLayer(Layers.zoomedIslandLayer);
  } else {
    map.removeLayer(Layers.zoomedIslandLayer);
  }
}