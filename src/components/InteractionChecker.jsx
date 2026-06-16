import { useState, useMemo } from 'react';
import { SUBSTANCES } from '../data/substances';

const MAJOR_KEYWORDS = ['fatal', 'dangerous', 'avoid', 'seizure'];
const MODERATE_KEYWORDS = ['potentiates', 'reduces', 'increases'];

function classifySeverity(interactionText) {
  const lower = interactionText.toLowerCase();
  if (MAJOR_KEYWORDS.some(kw => lower.includes(kw))) return 'major';
  if (MODERATE_KEYWORDS.some(kw => lower.includes(kw))) return 'moderate';
  return 'minor';
}

function severityLabel(severity) {
  if (severity === 'major') return 'Major';
  if (severity === 'moderate') return 'Moderate';
  return 'Minor';
}

function findInteractions(substanceA, substanceB) {
  if (!substanceA || !substanceB || substanceA.id === substanceB.id) return [];

  const results = [];

  // Check A's interactions for mentions of B
  for (const interaction of substanceA.interactions) {
    const lower = interaction.toLowerCase();
    const bName = substanceB.name.toLowerCase();
    const bCategory = substanceB.category.toLowerCase();
    if (lower.includes(bName) || lower.includes(bCategory)) {
      results.push({
        text: interaction,
        source: substanceA.name,
        severity: classifySeverity(interaction),
      });
    }
  }

  // Check B's interactions for mentions of A
  for (const interaction of substanceB.interactions) {
    const lower = interaction.toLowerCase();
    const aName = substanceA.name.toLowerCase();
    const aCategory = substanceA.category.toLowerCase();
    if (lower.includes(aName) || lower.includes(aCategory)) {
      // Deduplicate: skip if same text already found
      const alreadyFound = results.some(
        r => r.text.toLowerCase() === interaction.toLowerCase()
      );
      if (!alreadyFound) {
        results.push({
          text: interaction,
          source: substanceB.name,
          severity: classifySeverity(interaction),
        });
      }
    }
  }

  // Also check for shared interaction targets (both mention the same thing)
  const aSet = substanceA.interactions.map(i => {
    const match = i.match(/^([^(]+)/);
    return match ? match[1].trim().toLowerCase() : i.toLowerCase();
  });
  const bSet = substanceB.interactions.map(i => {
    const match = i.match(/^([^(]+)/);
    return match ? match[1].trim().toLowerCase() : i.toLowerCase();
  });

  for (let i = 0; i < aSet.length; i++) {
    for (let j = 0; j < bSet.length; j++) {
      if (aSet[i] === bSet[j]) {
        const sharedTarget = aSet[i];
        // Don't add if it's just a reference to A or B themselves
        const aName = substanceA.name.toLowerCase();
        const bName = substanceB.name.toLowerCase();
        if (sharedTarget === aName || sharedTarget === bName) continue;

        const alreadyFound = results.some(
          r => r.text.toLowerCase().includes(sharedTarget)
        );
        if (!alreadyFound) {
          results.push({
            text: `Both interact with ${sharedTarget}: "${substanceA.interactions[i]}" / "${substanceB.interactions[j]}"`,
            source: 'shared',
            severity: classifySeverity(
              substanceA.interactions[i] + ' ' + substanceB.interactions[j]
            ),
          });
        }
      }
    }
  }

  // Sort by severity: major > moderate > minor
  const order = { major: 0, moderate: 1, minor: 2 };
  results.sort((a, b) => order[a.severity] - order[b.severity]);

  return results;
}

export default function InteractionChecker() {
  const [idA, setIdA] = useState('');
  const [idB, setIdB] = useState('');

  const substanceA = useMemo(
    () => SUBSTANCES.find(s => s.id === idA) || null,
    [idA]
  );
  const substanceB = useMemo(
    () => SUBSTANCES.find(s => s.id === idB) || null,
    [idB]
  );

  const interactions = useMemo(
    () => findInteractions(substanceA, substanceB),
    [substanceA, substanceB]
  );

  const worstSeverity = interactions.length
    ? interactions[0].severity
    : null;

  const sorted = [...SUBSTANCES].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="interaction-checker">
      <div className="interaction-selects">
        <div>
          <label className="label" htmlFor="substance-a">Substance A</label>
          <select
            id="substance-a"
            className="input"
            value={idA}
            onChange={e => setIdA(e.target.value)}
          >
            <option value="">Select substance...</option>
            {sorted.map(s => (
              <option key={s.id} value={s.id} disabled={s.id === idB}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="interaction-swap">
          <button
            className="btn-ghost"
            onClick={() => { setIdA(idB); setIdB(idA); }}
            aria-label="Swap substances"
            disabled={!idA && !idB}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
          </button>
        </div>
        <div>
          <label className="label" htmlFor="substance-b">Substance B</label>
          <select
            id="substance-b"
            className="input"
            value={idB}
            onChange={e => setIdB(e.target.value)}
          >
            <option value="">Select substance...</option>
            {sorted.map(s => (
              <option key={s.id} value={s.id} disabled={s.id === idA}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {idA && idB && idA === idB && (
        <div className="card-info" style={{ marginTop: 16 }}>
          Select two different substances to check interactions.
        </div>
      )}

      {idA && idB && idA !== idB && interactions.length === 0 && (
        <div className="interaction-result interaction-result--none" style={{ marginTop: 16 }}>
          <div className="interaction-result-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>No known interactions</span>
          </div>
          <p className="interaction-result-note">
            No direct interactions found between {substanceA.name} and {substanceB.name}.
            This does not guarantee safety -- always consult a healthcare provider.
          </p>
        </div>
      )}

      {interactions.length > 0 && (
        <div
          className={`interaction-result interaction-result--${worstSeverity}`}
          style={{ marginTop: 16 }}
        >
          <div className="interaction-result-header">
            {worstSeverity === 'major' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
            {worstSeverity === 'moderate' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            {worstSeverity === 'minor' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            )}
            <span>
              {severityLabel(worstSeverity)} interaction{interactions.length > 1 ? 's' : ''} found
            </span>
          </div>

          <ul className="interaction-list">
            {interactions.map((item, i) => (
              <li key={i} className={`interaction-item interaction-item--${item.severity}`}>
                <span className={`interaction-badge interaction-badge--${item.severity}`}>
                  {severityLabel(item.severity)}
                </span>
                <div className="interaction-item-body">
                  <p className="interaction-text">{item.text}</p>
                  <span className="interaction-source">
                    {item.source === 'shared' ? 'Shared target' : `via ${item.source}`}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <p className="interaction-result-note">
            This is informational only. Always consult a healthcare provider before combining substances.
          </p>
        </div>
      )}

      {!idA && !idB && (
        <div className="card-empty" style={{ marginTop: 16 }}>
          Select two substances above to check for interactions.
        </div>
      )}
    </div>
  );
}
