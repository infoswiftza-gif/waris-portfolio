'use client';

import { ReactNode } from 'react';

/**
 * Server-safe hover anchor. Next.js refuses to let a Server Component pass a
 * browser `onMouseEnter`/`onMouseLeave` prop down to a raw `<a>`, so this is
 * the single place the admin dashboard (layout nav + page links) wires up
 * hover styling. It is a Client Component, so all handlers live in the browser.
 *
 * The event handlers are defined inline (not passed as props) because Next.js
 * 14 restricts passing event handlers as client component props.
 */
export function ClientHoverLink({
  href,
  children,
  className,
  style,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <a
      href={href}
      className={className}
      style={style}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--line-strong)';
      }}
    >
      {children}
    </a>
  );
}
