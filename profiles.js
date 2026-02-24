
const islandDataVersion = 1

const profilesStorageKey = "ProfilesData"
const settingsStorageKey = "Settings"

var Settings = JSON.parse(localStorage.getItem(settingsStorageKey) || '{"LegendOpen": true}')
var ProfilesData = JSON.parse(localStorage.getItem(profilesStorageKey) || 'null')

if (!ProfilesData) {
  ProfilesData = [{"name": "Default", "lastEdited": 0, "islandsData": {}}]
  touchProfileLastEdited("Default")
  localStorage.setItem(profilesStorageKey, JSON.stringify(ProfilesData))
}

if (!Settings.activeProfile || !ProfilesData.some(p => p.name === Settings.activeProfile)) {
  Settings.activeProfile = ProfilesData[0].name
  saveSettings()
}

var currentProfile = ProfilesData.find(p => p.name === Settings.activeProfile)

// --- Functions ---

function saveProfiles() {
  // Delete empty island
  Object.keys(currentProfile.islandsData).forEach(key => {
    if (Object.keys(currentProfile.islandsData[key]).length === 0) {
      delete currentProfile.islandsData[key]
    }
  })
  touchProfileLastEdited(Settings.activeProfile)
  localStorage.setItem(profilesStorageKey, JSON.stringify(ProfilesData))
}

function saveSettings() {
  localStorage.setItem(settingsStorageKey, JSON.stringify(Settings))
}

function touchProfileLastEdited(profileName) {
  var profile = ProfilesData.find(p => p.name === profileName)
  if (profile) {
    profile.lastEdited = Date.now()
    localStorage.setItem(profilesStorageKey, JSON.stringify(ProfilesData))
  }
}

function updateProfileSelect() {
  var select = document.getElementById('profile-select')
  if (!select) return
  select.innerHTML = ''
  ProfilesData.forEach(profile => {
    var option = document.createElement('option')
    option.value = profile.name
    if (profile.lastEdited) {
      var d = new Date(profile.lastEdited)
      var date = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear()
        + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
      option.textContent = profile.name + ' (' + date + ')'
    } else {
      option.textContent = profile.name
    }
    option.selected = profile.name === Settings.activeProfile
    select.appendChild(option)
  })
}

function selectProfile(name) {
  if (name === Settings.activeProfile) return
  Settings.activeProfile = name
  currentProfile = ProfilesData.find(p => p.name === Settings.activeProfile)
  saveSettings()
  refreshAllIslandMarkers()
}

// --- profiles CRUD ---

function createProfile() {
  var name = prompt('New profile name:').trim()
  if (!name) { alert('No name provided'); return }
  if (ProfilesData.some(p => p.name === name)) { alert('A profile with that name already exists'); return }

  var newProfile = { name: name, lastEdited: 0, islandsData: {} }
  ProfilesData.push(newProfile)
  Settings.activeProfile = name
  currentProfile = newProfile

  saveProfiles()
  saveSettings()
  updateProfileSelect()
  refreshAllIslandMarkers()
}

function clearProfile() {
  if (!confirm('Clear all data for profile "' + Settings.activeProfile + '"?')) return
  
  currentProfile.islandsData = {}
  saveProfiles()
  refreshAllIslandMarkers()
}

function renameProfile() {
  var newName = prompt('Rename "' + Settings.activeProfile + '" to:').trim()
  if (!newName) { alert('No name provided'); return }

  if (ProfilesData.some(p => p.name === newName)) { alert('A profile with that name already exists'); return }
  currentProfile.name = newName
  Settings.activeProfile = newName
  saveProfiles()
  saveSettings()
  updateProfileSelect()
}

function deleteProfile() {
  if (ProfilesData.length <= 1) { alert('Cannot delete the last profile'); return }
  if (!confirm('Delete profile "' + Settings.activeProfile + '"?')) return
  var idx = ProfilesData.findIndex(p => p.name === Settings.activeProfile)
  ProfilesData.splice(idx, 1)
  Settings.activeProfile = ProfilesData[Math.min(idx, ProfilesData.length - 1)].name
  currentProfile = ProfilesData.find(p => p.name === Settings.activeProfile)
  localStorage.setItem(profilesStorageKey, JSON.stringify(ProfilesData))
  saveSettings()
  updateProfileSelect()
  refreshAllIslandMarkers()
}

// --- Export / Import ---

function exportProfileData() {
  var data = { version: islandDataVersion, profiles: [currentProfile] }
  triggerDownload(data, 'LostSkiesMapData-' + currentProfile.name + '-' + getExportDate() + '.json')
}

function exportAllData() {
  var data = { version: islandDataVersion, activeProfile: Settings.activeProfile, profiles: ProfilesData }
  triggerDownload(data, 'LostSkiesMapData-All-' + getExportDate() + '.json')
}

function importData() {
  openFilePicker(function(text) {
    var parsed
    try { parsed = JSON.parse(text) } catch(e) { alert('Import failed: file is not valid JSON'); return }
    try {
      if (typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('file content must be a JSON object')
      if (parsed.version > islandDataVersion) throw new Error('file was exported with a newer version of the map')
      if (!Array.isArray(parsed.profiles) || parsed.profiles.length === 0) throw new Error('profiles data is missing or malformed')
      if (!parsed.profiles.every(p => typeof p.name === 'string' && typeof p.islandsData === 'object')) throw new Error('profiles data contains invalid entries')

      if (parsed.profiles.length === 1) {
        var incoming = parsed.profiles[0]
        var existing = ProfilesData.find(p => p.name === incoming.name)
        if (existing && !confirm('Profile "' + incoming.name + '" already exists. Overwrite it?')) return
        if (existing) {
          existing.islandsData = incoming.islandsData
          existing.lastEdited = incoming.lastEdited
        } else {
          ProfilesData.push(incoming)
        }
        Settings.activeProfile = incoming.name
      } else {
        if (!confirm('This will replace all ' + ProfilesData.length + ' existing profile(s) with ' + parsed.profiles.length + ' profile(s) from the file. Continue?')) return
        ProfilesData = parsed.profiles
        Settings.activeProfile = (parsed.activeProfile && parsed.profiles.some(p => p.name === parsed.activeProfile))
          ? parsed.activeProfile
          : parsed.profiles[0].name
      }

      currentProfile = ProfilesData.find(p => p.name === Settings.activeProfile)
      localStorage.setItem(profilesStorageKey, JSON.stringify(ProfilesData))
      saveSettings()
      updateProfileSelect()
      refreshAllIslandMarkers()
    } catch(err) {
      alert('Import failed: ' + err.message)
    }
  })
}

// --- Helper ---

function getExportDate() {
  var now = new Date()
  return String(now.getDate()).padStart(2, '0') + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + now.getFullYear()
}

function triggerDownload(data, filename) {
  var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  var a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

function openFilePicker(onLoad) {
  var input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json,application/json'
  input.onchange = function() {
    var file = input.files[0]
    if (!file) return
    var reader = new FileReader()
    reader.onload = function(e) { onLoad(e.target.result) }
    reader.readAsText(file)
  }
  input.click()
}
