const toolLinks = [
  { href: '/tools/reality-check', label: 'Reality Check' },
  { href: '/tools/cost-calculator', label: 'True Cost' },
  { href: '/tools/route-compare', label: 'Route Compare' },
  { href: '/tools/fit-check', label: 'Career Fit' },
  { href: '/tools/next-steps', label: 'What Comes Next' },
];

const companyLinks = [
  { href: '/about', label: 'About' },
  { href: '/research', label: 'Research & method' },
  { href: '/contact', label: 'Contact' },
  { href: '/terms', label: 'Terms' },
];

const legalLinks = [
  { href: '/privacy', label: 'Privacy (POPIA)' },
  { href: '/terms', label: 'Terms & disclaimers' },
  {
    href: 'mailto:info@dharmapathways.org.za?subject=Report%20an%20error%20on%20Dharma%20Pathways',
    label: 'Report an error',
  },
  { href: 'mailto:info@dharmapathways.org.za', label: 'info@dharmapathways.org.za' },
];

function LinkList({ links }: { links: Array<{ href: string; label: string }> }) {
  return (
    <ul>
      {links.map((link) => (
        <li key={link.href}>
          <a href={link.href}>{link.label}</a>
        </li>
      ))}
    </ul>
  );
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <img alt="Dharma Pathways" src="/logo.png" />
            <p>Honest, independent guidance for South African families weighing post-school choices.</p>
          </div>

          <div>
            <h4>Tools</h4>
            <LinkList links={toolLinks} />
          </div>

          <div>
            <h4>Company</h4>
            <LinkList links={companyLinks} />
          </div>

          <div>
            <h4>Legal</h4>
            <LinkList links={legalLinks} />
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Dharma Pathways. Built in South Africa.</span>
          <span>Public beta · Independent · No referral fees · Verify before applying.</span>
        </div>
      </div>
    </footer>
  );
}
