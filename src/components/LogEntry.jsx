import { useSubstances } from '../hooks/useSubstances';
import { CATEGORY_COLORS } from '../constants/colors';
import { shortDate } from '../utils/date';

function formatTime(iso) {
  try {
    const d = new Date(iso);
    const diffMs = Date.now() - d.getTime();
    const diffH = diffMs / (1000 * 60 * 60);

    if (diffH < 1) return `${Math.round(diffMs / 60000)}m ago`;
    if (diffH < 24) return `${Math.round(diffH)}h ago`;
    return shortDate(d);
  } catch {
    return '\u2014';
  }
}

function Stars({ rating }) {
  if (!rating) return null;
  return (
    <span className="log-stars">
      {'\u2605'.repeat(rating)}<span className="log-stars-off">{'\u2606'.repeat(5 - rating)}</span>
    </span>
  );
}

export default function LogEntry({ entry, onDelete }) {
  const { getById } = useSubstances();
  const substance = getById(entry.substanceId);
  const color = CATEGORY_COLORS[substance?.category] || '#4e9cd7';
  const name = substance?.name || entry.substanceId;

  return (
    <div className="log-entry">
      <div className="log-dot" style={{ background: color }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex-between" style={{ gap: 8, marginBottom: 4 }}>
          <span className="log-name">{name}</span>
          <span className="log-time">{formatTime(entry.timestamp)}</span>
        </div>
        <div className="log-meta">
          <span className="log-dose">{entry.dose} {entry.unit}</span>
          <span>{entry.route}</span>
          <Stars rating={entry.rating} />
        </div>
        {entry.notes && (
          <div className="log-notes">
            {entry.notes.length > 80 ? entry.notes.slice(0, 80) + '\u2026' : entry.notes}
          </div>
        )}
      </div>
      {onDelete && (
        <button className="btn-icon" onClick={() => onDelete(entry.id)} aria-label="Delete entry">
          \u00d7
        </button>
      )}
    </div>
  );
}
