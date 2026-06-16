import { useMemo } from 'react'
import { evaluateRisk, weeklyTrend } from '../utils/healthLogic'
import { computeAnalytics, healthRank, scoreBreakdown, supplementAdherence } from '../utils/scoring'
import AnomalyPanel from './AnomalyPanel'
import ScoreHero from './ScoreHero'
import StatCard from './StatCard'
import TrendChart from './TrendChart'

export default function Dashboard({ records, todayRecord, streak, familyHistory }) {
  const trendData = weeklyTrend(records)
  const riskFlags = todayRecord ? evaluateRisk(todayRecord, familyHistory) : []
  const scoring = scoreBreakdown(todayRecord)
  const rank = healthRank(scoring.total)
  const analytics = useMemo(() => computeAnalytics(records, familyHistory), [records, familyHistory])
  const suppAdherence = useMemo(() => supplementAdherence(records), [records])

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Dashboard</h2>
        <p>Today at a glance</p>
      </div>

      <ScoreHero score={scoring.total} rank={rank} confidence={scoring.confidence} parts={scoring.parts} />

      <div className="card-grid">
        <StatCard label="Sleep" value={todayRecord?.sleepHours ?? '--'} unit="h" />
        <StatCard label="Exercise" value={todayRecord?.exerciseMinutes ?? '--'} unit="m" />
        <StatCard label="Nutrition" value={todayRecord?.nutritionScore ?? '--'} unit="/10" />
        <StatCard label="Smoking" value={todayRecord?.smokingCount ?? '--'} />
        <StatCard label="Steps" value={todayRecord?.steps ?? '--'} />
        <StatCard label="Heart Rate" value={todayRecord?.heartRate ?? '--'} unit="bpm" />
        <StatCard label="Stress" value={todayRecord?.stressLevel ?? '--'} unit="/10" />
        <StatCard label="Mood" value={todayRecord?.moodScore ?? '--'} unit="/10" />
        <StatCard label="Streak" value={streak} unit="days" />
      </div>

      <TrendChart data={trendData} />

      {analytics.last7Avg && (
        <div className="trend-deltas">
          <h3>7-Day Averages</h3>
          <div className="card-grid">
            {Object.entries(analytics.last7Avg).map(([key, val]) => {
              if (val == null) return null
              const trend = analytics.trends[key]
              const delta = analytics.prev7Avg[key] != null
                ? Math.round((val - analytics.prev7Avg[key]) * 10) / 10
                : null
              return (
                <StatCard
                  key={key}
                  label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                  value={Math.round(val * 10) / 10}
                  trend={trend}
                />
              )
            })}
          </div>
        </div>
      )}

      <AnomalyPanel anomalies={analytics.anomalies} riskFlags={riskFlags} />

      {suppAdherence.length > 0 && (
        <div className="supplement-adherence">
          <h3>Supplement Adherence (14d)</h3>
          <div className="adherence-bars">
            {suppAdherence.map((s) => (
              <div key={s.name} className="adherence-item">
                <span className="adherence-name">{s.name}</span>
                <div className="adherence-bar">
                  <div className="adherence-fill" style={{ width: `${s.rate}%` }} />
                </div>
                <span className="adherence-rate">{s.taken}/{s.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
