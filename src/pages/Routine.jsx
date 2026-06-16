import { useState } from 'react';
import { items, categories } from '../data/routine';
import { useRoutine } from '../hooks/useRoutine';

function ProgressBar({ value, max }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          background: 'var(--accent)',
          borderRadius: 2,
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  );
}

export default function Routine() {
  const [openId, setOpenId] = useState(null);
  const { toggle, isChecked, completedToday, streak } = useRoutine();

  return (
    <main className="page">
      <h1 className="page-title" style={{ marginBottom: 6 }}>Daily Routine</h1>
      <p className="page-subtitle">Health habits. Reset at midnight.</p>

      <div
        style={{
          padding: '12px 14px',
          border: '1px solid var(--border)',
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 2 }}>Today</div>
            <div style={{ fontSize: 14 }}>
              {completedToday} of {items.length} complete
            </div>
          </div>
          {streak > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div className="section-label" style={{ marginBottom: 2 }}>Streak</div>
              <div style={{ fontSize: 14, color: 'var(--accent)' }}>{streak} day{streak !== 1 ? 's' : ''}</div>
            </div>
          )}
        </div>
        <ProgressBar value={completedToday} max={items.length} />
      </div>

      {categories.map(cat => {
        const catItems = items.filter(i => i.category === cat);
        const catDone = catItems.filter(i => isChecked(i.id)).length;
        return (
          <section key={cat} style={{ marginBottom: 24 }}>
            <div
              className="section-label"
              style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}
            >
              <span>{cat}</span>
              <span style={{ color: catDone === catItems.length ? 'var(--accent)' : 'var(--text-muted)' }}>
                {catDone}/{catItems.length}
              </span>
            </div>

            {catItems.map(item => {
              const done = isChecked(item.id);
              const open = openId === item.id;
              return (
                <div
                  key={item.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    marginBottom: 8,
                    overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={() => setOpenId(open ? null : item.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: 'inherit',
                    }}
                  >
                    <button
                      onClick={e => { e.stopPropagation(); toggle(item.id); }}
                      aria-label={done ? 'Uncheck' : 'Check'}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        border: `2px solid ${done ? 'var(--accent)' : 'var(--border)'}`,
                        background: done ? 'var(--accent)' : 'transparent',
                        flexShrink: 0,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                        padding: 0,
                      }}
                    >
                      {done && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <span style={{ flex: 1, fontSize: 14, opacity: done ? 0.5 : 1, textDecoration: done ? 'line-through' : 'none' }}>
                      {item.label}
                    </span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ opacity: 0.4, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease', flexShrink: 0 }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {open && item.note && (
                    <div style={{ padding: '0 14px 12px 48px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {item.note}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        );
      })}
    </main>
  );
}
