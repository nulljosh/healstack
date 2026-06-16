import React, { useState } from 'react';
import { useDoseLog } from '../hooks/useDoseLog';
import { useSubstances } from '../hooks/useSubstances';
import ToleranceTracker from '../components/ToleranceTracker';
import LabResults from './LabResults';
import Biometrics from './Biometrics';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function SubTabBar({ active, onChange }) {
  return (
    <div className="sub-tab-bar">
      {SUB_TABS.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`sub-tab-pill${active === t ? ' active' : ''}`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function buildHeatmap(entries) {
  const grid = {};
  entries.forEach(e => {
    const d = new Date(e.timestamp);
    const key = `${d.getDay()}-${d.getHours()}`;
    grid[key] = (grid[key] || 0) + 1;
  });
  return grid;
}

const SUB_TABS = ['Insights', 'Labs', 'Biometrics'];

export default function Insights() {
  const [subTab, setSubTab] = useState('Insights');
  const { getEntries } = useDoseLog();
  const { getById } = useSubstances();

  if (subTab === 'Labs') {
    return (
      <>
        <div className="sub-tab-header">
          <SubTabBar active={subTab} onChange={setSubTab} />
        </div>
        <LabResults />
      </>
    );
  }

  if (subTab === 'Biometrics') {
    return (
      <>
        <div className="sub-tab-header">
          <SubTabBar active={subTab} onChange={setSubTab} />
        </div>
        <Biometrics />
      </>
    );
  }


  // Try last 30 days; if empty, fall back to all-time so users see something
  // as soon as they have any log history at all.
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  let entries = getEntries({ since });
  let windowLabel = 'last 30 days';
  if (entries.length === 0) {
    entries = getEntries();
    windowLabel = 'all time';
  }
  const windowDays = windowLabel === 'all time' && entries.length > 0
    ? Math.max(1, Math.ceil((Date.now() - new Date(entries[entries.length - 1].timestamp).getTime()) / 86400000))
    : 30;
  const heatmap = buildHeatmap(entries);
  const maxVal = Math.max(...Object.values(heatmap), 1);

  const freq = {};
  entries.forEach(e => { freq[e.substanceId] = (freq[e.substanceId] || 0) + 1; });
  const topSubs = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const hasData = entries.length > 0;

  return (
    <main className="page">
      <SubTabBar active={subTab} onChange={setSubTab} />
      <div className="flex-center" style={{ gap: 12, marginBottom: 6 }}>
        <h1 className="page-title">Insights</h1>
      </div>
      <p className="page-subtitle">Pattern analysis -- {windowLabel}</p>

      {!hasData ? (
        <div className="card-empty" style={{ padding: '60px 20px' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>No data yet</div>
          <div>Log some doses to see patterns here.</div>
        </div>
      ) : (
        <>
          <section style={{ marginBottom: 32 }}>
            <div className="section-label">Usage Heatmap -- by day &amp; hour</div>
            <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
              <div className="heatmap-grid" style={{ gridTemplateColumns: `auto repeat(24, 1fr)` }}>
                <div />
                {HOURS.map(h => (
                  <div key={h} style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', textAlign: 'center', paddingBottom: 4 }}>
                    {h % 6 === 0 ? h : ''}
                  </div>
                ))}
                {DAYS.map((day, dayIdx) => (
                  <React.Fragment key={dayIdx}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', paddingRight: 6 }}>
                      {day}
                    </div>
                    {HOURS.map(h => {
                      const val = heatmap[`${dayIdx}-${h}`] || 0;
                      const intensity = val / maxVal;
                      return (
                        <div
                          key={`${dayIdx}-${h}`}
                          className="heatmap-cell"
                          title={val > 0 ? `${day} ${h}:00 -- ${val} dose${val !== 1 ? 's' : ''}` : undefined}
                          style={{
                            background: val === 0
                              ? 'var(--bg-tertiary)'
                              : `rgba(78,156,215,${0.15 + intensity * 0.75})`,
                          }}
                        />
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </section>

          {topSubs.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <div className="section-label">Most Used -- last 30 days</div>
              <div className="entry-list" style={{ gap: 8 }}>
                {topSubs.map(([id, count]) => {
                  const sub = getById(id);
                  const name = sub?.name || id;
                  const pct = (count / entries.length) * 100;
                  return (
                    <div key={id} className="flex-center" style={{ gap: 12 }}>
                      <div style={{ width: 90, fontSize: '0.83rem', fontWeight: 600, flexShrink: 0 }}>{name}</div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', width: 28, textAlign: 'right', flexShrink: 0 }}>
                        {count}\u00d7
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <div className="grid-2">
            {[
              { label: 'Total doses', value: entries.length },
              { label: 'Unique substances', value: Object.keys(freq).length },
              { label: 'Avg doses/day', value: (entries.length / windowDays).toFixed(1) },
              { label: 'Most active day', value: (() => {
                const dayCounts = {};
                entries.forEach(e => {
                  const d = DAYS[new Date(e.timestamp).getDay()];
                  dayCounts[d] = (dayCounts[d] || 0) + 1;
                });
                return Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '\u2014';
              })() },
            ].map(({ label, value }) => (
              <div key={label} className="card-stat">
                <div className="stat-label">{label}</div>
                <div className="stat-value">{value}</div>
              </div>
            ))}
          </div>

          <ToleranceTracker />
        </>
      )}
    </main>
  );
}
