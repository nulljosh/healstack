const FEATURES = [
  {
    title: 'Log what you take',
    body: 'Record doses as you take them and keep a running stack of everything currently active.',
  },
  {
    title: 'Catch interactions',
    body: 'The interaction checker warns you before you log something that clashes with your active stack.',
  },
  {
    title: 'See the patterns',
    body: 'Symptoms, biometrics, and lab results plotted over time, so changes show up as trends instead of guesses.',
  },
  {
    title: 'Look things up',
    body: 'A built-in reference for each substance — dosing ranges, timing, and harm reduction notes.',
  },
];

export default function Landing({ onGetStarted }) {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '56px 20px 72px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: 'var(--bg-secondary)',
            border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
              <path d="M20 21a8 8 0 1 0-16 0" />
            </svg>
          </div>
          <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Healstack</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(1.9rem, 6vw, 2.7rem)', lineHeight: 1.12, fontWeight: 600,
          letterSpacing: '-0.02em', margin: '0 0 16px', maxWidth: '16ch',
        }}>
          Keep track of what you take, and what it does.
        </h1>

        <p style={{
          fontSize: '1.02rem', lineHeight: 1.6, color: 'var(--text-secondary)',
          margin: '0 0 32px', maxWidth: '46ch',
        }}>
          Healstack is a private tracker for supplements, medications, and symptoms. Log your doses,
          check interactions before you take something, and watch how your numbers move over time.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 56 }}>
          <button
            onClick={onGetStarted}
            style={{
              padding: '11px 22px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 500,
              background: 'var(--accent)', color: '#fff',
            }}
          >
            Get started
          </button>
          <button
            onClick={onGetStarted}
            style={{
              padding: '11px 22px', borderRadius: 8, cursor: 'pointer',
              border: '1px solid var(--border)', background: 'transparent',
              fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 500,
              color: 'var(--text-primary)',
            }}
          >
            Sign in
          </button>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 1, background: 'var(--border)', border: '1px solid var(--border)',
          borderRadius: 10, overflow: 'hidden', marginBottom: 48,
        }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: 'var(--bg-primary)', padding: '18px 18px 20px' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: '0.85rem', lineHeight: 1.55, color: 'var(--text-secondary)' }}>{f.body}</div>
            </div>
          ))}
        </div>

        <p style={{
          fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--text-tertiary)',
          margin: 0, paddingTop: 24, borderTop: '1px solid var(--border-muted)',
        }}>
          Your data is tied to your account and is not sold or shared.{' '}
          <a href="/privacy.html" style={{ color: 'var(--text-secondary)' }}>Privacy</a>{' · '}
          <a href="/tos.html" style={{ color: 'var(--text-secondary)' }}>Terms</a>
          <br />
          Healstack is a personal tracking tool, not medical advice. Talk to a clinician before
          changing anything you take.
        </p>

      </div>
    </div>
  );
}
