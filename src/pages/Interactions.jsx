import InteractionChecker from '../components/InteractionChecker';

export default function Interactions() {
  return (
    <div className="page">
      <h1 className="page-title">Interactions</h1>
      <p className="page-subtitle">Check drug-drug interactions</p>
      <InteractionChecker />
    </div>
  );
}
