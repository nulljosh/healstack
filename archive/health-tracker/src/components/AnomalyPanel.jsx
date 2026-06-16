export default function AnomalyPanel({ anomalies, riskFlags }) {
  const hasAnomalies = anomalies && anomalies.length > 0
  const hasRisk = riskFlags && riskFlags.length > 0

  if (!hasAnomalies && !hasRisk) {
    return (
      <div className="anomaly-panel">
        <h3>Alerts</h3>
        <p className="muted">No anomalies or risk flags detected.</p>
      </div>
    )
  }

  return (
    <div className="anomaly-panel">
      <h3>Alerts</h3>
      {hasAnomalies && (
        <div className="anomaly-section">
          <p className="section-label">Anomalies vs Baseline</p>
          <ul>
            {anomalies.map((a) => (
              <li key={a} className="anomaly-flag">{a}</li>
            ))}
          </ul>
        </div>
      )}
      {hasRisk && (
        <div className="anomaly-section">
          <p className="section-label">Risk Flags</p>
          <ul>
            {riskFlags.map((f) => (
              <li key={f} className="risk-flag">{f}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
