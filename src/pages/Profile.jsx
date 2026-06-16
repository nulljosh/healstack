import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { items as routineItems } from '../data/routine';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  diagnosed: 'var(--accent)',
  active: 'var(--danger)',
  monitoring: 'var(--warning)',
  concern: 'var(--warning)',
  pending: 'var(--text-tertiary)',
  done: 'var(--success)',
};

function RoutineSummary() {
  let checked = {};
  try {
    checked = JSON.parse(localStorage.getItem('dose:routine:checked') || '{}');
  } catch {}
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayChecks = checked[todayKey] || {};
  const visible = routineItems.slice(0, 5);

  if (routineItems.length === 0) {
    return <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>No routine set</div>;
  }

  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {visible.map(item => {
        const done = !!todayChecks[item.id];
        return (
          <li key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
              background: done ? 'var(--accent)' : 'var(--border)',
            }} />
            <span style={{
              fontSize: '0.83rem',
              color: done ? 'var(--text-tertiary)' : 'var(--text-primary)',
              textDecoration: done ? 'line-through' : 'none',
            }}>
              {item.label}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginLeft: 'auto', flexShrink: 0 }}>
              {item.category}
            </span>
          </li>
        );
      })}
      {routineItems.length > 5 && (
        <li style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
          +{routineItems.length - 5} more
        </li>
      )}
    </ul>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { profile, saveProfile, profileLoading } = useProfile();
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesVal, setNotesVal] = useState('');

  function saveNotes() {
    const next = { ...profile, notes: notesVal };
    saveProfile(next);
    setEditingNotes(false);
  }

  function startEditNotes() {
    setNotesVal(profile.notes);
    setEditingNotes(true);
  }

  function toggleTestStatus(i) {
    const tests = [...profile.pendingTests];
    tests[i] = { ...tests[i], status: tests[i].status === 'pending' ? 'done' : 'pending' };
    saveProfile({ ...profile, pendingTests: tests });
  }

  if (profileLoading) {
    return (
      <div className="page" style={{ maxWidth: 600 }}>
        <h1 className="page-title">Health Profile</h1>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 600 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Health Profile</h1>
        <button
          onClick={signOut}
          className="btn-ghost"
          style={{ fontSize: '0.75rem' }}
        >
          Sign out
        </button>
      </div>
      <p className="page-subtitle">Background, conditions, and pending medical actions.</p>

      {/* Pending Tests */}
      <div className="section-label" style={{ marginBottom: 10 }}>Pending Tests</div>
      <div className="card" style={{ marginBottom: 20 }}>
        {profile.pendingTests.map((t, i) => (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '10px 0',
              borderBottom: i < profile.pendingTests.length - 1 ? '1px solid var(--border-muted)' : 'none',
              opacity: t.status === 'done' ? 0.45 : 1,
            }}
          >
            <button
              onClick={() => toggleTestStatus(i)}
              style={{
                width: 18, height: 18, flexShrink: 0, marginTop: 2,
                borderRadius: 4, border: `2px solid ${t.status === 'done' ? 'var(--success)' : 'var(--border)'}`,
                background: t.status === 'done' ? 'var(--success)' : 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {t.status === 'done' && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5 4-4" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: '0.88rem', textDecoration: t.status === 'done' ? 'line-through' : 'none' }}>
                {t.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                {t.location}{t.notes ? ` — ${t.notes}` : ''}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Conditions */}
      <div className="section-label" style={{ marginBottom: 10 }}>Conditions & Concerns</div>
      <div className="card" style={{ marginBottom: 20 }}>
        {profile.conditions.map((c, i) => (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0',
              borderBottom: i < profile.conditions.length - 1 ? '1px solid var(--border-muted)' : 'none',
            }}
          >
            <div style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: STATUS_COLORS[c.status] || 'var(--text-tertiary)',
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>{c.name}</div>
              {c.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{c.notes}</div>}
            </div>
            <span style={{
              fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
              color: STATUS_COLORS[c.status] || 'var(--text-tertiary)',
            }}>
              {c.status}
            </span>
          </div>
        ))}
      </div>

      {/* Current Substances */}
      <div className="section-label" style={{ marginBottom: 10 }}>Current Substances</div>
      <div className="card" style={{ marginBottom: 20 }}>
        {profile.substances.map((s, i) => (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '10px 0',
              borderBottom: i < profile.substances.length - 1 ? '1px solid var(--border-muted)' : 'none',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>{s.name}</div>
              {s.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{s.notes}</div>}
            </div>
            <span style={{
              fontSize: '0.72rem', color: 'var(--text-tertiary)',
              background: 'var(--bg-tertiary)', padding: '3px 8px', borderRadius: 100,
              flexShrink: 0,
            }}>
              {s.frequency}
            </span>
          </div>
        ))}
      </div>

      {/* Routine */}
      <div className="section-label" style={{ marginBottom: 10 }}>Routine</div>
      <div className="card" style={{ marginBottom: 20 }}>
        <RoutineSummary />
        <button
          onClick={() => navigate('/routine')}
          style={{
            marginTop: 10, background: 'none', border: 'none', padding: 0,
            color: 'var(--accent)', fontSize: '0.78rem', cursor: 'pointer',
            fontFamily: 'inherit', textDecoration: 'underline', textDecorationColor: 'var(--accent-border)',
            textUnderlineOffset: 3,
          }}
        >
          Edit routine
        </button>
      </div>

      {/* Notes */}
      <div className="section-label" style={{ marginBottom: 10 }}>Notes</div>
      <div className="card" style={{ marginBottom: 20 }}>
        {editingNotes ? (
          <>
            <textarea
              value={notesVal}
              onChange={e => setNotesVal(e.target.value)}
              rows={4}
              className="input"
              style={{ resize: 'vertical', marginBottom: 12 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-primary" onClick={saveNotes}>Save</button>
              <button className="btn-ghost" onClick={() => setEditingNotes(false)}>Cancel</button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              {profile.notes || 'No notes.'}
            </p>
            <button className="btn-ghost" onClick={startEditNotes} style={{ flexShrink: 0 }}>Edit</button>
          </div>
        )}
      </div>
    </div>
  );
}
