import { useState } from 'react';
import { footZones } from '../data/reflexology';
import { useSessions } from '../context/SessionContext';
import FootMap from '../components/FootMap';
import ZoneDetail from '../components/ZoneDetail';

export default function Feet() {
  const [selected, setSelected] = useState(null);
  const { addSession } = useSessions();
  const zone = footZones.find(z => z.id === selected);

  function logSession(z) {
    addSession({ type: 'reflexology', zone: z.name, area: 'foot', notes: '' });
  }

  return (
    <main className="page">
      <h1 className="page-title">Foot Reflexology</h1>
      <p className="page-subtitle">Tap a zone to see details and technique</p>
      <FootMap selectedZone={selected} onSelect={setSelected} />
      <ZoneDetail zone={zone} onLogSession={logSession} />
    </main>
  );
}
