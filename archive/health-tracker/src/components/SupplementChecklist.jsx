export default function SupplementChecklist({ stack, supplements, onChange }) {
  if (!stack || !stack.length) {
    return <p className="muted">No supplements configured. Add them in the supplement stack settings.</p>
  }

  function toggle(name) {
    const existing = supplements.find((s) => s.name === name)
    if (existing) {
      onChange(supplements.map((s) => s.name === name ? { ...s, taken: !s.taken } : s))
    } else {
      const template = stack.find((s) => s.name === name)
      onChange([...supplements, { name, doseMg: template?.defaultDoseMg || 0, taken: true }])
    }
  }

  return (
    <div className="supplement-checklist">
      {stack.map((item) => {
        const entry = supplements.find((s) => s.name === item.name)
        const taken = entry?.taken || false
        return (
          <label key={item.name} className={`supplement-item ${taken ? 'taken' : ''}`}>
            <input
              type="checkbox"
              checked={taken}
              onChange={() => toggle(item.name)}
            />
            <span className="supplement-name">{item.name}</span>
            <span className="supplement-dose">{item.defaultDoseMg}mg</span>
            <span className="supplement-schedule">{item.schedule}</span>
          </label>
        )
      })}
    </div>
  )
}
