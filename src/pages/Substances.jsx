import { useState } from 'react';
import { useSubstances } from '../hooks/useSubstances';
import SubstanceCard from '../components/SubstanceCard';
import InteractionChecker from '../components/InteractionChecker';

const CATEGORIES = [
  'all', 'psychedelic', 'stimulant', 'depressant', 'entactogen', 'cannabinoid',
  'opioid', 'opioid-adjacent', 'dissociative', 'benzodiazepine',
  'medication', 'nootropic', 'supplement', 'vitamin', 'mineral', 'herb',
];

export default function Substances({ defaultTab = 'browse' }) {
  const { search, substances } = useSubstances();
  const [tab, setTab] = useState(defaultTab);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  let results = query ? search(query) : substances;
  if (category !== 'all') {
    results = results.filter(s => s.category === category);
  }

  // Counts per category for the filter pills
  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = cat === 'all'
      ? substances.length
      : substances.filter(s => s.category === cat).length;
    return acc;
  }, {});

  // When showing "all" with no query, group results by category for scannability
  const grouped = (!query && category === 'all')
    ? CATEGORIES.filter(c => c !== 'all' && categoryCounts[c] > 0).map(c => ({
        category: c,
        items: results.filter(s => s.category === c),
      }))
    : null;

  return (
    <main className="page">
      <h1 className="page-title">Library</h1>

      <div className="filter-row" style={{ marginBottom: 16 }}>
        <button onClick={() => setTab('browse')} className={`filter-pill${tab === 'browse' ? ' active' : ''}`}>Browse</button>
        <button onClick={() => setTab('interactions')} className={`filter-pill${tab === 'interactions' ? ' active' : ''}`}>Interactions</button>
      </div>

      {tab === 'browse' ? (
        <>
          <p className="page-subtitle">
            Educational reference. {substances.length} substances indexed.
          </p>

          <div style={{ position: 'relative', marginBottom: 14 }}>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }}
            >
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="search"
              placeholder="Search by name or category..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="input input-search"
            />
          </div>

          <div className="filter-row" style={{ position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 5, paddingTop: 4, paddingBottom: 8 }}>
            {CATEGORIES.filter(c => c === 'all' || categoryCounts[c] > 0).map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`filter-pill${category === cat ? ' active' : ''}`}
              >
                {cat === 'all' ? 'All' : cat.replace('-', ' ')}
                <span style={{ opacity: 0.55, marginLeft: 6, fontSize: '0.75em' }}>{categoryCounts[cat]}</span>
              </button>
            ))}
          </div>

          {results.length === 0 ? (
            <div className="card-empty">No substances match "{query}".</div>
          ) : grouped ? (
            <>
              <div className="count-label">
                {results.length} substances across {grouped.length} categories
              </div>
              {grouped.map(group => (
                <section key={group.category} style={{ marginTop: 18 }}>
                  <div className="section-label" style={{ marginBottom: 8 }}>
                    {group.category.replace('-', ' ')}
                    <span style={{ opacity: 0.5, marginLeft: 8 }}>{group.items.length}</span>
                  </div>
                  <div className="substance-grid">
                    {group.items.map(s => <SubstanceCard key={s.id} substance={s} />)}
                  </div>
                </section>
              ))}
            </>
          ) : (
            <>
              <div className="count-label">
                {results.length} {results.length === 1 ? 'substance' : 'substances'}
              </div>
              <div className="substance-grid">
                {results.map(s => <SubstanceCard key={s.id} substance={s} />)}
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <p className="page-subtitle">Check drug-drug interactions</p>
          <InteractionChecker />
        </>
      )}
    </main>
  );
}
