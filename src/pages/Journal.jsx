import { useState } from 'react';
import { useDoseLog } from '../hooks/useDoseLog';
import { useSubstances } from '../hooks/useSubstances';
import LogEntry from '../components/LogEntry';
import AddEntryModal from '../components/AddEntryModal';
import { exportCsv } from '../utils/exportCsv';

const ROUTES = ['all', 'oral', 'sublingual', 'smoked', 'vaped', 'insufflated', 'IV', 'IM'];

export default function Journal() {
  const { addEntry, deleteEntry, getEntries } = useDoseLog();
  const { substances, getById } = useSubstances();
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ substanceId: '', route: 'all', since: '', until: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const entries = getEntries({
    substanceId: filters.substanceId || undefined,
    route: filters.route !== 'all' ? filters.route : undefined,
    since: filters.since || undefined,
    until: filters.until || undefined,
  });

  const handleDelete = (id) => {
    if (deleteConfirm === id) {
      deleteEntry(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <main className="page">
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <h1 className="page-title">Journal</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {entries.length > 0 && (
            <button className="btn-ghost" onClick={() => exportCsv(entries, getById)}>Export CSV</button>
          )}
          <button className="btn-secondary" onClick={() => setShowModal(true)}>+ Log</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        <div className="grid-filters">
          <select
            value={filters.substanceId}
            onChange={e => setFilters(f => ({ ...f, substanceId: e.target.value }))}
            className="input"
            aria-label="Filter by substance"
          >
            <option value="">All substances</option>
            {substances.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select
            value={filters.route}
            onChange={e => setFilters(f => ({ ...f, route: e.target.value }))}
            className="input"
            aria-label="Filter by route"
          >
            {ROUTES.map(r => <option key={r} value={r}>{r === 'all' ? 'All routes' : r}</option>)}
          </select>
        </div>
        <div className="grid-filters">
          <input
            type="date"
            value={filters.since}
            onChange={e => setFilters(f => ({ ...f, since: e.target.value }))}
            className="input"
            aria-label="From date"
          />
          <input
            type="date"
            value={filters.until}
            onChange={e => setFilters(f => ({ ...f, until: e.target.value }))}
            className="input"
            aria-label="Until date"
          />
        </div>
        {Object.values(filters).some(v => v && v !== 'all') && (
          <button
            className="btn-link"
            onClick={() => setFilters({ substanceId: '', route: 'all', since: '', until: '' })}
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="count-label">
        {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
      </div>

      {entries.length === 0 ? (
        <div className="card-empty">
          {Object.values(filters).some(v => v && v !== 'all')
            ? 'No entries match these filters.'
            : 'No entries yet. Log your first dose.'}
        </div>
      ) : (
        <div className="entry-list">
          {entries.map(entry => (
            <div key={entry.id} style={{ position: 'relative' }}>
              <LogEntry entry={entry} onDelete={handleDelete} />
              {deleteConfirm === entry.id && (
                <div className="delete-tooltip" role="alert">
                  Tap \u00d7 again to confirm delete
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AddEntryModal onAdd={addEntry} onClose={() => setShowModal(false)} />
      )}
    </main>
  );
}
