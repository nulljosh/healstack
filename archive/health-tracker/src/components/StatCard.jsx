export default function StatCard({ label, value, unit = '', trend }) {
  return (
    <article className="stat-card">
      <p>{label}</p>
      <h3>
        {value}
        {unit ? <span>{unit}</span> : null}
      </h3>
      {trend ? <div className={`stat-trend ${trend}`}>{trend}</div> : null}
    </article>
  )
}
