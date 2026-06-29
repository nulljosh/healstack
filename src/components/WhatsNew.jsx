import { useState } from 'react';

const VERSION = '2.2.0';
const KEY = 'dose_whats_new_seen';

export default function WhatsNew() {
  const [open, setOpen] = useState(() => localStorage.getItem(KEY) !== VERSION);
  const dismiss = () => { localStorage.setItem(KEY, VERSION); setOpen(false); };
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={dismiss}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
        <h2 style={{ marginBottom: 12 }}>What's New in v{VERSION}</h2>
        <ul style={{ paddingLeft: 18, lineHeight: 1.7, marginBottom: 20 }}>
          <li>GitHub Sign In</li>
          <li>Lab Results tracker</li>
          <li>Bodywork, Facemaxxing &amp; Routine pages</li>
          <li>Interaction warnings when logging active stack</li>
        </ul>
        <button className="btn-primary" onClick={dismiss} style={{ width: '100%' }}>Got it</button>
      </div>
    </div>
  );
}
