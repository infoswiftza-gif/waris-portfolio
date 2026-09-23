import Link from 'next/link';

// Site-wide footer matching the homepage footer markup in lib/markup.ts.
// Navbar/footer map links now resolve to dedicated pages; CONNECT links point
// at real profiles (placeholders to be swapped for live URLs).
export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer>
      <div className="foot-grid">
        <div className="foot-brand">
          <Link className="brand" href="/" aria-label="WARIS.DEV — back to home">
            <span className="tri">▲</span>WARIS.DEV
          </Link>
          <p>
            Full Stack Developer
            <br />
            Building digital systems from interface to infrastructure.
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="foot-h">MAP</p>
          <div className="foot-links">
            <Link href="/about">ABOUT</Link>
            <Link href="/stack">STACK</Link>
            <Link href="/projects">PROJECTS</Link>
            <Link href="/experience">EXPERIENCE</Link>
            <Link href="/contact">CONTACT</Link>
          </div>
        </nav>
        <div>
          <p className="foot-h">CONNECT</p>
          <div className="foot-links">
            <a href="https://github.com/" target="_blank" rel="noopener">
              GitHub
            </a>
            <a href="https://www.linkedin.com/" target="_blank" rel="noopener">
              LinkedIn
            </a>
            <a href="mailto:hello@waris.dev" rel="noopener">
              Email
            </a>
          </div>
        </div>
      </div>
      <div className="foot-base">
        <span>
          © <span id="year">{year}</span> Waris Ali. Built in the digital city.
        </span>
        <span className="sys">
          SYS.STATUS: <span style={{ color: 'var(--accent)' }}>OPERATIONAL</span>
        </span>
      </div>
    </footer>
  );
}