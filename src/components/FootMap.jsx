import { footZones, bodySystemColors } from '../data/reflexology';

export default function FootMap({ selectedZone, onSelect }) {
  return (
    <div className="body-map-container">
      <svg viewBox="100 5 130 220" className="body-map-svg">
        <path
          d="M 125,55 C 128,40 135,25 145,20 C 155,15 170,18 180,20 C 190,22 200,25 205,35 C 210,45 212,60 212,75 C 212,85 208,95 205,105 C 202,115 200,130 200,145 C 200,160 202,170 200,185 C 198,200 195,210 185,215 C 175,220 155,220 145,215 C 135,210 128,200 125,185 C 122,170 120,155 120,140 C 120,125 122,110 122,95 C 122,80 123,65 125,55 Z"
          fill="var(--bg-tertiary)"
          stroke="var(--border)"
          strokeWidth="1.5"
        />
        <ellipse cx="148" cy="22" rx="10" ry="14" fill="var(--bg-tertiary)" stroke="var(--border)" strokeWidth="1" />
        <ellipse cx="168" cy="18" rx="8" ry="12" fill="var(--bg-tertiary)" stroke="var(--border)" strokeWidth="1" />
        <ellipse cx="183" cy="20" rx="7" ry="11" fill="var(--bg-tertiary)" stroke="var(--border)" strokeWidth="1" />
        <ellipse cx="195" cy="26" rx="7" ry="10" fill="var(--bg-tertiary)" stroke="var(--border)" strokeWidth="1" />
        <ellipse cx="204" cy="36" rx="6" ry="9" fill="var(--bg-tertiary)" stroke="var(--border)" strokeWidth="1" />

        {footZones.map(zone => (
          <path
            key={zone.id}
            d={zone.path}
            fill={bodySystemColors[zone.system]}
            fillOpacity={selectedZone === zone.id ? 0.7 : 0.3}
            stroke={selectedZone === zone.id ? 'var(--text-primary)' : bodySystemColors[zone.system]}
            strokeWidth={selectedZone === zone.id ? 2 : 1}
            strokeOpacity={selectedZone === zone.id ? 1 : 0.5}
            className="zone-path"
            onClick={() => onSelect(zone.id === selectedZone ? null : zone.id)}
          />
        ))}

        {footZones.filter(z => z.id !== 'spine').map(zone => {
          const bounds = zone.path.match(/[\d.]+/g).map(Number);
          const xs = bounds.filter((_, i) => i % 2 === 0);
          const ys = bounds.filter((_, i) => i % 2 === 1);
          const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
          const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
          return (
            <text
              key={zone.id + '-label'}
              x={cx}
              y={cy + 1}
              fill={selectedZone === zone.id ? 'var(--text-primary)' : 'var(--text-secondary)'}
              fontSize="5"
              fontFamily="var(--font)"
              fontWeight="600"
              textAnchor="middle"
              pointerEvents="none"
              opacity={selectedZone === zone.id ? 1 : 0.6}
            >
              {zone.name}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
