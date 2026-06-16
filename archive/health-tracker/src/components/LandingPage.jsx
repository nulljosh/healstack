const FEATURES = [
  { title: 'Sleep & Recovery', desc: 'Track sleep duration, quality patterns, and recovery trends over time.' },
  { title: 'Exercise & Movement', desc: 'Log workouts, daily steps, and outdoor activity minutes.' },
  { title: 'Vitals', desc: 'Heart rate, blood pressure, weight -- your baseline biometrics.' },
  { title: 'Blood Markers', desc: 'Glucose, cholesterol, triglycerides -- lab results that matter.' },
  { title: 'Stress & Mental', desc: 'Stress levels, mood scores, anxiety tracking on a 1-10 scale.' },
  { title: 'Supplements', desc: 'Configure your stack. Track daily adherence. See consistency.' },
  { title: 'Environment', desc: 'Screen time, outdoor exposure -- the inputs you control.' },
  { title: 'Family History', desc: 'Log conditions once. Get personalized risk context forever.' },
]

const TIMELINE = [
  { step: 'Log', desc: 'Check in daily. Start with the basics -- sleep, exercise, nutrition.' },
  { step: 'Build baseline', desc: '7 days of data creates your personal baseline for anomaly detection.' },
  { step: 'Spot patterns', desc: 'Trends, correlations, and risk flags surface automatically.' },
  { step: 'Track adherence', desc: 'Supplement consistency, streak counting, period-over-period comparison.' },
]

export default function LandingPage({ onEnter }) {
  return (
    <div className="landing">
      <section className="landing-hero">
        <p className="section-label" data-aos="fade-up">Personal Health System</p>
        <h1 className="hero-title animate__animated animate__fadeInUp">
          Your health.<br />Quantified.
        </h1>
        <p className="hero-sub" data-aos="fade-up" data-aos-delay="100">
          A continuous simulation of your body -- genome to environment.
          Track what matters. Own your data. No cloud. No account. No excuses.
        </p>
        <button className="pill-cta" onClick={onEnter} data-aos="fade-up" data-aos-delay="200">
          Start Tracking
        </button>
      </section>

      <section className="landing-vision" data-aos="fade-up">
        <p className="section-label">The Vision</p>
        <blockquote className="vision-quote">
          "Imagine a personal health system that continuously simulates your body
          using your genome, microbiome, blood markers, sleep, stress, family history,
          and local environment data -- adjusting recommendations in real-time as
          your biology changes."
        </blockquote>
        <p className="vision-attr">-- @0xDevShah</p>
      </section>

      <section className="landing-features">
        <p className="section-label" data-aos="fade-up">What You Track</p>
        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="feature-card" data-aos="fade-up" data-aos-delay={i * 50}>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-timeline" data-aos="fade-up">
        <p className="section-label">How It Works</p>
        <div className="timeline">
          {TIMELINE.map((t, i) => (
            <div key={t.step} className="timeline-step" data-aos="fade-up" data-aos-delay={i * 80}>
              <div className="timeline-dot" />
              <div className="timeline-content">
                <h4>{t.step}</h4>
                <p>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-glynac" data-aos="fade-up">
        <p className="section-label">Research Spotlight</p>
        <div className="glynac-card">
          <h3>GlyNAC: NAC + Glycine</h3>
          <p>
            Baylor College of Medicine research shows GlyNAC supplementation
            restores glutathione levels, reduces oxidative stress, improves
            mitochondrial function, and reverses multiple aging biomarkers.
          </p>
          <p>
            Glutathione = glutamate + cysteine + glycine. Both cysteine (via NAC)
            and glycine become deficient with age. Supplementing both together
            is more effective than either alone.
          </p>
          <div className="glynac-dosage">
            <span>NAC: 3g/day (split doses)</span>
            <span>Glycine: 6g/day (evening)</span>
            <span>~$30/month total</span>
          </div>
        </div>
      </section>

      <footer className="landing-footer" data-aos="fade-up">
        <p>All data stays on your device. No accounts. No cloud. No tracking.</p>
        <button className="pill-cta" onClick={onEnter}>Open Health Tracker</button>
      </footer>
    </div>
  )
}
