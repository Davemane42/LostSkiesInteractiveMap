
const Themes = {
  "Default": { // based on Endesga 32 palette
    "--map-bg": "#181425",
    "--bg-dark": "#262b44",
    "--bg-medium": "#3a4466",
    "--bg-light": "#5a6988",
    "--text-muted": "#c0cbdc",
    "--text-primary": "#ffffff",
    "--text-stroke": "#181425",
    "--text-link": "#ff0044",

    "accent": "#ff0044",

    "wall_WindRegion1": "#c0cbdc",
    "wall_WindRegion2": "#8b9bb4",
    "wall_StormRegion4": "#124e89",

    "biome_Green Pines": "#63c74d",
    "biome_Azure Grove": "#0099db",
    "biome_Atlas Heights": "#124e89",
    "biome_Midlands": "#d77643",
    "regionShadePercent": -20,
  },
  "OneDark": {
    "--map-bg": "#282c34", //@syntax-bg
    "--bg-dark": "#282c34",
    "--bg-medium": "#5c6370", //@mono-3
    "--bg-light": "#6a758a",
    "--text-muted": "#828997", //@mono-2
    "--text-primary": "#abb2bf", //@mono-1
    "--text-stroke": "#282c34",
    "--text-link": "#61afef",

    "accent": "#e06c75",

    "wall_WindRegion1": "#abb2bf",
    "wall_WindRegion2": "#858fa3", //@syntax-gutter
    "wall_StormRegion4": "#4b5263",

    "biome_Green Pines": "#98c379",
    "biome_Azure Grove": "#56b6c2",
    "biome_Atlas Heights": "#61afef",
    "biome_Midlands": "#e5c07b",
    "regionShadePercent": -20,
  },
  "Catppuccin Mocha": {
    "--map-bg": "#1e1e2e",  // Base
    "--bg-dark": "#181825", // Mantle
    "--bg-medium": "#313244", // Surface0
    "--bg-light": "#45475a",  // Surface1
    "--text-muted": "#a6adc8",  // Subtext0
    "--text-primary": "#cdd6f4", // Text
    "--text-stroke": "#11111b", // Crust
    "--text-link": "#89b4fa",   // Blue

    "accent": "#f38ba8", // Red

    "wall_WindRegion1": "#9399b2",  // Overlay2
    "wall_WindRegion2": "#7f849c",  // Overlay1
    "wall_StormRegion4": "#313244", // Surface0

    "biome_Green Pines": "#a6e3a1", // Green
    "biome_Azure Grove": "#89dceb", // Sky
    "biome_Atlas Heights": "#89b4fa", // Blue
    "biome_Midlands": "#fab387",    // Peach
    "regionShadePercent": -20,
  },
  // "Catppuccin Latte": {
  //   "--map-bg": "#eff1f5",  // Base
  //   "--bg-dark": "#e6e9ef", // Mantle
  //   "--bg-medium": "#ccd0da", // Surface0
  //   "--bg-light": "#bcc0cc",  // Surface1
  //   "--text-muted": "#8c8fa1",  // Overlay1
  //   "--text-primary": "#4c4f69", // Text
  //   "--text-stroke": "#eff1f5", // Base (light halo)
  //   "--text-link": "#1e66f5",   // Blue

  //   "accent": "#8839ef",          // Mauve

  //   "wall_WindRegion1": "#6c6f85",  // Subtext0
  //   "wall_WindRegion2": "#9ca0b0",  // Overlay0
  //   "wall_StormRegion4": "#acb0be", // Surface2

  //   "biome_Green Pines": "#40a02b", // Green
  //   "biome_Azure Grove": "#209fb5", // Sapphire
  //   "biome_Atlas Heights": "#1e66f5", // Blue
  //   "biome_Midlands": "#fe640b",    // Peach
  //   "regionShadePercent": -15,
  // },
  "Gruvbox Dark": {
    "--map-bg": "#282828", // bg0
    "--bg-dark": "#282828", // bg0
    "--bg-medium": "#504945", // bg2
    "--bg-light": "#7c6f64", // bg4
    "--text-muted": "#a89984", // fg4
    "--text-primary": "#ebdbb2", // fg1
    "--text-stroke": "#32302f", // bg s
    "--text-link": "#cc241d", // dark red

    "accent": "#cc241d", // dark red

    "wall_WindRegion1": "#7c6f64", // bg4
    "wall_WindRegion2": "#665c54", // bg3
    "wall_StormRegion4": "#458588", // dark blue

    "biome_Green Pines": "#b8bb26", // bright green
    "biome_Azure Grove": "#8ec07c", // bright aqua
    "biome_Atlas Heights": "#83a598", // bright blue
    "biome_Midlands": "#fadb2d", // bright yellow
    "regionShadePercent": -20,
  },
  "Gruvbox Light": {
    "--map-bg": "#fbf1c7",  // bg0
    "--bg-dark": "#a89984", // bg4
    "--bg-medium": "#d5c4a1", // bg2
    "--bg-light": "#fbf1c7",  // bg0
    "--text-muted": "#a89984",  // fg4
    "--text-primary": "#3c3836", // fg1
    "--text-stroke": "#282828", // fg
    "--text-link": "#cc241d",   // bright blue

    "accent": "#cc241d",          // bright red

    "wall_WindRegion1": "#a89984",  // bg4
    "wall_WindRegion2": "#bdae93",  // bg3
    "wall_StormRegion4": "#076678", // dark blue

    "biome_Green Pines": "#98971a", // bright green
    "biome_Azure Grove": "#689d6a", // bright aqua
    "biome_Atlas Heights": "#458588", // bright blue
    "biome_Midlands": "#d79921",    // bright yellow
    "regionShadePercent": -15,
  },
}

const userThemesStorageKey = "UserThemes"
var UserThemes = JSON.parse(localStorage.getItem(userThemesStorageKey) || '{}')
var currentTheme = getAllThemes()[Settings.Theme] ?? Themes["Default"]

if (!getAllThemes()[Settings.Theme]) {
  Settings.Theme = "Default"
  saveSettings()
}

Object.entries(currentTheme).forEach(([key, value]) => {
  if (key.startsWith("--")) document.documentElement.style.setProperty(key, value)
})

// --- Functions ---

function getAllThemes() {
  return { ...Themes, ...UserThemes }
}

function isUserTheme(name) {
  return name in UserThemes
}

function saveUserThemes() {
  localStorage.setItem(userThemesStorageKey, JSON.stringify(UserThemes))
}

function getThemeColor(key) {
  return currentTheme[key] ?? "#ff00ff"
}

function getThemeSetting(key) {
  return currentTheme[key] ?? 0
}

function updateLegend() {
  var el = document.querySelector('.legend-content')
  if (el) el.innerHTML = getLegendHTML()
}

function updateThemeButtons() {
  var row = document.getElementById('theme-user-buttons')
  if (!row) return
  row.style.display = isUserTheme(Settings.Theme ?? "Default") ? 'flex' : 'none'
}

function updateThemeSelect() {
  var select = document.getElementById('theme-select')
  if (!select) return
  select.innerHTML = ''

  var builtInGroup = document.createElement('optgroup')
  builtInGroup.label = 'Built-in'
  Object.keys(Themes).forEach(name => {
    var option = document.createElement('option')
    option.value = name
    option.textContent = name
    option.selected = name === (Settings.Theme ?? "Default")
    builtInGroup.appendChild(option)
  })
  select.appendChild(builtInGroup)

  if (Object.keys(UserThemes).length > 0) {
    var userGroup = document.createElement('optgroup')
    userGroup.label = 'Custom'
    Object.keys(UserThemes).forEach(name => {
      var option = document.createElement('option')
      option.value = name
      option.textContent = name
      option.selected = name === (Settings.Theme ?? "Default")
      userGroup.appendChild(option)
    })
    select.appendChild(userGroup)
  }

  updateThemeButtons()
}

function applyTheme(themeName) {
  currentTheme = getAllThemes()[themeName] ?? Themes["Default"]
  Object.entries(currentTheme).forEach(([key, value]) => {
    if (key.startsWith("--")) document.documentElement.style.setProperty(key, value)
  })
  Settings.Theme = themeName
  saveSettings()
  refreshMapColors()
  updateLegend()
  updateThemeButtons()
}

function refreshMapColors() {
  if (borderCircleLayer) borderCircleLayer.setStyle({ color: getThemeColor("accent") })
  Layers.wallLayer.eachLayer(function(layer) {
    if (layer.options.wallType) layer.setStyle({ color: getThemeColor("wall_" + layer.options.wallType) })
  })
  Layers.regionLayer.eachLayer(function(layer) {
    if (layer.options.biomeType) layer.setStyle({ color: shadeColorOKLAB(getThemeColor("biome_" + layer.options.biomeType), getThemeSetting("regionShadePercent")) })
  })
  refreshAllIslandMarkers()
}

// --- Export / Import ---

function exportTheme() {
  var name = Settings.Theme ?? "Default"
  var theme = getAllThemes()[name] ?? Themes["Default"]
  triggerDownload({ version: 1, name: name, theme: theme }, 'LostSkiesTheme-' + name + '-' + getExportDate() + '.json')
}

function importTheme() {
  openFilePicker(function(text) {
    var parsed
    try { parsed = JSON.parse(text) } catch(e) { alert('Import failed: file is not valid JSON'); return }
    try {
      if (typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('file content must be a JSON object')
      if (typeof parsed.name !== 'string' || !parsed.name.trim()) throw new Error('theme name is missing')
      if (typeof parsed.theme !== 'object' || Array.isArray(parsed.theme)) throw new Error('theme data is missing or malformed')
      var name = parsed.name.trim()
      if (name in Themes) throw new Error('"' + name + '" is a built-in theme and cannot be overwritten')
      if (name in UserThemes && !confirm('Theme "' + name + '" already exists. Overwrite it?')) return
      UserThemes[name] = parsed.theme
      saveUserThemes()
      applyTheme(name)
      updateThemeSelect()
    } catch(err) {
      alert('Import failed: ' + err.message)
    }
  })
}

// --- Custom themes CRUD ---

function createCustomTheme() {
  var name = prompt('New theme name:')
  if (name === null) return
  name = name.trim()
  if (!name) { alert('No name provided'); return }
  if (name in getAllThemes()) { alert('A theme with that name already exists'); return }

  UserThemes[name] = { ...(getAllThemes()[Settings.Theme ?? "Default"] ?? Themes["Default"]) }
  saveUserThemes()
  applyTheme(name)
  updateThemeSelect()
  openThemeEditor()
}

function renameCustomTheme() {
  var oldName = Settings.Theme
  if (!isUserTheme(oldName)) return
  var newName = prompt('Rename "' + oldName + '" to:')
  if (newName === null) return
  newName = newName.trim()
  if (!newName) { alert('No name provided'); return }
  if (newName in getAllThemes()) { alert('A theme with that name already exists'); return }

  UserThemes[newName] = UserThemes[oldName]
  delete UserThemes[oldName]
  saveUserThemes()
  Settings.Theme = newName
  currentTheme = UserThemes[newName]
  saveSettings()
  updateThemeSelect()
}

function deleteCustomTheme() {
  var name = Settings.Theme
  if (!isUserTheme(name)) return
  if (!confirm('Delete theme "' + name + '"?')) return
  delete UserThemes[name]
  saveUserThemes()
  applyTheme("Default")
  updateThemeSelect()
}

// --- Theme editor ---

const themeEditorFields = [
  { key: "--map-bg",             label: "Map BG",         type: "color"     },
  { key: "--bg-dark",            label: "BG Dark",        type: "color"     },
  { key: "--bg-medium",          label: "BG Medium",      type: "color"     },
  { key: "--bg-light",           label: "BG Light",       type: "color"     },
  { key: "--text-muted",         label: "Text Muted",     type: "color"     },
  { key: "--text-primary",       label: "Text Primary",   type: "color"     },
  { key: "--text-stroke",        label: "Text Stroke",    type: "color"     },
  { key: "--text-link",          label: "Text Link",      type: "color"     },
  { type: "separator" },
  { key: "accent",               label: "Accent",         type: "color"     },
  { type: "separator" },
  { key: "wall_WindRegion1",     label: "Wind Wall 1",    type: "color"     },
  { key: "wall_WindRegion2",     label: "Wind Wall 2",    type: "color"     },
  { key: "wall_StormRegion4",    label: "Storm Wall",     type: "color"     },
  { type: "separator" },
  { key: "biome_Green Pines",    label: "Green Pines",    type: "color"     },
  { key: "biome_Azure Grove",    label: "Azure Grove",    type: "color"     },
  { key: "biome_Atlas Heights",  label: "Atlas Heights",  type: "color"     },
  { key: "biome_Midlands",       label: "Midlands",       type: "color"     },
  { key: "regionShadePercent",   label: "Region Shade %", type: "number"    },
]

var themeEditorTarget = null

function openThemeEditor() {
  var name = Settings.Theme
  if (!isUserTheme(name)) return
  themeEditorTarget = name

  document.getElementById('theme-editor-title').textContent = 'Edit: ' + name

  var fields = document.getElementById('theme-editor-fields')
  fields.innerHTML = ''
  var theme = UserThemes[name]

  themeEditorFields.forEach(function(field) {
    if (field.type === 'separator') {
      var sep = document.createElement('div')
      sep.className = 'theme-editor-separator'
      fields.appendChild(sep)
      return
    }

    var label = document.createElement('p')
    label.textContent = field.label
    fields.appendChild(label)

    if (field.type === 'color') {
      var raw = theme[field.key] || '#ff00ff'
      var col = raw.replace(/^#/, '').toLowerCase()
      if (col.length === 3) col = col[0]+col[0]+col[1]+col[1]+col[2]+col[2]
      var hexVal = '#' + col

      var colorInput = document.createElement('input')
      colorInput.type = 'color'
      colorInput.dataset.key = field.key
      colorInput.value = hexVal

      var hexInput = document.createElement('input')
      hexInput.type = 'text'
      hexInput.className = 'theme-editor-hex'
      hexInput.value = hexVal
      hexInput.maxLength = 7

      colorInput.addEventListener('input', function() { hexInput.value = this.value })
      hexInput.addEventListener('input', function() {
        if (/^#[0-9a-fA-F]{6}$/.test(this.value)) colorInput.value = this.value.toLowerCase()
      })

      fields.appendChild(colorInput)
      fields.appendChild(hexInput)
    } else if (field.type === 'number') {
      var numInput = document.createElement('input')
      numInput.type = 'number'
      numInput.dataset.key = field.key
      numInput.value = theme[field.key] ?? 0
      numInput.className = 'theme-editor-number'

      fields.appendChild(numInput)
    }
  })

  document.getElementById('theme-editor-modal').style.display = 'flex'
}

function closeThemeEditor() {
  document.getElementById('theme-editor-modal').style.display = 'none'
  themeEditorTarget = null
}

function saveThemeEditor() {
  if (!themeEditorTarget) return
  document.getElementById('theme-editor-fields').querySelectorAll('input[data-key]').forEach(function(input) {
    UserThemes[themeEditorTarget][input.dataset.key] = input.type === 'number' ? parseFloat(input.value) : input.value
  })
  saveUserThemes()
  applyTheme(themeEditorTarget)
  closeThemeEditor()
}

// --- Color utilities ---

// function shadeColor(hexString, percent) {
//   col = hexString.replace(/^#/, '')
//   if (col.length === 3) col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2]

//   var [r, g, b] = col.match(/../g);
//   r = Math.round(parseInt(r, 16) * (100+percent) / 100)
//   g = Math.round(parseInt(g, 16) * (100+percent) / 100)
//   b = Math.round(parseInt(b, 16) * (100+percent) / 100)

//   r = Math.max(Math.min(255, r), 0).toString(16).padStart(2, '0')
//   g = Math.max(Math.min(255, g), 0).toString(16).padStart(2, '0')
//   b = Math.max(Math.min(255, b), 0).toString(16).padStart(2, '0')

//   return '#'+r+g+b
// }

// Returns [L, a, b] in OKLAB from a hex string
function hexToOKLAB(hexString) {
  var col = hexString.replace(/^#/, '')
  if (col.length === 3) col = col[0]+col[0]+col[1]+col[1]+col[2]+col[2]
  var [sr, sg, sb] = col.match(/../g).map(c => parseInt(c, 16) / 255)

  const toLinear = c => c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92
  var lr = toLinear(sr), lg = toLinear(sg), lb = toLinear(sb)

  var l = Math.cbrt(0.4122214708*lr + 0.5363325363*lg + 0.0514459929*lb)
  var m = Math.cbrt(0.2119034982*lr + 0.6806995451*lg + 0.1073969566*lb)
  var s = Math.cbrt(0.0883024619*lr + 0.2817188376*lg + 0.6299787005*lb)

  return [
     0.2104542553*l + 0.7936177850*m - 0.0040720468*s,
     1.9779984951*l - 2.4285922050*m + 0.4505937099*s,
     0.0259040371*l + 0.7827717662*m - 0.8086757660*s,
  ]
}

// Returns a hex string from [L, a, b] in OKLAB
function oklabToHex(L, ok_a, ok_b) {
  var l = L + 0.3963377774*ok_a + 0.2158037573*ok_b
  var m = L - 0.1055613458*ok_a - 0.0638541728*ok_b
  var s = L - 0.0894841775*ok_a - 1.2914855480*ok_b

  l = l*l*l; m = m*m*m; s = s*s*s

  var lr =  4.0767416621*l - 3.3077115913*m + 0.2309699292*s
  var lg = -1.2684380046*l + 2.6097574011*m - 0.3413193965*s
  var lb = -0.0041960863*l - 0.7034186147*m + 1.7076147010*s

  const toSRGB = c => c > 0.0031308 ? 1.055*Math.pow(Math.max(0, c), 1/2.4) - 0.055 : 12.92*c
  const toHex  = c => Math.round(Math.max(0, Math.min(1, toSRGB(c))) * 255).toString(16).padStart(2, '0')

  return '#' + toHex(lr) + toHex(lg) + toHex(lb)
}

function shadeColorOKLAB(hexString, percent) {
  var [L, ok_a, ok_b] = hexToOKLAB(hexString)
  L = Math.max(0, Math.min(1, L * (1 + percent / 100)))
  return oklabToHex(L, ok_a, ok_b)
}
