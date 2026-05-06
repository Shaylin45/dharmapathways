const subjects = [
  {
    href: 'mailto:info@dharmapathways.org.za?subject=Dharma%20Pathways%20feedback',
    label: 'Tool feedback',
    body: 'something felt confusing, harsh, unclear or useful.',
  },
  {
    href: 'mailto:info@dharmapathways.org.za?subject=Report%20an%20error%20on%20Dharma%20Pathways',
    label: 'Report an error',
    body: 'outdated figure, broken calculation or incorrect pathway.',
  },
  {
    href: 'mailto:info@dharmapathways.org.za?subject=Pathway%20request%20for%20Dharma%20Pathways',
    label: 'Request a pathway',
    body: 'a field, qualification or route you want us to add.',
  },
  {
    href: 'mailto:info@dharmapathways.org.za?subject=School%20or%20NGO%20Dharma%20Pathways%20query',
    label: 'School / NGO query',
    body: 'using the tools with learners or families.',
  },
];

export default function Page() {
  return (
    <div className="page-section active" data-page="contact">
      <section className="page-hero">
        <div className="container container-narrow">
          <span className="eyebrow">Contact</span>
          <h1>Email is the best way to reach us.</h1>
          <p className="lead">A real person reads every message and replies as capacity allows.</p>
        </div>
      </section>

      <section style={{ paddingTop: 'var(--space-12)' }}>
        <div className="container container-narrow">
          <div className="form-section" style={{ textAlign: 'center', padding: 'var(--space-16) var(--space-8)' }}>
            <span className="eyebrow">Write to us at</span>
            <h2
              style={{
                fontFamily: 'var(--display)',
                fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                margin: 'var(--space-4) 0 var(--space-8)',
                wordBreak: 'break-all',
              }}
            >
              <a
                href="mailto:info@dharmapathways.org.za"
                style={{ textDecoration: 'none', color: 'var(--ink)', borderBottom: '2px solid var(--terracotta)', paddingBottom: 4 }}
              >
                info@dharmapathways.org.za
              </a>
            </h2>
            <a className="btn btn-primary" href="mailto:info@dharmapathways.org.za">
              Open in your email app →
            </a>
          </div>

          <div className="form-section" style={{ marginTop: 'var(--space-8)' }}>
            <h3>Useful subject lines</h3>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--ink-soft)', lineHeight: 1.9, marginTop: 'var(--space-4)' }}>
              {subjects.map((subject) => (
                <li key={subject.href}>
                  <a href={subject.href}>{subject.label}</a> — {subject.body}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
