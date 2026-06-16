export function toDateKey(input = new Date()) {
  const date = new Date(input)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function sortDesc(records) {
  return [...records].sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function calculateStreak(records, today = new Date()) {
  if (!records.length) return 0

  const byDate = new Map(records.map((entry) => [entry.date, entry]))
  let streak = 0
  const todayKey = toDateKey(today)

  if (!byDate.has(todayKey)) return 0

  const cursorDate = new Date(today)
  cursorDate.setHours(12, 0, 0, 0)

  while (true) {
    const key = toDateKey(cursorDate)
    if (!byDate.has(key)) break
    streak += 1
    cursorDate.setDate(cursorDate.getDate() - 1)
  }

  return streak
}

export function evaluateRisk(entry) {
  const flags = []

  if (entry.sleepHours < 6 && entry.smokingCount >= 5) {
    flags.push('Low sleep + high smoking')
  }

  if (entry.exerciseMinutes < 20 && entry.nutritionScore <= 4) {
    flags.push('Low activity + poor nutrition')
  }

  if (entry.smokingCount >= 10) {
    flags.push('Very high smoking count')
  }

  if (entry.sleepHours < 5) {
    flags.push('Sleep deprivation risk')
  }

  return flags
}

export function normalizeRecords(records) {
  return sortDesc(records)
}

export function weeklyTrend(records, today = new Date()) {
  const output = []
  const recordByDate = new Map(records.map((entry) => [entry.date, entry]))

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateKey = toDateKey(date)
    const item = recordByDate.get(dateKey)
    output.push({
      date: dateKey.slice(5),
      sleep: item?.sleepHours ?? 0,
      exercise: item?.exerciseMinutes ?? 0,
      smoking: item?.smokingCount ?? 0
    })
  }

  return output
}
