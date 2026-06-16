import { useState, useRef, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, LineElement, PointElement, LinearScale,
  CategoryScale, Tooltip, Legend, Filler,
} from 'chart.js';
import { useLabResults, PANELS, computeFlag } from '../hooks/useLabResults';
import { parseLifeLabsPDF, parseGenericLabPDF } from '../utils/parseLifeLabs';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler);

const FLAG_COLORS = {
  normal: 'var(--success)',
  low: 'var(--warning)',
  high: 'var(--warning)',
  critical: 'var(--danger)',
};

const FLAG_BG = {
  normal: 'var(--success-muted)',
  low: 'var(--warning-muted)',
  high: 'var(--warning-muted)',
  critical: 'var(--danger-muted)',
};

function FlagBadge({ flag }) {
  if (!flag || flag === 'normal') return null;
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em',
      textTransform: 'uppercase', padding: '2px 7px', borderRadius: 100,
      background: FLAG_BG[flag], color: FLAG_COLORS[flag],
      border: `1px solid ${FLAG_COLORS[flag]}44`,
    }}>
      {flag}
    </span>
  );
}

function MarkerRow({ marker }) {
  const flagColor = FLAG_COLORS[marker.flag] || 'var(--text-secondary)';
  const hasRef = marker.refLow != null || marker.refHigh != null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
      borderBottom: '1px solid var(--border-muted)',
    }}>
      <div style={{
        width: 3, height: 36, borderRadius: 2, flexShrink: 0,
        background: flagColor, opacity: 0.8,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{marker.name}</div>
        {hasRef && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            ref: {marker.refLow ?? '--'} – {marker.refHigh ?? '--'} {marker.unit}
          </div>
        )}
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontWeight: 600, color: flagColor, fontSize: '1rem' }}>
          {marker.value}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: 4 }}>
          {marker.unit}
        </span>
      </div>
      <FlagBadge flag={marker.flag} />
    </div>
  );
}

function ResultCard({ result, flaggedCount }) {
  const [open, setOpen] = useState(false);
  const flagged = flaggedCount(result);

  return (
    <div style={{
      background: 'var(--bg-secondary)', borderRadius: 12,
      border: '1px solid var(--border)', marginBottom: 12, overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', padding: '14px 16px', background: 'none', border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
          transition: 'background 0.15s',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {result.date}
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{result.lab} — {result.panel}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {result.markers.length} marker{result.markers.length !== 1 ? 's' : ''}
          </div>
        </div>
        {flagged > 0 && (
          <span style={{
            background: 'var(--danger-muted)', color: 'var(--danger)',
            border: '1px solid var(--danger-border)', borderRadius: 100,
            fontSize: '0.72rem', fontWeight: 700, padding: '3px 9px',
          }}>
            {flagged} flagged
          </span>
        )}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-secondary)', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div style={{ padding: '0 16px 16px' }}>
          {result.markers.map((m, i) => <MarkerRow key={i} marker={m} />)}
        </div>
      )}
    </div>
  );
}

function MarkerChart({ data, name }) {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const color = '#60A5FA';

  // Draw reference range as dataset annotations (using fill between datasets)
  const hasRef = data.some(d => d.refLow != null || d.refHigh != null);
  const refLow = data[0]?.refLow;
  const refHigh = data[0]?.refHigh;

  const datasets = [
    {
      label: name,
      data: data.map(d => d.value),
      borderColor: color,
      backgroundColor: color + '22',
      pointBackgroundColor: data.map(d => FLAG_COLORS[d.flag] || color),
      pointRadius: 5,
      tension: 0.3,
      fill: false,
    },
  ];

  if (hasRef && refHigh != null) {
    datasets.push({
      label: 'Upper limit',
      data: data.map(() => refHigh),
      borderColor: 'var(--danger)' + '44',
      borderDash: [4, 4],
      pointRadius: 0,
      fill: refLow != null ? '-1' : false,
      backgroundColor: 'rgba(239,68,68,0.04)',
    });
  }
  if (hasRef && refLow != null) {
    datasets.push({
      label: 'Lower limit',
      data: data.map(() => refLow),
      borderColor: 'var(--warning)' + '44',
      borderDash: [4, 4],
      pointRadius: 0,
      fill: false,
    });
  }

  const chartData = {
    labels: data.map(d => d.date),
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => `${ctx.parsed.y} ${data[0]?.unit || ''}` } },
    },
    scales: {
      x: {
        ticks: { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', font: { size: 11 } },
        grid: { color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' },
      },
      y: {
        ticks: { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', font: { size: 11 } },
        grid: { color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}

function AddResultModal({ onClose, onSave, prefill }) {
  const [date, setDate] = useState(prefill?.date || new Date().toISOString().slice(0, 10));
  const [lab, setLab] = useState(prefill?.lab || 'LifeLabs');
  const [panel, setPanel] = useState(prefill?.panel || 'Thyroid');
  const [markers, setMarkers] = useState(prefill?.markers || []);
  const [customPanel, setCustomPanel] = useState(false);

  function loadPanel(panelName) {
    const template = PANELS[panelName];
    if (!template) return;
    setMarkers(template.map(m => ({ ...m, value: '' })));
    setPanel(panelName);
    setCustomPanel(false);
  }

  function setMarkerVal(idx, key, val) {
    setMarkers(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: val };
      return next;
    });
  }

  function addMarkerRow() {
    setMarkers(prev => [...prev, { name: '', value: '', unit: '', refLow: null, refHigh: null }]);
  }

  function removeMarker(idx) {
    setMarkers(prev => prev.filter((_, i) => i !== idx));
  }

  function handleSave() {
    const filled = markers.filter(m => m.name && m.value !== '');
    if (!filled.length) return;
    onSave({ date, lab, panel, markers: filled });
    onClose();
  }

  const panelKeys = Object.keys(PANELS);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--overlay)', zIndex: 200,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--modal-bg)', borderRadius: '20px 20px 0 0',
        width: '100%', maxWidth: 600, maxHeight: '90dvh', overflow: 'auto',
        padding: '20px 20px 40px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Add Lab Result</h2>
          <button className="btn-icon" onClick={onClose} style={{ fontSize: '1.2rem' }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Lab</label>
            <input className="form-input" type="text" value={lab} onChange={e => setLab(e.target.value)} placeholder="LifeLabs" />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="form-label">Panel</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {panelKeys.map(p => (
              <button
                key={p}
                onClick={() => loadPanel(p)}
                className={`filter-pill${panel === p && !customPanel ? ' active' : ''}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => { setCustomPanel(true); setPanel('Custom'); setMarkers([{ name: '', value: '', unit: '', refLow: null, refHigh: null }]); }}
              className={`filter-pill${customPanel ? ' active' : ''}`}
            >
              Custom
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <label className="form-label" style={{ margin: 0 }}>Markers</label>
            <button className="btn-icon" style={{ fontSize: '0.85rem' }} onClick={addMarkerRow}>+ row</button>
          </div>
          {markers.map((m, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr 28px', gap: 6, marginBottom: 6, alignItems: 'center' }}>
              <input className="form-input" style={{ fontSize: '0.82rem', padding: '6px 8px' }}
                placeholder="Marker name" value={m.name}
                onChange={e => setMarkerVal(i, 'name', e.target.value)} />
              <input className="form-input" style={{ fontSize: '0.82rem', padding: '6px 8px' }}
                placeholder="Value" type="number" value={m.value}
                onChange={e => setMarkerVal(i, 'value', e.target.value)} />
              <input className="form-input" style={{ fontSize: '0.82rem', padding: '6px 8px' }}
                placeholder="Unit" value={m.unit}
                onChange={e => setMarkerVal(i, 'unit', e.target.value)} />
              <div style={{ display: 'flex', gap: 3 }}>
                <input className="form-input" style={{ fontSize: '0.82rem', padding: '6px 4px', width: '50%' }}
                  placeholder="Lo" type="number" value={m.refLow ?? ''}
                  onChange={e => setMarkerVal(i, 'refLow', e.target.value || null)} />
                <input className="form-input" style={{ fontSize: '0.82rem', padding: '6px 4px', width: '50%' }}
                  placeholder="Hi" type="number" value={m.refHigh ?? ''}
                  onChange={e => setMarkerVal(i, 'refHigh', e.target.value || null)} />
              </div>
              <button className="btn-icon" onClick={() => removeMarker(i)} style={{ fontSize: '1rem', color: 'var(--danger)' }}>×</button>
            </div>
          ))}
        </div>

        <button className="btn-primary" onClick={handleSave} style={{ width: '100%' }}>Save Result</button>
      </div>
    </div>
  );
}

export default function LabResults() {
  const { results, addResult, deleteResult, getByMarker, allMarkerNames, flaggedCount } = useLabResults();
  const [tab, setTab] = useState('timeline');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [prefill, setPrefill] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [importedPanels, setImportedPanels] = useState([]);
  const fileRef = useRef(null);

  const markerNames = allMarkerNames();
  const markerData = selectedMarker ? getByMarker(selectedMarker) : [];

  useEffect(() => {
    if (!selectedMarker && markerNames.length) setSelectedMarker(markerNames[0]);
  }, [markerNames.length]);

  async function handlePDF(file) {
    if (!file || file.type !== 'application/pdf') {
      setImportError('Only PDF files are supported');
      return;
    }
    setImporting(true);
    setImportError('');
    try {
      let panels = await parseLifeLabsPDF(file);
      if (!panels.length) panels = await parseGenericLabPDF(file) || [];
      if (!panels.length) {
        setImportError('No lab values found in this PDF. Try manual entry.');
        return;
      }
      setImportedPanels(panels);
      // Auto-open confirmation for first panel
      setPrefill(panels[0]);
      setShowAdd(true);
    } catch (err) {
      setImportError('PDF parse failed: ' + err.message);
    } finally {
      setImporting(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handlePDF(file);
  }

  const sorted = [...results].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main className="page">
      <div style={{ marginBottom: 24 }}>
        <div className="date-label">Health</div>
        <h1 className="page-title">Lab Results</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          {results.length === 0 ? 'No results yet.' : `${results.length} result${results.length !== 1 ? 's' : ''} tracked.`}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="filter-row" style={{ margin: 0 }}>
          {['timeline', 'markers', 'import'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`filter-pill${tab === t ? ' active' : ''}`}
              style={{ textTransform: 'capitalize' }}>
              {t}
            </button>
          ))}
        </div>
        <button className="btn-primary" onClick={() => { setPrefill(null); setShowAdd(true); }}
          style={{ marginLeft: 'auto', padding: '8px 16px', fontSize: '0.85rem' }}>
          + Add Result
        </button>
      </div>

      {tab === 'timeline' && (
        sorted.length === 0 ? (
          <EmptyState
            icon={<LabIcon />}
            title="No lab results yet"
            sub="Import a LifeLabs PDF or add results manually."
          />
        ) : (
          sorted.map(r => (
            <ResultCard key={r.id} result={r} flaggedCount={flaggedCount} />
          ))
        )
      )}

      {tab === 'markers' && (
        markerNames.length === 0 ? (
          <EmptyState icon={<ChartIcon />} title="No markers yet" sub="Add lab results to track individual markers over time." />
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Marker</label>
              <select className="form-input" value={selectedMarker} onChange={e => setSelectedMarker(e.target.value)}
                style={{ maxWidth: 280 }}>
                {markerNames.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            {markerData.length < 2 ? (
              <div className="card-empty">Need at least 2 readings to show a trend.</div>
            ) : (
              <>
                <div style={{ height: 240, marginBottom: 20 }}>
                  <MarkerChart data={markerData} name={selectedMarker} />
                </div>
                <div className="section-label">All readings</div>
                {markerData.slice().reverse().map((d, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 0', borderBottom: '1px solid var(--border-muted)',
                  }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{d.date}</span>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontWeight: 600 }}>{d.value} {d.unit}</span>
                      <FlagBadge flag={d.flag} />
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )
      )}

      {tab === 'import' && (
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 20 }}>
            Drag a LifeLabs PDF to auto-extract your lab values. Results are processed locally — nothing is uploaded.
          </p>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 14, padding: '48px 24px', textAlign: 'center', cursor: 'pointer',
              background: dragging ? 'var(--accent-muted)' : 'var(--bg-secondary)',
              transition: 'all 0.2s var(--spring)',
            }}
          >
            <UploadIcon />
            <div style={{ fontWeight: 600, marginTop: 12 }}>
              {importing ? 'Parsing PDF...' : 'Drop LifeLabs PDF here'}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>
              or click to browse
            </div>
          </div>
          <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }}
            onChange={e => { handlePDF(e.target.files[0]); e.target.value = ''; }} />

          {importError && (
            <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: 12 }}>{importError}</div>
          )}

          {importedPanels.length > 1 && (
            <div style={{ marginTop: 24 }}>
              <div className="section-label">Panels found</div>
              {importedPanels.map((p, i) => (
                <button key={i} onClick={() => { setPrefill(p); setShowAdd(true); }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '12px 16px', marginBottom: 8,
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                    color: 'var(--text-primary)',
                  }}>
                  <span style={{ fontWeight: 600 }}>{p.panel}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginLeft: 8 }}>
                    {p.markers.length} markers — click to review &amp; save
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {showAdd && (
        <AddResultModal
          prefill={prefill}
          onClose={() => { setShowAdd(false); setPrefill(null); }}
          onSave={addResult}
        />
      )}
    </main>
  );
}

function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
      <div style={{ marginBottom: 14, opacity: 0.4 }}>{icon}</div>
      <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: '0.85rem' }}>{sub}</div>
    </div>
  );
}

function LabIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );
}
