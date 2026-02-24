const LegacyIsVisitedStorageKey = "isVisited_"
const LegacyPersonalNoteStorageKey = "personalNote_"

function migrateLocalStorage() {
  var keysToRemove = []

  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i)
    if (key.startsWith(LegacyIsVisitedStorageKey)) {
      var name = key.slice(LegacyIsVisitedStorageKey.length)
      if (!currentProfile.islandsData[name]) currentProfile.islandsData[name] = {}
      currentProfile.islandsData[name].IsVisited = localStorage.getItem(key) === 'true'
      keysToRemove.push(key)
    } else if (key.startsWith(LegacyPersonalNoteStorageKey)) {
      var name = key.slice(LegacyPersonalNoteStorageKey.length)
      if (!currentProfile.islandsData[name]) currentProfile.islandsData[name] = {}
      currentProfile.islandsData[name].PersonalNote = localStorage.getItem(key)
      keysToRemove.push(key)
    }
  }

  if (keysToRemove.length > 0) {
    saveProfiles()
    keysToRemove.forEach(key => localStorage.removeItem(key))
    console.log('Migrated ' + keysToRemove.length + ' legacy storage keys to IslandData')
  }
}

migrateLocalStorage()