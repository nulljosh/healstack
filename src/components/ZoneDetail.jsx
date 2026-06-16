import { bodySystemColors } from '../data/reflexology';

export default function ZoneDetail({ zone, onLogSession }) {
  if (!zone) return null;

  const color = bodySystemColors[zone.system];

  return (
    <div className="zone-detail card" style={{ animation: 'fadeUp 0.3s ease both' }}>
      <div className="zone-detail-header">
        <div className="zone-dot" style={{ background: color }} />
        <div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: 2 }}>{zone.name}</h3>
          <span className="section-label" style={{ marginBottom: 0 }}>{zone.organ} -- {zone.system}</span>
        </div>
      </div>
      <div className="zone-detail-body">
        <div>
          <span className="section-label">Location</span>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 4 }}>{zone.location}</p>
        </div>
        <div>
          <span className="section-label">Technique</span>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 4 }}>{zone.technique}</p>
        </div>
        <div>
          <span className="section-label">Duration</span>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 4 }}>{zone.duration}</p>
        </div>
        {zone.referral && (
          <div>
            <span className="section-label">Clinical Note</span>
            <p style={{ fontSize: '0.875rem', color: 'var(--warning)', lineHeight: 1.5, marginTop: 4, padding: '10px 12px', background: 'var(--warning-muted)', border: '1px solid var(--warning-border)', borderRadius: 8 }}>{zone.referral}</p>
          </div>
        )}
        {zone.benefits && (
          <div>
            <span className="section-label">Benefits</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {zone.benefits.map(b => (
                <span key={b} className="pill-category" style={{ background: color + '14', border: `1px solid ${color}44`, color: 'var(--text-primary)' }}>{b}</span>
              ))}
            </div>
          </div>
        )}
      </div>
      {onLogSession && (
        <button className="btn-primary" onClick={() => onLogSession(zone)} style={{ marginTop: 16 }}>
          Log session
        </button>
      )}
    </div>
  );
}
