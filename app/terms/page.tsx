export default function Page() {
  return (
    <div className="page-section active" data-page="terms">
      <section className="page-hero">
        <div className="container container-narrow">
          <span className="eyebrow">Terms, disclaimers &amp; independence</span>
          <h1>Use the tools as decision support — not as a guarantee.</h1>
          <p className="lead">Dharma Pathways helps families ask better questions, compare options more honestly, and prepare for real conversations. It does not replace professional advice or direct verification with institutions and funders.</p>
        </div>
      </section>

      <section>
        <div className="container container-narrow">
          <h3>1. Educational guidance only</h3>
          <p>The tools and recommendations on Dharma Pathways are provided for general educational guidance. They are not personalised financial advice, legal advice, psychological advice, admission advice, funding advice, or a guarantee of any education, funding, employment or immigration outcome.</p>

          <h3 className="section-heading-spaced">2. No guarantee of admission, funding or employment</h3>
          <p>Admission requirements, funding rules, bursary deadlines, programme accreditation, institutional fees and labour-market conditions change. You must verify all information directly with the relevant university, TVET college, private provider, professional body, funder, government department or employer before making a commitment.</p>

          <div className="warning-box section-gap-top">
            <strong>⚠ Damelin — specific warning</strong>
            As of January 2026, DHET issued a Notice of Intent to Cancel Damelin’s registration as a private higher education institution. The CHE has also recommended the withdrawal of Damelin qualifications. Dharma Pathways does not recommend Damelin as a destination. Do not enrol, apply or pay non-refundable deposits at Damelin without first confirming the current regulatory status directly with DHET and CHE.
          </div>

          <h3 className="section-heading-spaced">3. Cost and affordability estimates</h3>
          <p>Cost figures are estimates only. They may be based on public fee ranges, typical student expenses, user inputs, or conservative assumptions. Actual costs can vary materially by institution, city, accommodation choice, transport distance, inflation, programme structure, repeat years, personal circumstances and funding outcomes.</p>

          <h3 className="section-heading-spaced">4. Career and labour-market information</h3>
          <p>Career-fit outputs and pathway recommendations are decision-support tools. They are not aptitude tests, psychometric assessments, employment guarantees, or formal career-counselling reports. Labour-market signals should be treated as one input among many, not as certainty.</p>

          <h3 className="section-heading-spaced">5. Independence policy</h3>
          <p>Dharma Pathways does not take referral fees from universities, colleges, lenders, bursary providers or training providers. We do not rank institutions based on payment. If this policy ever changes for any future service, it must be disclosed clearly before a user relies on the relevant information.</p>

          <h3 className="section-heading-spaced">6. User responsibility</h3>
          <p>You are responsible for checking all application requirements, deadlines, accreditation status, professional registration requirements, funding conditions, loan terms and total costs before making a decision. Use the tools to prepare better questions, not to skip due diligence.</p>

          <h3 className="section-heading-spaced">7. Corrections and updates</h3>
          <p>
            We aim to correct errors transparently. If you find outdated data, broken logic, a misleading statement, or a missing route, email{' '}
            <a href="mailto:info@dharmapathways.org.za?subject=Dharma%20Pathways%20correction">info@dharmapathways.org.za</a>{' '}
            with the page name, the issue, and any source we should review.
          </p>

          <h3 className="section-heading-spaced">8. Intellectual property</h3>
          <p>The Dharma Pathways name, writing, tool logic, page structure, visual design and original content are protected as the project&apos;s intellectual property unless otherwise stated. Public sources remain the property of their respective owners.</p>

          <h3 className="section-heading-spaced">9. Contact</h3>
          <p>
            Questions about these terms can be sent to <a href="mailto:info@dharmapathways.org.za">info@dharmapathways.org.za</a>.
          </p>

          <p className="timestamp-note">Last updated: May 2026.</p>
        </div>
      </section>
    </div>
  );
}
