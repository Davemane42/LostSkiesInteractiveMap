
var Zoom = -4;

const map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -7,
  maxZoom: -3,
  zoomDelta: 0.5,
  zoomSnap: 0.5,
  attributionControl: false
});


//const bounds = [[-25000, -25000], [25000, 25000]];
//L.rectangle(bounds, { color: "#ff0044", weight: 1, fillColor: '#3a4466' }).addTo(map)
//const boundLimit = 15000
// map.setMaxBounds([[bounds[0][0] - boundLimit * 2, bounds[0][1] - boundLimit], [bounds[1][0] + boundLimit * 2, bounds[1][1] + boundLimit]]);
L.circle([0, 0], {radius: 26000, color: "#ff0044", weight: 1, fillColor: '#3a4466' }).addTo(map)




map.setView([0, 0], Zoom);
map.getRenderer(map).options.padding = 100;

map.on('zoomanim', onZoomAnim);
map.on('zoomend', onZoomEnd);


var Layers = {}
Layers.zoomedIslandLayer = new L.LayerGroup();
Layers.islandLayer = new L.LayerGroup();
Layers.markerLayer = new L.LayerGroup();
Layers.wallLayer = new L.LayerGroup();

Layers.islandLayer.addTo(map);
Layers.wallLayer.addTo(map);


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
        //props.creator.toLowerCase().includes(searchText) ||
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

var bannerOverlay = L.control({
  position: 'topright'
});

bannerOverlay.onAdd = function(map) {
  var div = L.DomUtil.create('div', 'static-overlay');
  div.innerHTML = `<h3 style="color: white; background-color: black; text-align: center; margin: auto;">1.0 WIP</br>contact "Davemane42"</br>on Discord to help</h3>`
  L.DomEvent.disableClickPropagation(div);
  L.DomEvent.disableScrollPropagation(div);
  return div;
};

bannerOverlay.addTo(map);

asyncFetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRfvJ3efJxwK2ld-hnIoB-jdRN-n8U6XR0kSoOqNxcfyEDJiISo1zXlx5N4lci79WLM7tSH-bskeswQ/pub?gid=1976428671&single=true&output=csv')
  .then(csv => parseSheetCSV(csv))

asyncFetch('wallData.json')
  .then(json => parseWallJson(json))

function parseSheetCSV(csv) {
  var rows = csv.replace(/\r/g, '').split('\n');
  for (let i = 0; i < rows.length; i++) {
    var regex = /(?:,|^)("(?:(?:"")*[^"]*)*"|[^",]*)/g;
    var values = [...rows[i].matchAll(regex)].map(m => m[1].replace(/"/g, ''));

    if (values[0] == '' || isNaN(values[0])) {
      continue
    }
    // id, Name, PosX, PosY, PosZ, Region, Creator, Workshop, HasArk, Databanks, Large Chests, Description, HasImage
    var islandData = {
      ID: values[0],
      Name: values[1],
      X: values[2],
      Y: values[3],
      Z: values[4],
      Region: values[5],
      Creator: values[6],
      Workshop: values[7],
      HasArk: values[8],
      Databanks: values[9],
      Chests: values[10],
      Description: values[11],
      HasImage: values[12]
    }
    createIslandMarker(islandData)
  }
}

function parseWallJson(json) {
  var obj = JSON.parse(json)

  for (const regionType in obj) {
    const region = obj[regionType];

    // var regionType = regionType
    // var regionThickness = region.Thickness

    region.Segments.forEach(segment => {
      var [x1, z1] = rotateXZ(parseFloat(segment[0]), parseFloat(segment[1]))
      var [x2, z2] = rotateXZ(parseFloat(segment[2]), parseFloat(segment[3]))

      var polylineOptions = {
        color : getRegionColor(regionType),
        fill : false,
        interactive : false,
        opacity: 1,
        stroke : true,
        weight : 10
      }

      var polyline = L.polyline([[x1, z1], [x2, z2]], polylineOptions).addTo(Layers.wallLayer);
    });
  }
}


function createIslandMarker(islandData) {

  var [tx, tz] = rotateXZ(islandData.X, islandData.Z)
  islandData.X = Math.round(tx * 100) / 100
  islandData.Z = Math.round(tz * 100) / 100

  //var color = getDifficultyColor(islandData.Difficulty)
  color = getRegionColor(islandData.Region)
  if (color == '#ff0044') color = '#63c74d'
  var darkenColor = '#' + color.replace(/^#/, '').replace(/../g, colorComponent => ('0' + Math.min(255, Math.max(0, parseInt(colorComponent, 16) - 64)).toString(16)).substr(-2));

  islandDisplayName = islandData.Name.replaceAll('_', ' ')


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

  squareImageSrc = (islandData.HasImage == "TRUE" ? "img/islands/" + islandData.Name + "_square.webp" : 'img/bigFavicon.png')

  var islandMarkerOptions = {
    icon: L.divIcon({
      iconSize: [96, 96],
      popupAnchor: [0, -48],
      className: 'marker',
      html: '<img src="' + squareImageSrc + '"/>' +
            '<h1>'+ islandData.ID +'</h1>'
    })
  }
  var islandMarker = L.marker([islandData.X, islandData.Z], islandMarkerOptions).addTo(Layers.islandLayer);

  var zoomedIslandMarkerOptions = {
    icon: L.divIcon({
      iconSize: [96, 96],
      popupAnchor: [0, -48],
      className: 'marker-zoomedIn',
      html: '<h1>' + islandData.ID + ' - ' + islandDisplayName + '</h1>' + 
            '<img src="' + squareImageSrc + '"/>'
    }),
    name: islandDisplayName,
    id: islandData.ID,
    //creator: islandData.Creator
  }
  var zoomedIslandMarker = new L.Marker([islandData.X, islandData.Z], zoomedIslandMarkerOptions).addTo(Layers.zoomedIslandLayer);

  // difficulty = '<span style="color:' + color + '">' + islandData.Difficulty + ' ' + getDifficultyName(islandData.Difficulty) + '<span/>'
  workshopLink = (islandData.Workshop == '' ? islandDisplayName : '<a href="' + islandData.Workshop + '" target="_blank">' + islandDisplayName + '</a>')
  creator = (islandData.Creator == '' ? 'missing Creator': islandData.Creator)

  popup = `
    <b>#${islandData.ID} - ${workshopLink} - ${islandData.Region}</b><br>
    <b>By:</b> ${creator}<br><br>
    ${(islandData.Description !== '' ? '<details><summary>Description:</summary>' + islandData.Description + '</details><br>' : '')}
    <b>Altitute:</b> ${(1200 + Math.round(islandData.Y / 100) * 100)}m<br>
    <b>Has an Ark:</b> ${(islandData.HasArk == 'TRUE' ? "✅" : "❌")}<br>
    <b>Databanks:</b> ${(islandData.Databanks == '' ? 'Not Reported': islandData.Databanks)}<br>
    <b>Large Chests:</b> ${(islandData.Chests == '' ? 'Not Reported': islandData.Chests)}<br><br>
    ${(islandData.HasImage == "TRUE" ? '<a href="img/islands/'+islandData.Name+'.webp" target="_blank"><img src="img/islands/'+islandData.Name+'_small.webp" width="320"></a><br>' : '')}

  `.replace(/[\r\n\t]/g, '')
  //   <a href="img/islands/${islandData.ID}.webp" target="_blank"><img src="img/islands/${islandData.ID}_small.webp" width="320"></a><br>
  //   <a href="https://docs.google.com/spreadsheets/d/19hqTagUc_mKkPCioP0OQ_Dt7iesC4r_C5nMgRirHO8s" target="_blank">Report missing info</a> or
  //   <a href="https://discord.com/channels/947796968669851659/1363502652373209109" target="_blank">Discuss it on Discord</a>

  var popupOptions = {
    minWidth: '320'
  }

  zoomedOutMarker.bindPopup(popup, popupOptions);
  islandMarker.bindPopup(popup, popupOptions);
  zoomedIslandMarker.bindPopup(popup, popupOptions);
}

const rotateCos = Math.cos(Math.PI / 2)
const rotateSin = Math.sin(Math.PI / 2)

function rotateXZ(x, z) {
  var newX = (rotateCos * x) + (rotateSin * z)
  var newZ = (rotateCos * z) - (rotateSin * x)
  return [newX, -newZ]
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

function getRegionColor(regionType) {
  var color = "#ff0044"
  if (regionType == "WindRegion1") color = "#c0cbdc"
  if (regionType == "WindRegion2") color = "#8b9bb4"
  if (regionType == "StormRegion4") color = "#124e89"
  return color
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

  if (Zoom >= -6 && Zoom < -4.5) {
    map.addLayer(Layers.markerLayer);
  } else {
    map.removeLayer(Layers.markerLayer)
  }

  if (Zoom >= -4.5 && Zoom <= -4) {
    map.addLayer(Layers.islandLayer);
  } else {
    map.removeLayer(Layers.islandLayer);
  }

  if (Zoom > -4) {
    map.addLayer(Layers.zoomedIslandLayer);
  } else {
    map.removeLayer(Layers.zoomedIslandLayer);
  }

  var newWeight = 14+Zoom
  Layers.wallLayer.eachLayer(function(wall) {
      wall.setStyle({weight: newWeight});
    }
  );
}