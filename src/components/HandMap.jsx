import { handZones, bodySystemColors } from '../data/reflexology';

export default function HandMap({ selectedZone, onSelect }) {
  return (
    <div className="body-map-container">
      <svg viewBox="40 0 145 165" className="body-map-svg">
        <path
          d="M 70,48 C 65,35 58,22 60,15 C 62,8 72,8 76,15 C 80,22 78,35 80,45
             L 85,28 C 82,18 80,8 85,4 C 90,0 98,2 100,8 C 102,14 100,28 98,38
             L 108,18 C 106,10 108,2 114,1 C 120,0 126,4 127,10 C 128,16 124,28 120,40
             L 130,25 C 130,18 132,10 138,10 C 144,10 148,16 148,22 C 148,28 145,38 142,48
             L 150,42 C 152,36 156,32 161,34 C 166,36 168,42 166,48 C 164,54 158,62 152,68
             C 146,74 155,82 155,95 C 155,108 152,120 150,130 C 148,140 145,148 138,152
             C 131,156 110,158 95,156 C 80,154 68,148 62,140 C 56,132 55,120 56,108
             C 57,96 60,85 62,78 C 64,71 68,62 70,55 Z"
          fill="var(--bg-tertiary)"
          stroke="var(--border)"
          strokeWidth="1.5"
        />

        {handZones.map(zone => (
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

        {handZones.filter(z => z.id !== 'h-spine').map(zone => {
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
