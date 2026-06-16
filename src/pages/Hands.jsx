import { useState } from 'react';
import { handZones } from '../data/reflexology';
import { useSessions } from '../context/SessionContext';
import HandMap from '../components/HandMap';
import ZoneDetail from '../components/ZoneDetail';

export default function Hands() {
  const [selected, setSelected] = useState(null);
  const { addSession } = useSessions();
  const zone = handZones.find(z => z.id === selected);

  function logSession(z) {
    addSession({ type: 'reflexology', zone: z.name, area: 'hand', notes: '' });
  }

  return (
    <main className="page">
      <h1 className="page-title">Hand Reflexology</h1>
      <p className="page-subtitle">Tap a zone to see details and technique</p>
      <HandMap selectedZone={selected} onSelect={setSelected} />
      <ZoneDetail zone={zone} onLogSession={logSession} />
    </main>
  );
}
