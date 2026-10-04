import { Link } from 'react-router-dom';
import { BROWSE } from '../data/browse';

export default function Browse() {
  return (
    <main className="page">
      <h1 className="page-title">Browse</h1>
      {BROWSE.map(cat => (
        <section key={cat.title} style={{ marginBottom: 24 }}>
          <div className="section-label">{cat.title}</div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {cat.items.map(([label, to]) => (
              <Link key={to} to={to} className="browse-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 48, padding: '0 16px', color: 'inherit', textDecoration: 'none' }}>
                {label}<span aria-hidden="true" style={{ color: 'var(--text-secondary)' }}>&rsaquo;</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
