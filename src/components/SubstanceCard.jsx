import { useNavigate } from 'react-router-dom';

const CATEGORY_COLORS = {
  psychedelic: '#8b6b9e', stimulant: '#c96b6b', depressant: '#6b9ab8',
  entactogen: '#b8607a', cannabinoid: '#5d9e6f', vitamin: '#c9a04e',
  supplement: '#4d9e8f', mineral: '#8a9399', medication: '#5d8ab0',
  dissociative: '#7d5e8f', 'opioid-adjacent': '#a85c5c',
  opioid: '#9e6b5c', benzodiazepine: '#7b7eae', herb: '#7a9e6b', nootropic: '#5c9e9e',
};

export default function SubstanceCard({ substance }) {
  const navigate = useNavigate();
  const color = CATEGORY_COLORS[substance.category] || '#4e9cd7';

  return (
    <button className="substance-card" onClick={() => navigate(`/substances/${substance.id}`)}>
      <div className="flex-between" style={{ marginBottom: 10 }}>
        <span className="pill-category" style={{ color, background: color + '14', border: `1px solid ${color}44` }}>
          {substance.category.replace('-', ' ')}
        </span>
        {substance.custom && (
          <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>custom</span>
        )}
      </div>
      <div className="card-name">{substance.name}</div>
      <div className="card-effects">{substance.effects.slice(0, 3).join(' \u00b7 ')}</div>
    </button>
  );
}
