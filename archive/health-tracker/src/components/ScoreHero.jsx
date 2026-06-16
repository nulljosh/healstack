export default function ScoreHero({ score, rank, confidence, parts }) {
  const rankClass = rank.toLowerCase().replace(' ', '-')

  return (
    <div className="score-hero">
      <div className="score-ring">
        <div className="score-value">{score}</div>
        <div className="score-label">/ 100</div>
      </div>
      <div className="score-meta">
        <span className={`rank-badge ${rankClass}`}>{rank}</span>
        <span className="confidence">{confidence}% confidence</span>
      </div>
      {parts && Object.keys(parts).some((k) => parts[k] !== null) && (
        <div className="score-parts">
          {Object.entries(parts).map(([key, val]) =>
            val !== null ? (
              <span key={key} className="score-part">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim()}: {val}
              </span>
            ) : null
          )}
        </div>
      )}
    </div>
  )
}
