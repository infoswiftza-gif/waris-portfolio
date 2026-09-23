'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Site-wide navigation that mirrors the homepage's .nav / .mnav markup from
// lib/markup.ts, so sub-pages share the exact same visual language. It keeps a
// light client-side copy of the scrolled-state + mobile-menu behaviour that the
// homepage's SiteInteractions provides, since that component only mounts on "/".
const PRIMARY = [
  { href: '/about', label: 'ABOUT' },
  { href: '/stack', label: 'STACK' },
  { href: '/projects', label: 'PROJECTS' },
  { href: '/experience', label: 'EXPERIENCE' },
];

const MOBILE = [
  { href: '/about', n: '01', label: 'ABOUT' },
  { href: '/stack', n: '02', label: 'STACK' },
  { href: '/projects', n: '03', label: 'PROJECTS' },
  { href: '/experience', n: '04', label: 'EXPERIENCE' },
  { href: '/process', n: '05', label: 'PROCESS' },
  { href: '/contact', n: '06', label: 'CONTACT' },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled((window.scrollY || 0) > 30);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <div className="city-sky" aria-hidden="true"></div>
      <div className="fx fx-vignette" aria-hidden="true"></div>
      <header className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <Link className="brand" href="/" aria-label="WARIS.DEV — back to home">
            <span className="tri">▲</span>WARIS.DEV
          </Link>
          <nav className="nav-links" aria-label="Primary">
            {PRIMARY.map((l) => (
              <Link key={l.href} href={l.href} aria-current={isActive(l.href) ? 'true' : undefined}>
                {l.label}
              </Link>
            ))}
          </nav>
          <Link className="btn btn-ghost btn-sm nav-cta magnetic" href="/contact">
            LET&apos;S BUILD
          </Link>
          <button
            className="menu-btn"
            aria-expanded={open}
            aria-controls="mnav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>
      <div className={`mnav${open ? ' open' : ''}`} id="mnav" aria-hidden={!open}>
        {MOBILE.map((l) => (
          <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
            <i>{l.n}</i>
            {l.label}
          </Link>
        ))}
      </div>
    </>
  );
}