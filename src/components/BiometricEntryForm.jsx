import { useState } from 'react';

const METRIC_KEYS = [
  'sleep', 'steps', 'heartRate', 'activeEnergy', 'exerciseMin', 'standHours',
  'hrv', 'bloodOxygen', 'weight', 'bodyFat', 'mindfulness', 'water',
];

const METRIC_LABELS = {
  sleep: 'Sleep (hrs)', steps: 'Steps', heartRate: 'Resting HR',
  activeEnergy: 'Active Energy', exerciseMin: 'Exercise (min)', standHours: 'Stand (hrs)',
  hrv: 'HRV (ms)', bloodOxygen: 'Blood O2 (%)', weight: 'Weight (lbs)',
  bodyFat: 'Body Fat (%)', mindfulness: 'Mindfulness (min)', water: 'Water (oz)',
};

const METRIC_PLACEHOLDERS = {
  sleep: '7.5', steps: '8200', heartRate: '62', activeEnergy: '450',
  exerciseMin: '35', standHours: '10', hrv: '45', bloodOxygen: '98',
  weight: '170', bodyFat: '18', mindfulness: '10', water: '64',
};

export default function BiometricEntryForm({ onSubmit, initial }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(initial?.date || today);
  const [metrics, setMetrics] = useState(initial?.metrics || {});
  const [notes, setNotes] = useState(initial?.notes || '');
  const [error, setError] = useState('');

  function handleMetric(key, val) {
    setMetrics(prev => ({ ...prev, [key]: val === '' ? undefined : Number(val) }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const filled = Object.entries(metrics).filter(([, v]) => v != null && v !== '' && !isNaN(v));
    if (filled.length === 0) { setError('Enter at least one metric'); return; }
    setError('');
    onSubmit({ date, metrics: Object.fromEntries(filled.map(([k, v]) => [k, Number(v)])), notes });
    setMetrics({}); setNotes(''); setDate(today);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 16 }}>
        <label className="label">Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
        {METRIC_KEYS.map(key => (
          <div key={key}>
            <label className="label">{METRIC_LABELS[key]}</label>
            <input type="number" step="any" placeholder={METRIC_PLACEHOLDERS[key]}
              value={metrics[key] ?? ''} onChange={e => handleMetric(key, e.target.value)} className="input" />
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label className="label">Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="How are you feeling today?" rows={3} className="input" style={{ resize: 'vertical' }} />
      </div>

      {error && <div className="alert-error" style={{ marginBottom: 12 }}>{error}</div>}
      <button type="submit" className="btn-primary">{initial ? 'Update Entry' : 'Log Biometrics'}</button>
    </form>
  );
}
