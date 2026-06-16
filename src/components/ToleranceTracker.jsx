import { useDoseLog } from '../hooks/useDoseLog';
import { useSubstances } from '../hooks/useSubstances';

/**
 * Washout periods in days by substance ID or category.
 * Specific IDs take priority over category-level defaults.
 */
const WASHOUT_BY_ID = {
  psilocybin: 14, lsd: 14, dmt: 14, mescaline: 14, '5-meo-dmt': 14,
  '2c-b': 14, '4-aco-dmt': 14, lsa: 14, ayahuasca: 14, ibogaine: 14, salvia: 14,
  mdma: 90, mda: 90, '6-apb': 90,
  caffeine: 7, adderall: 7, amphetamine: 7, methylphenidate: 7,
  cocaine: 7, methamphetamine: 7, modafinil: 7,
  kratom: 7,
  alprazolam: 14, diazepam: 14, clonazepam: 14, lorazepam: 14,
};

const WASHOUT_BY_CATEGORY = {
  psychedelic: 14,
  stimulant: 7,
  entactogen: 90,
  benzodiazepine: 14,
  dissociative: 14,
};

const DEFAULT_WASHOUT = 7;

function getWashoutDays(substanceId, category) {
  if (WASHOUT_BY_ID[substanceId] != null) return WASHOUT_BY_ID[substanceId];
  if (WASHOUT_BY_CATEGORY[category] != null) return WASHOUT_BY_CATEGORY[category];
  return DEFAULT_WASHOUT;
}

function getToleranceLevel(usesIn14Days, daysSinceLast, washoutDays) {
  if (daysSinceLast >= washoutDays) return 'reset';
  if (usesIn14Days > 6) return 'high';
  if (usesIn14Days > 3) return 'building';
  return 'reset';
}

const LEVEL_COLORS = {
  reset: '#22c55e',
  building: '#f59e0b',
  high: '#ef4444',
};

const LEVEL_LABELS = {
  reset: 'Reset',
  building: 'Building',
  high: 'High',
};

export default function ToleranceTracker() {
  const { getEntries } = useDoseLog();
  const { getById } = useSubstances();

  const now = Date.now();
  const fourteenDaysAgo = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString();
  const recentEntries = getEntries({ since: fourteenDaysAgo });

  // Group by substanceId
  const bySubstance = {};
  recentEntries.forEach(e => {
    if (!bySubstance[e.substanceId]) bySubstance[e.substanceId] = [];
    bySubstance[e.substanceId].push(e);
  });

  // Filter to substances with >3 uses or known tolerance profiles
  const tracked = Object.entries(bySubstance)
    .map(([id, entries]) => {
      const sub = getById(id);
      const category = sub?.category || '';
      const name = sub?.name || id;
      const washoutDays = getWashoutDays(id, category);
      const lastTimestamp = new Date(entries[0].timestamp).getTime(); // entries sorted newest-first
      const daysSinceLast = (now - lastTimestamp) / (1000 * 60 * 60 * 24);
      const daysRemaining = Math.max(0, Math.ceil(washoutDays - daysSinceLast));
      const level = getToleranceLevel(entries.length, daysSinceLast, washoutDays);

      return { id, name, category, count: entries.length, washoutDays, daysSinceLast, daysRemaining, level };
    })
    .filter(t => t.count > 3 || WASHOUT_BY_ID[t.id] != null || WASHOUT_BY_CATEGORY[t.category] != null)
    .sort((a, b) => {
      // High tolerance first, then building, then reset
      const order = { high: 0, building: 1, reset: 2 };
      if (order[a.level] !== order[b.level]) return order[a.level] - order[b.level];
      return b.count - a.count;
    });

  if (tracked.length === 0) return null;

  return (
    <section style={{ marginTop: 32 }}>
      <div className="section-label">Tolerance Tracker</div>
      <div className="entry-list" style={{ gap: 8 }}>
        {tracked.map(t => (
          <div
            key={t.id}
            className="card"
            style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <div
              style={{
                width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                background: LEVEL_COLORS[t.level],
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.name}</span>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: LEVEL_COLORS[t.level],
                }}>
                  {LEVEL_LABELS[t.level]}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <span>{t.count}x in 14d</span>
                {t.level !== 'reset' ? (
                  <span>{t.daysRemaining}d until reset ({t.washoutDays}d washout)</span>
                ) : (
                  <span>Tolerance reset</span>
                )}
              </div>
              {t.level !== 'reset' && (
                <div style={{ marginTop: 6 }}>
                  <div className="bar-track" style={{ height: 4 }}>
                    <div
                      className="bar-fill"
                      style={{
                        width: `${Math.min(100, ((t.washoutDays - t.daysRemaining) / t.washoutDays) * 100)}%`,
                        background: LEVEL_COLORS[t.level],
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
