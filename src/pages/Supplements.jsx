import { useState } from 'react';
import { useSubstances } from '../hooks/useSubstances';
import { useSupplements, SUPPLEMENT_CATEGORIES } from '../hooks/useSupplements';

export default function Supplements() {
  const { substances, getById } = useSubstances();
  const { stack, add, remove, toggle, isTaken, takenToday, weekAdherence } = useSupplements();
  const [pick, setPick] = useState('');

  const options = substances
    .filter(s => SUPPLEMENT_CATEGORIES.includes(s.category) && !stack.includes(s.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="page">
      <h1 className="page-title" style={{ marginBottom: 6 }}>Supplements</h1>
      <p className="page-subtitle">Your daily stack. Check off what you took.</p>

      <div style={{ padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div className="section-label" style={{ marginBottom: 2 }}>Today</div>
          <div style={{ fontSize: 14 }}>{takenToday} of {stack.length} taken</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="section-label" style={{ marginBottom: 2 }}>7-day adherence</div>
          <div style={{ fontSize: 14, color: 'var(--accent)' }}>{weekAdherence}%</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <select aria-label="Add supplement" value={pick} onChange={e => setPick(e.target.value)} style={{ flex: 1 }}>
          <option value="">Add a supplement</option>
          {options.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button className="btn-primary" disabled={!pick} onClick={() => { add(pick); setPick(''); }}>Add</button>
      </div>

      {stack.length === 0 && <div className="card-empty">Nothing in your stack yet.</div>}

      {stack.map(id => {
        const sub = getById(id);
        const done = isTaken(id);
        return (
          <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 8 }}>
            <button
              onClick={() => toggle(id)}
              aria-label={done ? `Untake ${sub?.name || id}` : `Take ${sub?.name || id}`}
              style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${done ? 'var(--accent)' : 'var(--border)'}`, background: done ? 'var(--accent)' : 'transparent', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
            >
              {done && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <span style={{ flex: 1, fontSize: 14, opacity: done ? 0.5 : 1 }}>{sub?.name || id}</span>
            <span className="section-label">{sub?.category}</span>
            <button className="btn-ghost" aria-label={`Remove ${sub?.name || id}`} onClick={() => remove(id)}>Remove</button>
          </div>
        );
      })}
    </main>
  );
}
