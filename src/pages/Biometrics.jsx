import { useState } from 'react';
import { useBiometrics } from '../hooks/useBiometrics';
import RadarChart from '../components/RadarChart';
import ScreenshotGallery from '../components/ScreenshotGallery';
import BiometricEntryForm from '../components/BiometricEntryForm';
import Health from './Health';

export default function Biometrics({ defaultTab = 'biometrics' }) {
  const {
    entries, addEntry, deleteEntry, updateEntry,
    getRadarData, getLatest, METRIC_LABELS,
  } = useBiometrics();

  const [tab, setTab] = useState(defaultTab);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const latest = getLatest();
  const radar = latest ? getRadarData(latest) : { labels: [], values: [] };

  function handleAdd(data) {
    addEntry(data);
    setShowForm(false);
  }

  function handleScreenshotAdd(entryId, base64) {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;
    updateEntry(entryId, { screenshots: [...(entry.screenshots || []), base64] });
  }

  function handleScreenshotRemove(entryId, idx) {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;
    const next = [...(entry.screenshots || [])];
    next.splice(idx, 1);
    updateEntry(entryId, { screenshots: next });
  }

  function handleDelete(id) {
    if (deletingId === id) {
      deleteEntry(id);
      setDeletingId(null);
    } else {
      setDeletingId(id);
      setTimeout(() => setDeletingId(prev => prev === id ? null : prev), 3000);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 600 }}>
      <h1 className="page-title">Body</h1>

      <div className="filter-row" style={{ marginBottom: 16 }}>
        <button onClick={() => setTab('biometrics')} className={`filter-pill${tab === 'biometrics' ? ' active' : ''}`}>Biometrics</button>
        <button onClick={() => setTab('health')} className={`filter-pill${tab === 'health' ? ' active' : ''}`}>Health</button>
      </div>

      {tab === 'health' ? (
        <Health embedded />
      ) : (
        <>
          <p className="page-subtitle">Track your body. See the patterns.</p>

          <div className="card" style={{ marginBottom: 20 }}>
            <div className="section-label">Today's Snapshot</div>
            <RadarChart labels={radar.labels} values={radar.values} />
            {latest && (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: 8 }}>
                {latest.date}
                {latest.notes && <span> -- {latest.notes}</span>}
              </div>
            )}
          </div>

          <div style={{ marginBottom: 20 }}>
            {!showForm ? (
              <button className="btn-primary" onClick={() => setShowForm(true)}>+ Log Biometrics</button>
            ) : (
              <div className="card">
                <div className="flex-between" style={{ marginBottom: 16 }}>
                  <div className="section-label" style={{ marginBottom: 0 }}>New Entry</div>
                  <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
                <BiometricEntryForm onSubmit={handleAdd} />
              </div>
            )}
          </div>

          {entries.length > 0 && (
            <div>
              <div className="section-label">History ({entries.length})</div>
              {[...entries].sort((a, b) => b.date.localeCompare(a.date)).map(entry => {
                const filledMetrics = Object.entries(entry.metrics || {}).filter(([, v]) => v != null);
                return (
                  <div key={entry.id} className="card" style={{ position: 'relative', marginBottom: 12 }}>
                    <div className="flex-between" style={{ marginBottom: 10 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{entry.date}</span>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className={`btn-delete${deletingId === entry.id ? ' confirming' : ''}`}
                      >
                        {deletingId === entry.id ? 'Confirm' : 'Delete'}
                      </button>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                      gap: 8,
                      marginBottom: entry.screenshots?.length || entry.notes ? 12 : 0,
                    }}>
                      {filledMetrics.map(([key, val]) => (
                        <div key={key} className="metric-cell">
                          <div className="metric-label">{METRIC_LABELS[key] || key}</div>
                          <div className="metric-value">{val}</div>
                        </div>
                      ))}
                    </div>

                    {entry.notes && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: entry.screenshots?.length ? 10 : 0 }}>
                        {entry.notes}
                      </div>
                    )}

                    <ScreenshotGallery
                      screenshots={entry.screenshots || []}
                      onAdd={(b64) => handleScreenshotAdd(entry.id, b64)}
                      onRemove={(idx) => handleScreenshotRemove(entry.id, idx)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
