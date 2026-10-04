import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBiometrics } from '../hooks/useBiometrics';
import { PINNABLE, DEFAULT_PINS } from '../data/browse';

const KEY = 'dose:pinned';
function loadPins() {
  try { const p = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(p)) return p.filter(k => PINNABLE[k]); } catch { /* none */ }
  return DEFAULT_PINS;
}

function Spark({ values }) {
  if (values.length < 2) return <svg width="72" height="28" aria-hidden="true" />;
  const max = Math.max(...values), min = Math.min(...values), span = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 70 + 1},${26 - ((v - min) / span) * 24}`).join(' ');
  return <svg width="72" height="28" aria-hidden="true"><polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" /></svg>;
}

export default function PinnedCards() {
  const { entries } = useBiometrics();
  const [pins, setPins] = useState(loadPins);
  const [editing, setEditing] = useState(false);

  function toggle(k) {
    const next = pins.includes(k) ? pins.filter(p => p !== k) : [...pins, k];
    setPins(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const series = k => sorted.filter(e => e.metrics?.[k] != null).map(e => ({ d: e.date, v: Number(e.metrics[k]) }));

  return (
    <section style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div className="section-label">Pinned</div>
        <button className="link-btn" onClick={() => setEditing(e => !e)} style={{ background: 'none', border: 0, color: 'var(--accent)', font: 'inherit', cursor: 'pointer', padding: 8 }}>
          {editing ? 'Done' : 'Edit'}
        </button>
      </div>
      {editing ? (
        <div className="card" style={{ display: 'grid', gap: 4 }}>
          {Object.entries(PINNABLE).map(([k, [label]]) => (
            <label key={k} style={{ display: 'flex', gap: 12, alignItems: 'center', minHeight: 44 }}>
              <input type="checkbox" checked={pins.includes(k)} onChange={() => toggle(k)} /> {label}
            </label>
          ))}
        </div>
      ) : pins.length === 0 ? (
        <div className="card-empty">Tap Edit to pin a metric.</div>
      ) : pins.map(k => {
        const [label, unit, to] = PINNABLE[k];
        const s = series(k), last = s[s.length - 1];
        return (
          <Link key={k} to={to} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, textDecoration: 'none', color: 'inherit', minHeight: 44 }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{label}{last ? ` · ${new Date(last.d + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : ''}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
                {last ? last.v : '--'} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-secondary)' }}>{unit}</span>
              </div>
            </div>
            <Spark values={s.slice(-14).map(x => x.v)} />
          </Link>
        );
      })}
    </section>
  );
}
