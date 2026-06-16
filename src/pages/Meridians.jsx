import { useState } from 'react';
import { meridians } from '../data/meridians';
import { useSessions } from '../context/SessionContext';

export default function Meridians() {
  const [activeMeridian, setActiveMeridian] = useState(null);
  const [activePoint, setActivePoint] = useState(null);
  const { addSession } = useSessions();

  const meridian = meridians.find(m => m.id === activeMeridian);

  return (
    <main className="page">
      <h1 className="page-title">Acupuncture Points</h1>
      <p className="page-subtitle">35+ points organized by meridian</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
        {meridians.map(m => (
          <button
            key={m.id}
            className={`filter-pill${activeMeridian === m.id ? ' active' : ''}`}
            style={activeMeridian === m.id ? { background: m.color + '22', borderColor: m.color, color: m.color } : {}}
            onClick={() => { setActiveMeridian(activeMeridian === m.id ? null : m.id); setActivePoint(null); }}
          >
            <strong style={{ marginRight: 4 }}>{m.abbr}</strong>
            {m.name}
          </button>
        ))}
      </div>

      {meridian && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {meridian.points.map(p => (
            <div
              key={p.id}
              className="card"
              style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}
              onClick={() => setActivePoint(activePoint === p.id ? null : p.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: meridian.color, fontWeight: 700, fontSize: '1.125rem', whiteSpace: 'nowrap' }}>{p.id}</span>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 500 }}>{p.name}</h3>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{p.english}</span>
                </div>
              </div>

              {activePoint === p.id && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10, animation: 'fadeUp 0.2s ease both' }}>
                  <div>
                    <span className="section-label">Location</span>
                    <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 4 }}>{p.location}</p>
                  </div>
                  <div>
                    <span className="section-label">Technique</span>
                    <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 4 }}>{p.technique}</p>
                  </div>
                  <div>
                    <span className="section-label">Indications</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                      {p.indications.map(ind => (
                        <span key={ind} className="pill-category" style={{ background: meridian.color + '14', border: `1px solid ${meridian.color}44`, color: 'var(--text-primary)' }}>{ind}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    className="btn-primary"
                    style={{ marginTop: 8 }}
                    onClick={e => {
                      e.stopPropagation();
                      addSession({ type: 'acupuncture', point: `${p.id} ${p.name}`, meridian: meridian.name, notes: '' });
                    }}
                  >
                    Log session
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!meridian && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {meridians.map(m => (
            <button
              key={m.id}
              className="card"
              style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'inherit', color: 'inherit', fontSize: '0.9375rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, transition: 'transform 0.2s var(--spring)' }}
              onClick={() => { setActiveMeridian(m.id); setActivePoint(null); }}
            >
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <strong>{m.name}</strong>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{m.points.length} points</span>
              </div>
              <span style={{ color: m.color, fontWeight: 700, fontSize: '1rem' }}>{m.abbr}</span>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
