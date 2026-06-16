import { useState } from 'react';
import { abdomenZones } from '../data/abdomen';
import { useSessions } from '../context/SessionContext';
import AbdomenMap from '../components/AbdomenMap';
import ZoneDetail from '../components/ZoneDetail';

export default function Abdomen() {
  const [selected, setSelected] = useState(null);
  const { addSession } = useSessions();
  const zone = abdomenZones.find(z => z.id === selected);

  function logSession(z) {
    addSession({ type: 'abdominal-referral', zone: z.name, area: 'abdomen', notes: z.conditions || '' });
  }

  return (
    <main className="page">
      <h1 className="page-title">Abdominal Pain Referral</h1>
      <p className="page-subtitle">9 zones mapping pain location to likely conditions</p>
      <AbdomenMap selectedZone={selected} onSelect={setSelected} />
      <ZoneDetail zone={zone} onLogSession={logSession} />
    </main>
  );
}
