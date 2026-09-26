'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Admin navigation.
 *
 * A Client Component because it needs `usePathname` to mark the active section.
 * The links are real `<Link>`s rather than the old `ClientHoverLink` anchors
 * that wrote to `element.style` on hover, so middle-click, cmd-click and
 * keyboard focus all behave, and `aria-current` tells assistive tech where the
 * user is.
 */
const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/blog', label: 'Blog' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/experience', label: 'Experience' },
  { href: '/admin/stack', label: 'Stack' },
  { href: '/admin/media', label: 'Media' },
  { href: '/admin/audit', label: 'Audit' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="adm-nav" aria-label="Admin sections">
      {NAV.map((item) => {
        // Exact match for `/admin` so it is not highlighted on every sub-page.
        const current =
          item.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="adm-navlink"
            aria-current={current ? 'page' : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
