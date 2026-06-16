import { useState } from 'react';
import { bodyworkSymptoms } from '../data/bodyworkSymptoms';
import { footZones, handZones } from '../data/reflexology';
import { getAllPoints } from '../data/meridians';

const allPoints = getAllPoints();
const allZones = [...footZones, ...handZones];

export default function SymptomFinder() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(null);

  const filtered = query.trim()
    ? bodyworkSymptoms.filter(s =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.selfCare.toLowerCase().includes(query.toLowerCase())
      )
    : bodyworkSymptoms;

  const symptom = bodyworkSymptoms.find(s => s.id === active);

  return (
    <main className="page">
      <h1 className="page-title">What Hurts?</h1>
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          className="input"
          style={{ borderRadius: 100, padding: '14px 20px' }}
          placeholder="Type a symptom... headache, back pain, stress..."
          value={query}
          onChange={e => { setQuery(e.target.value); setActive(null); }}
          autoFocus
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 24 }}>
        {filtered.map(s => (
          <button
            key={s.id}
            className="card"
            style={{
              cursor: 'pointer', textAlign: 'center', padding: 14, fontSize: '0.875rem', fontWeight: 500,
              fontFamily: 'inherit', color: active === s.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderColor: active === s.id ? 'var(--accent)' : undefined,
              width: '100%'
            }}
            onClick={() => setActive(active === s.id ? null : s.id)}
          >
            {s.name}
          </button>
        ))}
        {filtered.length === 0 && (
          <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem' }}>
            No matching symptoms. Try a different term.
          </p>
        )}
      </div>

      {symptom && (
        <div style={{ animation: 'fadeUp 0.3s ease both' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 20 }}>{symptom.name}</h2>

          <div style={{ marginBottom: 24 }}>
            <span className="section-label">Self-Care Protocol</span>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--text-secondary)', marginTop: 8, padding: 16, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10 }}>
              {symptom.selfCare}
            </p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <span className="section-label">Reflexology Zones</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {symptom.reflexZones.map(zId => {
                const zone = allZones.find(z => z.id === zId);
                if (!zone) return null;
                return (
                  <div key={zId} className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <strong style={{ fontSize: '0.9375rem' }}>{zone.name}</strong>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{zone.location}</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 2 }}>{zone.technique}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <span className="section-label">Acupuncture Points</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {symptom.acuPoints.map(pId => {
                const point = allPoints.find(p => p.id === pId);
                if (!point) return null;
                return (
                  <div key={pId} className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: point.meridianColor, fontWeight: 700, fontSize: '0.9375rem' }}>{point.id}</span>
                      <strong style={{ fontSize: '0.9375rem' }}>{point.name}</strong>
                    </div>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{point.location}</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 2 }}>{point.technique}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
