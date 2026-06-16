import { Link } from 'react-router-dom';
import { useSessions } from '../context/SessionContext';
import { shortDate } from '../utils/date';

const cards = [
  { to: '/feet', title: 'Foot Reflexology', desc: '16 pressure zones mapped to organs', icon: 'M12 21c-3 0-5-2-6-5s-1-7 1-9 5-3 5-3 3 1 5 3 2 6 1 9-3 5-6 5z' },
  { to: '/hands', title: 'Hand Reflexology', desc: '11 palm zones for quick relief', icon: 'M18 11V6a2 2 0 00-4 0v2M14 8V4a2 2 0 00-4 0v6M10 6V3a2 2 0 00-4 0v9M7 15l-2 4h14l-2-4' },
  { to: '/abdomen', title: 'Abdominal Referral', desc: '9 zones for pain assessment', icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a1 1 0 110 2 1 1 0 010-2zm-1 4h2v8h-2z' },
  { to: '/meridians', title: 'Acupuncture Points', desc: '35+ points across 11 meridians', icon: 'M12 2v6m0 4v10M9 6l3-4 3 4M9 18l3 4 3-4' },
  { to: '/symptom-finder', title: 'What Hurts?', desc: 'Find points for 12 common symptoms', icon: 'M9 12h6m-3-3v6m8-3a9 9 0 11-18 0 9 9 0 0118 0z' },
];

export default function Bodywork() {
  const { sessions } = useSessions();

  return (
    <main className="page">
      <h1 className="page-title" style={{ marginBottom: 6 }}>Bodywork</h1>
      <p className="page-subtitle">Reflexology maps, acupuncture points, and pain referral areas</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
        {cards.map(c => (
          <Link key={c.to} to={c.to} className="substance-card" style={{ textDecoration: 'none' }}>
            <div style={{ marginBottom: 10 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={c.icon} />
              </svg>
            </div>
            <div className="card-name">{c.title}</div>
            <div className="card-effects">{c.desc}</div>
          </Link>
        ))}
      </div>

      {sessions.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <div className="flex-between" style={{ marginBottom: 12 }}>
            <div className="section-label" style={{ marginBottom: 0 }}>Recent Sessions</div>
            <Link to="/sessions" className="btn-link">View all</Link>
          </div>
          {sessions.slice(0, 3).map(s => (
            <div key={s.id} className="log-entry" style={{ marginBottom: 8 }}>
              <div className="log-dot" style={{ background: 'var(--accent)' }} />
              <div style={{ flex: 1 }}>
                <div className="log-name">{s.type === 'reflexology' ? s.zone : s.point}</div>
                <div className="log-meta">{s.type} -- {s.area || s.meridian || ''}</div>
              </div>
              <div className="log-time">{shortDate(s.date)}</div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
