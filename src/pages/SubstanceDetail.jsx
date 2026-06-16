import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useSubstances } from '../hooks/useSubstances';
import { useDoseLog } from '../hooks/useDoseLog';
import { shortDate } from '../utils/date';
import AddEntryModal from '../components/AddEntryModal';
import { CATEGORY_COLORS } from '../constants/colors';

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div className="section-label">{title}</div>
      {children}
    </div>
  );
}

function List({ items, color }) {
  return (
    <ul className="dash-list">
      {items.map((item, i) => (
        <li key={i}>
          <span className="bullet" style={{ color: color || 'var(--accent)' }}>&mdash;</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function SubstanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById } = useSubstances();
  const { addEntry, getEntries } = useDoseLog();
  const [showModal, setShowModal] = useState(false);

  const sub = getById(id);

  if (!sub) {
    return (
      <main className="page" style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Substance not found.</p>
        <button className="btn-ghost" onClick={() => navigate('/substances')}>&larr; Back to substances</button>
      </main>
    );
  }

  const color = CATEGORY_COLORS[sub.category] || 'var(--accent)';
  const myLogs = getEntries({ substanceId: sub.id });
  const lastLog = myLogs[0];

  return (
    <main style={{ paddingBottom: 100, maxWidth: 560, margin: '0 auto', animation: 'fadeUp 0.4s ease both' }}>
      <div className="detail-hero">
        <button className="btn-ghost" onClick={() => navigate('/substances')} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: '1rem' }}>&larr;</span> Substances
        </button>

        <div className="flex-between" style={{ alignItems: 'flex-start', gap: 12 }}>
          <div>
            <span className="pill-category" style={{ color, background: color + '18', border: `1px solid ${color}44`, marginBottom: 10, display: 'inline-block' }}>
              {sub.category.replace('-', ' ')}
            </span>
            <h1 className="page-title" style={{ fontSize: 'clamp(1.8rem, 6vw, 2.4rem)', marginBottom: 4 }}>
              {sub.name}
            </h1>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Half-life: {sub.halfLife}
            </div>
          </div>
          <button className="btn-secondary" onClick={() => setShowModal(true)} style={{ flexShrink: 0 }}>Log Dose</button>
        </div>

        {lastLog && (
          <div style={{ marginTop: 12, fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            Last logged: {shortDate(lastLog.timestamp)} &middot; {myLogs.length} total {myLogs.length === 1 ? 'entry' : 'entries'}
          </div>
        )}
      </div>

      <div className="detail-body">
        {sub.notes && <div className="card-info" style={{ marginBottom: 24 }}>{sub.notes}</div>}

        {sub.effects?.length > 0 && (
          <Section title="Effects">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {sub.effects.map((e, i) => (
                <span key={i} className="pill-effect" style={{ background: color + '14', border: `1px solid ${color}33` }}>{e}</span>
              ))}
            </div>
          </Section>
        )}

        {sub.routes?.length > 0 && (
          <Section title="Routes of Administration">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {sub.routes.map((r, i) => <span key={i} className="pill-route">{r}</span>)}
            </div>
          </Section>
        )}

        {sub.interactions?.length > 0 && (
          <Section title="Drug Interactions">
            <div className="card-danger"><List items={sub.interactions} color="var(--danger)" /></div>
          </Section>
        )}

        {sub.harmReduction?.length > 0 && (
          <Section title="Harm Reduction">
            <div className="card-info" style={{ fontStyle: 'normal' }}><List items={sub.harmReduction} color="var(--accent)" /></div>
          </Section>
        )}

        <div className="detail-disclaimer">
          Educational reference only. Not medical advice. Check current laws in your jurisdiction.
          Verify interactions with a pharmacist or physician before combining substances.
        </div>
      </div>

      {showModal && (
        <AddEntryModal
          onAdd={(data) => addEntry({ ...data, substanceId: sub.id, unit: sub.unit || 'mg' })}
          onClose={() => setShowModal(false)}
        />
      )}
    </main>
  );
}
