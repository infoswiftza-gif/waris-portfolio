import type { Metadata } from 'next';

import { ClientHoverLink } from '../../components/AdminHoverLink';

/**
 * Admin shell.
 *
 * A minimal, dark, monospace-accent shell that switches the public `SiteNav`
 * for an admin-only top bar.  Children are the separate CRUD pages
 * (`/admin/login`, `/admin/projects`, `/admin/experience`, `/admin/stack`,
 * `/admin/blog`) mounted under one nav so the whole CMS feels like one place.
 */

export const metadata: Metadata = {
  title: 'Admin · WARIS.DEV CMS',
  description: 'Content management backend for the WARIS.DEV portfolio.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--bg)',
        color: 'var(--ink)',
        minHeight: '100vh',
        fontFamily: "'Inter', 'SF Mono', 'Cascadia Code', Menlo, Consolas, monospace",
      }}
    >
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 32px',
          borderBottom: '1px solid var(--line)',
          background: 'rgba(3, 5, 11, 0.86)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'linear-gradient(180deg, var(--accent), var(--accent-blue))',
              display: 'grid',
              placeItems: 'center',
              fontSize: 14,
              fontWeight: 700,
              color: '#04140c',
              flexShrink: 0,
            }}
          >
            ⚙
          </span>
          <h1
            style={{
              fontFamily: '"Space Grotesk", "Inter", monospace',
              fontWeight: 700,
              letterSpacing: '-.03em',
              color: 'var(--ink)',
            }}
          >
            WARIS.DEV <span style={{ color: 'var(--accent)' }}>·</span> CMS
          </h1>
        </div>

        <nav
          style={{
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
          }}
        >
          <ClientHoverLink
            href="/admin"
            className="admin-nav-link"
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid var(--line-strong)',
              background: 'var(--surface)',
              color: 'var(--muted)',
              fontFamily: 'monospace',
              fontWeight: 500,
              fontSize: 12.5,
              letterSpacing: '.04em',
              textDecoration: 'none',
              transition: 'color .2s, border-color .2s, background .2s',
              cursor: 'pointer',
            }}
          >
            Dashboard
          </ClientHoverLink>
          <ClientHoverLink
            href="/admin/projects"
            className="admin-nav-link"
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid var(--line-strong)',
              background: 'var(--surface)',
              color: 'var(--muted)',
              fontFamily: 'monospace',
              fontWeight: 500,
              fontSize: 12.5,
              letterSpacing: '.04em',
              textDecoration: 'none',
              transition: 'color .2s, border-color .2s, background .2s',
              cursor: 'pointer',
            }}
          >
            Projects
          </ClientHoverLink>
          <ClientHoverLink
            href="/admin/experience"
            className="admin-nav-link"
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid var(--line-strong)',
              background: 'var(--surface)',
              color: 'var(--muted)',
              fontFamily: 'monospace',
              fontWeight: 500,
              fontSize: 12.5,
              letterSpacing: '.04em',
              textDecoration: 'none',
              transition: 'color .2s, border-color .2s, background .2s',
              cursor: 'pointer',
            }}
          >
            Experience
          </ClientHoverLink>
          <ClientHoverLink
            href="/admin/stack"
            className="admin-nav-link"
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid var(--line-strong)',
              background: 'var(--surface)',
              color: 'var(--muted)',
              fontFamily: 'monospace',
              fontWeight: 500,
              fontSize: 12.5,
              letterSpacing: '.04em',
              textDecoration: 'none',
              transition: 'color .2s, border-color .2s, background .2s',
              cursor: 'pointer',
            }}
          >
            Stack
          </ClientHoverLink>
          <ClientHoverLink
            href="/admin/blog"
            className="admin-nav-link"
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid var(--line-strong)',
              background: 'var(--surface)',
              color: 'var(--muted)',
              fontFamily: 'monospace',
              fontWeight: 500,
              fontSize: 12.5,
              letterSpacing: '.04em',
              textDecoration: 'none',
              transition: 'color .2s, border-color .2s, background .2s',
              cursor: 'pointer',
            }}
          >
            Blog
          </ClientHoverLink>
        </nav>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 36px 80px' }}>
        {children}
      </main>

      <footer
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '22px 36px',
          borderTop: '1px solid var(--line)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11.5,
          color: 'var(--muted-2)',
          fontFamily: 'monospace',
        }}
      >
        <span>WARIS.DEV CMS</span>
        <span>v1.0 · MongoDB + Prisma 8 · {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
