const FEATURES = [
  {
    title: 'Log doses in real-time',
    body: 'Record what you take as you take it and keep a running stack of everything currently active.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14"/>
        <rect x="4" y="4" width="16" height="16" rx="2"/>
      </svg>
    ),
  },
  {
    title: 'Catch interactions',
    body: 'Get warned before logging something that clashes with your active stack or history.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
  },
  {
    title: 'Track trends over time',
    body: 'Symptoms, biometrics, and labs plotted over time show real patterns instead of guesses.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
      </svg>
    ),
  },
  {
    title: 'Reference built-in',
    body: 'Look up dosing ranges, timing, and harm reduction notes for any substance in your library.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5h16M6 12.5h12M6 5.5h12"/>
      </svg>
    ),
  },
];

export default function Landing({ onGetStarted }) {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0.9rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6, background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
              </svg>
            </div>
            Healstack
          </div>
          <button
            onClick={onGetStarted}
            style={{
              background: 'var(--text-primary)', color: '#fff', fontSize: '0.875rem', fontWeight: 500,
              padding: '0.55rem 1.25rem', borderRadius: 999, border: 'none', cursor: 'pointer',
            }}
          >
            Get started
          </button>
        </div>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '5rem 1.5rem 4rem', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '3rem', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Health tracking</div>
          <h1 style={{ fontSize: 'clamp(2.75rem, 5.5vw, 4.25rem)', lineHeight: 1.05, margin: '0 0 1.25rem', fontWeight: 600, letterSpacing: '-0.01em' }}>
            Track what you take, and what it does.
          </h1>
          <p style={{ fontSize: '1.125rem', lineHeight: 1.6, color: 'var(--text-secondary)', maxWidth: 460, margin: '0 0 2rem' }}>
            A private tracker for supplements, medications, and symptoms. Log doses in real-time, check interactions before taking something, and watch trends over time.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
            <button
              onClick={onGetStarted}
              style={{
                textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 500, padding: '0.875rem 1.75rem',
                borderRadius: 999, display: 'inline-block', cursor: 'pointer', border: 'none',
                background: 'var(--text-primary)', color: '#fff', transition: 'transform 0.2s',
              }}
            >
              Start tracking →
            </button>
            <button
              onClick={onGetStarted}
              style={{
                textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 500, padding: '0.875rem 1.75rem',
                borderRadius: 999, display: 'inline-block', cursor: 'pointer',
                color: 'var(--text-primary)', border: '1px solid var(--border)', background: 'transparent',
              }}
            >
              Sign in
            </button>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.9rem', borderRadius: 999, background: 'rgba(26,26,26,0.04)', border: '1px solid var(--border)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2d7a50', flexShrink: 0 }} />
            Web + iOS app · private
          </div>
        </div>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,155,213,0.18) 0%, rgba(91,155,213,0) 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
          <div style={{ position: 'relative', display: 'flex', gap: '1rem' }}>
            <img
              src="/screenshots/iPhone-home.png"
              alt="Healstack dashboard"
              style={{ width: 180, borderRadius: 28, boxShadow: '0 30px 60px rgba(0,0,0,0.18)', border: '1px solid var(--border)' }}
            />
            <img
              src="/screenshots/iPhone-insights.png"
              alt="Healstack insights"
              style={{ width: 180, borderRadius: 28, boxShadow: '0 30px 60px rgba(0,0,0,0.18)', border: '1px solid var(--border)', transform: 'translateY(20px)' }}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 480, margin: '0 auto 3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Core features</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>Everything you need to track smart</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ padding: '1.5rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(91,155,213,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--accent)' }}>
                {f.icon}
              </div>
              <div style={{ fontWeight: 600, fontSize: '1.0625rem', letterSpacing: '-0.01em', marginBottom: '0.5rem' }}>{f.title}</div>
              <div style={{ fontSize: '0.875rem', lineHeight: 1.55, color: 'var(--text-secondary)' }}>{f.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Platforms */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 480, margin: '0 auto 3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Available now</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>Use it everywhere</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          {[
            { name: 'Web', status: 'Live', detail: 'healstack.heyitsmejosh.com', badge: 'badge-live' },
            { name: 'iOS', status: 'In Review', detail: 'v1.0 on App Store', badge: 'badge-pending' },
          ].map(p => (
            <div key={p.name} style={{ padding: '1.5rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: 600, fontSize: '1.0625rem', letterSpacing: '-0.01em' }}>{p.name}</div>
                <div style={{ padding: '0.15rem 0.5rem', borderRadius: 999, fontSize: '0.6875rem', fontWeight: 700, background: p.badge === 'badge-live' ? 'rgba(45,122,80,0.1)' : 'rgba(26,26,26,0.06)', color: p.badge === 'badge-live' ? '#2d7a50' : 'var(--text-secondary)' }}>
                  {p.status}
                </div>
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{p.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ maxWidth: 1080, margin: '0 auto', padding: '2rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
        <span>&copy; 2026 Joshua Trommel</span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a href="/privacy.html" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>Privacy</a>
          <a href="/tos.html" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>Terms</a>
        </div>
      </footer>
    </div>
  );
}
