const journeys = [
  {
    title: 'I am a parent or guardian',
    body: 'You are probably asking whether the family can carry the cost without breaking the household.',
    items: [
      'Start with Reality Check.',
      'Then run True Cost using the most likely option.',
      'Print the final report before paying deposits.',
    ],
    href: '/tools/reality-check',
    cta: 'Start with affordability →',
  },
  {
    title: 'I am a student',
    body: 'You may know what you like, but not whether the route is realistic, fundable or worth the risk.',
    items: [
      'Start with Career Fit.',
      'Check readiness against your marks.',
      'Compare a degree route against a safer alternative.',
    ],
    href: '/tools/fit-check',
    cta: 'Start with fit →',
  },
  {
    title: 'I am from a school or NGO',
    body: 'Use the tools as a structured conversation guide with learners and families.',
    items: [
      'Use Reality Check for household context.',
      'Use Route Compare for option counselling.',
      'Use the final report as a take-home discussion sheet.',
    ],
    href: '/tools',
    cta: 'Open the toolkit →',
  },
];

const trustItems = [
  {
    title: 'No login required',
    body: 'Use the tools without creating an account or entering an ID number.',
  },
  {
    title: 'Private by default',
    body: 'Your answers stay in your browser unless you choose to email them to us.',
  },
  {
    title: 'Independent',
    body: 'No referral fees from universities, colleges, lenders or bursary providers.',
  },
  {
    title: 'Built for SA',
    body: 'Missing-middle pressure, TVET routes, NSFAS thresholds and local pathway realities are built in.',
  },
];

const tools = [
  {
    step: '— Step 01',
    title: 'Reality Check',
    body: 'How much pressure is your household actually under? A two-minute snapshot of income, dependents, and existing commitments.',
    href: '/tools/reality-check',
    cta: 'Take the check →',
  },
  {
    step: '— Step 02',
    title: 'True Cost Calculator',
    body: 'Tuition is rarely more than half the bill. Add accommodation, food, transport, devices, and data.',
    href: '/tools/cost-calculator',
    cta: 'Calculate the truth →',
  },
  {
    step: '— Step 03',
    title: 'Route Compare',
    body: 'Place two paths side-by-side and see which one is genuinely safer for your situation.',
    href: '/tools/route-compare',
    cta: 'Compare two routes →',
  },
  {
    step: '— Step 04',
    title: 'Career Fit Check',
    body: 'The cheapest path is worthless if it leads somewhere you will quit in two years.',
    href: '/tools/fit-check',
    cta: 'Find your fit →',
  },
];

const insights = [
  '“The tools made hidden costs visible — food, housing, transport — not just tuition.”',
  '“For the first time we saw what year one actually costs, beyond the fees on the brochure.”',
  '“It showed us how unprepared we really were for our child starting university.”',
  '“It surfaced the gap between what our child enjoys and what they think they should study.”',
  '“It let us put two completely different study options side-by-side and see the trade-off honestly.”',
];

const methodSteps = [
  {
    title: 'Honest inputs',
    body: 'You tell us the real numbers. We do not pull credit data or ask for ID. Everything stays in your browser.',
  },
  {
    title: 'Transparent maths',
    body: 'Every calculation is shown. No black-box scores. You can challenge any assumption we make.',
  },
  {
    title: 'Real comparisons',
    body: 'Side-by-side, not feature-by-feature. We surface the trade-off you will actually feel.',
  },
  {
    title: 'A defensible decision',
    body: 'You leave with a written summary you can show your family — and a path you understood before choosing.',
  },
];

export default function Page() {
  return (
    <div className="page-section active" data-page="home">
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <span className="eyebrow">Built for South Africa’s missing middle</span>
              <h1>
                Choosing what to study <span className="accent">shouldn&apos;t</span> bankrupt your family.
              </h1>
              <p className="lead" style={{ marginTop: '1.5rem' }}>
                You earn too much for NSFAS, too little for university to feel safe. Dharma Pathways gives you four free tools to weigh the real cost, the real risk, and the real fit of every post-school path — before you commit.
              </p>
              <div className="beta-notice">
                <strong>Public beta:</strong> Dharma Pathways is being tested with South African families. Use it as decision support, then verify fees, admission rules, accreditation and funding directly before applying, borrowing or paying deposits.
              </div>
              <div className="hero-cta">
                <a className="btn btn-primary" href="/tools/reality-check">
                  Start with a 2-minute Reality Check →
                </a>
                <a className="btn btn-secondary" href="/tools">
                  See all tools
                </a>
              </div>
            </div>

            <aside className="hero-side">
              <div className="hero-stat">
                <div className="hero-stat-num">10 families</div>
                <div className="hero-stat-label">Tested with us before public launch — including the founders&apos; own</div>
                <div className="hero-stat-source">— see what they found below</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num">≈ R 350k+</div>
                <div className="hero-stat-label">Realistic 3-year cost of public university: tuition, residence, food, transport, devices and data</div>
                <div className="hero-stat-source">— Universities SA fee frameworks</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num">R 350,000–R 600,000</div>
                <div className="hero-stat-label">The missing-middle income band — too high for NSFAS, too low to comfortably self-fund</div>
                <div className="hero-stat-source">— DHET / NSFAS guidance</div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="callout">
        <div className="container container-narrow">
          <span className="eyebrow">Why this exists</span>
          <h2>The advice you are given assumes you can either pay full price or qualify for full funding. Most families can do neither.</h2>
          <p style={{ marginTop: '1.5rem' }}>
            If your household earns roughly R 350,000 to R 600,000 a year, you are caught in the gap. Bursary applications screen you out. Banks happily offer student loans you will struggle to repay. School counsellors steer everyone toward the same three universities. Meanwhile, no one tells you what an Honours actually costs once you add accommodation, data, and a working laptop — or that a TVET pathway might earn more, sooner, with less debt.
          </p>
          <p>Dharma Pathways was built to fill that gap with honest numbers and clear comparisons. No institution pays us. No referral fees. No hidden agenda.</p>
        </div>
      </section>

      <section style={{ background: 'var(--paper-deep)' }}>
        <div className="container">
          <span className="eyebrow">How to use Dharma Pathways</span>
          <h2 style={{ maxWidth: '24ch' }}>Start with the question you actually have.</h2>
          <p className="lead" style={{ marginTop: '1rem' }}>
            You do not need to understand the whole education system before using the site. Pick the entry point that sounds most like you.
          </p>
          <div className="journey-grid">
            {journeys.map((journey) => (
              <div className="journey-card reveal" key={journey.title}>
                <h3>{journey.title}</h3>
                <p>{journey.body}</p>
                <ul>
                  {journey.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <a className="btn btn-primary" href={journey.href}>
                  {journey.cta}
                </a>
              </div>
            ))}
          </div>

          <div className="trust-strip">
            {trustItems.map((item) => (
              <div className="trust-item" key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <span className="eyebrow">Four tools, one decision</span>
          <h2 style={{ maxWidth: '18ch' }}>A guided sequence — not another brochure.</h2>
          <p className="lead" style={{ marginTop: '1rem' }}>
            Each tool builds on the last. Use them in order for the strongest report, or jump to the question keeping you up at night.
          </p>
          <div className="tools-grid">
            {tools.map((tool) => (
              <a className="tool-card reveal" href={tool.href} key={tool.title}>
                <div className="tool-card-num">{tool.step}</div>
                <h3>{tool.title}</h3>
                <p>{tool.body}</p>
                <span className="tool-card-arrow">{tool.cta}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="early-users">
        <div className="container">
          <span className="eyebrow">What early users found</span>
          <h2 style={{ maxWidth: '22ch' }}>Ten families. Five recurring moments of &quot;oh — we hadn&apos;t thought about that.&quot;</h2>
          <div className="early-users-disclosure">
            <strong>Honest disclosure:</strong> Dharma Pathways was tested with ten South African families before public launch — including the founders&apos; own families and close relatives. As we collect named feedback from public users, we will publish that too.
          </div>
          <div className="early-users-grid">
            {insights.map((quote, index) => (
              <div
                className="insight reveal"
                key={quote}
                style={index === insights.length - 1 ? { gridColumn: '1 / -1', maxWidth: '60ch' } : undefined}
              >
                <div className="insight-num">— {String(index + 1).padStart(2, '0')}</div>
                <p className="insight-quote">{quote}</p>
                <p className="insight-attr">— recurring feedback from early users</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--ink)', color: 'var(--paper)', padding: 'var(--space-12) 0' }}>
        <div className="container container-narrow">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: 'var(--space-8)',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--display)',
                fontSize: 'clamp(3.5rem, 9vw, 6rem)',
                fontWeight: 400,
                color: 'var(--terracotta-soft)',
                lineHeight: 1,
              }}
            >
              51.7%
            </div>
            <div>
              <p
                style={{
                  color: 'rgba(250,247,242,0.92)',
                  fontSize: '1.15rem',
                  marginBottom: '0.5rem',
                  lineHeight: 1.4,
                }}
              >
                of South African workers are in jobs that do not match their qualifications.
              </p>
              <p style={{ color: 'rgba(250,247,242,0.6)', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>
                — DHET 2024 National List of Occupations in High Demand
              </p>
            </div>
          </div>
          <p style={{ color: 'rgba(250,247,242,0.78)', marginTop: 'var(--space-6)', fontSize: '1rem' }}>
            A generation of South Africans studied something that did not lead where they hoped. Our tools cross-reference what you would thrive at against what the country actually needs.
          </p>
          <p style={{ marginTop: 'var(--space-6)' }}>
            <a href="/tools/next-steps" style={{ color: 'var(--terracotta-soft)', fontWeight: 600 }}>
              See the three-pathway recommendations engine →
            </a>
          </p>
        </div>
      </section>

      <section style={{ background: 'var(--paper-deep)' }}>
        <div className="container">
          <span className="eyebrow">The Dharma method</span>
          <h2 style={{ maxWidth: '22ch' }}>From &quot;I have no idea&quot; to &quot;I know exactly why I chose this.&quot;</h2>
          <div className="steps">
            {methodSteps.map((step, index) => (
              <div className="step reveal" key={step.title}>
                <div className="step-num">— {String(index + 1).padStart(2, '0')}</div>
                <h4>{step.title}</h4>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container container-narrow" style={{ textAlign: 'center' }}>
          <span className="eyebrow">A note on independence</span>
          <h2 style={{ fontSize: '1.75rem', maxWidth: '30ch', margin: '0 auto' }}>
            We take no money from universities, colleges, lenders, or bursary providers.
          </h2>
          <p className="lead" style={{ margin: '1.5rem auto 2rem', textAlign: 'left' }}>
            Most &quot;free&quot; education advice in South Africa is paid for by the institutions you are being advised toward. Dharma Pathways is built independently and the tools are free to use.
          </p>
          <a className="btn btn-ghost" href="/about">
            Read more about how we work
          </a>
        </div>
      </section>

      <section className="feedback-strip">
        <div className="container">
          <div className="feedback-grid">
            <div>
              <span className="eyebrow">Help us improve</span>
              <h2 style={{ fontSize: 'clamp(1.7rem, 3vw, 2.4rem)' }}>Testing the tools? Tell us what confused you.</h2>
              <p style={{ marginTop: 'var(--space-4)', maxWidth: '60ch' }}>
                Dharma Pathways is still improving. We especially want to know which result felt unclear, which route you wished we covered, and whether any wording felt unfair or judgemental.
              </p>
            </div>
            <div className="feedback-actions">
              <a className="btn btn-primary" href="mailto:info@dharmapathways.org.za?subject=Dharma%20Pathways%20feedback">
                Send feedback →
              </a>
              <a className="btn btn-secondary" href="mailto:info@dharmapathways.org.za?subject=Report%20an%20error%20on%20Dharma%20Pathways">
                Report an error
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
