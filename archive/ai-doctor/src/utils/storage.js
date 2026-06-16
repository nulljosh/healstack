const PROFILES_KEY = 'ai-doctor-profiles-v1'
const ENTRIES_KEY = 'ai-doctor-entries-v1'
const IMPORTS_KEY = 'ai-doctor-imports-v1'

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const write = (key, data) => localStorage.setItem(key, JSON.stringify(data))

export const loadProfiles = () => read(PROFILES_KEY, [])
export const saveProfiles = (profiles) => write(PROFILES_KEY, profiles)

export const loadEntries = () => read(ENTRIES_KEY, [])
export const saveEntries = (entries) => write(ENTRIES_KEY, entries)

export const loadImports = () => read(IMPORTS_KEY, [])
export const saveImports = (imports) => write(IMPORTS_KEY, imports)
