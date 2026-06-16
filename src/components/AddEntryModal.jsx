import { useState } from 'react';
import { useSubstances } from '../hooks/useSubstances';

const ROUTES = ['oral', 'sublingual', 'smoked', 'vaped', 'insufflated', 'topical', 'IV', 'IM'];
const UNITS = ['mg', 'g', 'mL', 'ug', 'mcg', 'IU', 'drops'];

export default function AddEntryModal({ onAdd, onClose }) {
  const { substances } = useSubstances();
  const [form, setForm] = useState({
    substanceId: '',
    dose: '',
    unit: 'mg',
    route: 'oral',
    timestamp: new Date().toISOString().slice(0, 16),
    notes: '',
    rating: 0,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      onAdd(form);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Log a dose"
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-content">
        <div className="modal-handle" />
        <div className="modal-header">
          <h2 style={{ fontSize: '1.35rem', margin: 0 }}>Log a Dose</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">\u00d7</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="label" htmlFor="substance-picker">Substance</label>
            <select
              id="substance-picker"
              required
              value={form.substanceId}
              onChange={e => {
                const sub = substances.find(s => s.id === e.target.value);
                set('substanceId', e.target.value);
                if (sub) set('unit', sub.unit || 'mg');
              }}
              className="input"
            >
              <option value="">Select substance...</option>
              {substances.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
            <div>
              <label className="label" htmlFor="dose-input">Dose</label>
              <input
                id="dose-input"
                type="number"
                step="any"
                min="0"
                required
                placeholder="0"
                value={form.dose}
                onChange={e => set('dose', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="unit-select">Unit</label>
              <select
                id="unit-select"
                value={form.unit}
                onChange={e => set('unit', e.target.value)}
                className="input"
                style={{ width: 80 }}
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="route-select">Route</label>
            <select
              id="route-select"
              value={form.route}
              onChange={e => set('route', e.target.value)}
              className="input"
            >
              {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="time-input">Time</label>
            <input
              id="time-input"
              type="datetime-local"
              value={form.timestamp}
              onChange={e => set('timestamp', e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">Experience Rating</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set('rating', form.rating === n ? 0 : n)}
                  aria-label={`Rate ${n} star${n !== 1 ? 's' : ''}`}
                  className={`star-btn ${n <= form.rating ? 'on' : 'off'}`}
                >
                  \u2605
                </button>
              ))}
              {form.rating > 0 && (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', alignSelf: 'center' }}>
                  {form.rating}/5
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="label" htmlFor="notes-input">Notes</label>
            <textarea
              id="notes-input"
              rows={3}
              placeholder="Effects, context, set and setting..."
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              className="input"
              style={{ resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>

          {error && <div className="alert-error" role="alert">{error}</div>}

          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Logging...' : 'Log Dose'}
          </button>
        </form>
      </div>
    </div>
  );
}
