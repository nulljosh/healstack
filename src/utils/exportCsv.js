/**
 * Export dose log entries as a CSV file and trigger browser download.
 * Columns: date, time, substance, dose, unit, route, rating, notes
 */
export function exportCsv(entries, getById) {
  const header = 'date,time,substance,dose,unit,route,rating,notes';

  const rows = entries.map(e => {
    const d = new Date(e.timestamp);
    const date = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
    const time = d.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: false });
    const sub = getById ? getById(e.substanceId) : null;
    const name = sub?.name || e.substanceId;
    const rating = e.rating != null ? e.rating : '';
    const notes = e.notes ? `"${e.notes.replace(/"/g, '""').replace(/\n/g, ' ')}"` : '';

    return [date, time, name, e.dose, e.unit, e.route, rating, notes].join(',');
  });

  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const today = new Date().toLocaleDateString('en-CA');
  const a = document.createElement('a');
  a.href = url;
  a.download = `dose-log-${today}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
