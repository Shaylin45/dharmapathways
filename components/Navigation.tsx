const links = [
  { href: '/', label: 'Home' },
  { href: '/tools', label: 'Tools' },
  { href: '/about', label: 'About' },
  { href: '/research', label: 'Research' },
  { href: '/contact', label: 'Contact' },
  { href: '/terms', label: 'Terms' },
];

export default function Navigation() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <a className="nav-brand" href="/">
          <img alt="" src="/logo.png" />
          <span>Dharma Pathways</span>
        </a>

        <button aria-label="Menu" className="nav-toggle" type="button">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className="nav-links">
          {links.map((link) => (
            <a href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
