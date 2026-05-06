const frameworks = [
  {
    title: 'NSFAS household income threshold',
    body: 'The Reality Check tool uses the publicly cited figure of R 350,000 combined annual household income as the eligibility cap. Verify the current threshold at nsfas.org.za before applying.',
  },
  {
    title: 'Missing middle definition',
    body: 'The missing middle is generally used for households earning between roughly R 350,000 and R 600,000 per year — too high for NSFAS, too low to comfortably self-fund.',
  },
  {
    title: 'SAQA / NQF qualification levels',
    body: 'Route Compare reflects the South African Qualifications Authority\'s NQF framework: Higher Certificate, Diploma, Bachelor’s, Honours, Master’s and Doctorate.',
  },
  {
    title: 'DHET National List of Occupations in High Demand (OIHD)',
    body: 'The 51.7% mismatch figure — South African workers in jobs not matching their qualifications — is drawn from the DHET 2024 OIHD publication. We use this as a labour-market signal in the What Comes Next recommendations engine. The 23% overqualification figure cited in our research is also drawn from the same document.',
  },
  {
    title: 'CHE Vital Stats — undergraduate completion rates',
    body: 'The approximately 50% undergraduate completion-within-5-years figure is drawn from CHE Vital Stats reports. It informs the repeat-year risk weighting in the True Cost Calculator and Route Compare tools.',
  },
  {
    title: 'ICB — qualification deadline notice',
    body: 'The Institute of Certified Bookkeepers\' last enrolment date for NQF-registered qualifications in South Africa is 30 June 2026, after which enrolments will be under the IQB international framework only. This is noted in the Finance pathway card in the What Comes Next tool.',
  },
  {
    title: 'Important limitation',
    body: 'Cost figures are estimates. Specific institutions, residences, and cities can move them materially. Always verify fees directly before applying.',
  },
];

const references = [
  ['NSFAS', 'household income thresholds and application process', 'https://www.nsfas.org.za', 'nsfas.org.za'],
  ['DHET', 'Missing Middle policy, TVET sector data, OIHD, and Damelin regulatory notices', 'https://www.dhet.gov.za', 'dhet.gov.za'],
  ['SAQA', 'qualification registry and NQF framework', 'https://www.saqa.org.za', 'saqa.org.za'],
  ['Stats SA', 'cost-of-living and household expenditure surveys', 'https://www.statssa.gov.za', 'statssa.gov.za'],
  ['CHE', 'Vital Stats reports on completion rates and Damelin HEQC proceedings', 'https://www.che.ac.za', 'che.ac.za'],
  ['Report a correction', 'found outdated data, a broken calculation or a missing pathway?', 'mailto:info@dharmapathways.org.za?subject=Dharma%20Pathways%20correction', 'Email a correction'],
] as const;

export default function Page() {
  return (
    <div className="page-section active" data-page="research">
      <section className="page-hero">
        <div className="container container-narrow">
          <span className="eyebrow">Research &amp; method</span>
          <h1>Every formula. Every assumption. Every source.</h1>
          <p className="lead">If a tool gives you a number, you should be able to see why.</p>
        </div>
      </section>

      <section>
        <div className="container container-narrow">
          <span className="eyebrow">Frameworks we use</span>
          <h2>The South African context, baked in.</h2>

          <div className="method-note">
            <strong>Methodology review status:</strong>
            <br />
            Last methodology review: May 2026
            <br />
            Next scheduled review: July 2026
            <br />
            <br />
            <strong>Data currency note:</strong> thresholds, fee ranges, funding rules and labour-market signals change. Each assumption should be re-checked before major public campaigns, school partnerships or paid advisory work. Users should verify all figures directly before applying or borrowing.
          </div>

          <div className="warning-box section-gap-top">
            <strong>⚠ Damelin / Educor regulatory status — verify before applying</strong>
            In January 2026, DHET issued a Notice of Intent to Cancel Damelin’s private higher education registration. The Council on Higher Education has also recommended the withdrawal of Damelin qualifications from the HEQC register. These proceedings were ongoing as of May 2026. Users should verify current registration status directly with DHET, CHE and SAQA before applying, enrolling or paying deposits. Date checked: May 2026.
          </div>

          <div className="section-stack">
            {frameworks.map((item, index) => (
              <div key={item.title} className={index === 0 ? undefined : "section-gap-top"}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-paper-deep">
        <div className="container container-narrow">
          <span className="eyebrow">Reference list</span>
          <h2>Where to verify our framing.</h2>
          <p className="lead-space-sm">
            These links are starting points for verification, not endorsements. Before applying, borrowing or paying fees, confirm the current rule or figure directly with the relevant official body.
          </p>
          <ul className="reference-list">
            {references.map(([label, body, href, hrefLabel]) => (
              <li key={label} className="reference-list-item">
                <strong>{label}</strong> — {body} ·{' '}
                <a href={href} rel={href.startsWith('http') ? 'noopener' : undefined} target={href.startsWith('http') ? '_blank' : undefined}>
                  {hrefLabel}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
