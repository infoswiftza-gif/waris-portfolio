import Link from 'next/link';
import { ClientHoverLink } from '@/components/AdminHoverLink';

/**
 * /admin/dashboard
 *
 * Lightweight overview page. Each card links straight to its CRUD page so the
 * whole CMS lives behind one nav (`/admin/projects`, `/admin/experience`,
 * `/admin/stack`, `/admin/blog`).
 */

const ITEMS = [
  {
    href: '/admin/projects',
    label: 'PROJECTS',
    caption: 'title · slug · live URL · cover · order · published',
    icon: '📁',
  },
  {
    href: '/admin/experience',
    label: 'EXPERIENCE',
    caption: 'year · role · description · tags · order',
    icon: '📅',
  },
  {
    href: '/admin/stack',
    label: 'STACK',
    caption: 'category · name · order',
    icon: '🧱',
  },
  {
    href: '/admin/blog',
    label: 'BLOG',
    caption: 'title · slug · excerpt · markdown · cover · published toggle',
    icon: '✍️',
  },
];

export default function AdminDashboardPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        maxWidth: 820,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '22px 26px',
          borderRadius: 16,
          border: '1px solid var(--line)',
          background: 'var(--surface)',
        }}
      >
        <span
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background:
              'linear-gradient(180deg, rgba(100,245,176,.18), rgba(77,141,255,.12))',
            display: 'grid',
            placeItems: 'center',
            fontSize: 22,
          }}
        >
          ⚙
        </span>
        <div>
          <h2
            style={{
              fontFamily: '"Space Grotesk", "Inter", monospace',
              fontWeight: 700,
              letterSpacing: '-.03em',
              margin: 0,
              color: 'var(--ink)',
            }}
          >
            Welcome back, Admin.
          </h2>
          <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: 13 }}>
            Content lives in MongoDB via Prisma 8. Change a flag here and the
            public pages update instantly — the CDN cache is revalidated on every
            create / update / delete.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        {ITEMS.map((item) => (
          <ClientHoverLink
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: '22px 24px',
              borderRadius: 14,
              border: '1px solid var(--line-strong)',
              background: 'var(--surface)',
              textDecoration: 'none',
              transition: 'border-color .2s, background .2s, transform .2s',
              cursor: 'pointer',
              WebkitAppearance: 'none',
            }}
          >
            <span style={{ fontSize: 26 }}>{item.icon}</span>
            <span
              style={{
                fontFamily: '"Space Grotesk", "Inter", monospace',
                fontWeight: 700,
                letterSpacing: '.18em',
                fontSize: 13,
                color: 'var(--ink)',
              }}
            >
              {item.label}
            </span>
            <span
              style={{
                fontSize: 11.5,
                color: 'var(--muted)',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.caption}
            </span>
          </ClientHoverLink>
        ))}
      </div>

      <div
        style={{
          marginTop: 8,
          padding: '16px 20px',
          borderRadius: 10,
          border: '1px dashed var(--line-strong)',
          background: 'rgba(100,245,176,.04)',
          fontSize: 12,
          color: 'var(--muted)',
          fontFamily: 'monospace',
          letterSpacing: '.03em',
        }}
      >
        <b>Config</b> — set these in <code style={{ color: 'var(--muted-2)' }}>.env.local</code>, then run the seed script:
        <code
          style={{
            display: 'block',
            marginTop: 6,
            padding: '10px 12px',
            borderRadius: 8,
            background: 'var(--bg-2)',
            color: 'var(--ink)',
            fontSize: 11,
            overflowX: 'auto',
            fontFamily: 'monospace',
          }}
        >
          NEXTAUTH_SECRET=super-secret-change-me\n
          NEXTAUTH_URL=http://localhost:3000\n
          BLOB_READ_ONLY_TOKEN=your-virgin-blob-token
        </code>
      </div>
    </div>
  );
}
