import { useMemo, useState } from 'react'
import { loadEntries, loadImports, loadProfiles, saveEntries, saveImports, saveProfiles } from './utils/storage'
import { createProfile, parseHealthText } from './utils/parsing'
import './styles.css'

const METRIC_KEYS = ['sleepHours', 'steps', 'heartRate', 'exerciseMinutes']

function avg(nums) {
  const valid = nums.filter((n) => Number.isFinite(n))
  if (!valid.length) return null
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

function scoreBreakdown(entry) {
  if (!entry) {
    return { total: 0, confidence: 0, parts: { sleep: 0, steps: 0, exercise: 0, heart: 0 } }
  }

  const sleep = Number(entry.sleepHours)
  const steps = Number(entry.steps)
  const hr = Number(entry.heartRate)
  const ex = Number(entry.exerciseMinutes)

  let sleepScore = 0
  if (Number.isFinite(sleep)) sleepScore = sleep >= 7 && sleep <= 9 ? 25 : sleep >= 6 ? 16 : 8

  let stepsScore = 0
  if (Number.isFinite(steps)) stepsScore = steps >= 10000 ? 25 : steps >= 7000 ? 18 : steps >= 4000 ? 10 : 4

  let exScore = 0
  if (Number.isFinite(ex)) exScore = ex >= 45 ? 25 : ex >= 30 ? 20 : ex >= 15 ? 12 : 4

  let hrScore = 0
  if (Number.isFinite(hr)) hrScore = hr >= 55 && hr <= 80 ? 25 : hr >= 50 && hr <= 90 ? 16 : 8

  const known = [sleep, steps, ex, hr].filter((v) => Number.isFinite(v)).length
  const confidence = Math.round((known / 4) * 100)

  return {
    total: Math.round(sleepScore + stepsScore + exScore + hrScore),
    confidence,
    parts: { sleep: sleepScore, steps: stepsScore, exercise: exScore, heart: hrScore },
  }
}

function healthRank(score) {
  if (score >= 86) return 'Excellent'
  if (score >= 72) return 'Healthy'
  if (score >= 58) return 'Watch'
  return 'At Risk'
}

function trendDirection(current, prev) {
  if (current == null || prev == null) return 'flat'
  if (current > prev) return 'up'
  if (current < prev) return 'down'
  return 'flat'
}

function metricAnomalies(last7Avg, latest) {
  if (!latest) return []
  const flags = []
  const sleepAvg = last7Avg.sleepHours
  const stepAvg = last7Avg.steps

  if (sleepAvg != null && latest.sleepHours != null && latest.sleepHours < sleepAvg - 1.5) flags.push('Sleep dipped sharply vs weekly baseline')
  if (stepAvg != null && latest.steps != null && latest.steps < stepAvg * 0.6) flags.push('Step count dropped materially today')
  if (latest.heartRate != null && latest.heartRate > 95) flags.push('Heart rate is elevated')
  return flags
}

const DEMO_ID = 'demo-profile'

const DEMO_ENTRIES = [
  { sleepHours: 7.5, steps: 9200,  heartRate: 64, exerciseMinutes: 42 },
  { sleepHours: 6.8, steps: 11400, heartRate: 67, exerciseMinutes: 55 },
  { sleepHours: 8.1, steps: 7800,  heartRate: 62, exerciseMinutes: 30 },
  { sleepHours: 7.0, steps: 13200, heartRate: 69, exerciseMinutes: 60 },
  { sleepHours: 6.2, steps: 5400,  heartRate: 72, exerciseMinutes: 15 },
  { sleepHours: 7.8, steps: 8900,  heartRate: 63, exerciseMinutes: 45 },
  { sleepHours: 7.2, steps: 10100, heartRate: 65, exerciseMinutes: 38 },
  { sleepHours: 7.4, steps: 9400,  heartRate: 64, exerciseMinutes: 40 },
  { sleepHours: 6.6, steps: 11000, heartRate: 66, exerciseMinutes: 50 },
  { sleepHours: 7.9, steps: 8200,  heartRate: 63, exerciseMinutes: 35 },
  { sleepHours: 7.1, steps: 12500, heartRate: 68, exerciseMinutes: 55 },
  { sleepHours: 6.0, steps: 4800,  heartRate: 75, exerciseMinutes: 10 },
  { sleepHours: 8.0, steps: 9100,  heartRate: 62, exerciseMinutes: 48 },
  { sleepHours: 7.3, steps: 10300, heartRate: 65, exerciseMinutes: 42 },
].map((d, i) => ({
  id: `demo-entry-${i}`,
  profileId: DEMO_ID,
  source: i === 0 ? 'screenshot' : 'manual',
  ...d,
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}))

export default function App() {
  const [profiles, setProfiles] = useState(() => loadProfiles())
  const [entries, setEntries] = useState(() => loadEntries())
  const [imports, setImports] = useState(() => loadImports())
  const [activeProfileId, setActiveProfileId] = useState(() => loadProfiles()[0]?.id ?? null)
  const [newProfileName, setNewProfileName] = useState('')
  const [ocrText, setOcrText] = useState('')
  const [manual, setManual] = useState({ sleepHours: '', steps: '', heartRate: '', exerciseMinutes: '' })

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || null

  const timeline = useMemo(
    () => entries.filter((e) => e.profileId === activeProfileId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [entries, activeProfileId]
  )

  const latest = timeline[0] || null
  const scoring = scoreBreakdown(latest)
  const rank = healthRank(scoring.total)

  const profileImports = useMemo(
    () => imports.filter((i) => i.profileId === activeProfileId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [imports, activeProfileId]
  )

  const analytics = useMemo(() => {
    const last7 = timeline.slice(0, 7)
    const prev7 = timeline.slice(7, 14)

    const metricAvg = (group, key) => avg(group.map((x) => Number(x[key])).filter((n) => Number.isFinite(n)))

    const last7Avg = {
      sleepHours: metricAvg(last7, 'sleepHours'),
      steps: metricAvg(last7, 'steps'),
      heartRate: metricAvg(last7, 'heartRate'),
      exerciseMinutes: metricAvg(last7, 'exerciseMinutes'),
    }

    const prev7Avg = {
      sleepHours: metricAvg(prev7, 'sleepHours'),
      steps: metricAvg(prev7, 'steps'),
      heartRate: metricAvg(prev7, 'heartRate'),
      exerciseMinutes: metricAvg(prev7, 'exerciseMinutes'),
    }

    const anomalies = metricAnomalies(last7Avg, latest)

    return { last7Avg, prev7Avg, anomalies }
  }, [timeline, latest])

  function addProfile(e) {
    e.preventDefault()
    if (!newProfileName.trim()) return
    const next = [...profiles, createProfile(newProfileName)]
    setProfiles(next)
    saveProfiles(next)
    setActiveProfileId(next[next.length - 1].id)
    setNewProfileName('')
  }

  function onUploadFile(e) {
    const file = e.target.files?.[0]
    if (!file || !activeProfileId) return
    const parsed = parseHealthText(ocrText || file.name)
    const populated = METRIC_KEYS.filter((k) => Number.isFinite(parsed[k])).length
    const parseConfidence = Math.round((populated / METRIC_KEYS.length) * 100)

    const rec = {
      id: crypto.randomUUID(),
      profileId: activeProfileId,
      fileName: file.name,
      previewUrl: URL.createObjectURL(file),
      parsed,
      parseConfidence,
      createdAt: new Date().toISOString(),
    }
    const next = [rec, ...imports]
    setImports(next)
    saveImports(next)
  }

  function saveManualEntry(e) {
    e.preventDefault()
    if (!activeProfileId) return
    const entry = {
      id: crypto.randomUUID(),
      profileId: activeProfileId,
      source: 'manual',
      ...Object.fromEntries(Object.entries(manual).map(([k, v]) => [k, v === '' ? null : Number(v)])),
      createdAt: new Date().toISOString(),
    }
    const next = [entry, ...entries]
    setEntries(next)
    saveEntries(next)
    setManual({ sleepHours: '', steps: '', heartRate: '', exerciseMinutes: '' })
  }

  function loadDemo() {
    if (profiles.find((p) => p.id === DEMO_ID)) {
      setActiveProfileId(DEMO_ID)
      return
    }
    const demoProfile = { id: DEMO_ID, name: 'Joshua (Demo)', createdAt: new Date().toISOString() }
    const demoImport = {
      id: 'demo-import-1',
      profileId: DEMO_ID,
      fileName: 'ios-health-demo-1.jpg',
      previewUrl: '/demo/ios-health-demo-1.jpg',
      parsed: { sleepHours: 7.5, steps: 9200, heartRate: 64, exerciseMinutes: 42 },
      parseConfidence: 100,
      createdAt: new Date().toISOString(),
    }
    const newProfiles = [...profiles, demoProfile]
    const newEntries = [...DEMO_ENTRIES, ...entries]
    const newImports = [demoImport, ...imports]
    setProfiles(newProfiles)
    setEntries(newEntries)
    setImports(newImports)
    setActiveProfileId(DEMO_ID)
    saveProfiles(newProfiles)
    saveEntries(newEntries)
    saveImports(newImports)
  }

  function importToTimeline(imp) {
    const entry = {
      id: crypto.randomUUID(),
      profileId: imp.profileId,
      source: 'screenshot',
      ...imp.parsed,
      createdAt: new Date().toISOString(),
    }
    const next = [entry, ...entries]
    setEntries(next)
    saveEntries(next)
  }

  const metricTile = (label, key, unit = '') => {
    const current = analytics.last7Avg[key]
    const prev = analytics.prev7Avg[key]
    const dir = trendDirection(current, prev)
    const delta = current != null && prev != null ? (current - prev) : null
    return (
      <div className="mini" key={key}>
        <div className="mini-label">{label}</div>
        <div className="mini-value">{current == null ? '-' : `${Math.round(current * 10) / 10}${unit}`}</div>
        <div className={`mini-trend ${dir}`}>{delta == null ? 'No baseline' : `${delta > 0 ? '+' : ''}${Math.round(delta * 10) / 10}`}</div>
      </div>
    )
  }

  return (
    <div className="app">
      <header>
        <h1>Vital</h1>
        <p>Deeper analytics, ranking confidence, anomaly flags, and import quality checks</p>
      </header>

      <section className="panel demo-banner">
        <div className="demo-tag">DEMO</div>
        <p className="demo-desc">14 days of pre-loaded health data. Click to see the full experience.</p>
        <div className="demo-images">
          <div className="demo-img-wrap">
            <img src="/demo/ios-health-demo-1.jpg" alt="iOS Health screenshot example" />
            <div className="small">iOS Health screenshot input</div>
          </div>
          <div className="demo-img-wrap">
            <img src="/demo/heart-rate.png" alt="Heart rate chart" />
            <div className="small">Parsed heart rate data</div>
          </div>
        </div>
        <button className="demo-btn" onClick={loadDemo}>
          {profiles.find((p) => p.id === DEMO_ID) ? 'Switch to Demo Profile' : 'Load Demo Data'}
        </button>
      </section>

      <section className="panel">
        <h2>Profiles / Accounts</h2>
        <form onSubmit={addProfile} className="row">
          <input value={newProfileName} onChange={(e) => setNewProfileName(e.target.value)} placeholder="Add profile name" />
          <button type="submit">Create</button>
        </form>
        <div className="chips">
          {profiles.map((p) => (
            <button key={p.id} className={p.id === activeProfileId ? 'chip active' : 'chip'} onClick={() => setActiveProfileId(p.id)}>{p.name}</button>
          ))}
        </div>
      </section>

      {activeProfile ? (
        <>
          <section className="panel rank">
            <h2>{activeProfile.name} Health Rank</h2>
            <div className="score">{scoring.total}/100</div>
            <div className={`badge ${rank.toLowerCase().replace(' ', '-')}`}>{rank}</div>
            <div className="small">Confidence: {scoring.confidence}% · Sleep {scoring.parts.sleep}, Steps {scoring.parts.steps}, Exercise {scoring.parts.exercise}, HR {scoring.parts.heart}</div>
          </section>

          <section className="panel">
            <h2>7-Day Analytics</h2>
            <div className="mini-grid">
              {metricTile('Sleep', 'sleepHours', 'h')}
              {metricTile('Steps', 'steps')}
              {metricTile('Heart Rate', 'heartRate', ' bpm')}
              {metricTile('Exercise', 'exerciseMinutes', 'm')}
            </div>
            <div className="card">
              <div className="small">Anomalies</div>
              {analytics.anomalies.length ? (
                <ul className="flags">{analytics.anomalies.map((x) => <li key={x}>{x}</li>)}</ul>
              ) : <div className="small">No strong anomalies detected against recent baseline.</div>}
            </div>
          </section>

          <section className="panel">
            <h2>Screenshot Upload (iOS Health)</h2>
            <p>Paste OCR text (optional), upload screenshot, review parse confidence, then import.</p>
            <textarea value={ocrText} onChange={(e) => setOcrText(e.target.value)} placeholder="Paste OCR text from screenshot for better parsing" />
            <input type="file" accept="image/*" onChange={onUploadFile} />
            {profileImports.map((imp) => (
              <div key={imp.id} className="card">
                <div>{imp.fileName}</div>
                {imp.previewUrl ? <img src={imp.previewUrl} alt={imp.fileName} className="preview" /> : null}
                <div className="small">Parse confidence: {imp.parseConfidence ?? 0}%</div>
                <div className="small">Parsed: sleep {imp.parsed.sleepHours ?? '-'}h, steps {imp.parsed.steps ?? '-'}, HR {imp.parsed.heartRate ?? '-'}, ex {imp.parsed.exerciseMinutes ?? '-'}m</div>
                <button onClick={() => importToTimeline(imp)}>Import to timeline</button>
              </div>
            ))}
          </section>

          <section className="panel">
            <h2>Manual Correction / Entry</h2>
            <form onSubmit={saveManualEntry} className="grid">
              {['sleepHours', 'steps', 'heartRate', 'exerciseMinutes'].map((f) => (
                <input key={f} placeholder={f} value={manual[f]} onChange={(e) => setManual((m) => ({ ...m, [f]: e.target.value }))} />
              ))}
              <button type="submit">Save entry</button>
            </form>
          </section>

          <section className="panel">
            <h2>{activeProfile.name} Timeline</h2>
            {timeline.map((t) => (
              <div className="card" key={t.id}>
                <div className="small">{new Date(t.createdAt).toLocaleString()} · {t.source}</div>
                <div>Sleep {t.sleepHours ?? '-'}h · Steps {t.steps ?? '-'} · HR {t.heartRate ?? '-'} · Exercise {t.exerciseMinutes ?? '-'}m</div>
              </div>
            ))}
          </section>
        </>
      ) : <p>Create a profile to begin.</p>}
    </div>
  )
}
