import { useState, useMemo } from 'react';
import { protocols, categories } from '../data/facemaxxing';

const STORAGE_KEY = 'dose:facemaxxing:checked';

function loadChecked() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export default function Facemaxxing() {
  const [filter, setFilter] = useState('All');
  const [checked, setChecked] = useState(loadChecked);
  const [openId, setOpenId] = useState(null);

  const visible = useMemo(
    () => (filter === 'All' ? protocols : protocols.filter(p => p.category === filter)),
    [filter]
  );

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayChecks = checked[todayKey] || {};
  const completedToday = Object.values(todayChecks).filter(Boolean).length;

  function toggle(id) {
    const next = {
      ...checked,
      [todayKey]: { ...todayChecks, [id]: !todayChecks[id] },
    };
    setChecked(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return (
    <main className="page">
      <h1 className="page-title" style={{ marginBottom: 6 }}>Facemaxxing</h1>
      <p className="page-subtitle">
        Soft maxxing protocols. Posture, recovery, diet, skin. No surgery, no extremes.
      </p>

      <div
        style={{
          padding: '12px 14px',
          border: '1px solid var(--border)',
          borderRadius: 8,
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div className="section-label" style={{ marginBottom: 2 }}>Today</div>
          <div style={{ fontSize: 14 }}>
            {completedToday} of {protocols.length} protocols logged
          </div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--accent)' }}>
          {Math.round((completedToday / protocols.length) * 100)}%
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {['All', ...categories.map(c => c.id)].map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={filter === c ? 'chip chip-active' : 'chip'}
            style={{
              padding: '6px 12px',
              border: '1px solid var(--border)',
              borderRadius: 20,
              background: filter === c ? 'var(--accent)' : 'transparent',
              color: filter === c ? 'var(--bg)' : 'var(--text)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {visible.map(p => {
          const isOpen = openId === p.id;
          const isChecked = !!todayChecks[p.id];
          return (
            <div
              key={p.id}
              className="substance-card"
              style={{ cursor: 'pointer' }}
              onClick={() => setOpenId(isOpen ? null : p.id)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    toggle(p.id);
                  }}
                  aria-label={isChecked ? 'Mark incomplete' : 'Mark complete'}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    border: '1.5px solid var(--border)',
                    background: isChecked ? 'var(--accent)' : 'transparent',
                    cursor: 'pointer',
                    flexShrink: 0,
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isChecked && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="card-name">{p.title}</div>
                  <div className="card-effects">{p.summary}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: 11, color: 'var(--muted)' }}>
                    <span>{p.category}</span>
                    <span>--</span>
                    <span>{p.difficulty}</span>
                  </div>
                </div>
              </div>

              {isOpen && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                  <div className="section-label" style={{ marginBottom: 8 }}>Protocol</div>
                  <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.6 }}>
                    {p.steps.map((s, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>{s}</li>
                    ))}
                  </ol>
                  <div className="section-label" style={{ marginTop: 14, marginBottom: 6 }}>Notes</div>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'var(--muted)' }}>
                    {p.notes}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ marginTop: 24, fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>
        Not medical advice. See a doctor for persistent skin, jaw, or sleep issues.
      </p>
    </main>
  );
}
