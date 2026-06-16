import { useEffect, useMemo, useState } from 'react'
import DailyCheckInForm from './components/DailyCheckInForm'
import Dashboard from './components/Dashboard'
import FamilyHistoryForm from './components/FamilyHistoryForm'
import HistoryView from './components/HistoryView'
import LandingPage from './components/LandingPage'
import { DEFAULT_SUPPLEMENTS } from './utils/constants'
import { calculateStreak, normalizeRecords, toDateKey } from './utils/healthLogic'
import {
  loadFamilyHistory,
  loadRecords,
  loadSupplementStack,
  saveFamilyHistory,
  saveRecords,
  saveSupplementStack,
} from './utils/storage'

const APP_VIEWS = ['dashboard', 'history']

function getHash() {
  return window.location.hash.replace('#', '') || 'landing'
}

export default function App() {
  const [view, setView] = useState(getHash)
  const [records, setRecords] = useState(() => normalizeRecords(loadRecords()))
  const [activeView, setActiveView] = useState('dashboard')
  const [historyDays, setHistoryDays] = useState(7)
  const [familyHistory, setFamilyHistory] = useState(loadFamilyHistory)
  const [supplementStack, setSupplementStack] = useState(() => {
    const saved = loadSupplementStack()
    if (saved.length > 0) return saved
    saveSupplementStack(DEFAULT_SUPPLEMENTS)
    return DEFAULT_SUPPLEMENTS
  })
  const [showFamilyForm, setShowFamilyForm] = useState(false)

  useEffect(() => {
    function onHash() { setView(getHash()) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const todayKey = toDateKey(new Date())
  const todayRecord = useMemo(
    () => records.find((entry) => entry.date === todayKey),
    [records, todayKey]
  )
  const streak = useMemo(() => calculateStreak(records), [records])

  function handleSaveCheckIn(newEntry) {
    const withoutToday = records.filter((entry) => entry.date !== newEntry.date)
    const next = normalizeRecords([newEntry, ...withoutToday])
    setRecords(next)
    saveRecords(next)
  }

  function handleSaveFamilyHistory(fh) {
    setFamilyHistory(fh)
    saveFamilyHistory(fh)
  }

  function enterApp() {
    window.location.hash = 'app'
  }

  if (view === 'landing') {
    return <LandingPage onEnter={enterApp} />
  }

  return (
    <div className="app-shell">
      <header>
        <div>
          <p className="eyebrow">Daily health log</p>
          <h1>Health Tracker</h1>
        </div>
        <nav>
          {APP_VIEWS.map((v) => (
            <button
              key={v}
              type="button"
              className={activeView === v ? 'active' : ''}
              onClick={() => setActiveView(v)}
            >
              {v}
            </button>
          ))}
          <button type="button" onClick={() => setShowFamilyForm(true)}>
            family
          </button>
          <button type="button" onClick={() => { window.location.hash = 'landing' }}>
            about
          </button>
        </nav>
      </header>

      <main>
        <DailyCheckInForm
          todayRecord={todayRecord}
          onSubmit={handleSaveCheckIn}
          supplementStack={supplementStack}
        />
        {activeView === 'dashboard' ? (
          <Dashboard
            records={records}
            todayRecord={todayRecord}
            streak={streak}
            familyHistory={familyHistory}
          />
        ) : (
          <HistoryView records={records} days={historyDays} onDaysChange={setHistoryDays} />
        )}
      </main>

      {showFamilyForm && (
        <FamilyHistoryForm
          familyHistory={familyHistory}
          onSave={handleSaveFamilyHistory}
          onClose={() => setShowFamilyForm(false)}
        />
      )}
    </div>
  )
}
