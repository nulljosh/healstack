import { abdomenZones } from '../data/abdomen';
import { bodySystemColors } from '../data/reflexology';

const ZONE_NUMBERS = {
  'epigastric': '1',
  'right-upper': '2',
  'left-upper': '3',
  'left-flank': '4',
  'periumbilical': '5',
  'right-flank': '6',
  'right-lower': '7',
  'suprapubic': '8',
  'left-lower': '9'
};

export default function AbdomenMap({ selectedZone, onSelect }) {
  return (
    <div className="body-map-container">
      <svg viewBox="0 0 240 310" className="body-map-svg">
        {/* Torso outline */}
        <path
          d="M 40,20 C 40,10 60,5 80,5 L 160,5 C 180,5 200,10 200,20
             L 210,45 C 215,55 215,60 210,70
             L 210,270 C 210,285 195,295 180,295
             L 60,295 C 45,295 30,285 30,270
             L 30,70 C 25,60 25,55 30,45 Z"
          fill="var(--bg-tertiary)"
          stroke="var(--border)"
          strokeWidth="1.5"
        />

        {/* Rib cage suggestion */}
        <path d="M 60,50 Q 120,35 180,50" fill="none" stroke="var(--border)" strokeWidth="0.8" strokeDasharray="4,3" />
        <path d="M 55,65 Q 120,50 185,65" fill="none" stroke="var(--border)" strokeWidth="0.8" strokeDasharray="4,3" />
        <path d="M 50,80 Q 120,65 190,80" fill="none" stroke="var(--border)" strokeWidth="0.8" strokeDasharray="4,3" />

        {/* Navel marker */}
        <circle cx="120" cy="157" r="4" fill="none" stroke="var(--border)" strokeWidth="1" />

        {/* Grid lines */}
        <line x1="93" y1="45" x2="93" y2="270" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,2" />
        <line x1="147" y1="45" x2="147" y2="270" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,2" />
        <line x1="30" y1="115" x2="210" y2="115" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,2" />
        <line x1="30" y1="200" x2="210" y2="200" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,2" />

        {/* Interactive zones (skip deep-central, render as overlay) */}
        {abdomenZones.filter(z => z.id !== 'deep-central').map(zone => {
          const color = bodySystemColors[zone.system];
          return (
            <rect
              key={zone.id}
              x={parseInt(zone.path.match(/M\s*(\d+)/)[1])}
              y={parseInt(zone.path.match(/M\s*\d+,(\d+)/)[1])}
              width={parseInt(zone.path.match(/L\s*(\d+)/)[1]) - parseInt(zone.path.match(/M\s*(\d+)/)[1])}
              height={parseInt(zone.path.match(/L\s*\d+,(\d+)/)[1]) - parseInt(zone.path.match(/M\s*\d+,(\d+)/)[1])}
              rx="4"
              fill={color}
              fillOpacity={selectedZone === zone.id ? 0.6 : 0.2}
              stroke={selectedZone === zone.id ? 'var(--text-primary)' : color}
              strokeWidth={selectedZone === zone.id ? 2 : 1}
              strokeOpacity={selectedZone === zone.id ? 1 : 0.4}
              className="zone-path"
              onClick={() => onSelect(zone.id === selectedZone ? null : zone.id)}
            />
          );
        })}

        {/* Zone number labels */}
        {abdomenZones.filter(z => z.id !== 'deep-central').map(zone => {
          const coords = zone.path.match(/\d+/g).map(Number);
          const cx = (coords[0] + coords[2]) / 2;
          const cy = (coords[1] + coords[3]) / 2;
          const num = ZONE_NUMBERS[zone.id];
          return (
            <g key={zone.id + '-label'}>
              <circle
                cx={cx}
                cy={cy - 6}
                r="10"
                fill={selectedZone === zone.id ? bodySystemColors[zone.system] : 'var(--bg-secondary)'}
                stroke={bodySystemColors[zone.system]}
                strokeWidth="1.5"
              />
              <text
                x={cx}
                y={cy - 3}
                fill={selectedZone === zone.id ? '#fff' : 'var(--text-primary)'}
                fontSize="10"
                fontFamily="var(--font)"
                fontWeight="600"
                textAnchor="middle"
                pointerEvents="none"
              >
                {num}
              </text>
              <text
                x={cx}
                y={cy + 10}
                fill={selectedZone === zone.id ? 'var(--text-primary)' : 'var(--text-secondary)'}
                fontSize="7"
                fontFamily="var(--font)"
                fontWeight="500"
                textAnchor="middle"
                pointerEvents="none"
                opacity={selectedZone === zone.id ? 1 : 0.7}
              >
                {zone.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
