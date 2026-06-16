import { useState, useRef } from 'react';

const SCREENSHOTS_KEY = 'dose:health_screenshots';
const METRICS_KEY = 'dose:health_metrics';

const METRIC_FIELDS = [
  { key: 'weight', label: 'Weight (lbs)', placeholder: '170', type: 'number', step: '0.1' },
  { key: 'bpSystolic', label: 'BP Systolic', placeholder: '120', type: 'number', step: '1' },
  { key: 'bpDiastolic', label: 'BP Diastolic', placeholder: '80', type: 'number', step: '1' },
  { key: 'heartRate', label: 'Heart Rate (bpm)', placeholder: '72', type: 'number', step: '1' },
  { key: 'sleepHours', label: 'Sleep (hrs)', placeholder: '7.5', type: 'number', step: '0.1' },
  { key: 'steps', label: 'Steps', placeholder: '8000', type: 'number', step: '1' },
];

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadJson(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveJson(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('dose: failed to persist', key, err);
  }
}

export default function Health({ embedded = false }) {
  const [screenshots, setScreenshots] = useState(() => loadJson(SCREENSHOTS_KEY));
  const [metrics, setMetrics] = useState(() => loadJson(METRICS_KEY));
  const [showForm, setShowForm] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingScreenshotId, setDeletingScreenshotId] = useState(null);
  const fileRef = useRef(null);

  function addScreenshot(file) {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const entry = {
        id: generateId(),
        base64: reader.result,
        date: new Date().toISOString().slice(0, 10),
        timestamp: new Date().toISOString(),
      };
      setScreenshots(prev => {
        const next = [entry, ...prev];
        saveJson(SCREENSHOTS_KEY, next);
        return next;
      });
    };
    reader.readAsDataURL(file);
  }

  function handleFileChange(e) {
    Array.from(e.target.files).forEach(addScreenshot);
    e.target.value = '';
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    Array.from(e.dataTransfer.files).forEach(addScreenshot);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setDragging(false);
  }

  function deleteScreenshot(id) {
    if (deletingScreenshotId === id) {
      setScreenshots(prev => {
        const next = prev.filter(s => s.id !== id);
        saveJson(SCREENSHOTS_KEY, next);
        return next;
      });
      setDeletingScreenshotId(null);
    } else {
      setDeletingScreenshotId(id);
      setTimeout(() => setDeletingScreenshotId(prev => prev === id ? null : prev), 3000);
    }
  }

  // -- Metric handling --

  function handleMetricSubmit(data) {
    const entry = {
      id: generateId(),
      date: data.date,
      timestamp: new Date().toISOString(),
      ...data,
    };
    setMetrics(prev => {
      const next = [entry, ...prev];
      saveJson(METRICS_KEY, next);
      return next;
    });
    setShowForm(false);
  }

  function deleteMetric(id) {
    if (deletingId === id) {
      setMetrics(prev => {
        const next = prev.filter(m => m.id !== id);
        saveJson(METRICS_KEY, next);
        return next;
      });
      setDeletingId(null);
    } else {
      setDeletingId(id);
      setTimeout(() => setDeletingId(prev => prev === id ? null : prev), 3000);
    }
  }

  const content = (
    <>
      {!embedded && (
        <>
          <h1 className="page-title">Health</h1>
          <p className="page-subtitle">Upload screenshots or log metrics manually.</p>
        </>
      )}

      {/* Upload zone */}
      <div
        className="card"
        style={{
          marginBottom: 20,
          border: dragging ? '2px solid var(--accent)' : undefined,
          background: dragging ? 'var(--accent-muted)' : undefined,
          transition: 'border-color 0.2s, background 0.2s',
          cursor: 'pointer',
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileRef.current?.click()}
      >
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
            {dragging ? 'Drop image here' : 'Upload Health Screenshot'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Drag and drop or tap to browse. Max 2MB.
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
          onClick={e => e.stopPropagation()}
        />
      </div>

      {/* Manual entry toggle */}
      <div style={{ marginBottom: 20 }}>
        {!showForm ? (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + Manual Entry
          </button>
        ) : (
          <div className="card">
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <div className="section-label" style={{ marginBottom: 0 }}>New Entry</div>
              <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
            <MetricForm onSubmit={handleMetricSubmit} />
          </div>
        )}
      </div>

      {/* Screenshot gallery */}
      {screenshots.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-label">Screenshots ({screenshots.length})</div>
          <div className="gallery-grid">
            {screenshots.map(s => (
              <div key={s.id} className="gallery-item" style={{ position: 'relative' }}>
                <img
                  src={s.base64}
                  alt={`Health screenshot ${s.date}`}
                  className="gallery-thumb"
                  onClick={() => setViewing(s.base64)}
                />
                <button
                  className="gallery-delete"
                  style={{ opacity: deletingScreenshotId === s.id ? 1 : undefined }}
                  onClick={() => deleteScreenshot(s.id)}
                >
                  {deletingScreenshotId === s.id ? '!' : 'x'}
                </button>
                <div style={{
                  position: 'absolute',
                  bottom: 4,
                  left: 4,
                  fontSize: '0.6rem',
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  padding: '2px 6px',
                  borderRadius: 4,
                }}>
                  {s.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metric entries */}
      {metrics.length > 0 && (
        <div>
          <div className="section-label">Logged Metrics ({metrics.length})</div>
          {[...metrics].sort((a, b) => b.date.localeCompare(a.date)).map(entry => (
            <div key={entry.id} className="card" style={{ marginBottom: 12 }}>
              <div className="flex-between" style={{ marginBottom: 10 }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{entry.date}</span>
                <button
                  onClick={() => deleteMetric(entry.id)}
                  className={`btn-delete${deletingId === entry.id ? ' confirming' : ''}`}
                >
                  {deletingId === entry.id ? 'Confirm' : 'Delete'}
                </button>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: 8,
                marginBottom: entry.notes ? 12 : 0,
              }}>
                {entry.bpSystolic != null && entry.bpDiastolic != null && (
                  <div className="metric-cell">
                    <div className="metric-label">Blood Pressure</div>
                    <div className="metric-value">{entry.bpSystolic}/{entry.bpDiastolic}</div>
                  </div>
                )}
                {METRIC_FIELDS.filter(f => f.key !== 'bpSystolic' && f.key !== 'bpDiastolic' && entry[f.key] != null).map(f => (
                  <div key={f.key} className="metric-cell">
                    <div className="metric-label">{f.label}</div>
                    <div className="metric-value">{entry[f.key]}</div>
                  </div>
                ))}
              </div>
              {entry.notes && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                  {entry.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {screenshots.length === 0 && metrics.length === 0 && (
        <div className="card-empty">
          No health data yet. Upload a screenshot or log your first entry.
        </div>
      )}

      {/* Full-screen viewer */}
      {viewing && (
        <div className="gallery-overlay" onClick={() => setViewing(null)}>
          <img src={viewing} alt="Full screenshot" className="gallery-full" />
        </div>
      )}
    </>
  );

  if (embedded) return content;
  return <div className="page" style={{ maxWidth: 600 }}>{content}</div>;
}

function MetricForm({ onSubmit }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [values, setValues] = useState({});
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  function handleChange(key, val) {
    setValues(prev => ({ ...prev, [key]: val === '' ? undefined : Number(val) }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const filled = Object.entries(values).filter(([, v]) => v != null && !isNaN(v));
    if (filled.length === 0) {
      setError('Enter at least one metric');
      return;
    }
    setError('');
    const data = { date, notes: notes.trim() };
    filled.forEach(([k, v]) => { data[k] = v; });
    onSubmit(data);
    setValues({});
    setNotes('');
    setDate(today);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 16 }}>
        <label className="label">Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 12,
        marginBottom: 16,
      }}>
        {METRIC_FIELDS.map(f => (
          <div key={f.key}>
            <label className="label">{f.label}</label>
            <input
              type={f.type}
              step={f.step}
              placeholder={f.placeholder}
              value={values[f.key] ?? ''}
              onChange={e => handleChange(f.key, e.target.value)}
              className="input"
            />
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label className="label">Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any notes about today's health..."
          rows={3}
          className="input"
          style={{ resize: 'vertical' }}
        />
      </div>

      {error && <div className="alert-error" style={{ marginBottom: 12 }}>{error}</div>}
      <button type="submit" className="btn-primary">Save Entry</button>
    </form>
  );
}
