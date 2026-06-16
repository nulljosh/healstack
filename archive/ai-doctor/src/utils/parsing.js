export function parseHealthText(text = '') {
  const src = text.toLowerCase()
  const get = (regex) => {
    const m = src.match(regex)
    return m ? Number(m[1]) : null
  }

  return {
    sleepHours: get(/sleep\s*[:\-]?\s*(\d+(?:\.\d+)?)/),
    steps: get(/steps?\s*[:\-]?\s*(\d{2,6})/),
    heartRate: get(/(?:heart\s*rate|hr)\s*[:\-]?\s*(\d{2,3})/),
    exerciseMinutes: get(/(?:exercise|workout)\s*(?:minutes|min)?\s*[:\-]?\s*(\d{1,3})/),
  }
}

export function createProfile(name) {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
  }
}
