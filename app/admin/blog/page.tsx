'use client';

import { ResourceManager, type ResourceConfig } from '../_components/ResourceManager';

/**
 * Blog posts.
 *
 * The whole screen is this config object — the generic `ResourceManager` owns
 * the fetching, the table, the form, the bulk actions and the toasts. What
 * used to be ~450 lines of hand-copied CRUD (with a create path that could never
 * run and a success flag that was never set) is now a column list and a field
 * list.
 */

const STATUS = {
  live: (
    <span className="adm-badge adm-badge-live">
      <span className="adm-dot" />
      Live
    </span>
  ),
  draft: (
    <span className="adm-badge adm-badge-draft">
      <span className="adm-dot" />
      Draft
    </span>
  ),
};

const config: ResourceConfig = {
  resource: 'blog',
  title: 'Blog posts',
  singular: 'Blog post',
  plural: 'posts',
  description:
    'Long-form writing. Drafts stay private until you publish them — the public API only ever serves published posts.',
  hasPublished: true,
  sortable: ['publishedAt', 'title', 'slug'],
  publicPath: '/blog',
  preview: { titleField: 'title', bodyField: 'content' },
  emptyHint: 'No posts yet. Create your first one.',
  defaults: {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    tags: [],
    published: false,
  },
  columns: [
    {
      key: 'title',
      label: 'Title',
      sortKey: 'title',
      className: 'adm-td-title',
      render: (row) => (
        <>
          {String(row.title ?? 'Untitled')}
          {Array.isArray(row.tags) && row.tags.length ? (
            <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {(row.tags as string[]).slice(0, 3).map((t) => (
                <span className="adm-badge" key={t}>
                  {t}
                </span>
              ))}
              {(row.tags as string[]).length > 3 ? (
                <span className="adm-badge">+{(row.tags as string[]).length - 3}</span>
              ) : null}
            </div>
          ) : null}
        </>
      ),
    },
    { key: 'status', label: 'Status', render: (row) => (row.published ? STATUS.live : STATUS.draft) },
    {
      key: 'publishedAt',
      label: 'Published',
      sortKey: 'publishedAt',
      hideOnMobile: true,
      render: (row) => {
        if (!row.publishedAt) return <span style={{ opacity: 0.5 }}>—</span>;
        const d = new Date(String(row.publishedAt));
        return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB');
      },
    },
    {
      key: 'readingTime',
      label: 'Read',
      hideOnMobile: true,
      className: 'adm-td-num',
      render: (row) => `${Number(row.readingTime ?? 1)} min`,
    },
    {
      key: 'slug',
      label: 'Slug',
      sortKey: 'slug',
      hideOnMobile: true,
      className: 'adm-td-mono',
      render: (row) => String(row.slug ?? ''),
    },
  ],
  fields: [
    { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'How I shipped…' },
    {
      name: 'slug',
      label: 'Slug',
      type: 'text',
      half: true,
      hint: 'Leave blank to generate from the title.',
    },
    {
      name: 'published',
      label: 'Published',
      type: 'checkbox',
      half: true,
      checkboxLabel: 'Visible on the public site',
    },
    {
      name: 'excerpt',
      label: 'Excerpt',
      type: 'textarea',
      rows: 2,
      required: true,
      hint: 'Shown in listings and used for the meta description.',
    },
    { name: 'content', label: 'Content', type: 'textarea', rows: 14, required: true },
    {
      name: 'coverImage',
      label: 'Cover image',
      type: 'image',
      recordType: 'BlogPost',
      hint: 'Optional. JPEG, PNG, WebP or SVG, up to 10 MB.',
    },
    { name: 'tags', label: 'Tags', type: 'tags', hint: 'Press Enter or comma after each tag.' },
  ],
};

export default function BlogAdminPage() {
  return <ResourceManager config={config} />;
}
