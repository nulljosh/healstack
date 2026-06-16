export default function HistoryView({ records, days, onDaysChange }) {
  const recent = records.slice(0, days)

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>History</h2>
        <div className="history-controls">
          <label htmlFor="days">Range</label>
          <select id="days" value={days} onChange={(e) => onDaysChange(Number(e.target.value))}>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={21}>21 days</option>
            <option value={30}>30 days</option>
          </select>
        </div>
      </div>
      <div className="history-table-wrap">
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Sleep</th>
              <th>Exercise</th>
              <th>Nutrition</th>
              <th>Smoking</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((entry) => (
              <tr key={entry.date}>
                <td>{entry.date}</td>
                <td>{entry.sleepHours}h</td>
                <td>{entry.exerciseMinutes}m</td>
                <td>{entry.nutritionScore}/10</td>
                <td>{entry.smokingCount}</td>
              </tr>
            ))}
            {!recent.length ? (
              <tr>
                <td colSpan="5" className="empty">No records yet. Complete your first check-in.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}
