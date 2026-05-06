const tools = [
  {
    step: '— Step 01 · 2 minutes',
    title: 'Reality Check',
    body: 'How much pressure is your household actually under?',
    href: '/tools/reality-check',
    cta: 'Take the check →',
  },
  {
    step: '— Step 02 · 5 minutes',
    title: 'True Cost Calculator',
    body: 'See the real annual and monthly number you would actually need to find.',
    href: '/tools/cost-calculator',
    cta: 'Calculate the truth →',
  },
  {
    step: '— Step 03 · 5 minutes',
    title: 'Route Compare',
    body: 'University vs TVET, full-time vs distance, expensive vs affordable.',
    href: '/tools/route-compare',
    cta: 'Compare two routes →',
  },
  {
    step: '— Step 04 · 3 minutes',
    title: 'Career Fit Check',
    body: 'Map interests and working style to career fields where you are likely to thrive.',
    href: '/tools/fit-check',
    cta: 'Find your fit →',
  },
];

export default function Page() {
  return (
    <div className="page-section active" data-page="tools">
      <section className="page-hero">
        <div className="container container-narrow">
          <span className="eyebrow">Free tools</span>
          <h1>Four tools, in the order that matters — plus a recommendations engine that ties them together.</h1>
          <p className="lead">Start with whichever question is loudest right now — but the strongest decision comes from running all four in sequence.</p>
        </div>
      </section>

      <section className="section-top-tight">
        <div className="container">
          <div className="snapshot-panel" id="pathwaySnapshot">
            <span className="eyebrow eyebrow-soft">
              Your Pathway Snapshot
            </span>
            <h2 className="tools-snapshot-title">Your current decision profile</h2>
            <p>This snapshot updates as your household completes the tools. No tools completed yet? Start with Reality Check to build the first part of your snapshot.</p>
            <div className="snapshot-grid" id="snapshotGrid"></div>
            <div className="snapshot-action" id="snapshotAction">
              <strong>Recommended next action:</strong> Start with Reality Check to understand your household affordability pressure.
            </div>
          </div>

          <div className="tools-grid section-gap-top">
            {tools.map((tool) => (
              <a className="tool-card reveal" href={tool.href} key={tool.title}>
                <div className="tool-card-num">{tool.step}</div>
                <h3>{tool.title}</h3>
                <p>{tool.body}</p>
                <span className="tool-card-arrow">{tool.cta}</span>
              </a>
            ))}

            <a className="tool-card tool-card-featured reveal" href="/tools/next-steps">
              <div className="tool-card-num">
                — After all four · 5 minutes
              </div>
              <h3>What Comes Next — three pathways, three priorities</h3>
              <p>
                Cheapest, most employable, and fastest to earning — cross-referenced against South African labour-market signals.
              </p>
              <span className="tool-card-arrow">
                See your pathways →
              </span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
