import { useSessions } from '../context/SessionContext';
import { shortDate, shortTime } from '../utils/date';

export default function Sessions() {
  const { sessions, deleteSession } = useSessions();

  return (
    <main className="page">
      <h1 className="page-title">Session History</h1>
      <p className="page-subtitle">{sessions.length} session{sessions.length !== 1 ? 's' : ''} logged</p>

      {sessions.length === 0 ? (
        <div className="card-empty">
          No sessions logged yet. Use the bodywork pages to log your first session.
        </div>
      ) : (
        <div className="entry-list">
          {sessions.map(s => (
            <div key={s.id} className="log-entry">
              <div className="log-dot" style={{ background: 'var(--accent)' }} />
              <div style={{ flex: 1 }}>
                <div className="log-name">{s.type === 'reflexology' || s.type === 'abdominal-referral' ? s.zone : s.point}</div>
                <div className="log-meta">
                  <span>{s.type}</span>
                  {s.area && <span>{s.area}</span>}
                  {s.meridian && <span>{s.meridian}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {shortDate(s.date)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {shortTime(s.date)}
                  </div>
                </div>
                <button
                  onClick={() => deleteSession(s.id)}
                  className="btn-icon"
                  aria-label="Delete session"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
