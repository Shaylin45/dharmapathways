export default function Page() {
  return (
    <div className="page-section active" data-page="privacy">
      <section className="page-hero">
        <div className="container container-narrow">
          <span className="eyebrow">Privacy &amp; POPIA</span>
          <h1>Plain-language privacy policy.</h1>
          <p className="lead">Most education sites collect more data than they admit. Dharma Pathways is designed to collect as little as possible.</p>
        </div>
      </section>

      <section>
        <div className="container container-narrow">
          <h3>The short version</h3>
          <p>The Dharma Pathways tools run entirely in your browser. The numbers you enter are stored locally on your device and are not sent to us. Clearing your browser data clears them.</p>
          <p>We do not sell data. We do not use behavioural advertising trackers. We do not require an account, email address, ID number, banking details or documents to use the free tools.</p>

          <hr className="divider" />

          <h3>What we collect</h3>
          <ol className="content-list">
            <li>
              <strong>Tool inputs locally only:</strong> the information entered into the tools is saved to your browser&apos;s local storage so you can move between tools without re-entering everything. We cannot read this information unless you choose to send it to us yourself.
            </li>
            <li>
              <strong>Email correspondence:</strong> if you email us, we receive your email address and the contents of your message. We use this only to respond, keep a record of the query, and improve the public tools where appropriate.
            </li>
            <li>
              <strong>Basic analytics:</strong> we use Cloudflare Web Analytics to understand aggregate page visits and tool usage. This does not use cookies and does not identify individual users.
            </li>
          </ol>

          <h3 className="section-heading-spaced">What we do not collect</h3>
          <ul className="content-list">
            <li>We do not ask for ID numbers, passport numbers, banking details or credit reports.</li>
            <li>We do not require an account or login for the free tools.</li>
            <li>We do not sell, rent or share user data with universities, colleges, lenders, bursary providers or advertisers.</li>
            <li>We do not accept referral fees in exchange for recommending any education provider.</li>
          </ul>

          <h3 className="section-heading-spaced">Your POPIA rights</h3>
          <p>
            South Africa’s Protection of Personal Information Act gives you rights over personal information held about you. Because tool inputs stay on your own device, we do not hold that information. For email correspondence, you can request a copy of what we hold or ask us to delete it by emailing <a href="mailto:info@dharmapathways.org.za">info@dharmapathways.org.za</a>.
          </p>

          <h3 className="section-heading-spaced">Information Officer</h3>
          <p>
            POPIA-related queries can be sent to <a href="mailto:info@dharmapathways.org.za">info@dharmapathways.org.za</a>.
          </p>

          <p className="timestamp-note">Last updated: May 2026.</p>
        </div>
      </section>
    </div>
  );
}
