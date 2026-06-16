import { useState } from 'react'

export default function FamilyHistoryForm({ familyHistory, onSave, onClose }) {
  const [conditions, setConditions] = useState(familyHistory.conditions || [])
  const [bloodType, setBloodType] = useState(familyHistory.bloodType || '')
  const [newCondition, setNewCondition] = useState('')
  const [newRelation, setNewRelation] = useState('')
  const [newAge, setNewAge] = useState('')

  function addCondition(e) {
    e.preventDefault()
    if (!newCondition.trim()) return
    setConditions([
      ...conditions,
      { condition: newCondition.trim(), relation: newRelation.trim(), ageOfOnset: newAge ? Number(newAge) : null },
    ])
    setNewCondition('')
    setNewRelation('')
    setNewAge('')
  }

  function removeCondition(index) {
    setConditions(conditions.filter((_, i) => i !== index))
  }

  function handleSave() {
    onSave({ conditions, bloodType })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="panel-head">
          <h2>Family History</h2>
          <button type="button" className="close-btn" onClick={onClose}>x</button>
        </div>

        <label>
          Blood Type
          <select value={bloodType} onChange={(e) => setBloodType(e.target.value)}>
            <option value="">Unknown</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <div className="family-conditions">
          <p className="section-label">Conditions</p>
          {conditions.length > 0 && (
            <ul>
              {conditions.map((c, i) => (
                <li key={i}>
                  <strong>{c.condition}</strong>
                  {c.relation && ` -- ${c.relation}`}
                  {c.ageOfOnset && ` (onset: ${c.ageOfOnset})`}
                  <button type="button" className="remove-btn" onClick={() => removeCondition(i)}>remove</button>
                </li>
              ))}
            </ul>
          )}

          <form className="add-condition-form" onSubmit={addCondition}>
            <input
              placeholder="Condition (e.g. Diabetes)"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
            />
            <input
              placeholder="Relation (e.g. Father)"
              value={newRelation}
              onChange={(e) => setNewRelation(e.target.value)}
            />
            <input
              type="number"
              placeholder="Age of onset"
              value={newAge}
              onChange={(e) => setNewAge(e.target.value)}
            />
            <button type="submit" className="cta-button">Add</button>
          </form>
        </div>

        <button type="button" className="cta-button save-family" onClick={handleSave}>
          Save Family History
        </button>
      </div>
    </div>
  )
}
