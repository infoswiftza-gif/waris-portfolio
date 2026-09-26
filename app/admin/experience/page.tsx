'use client';

import { ResourceManager, type ResourceConfig } from '../_components/ResourceManager';

/**
 * Experience timeline.
 *
 * These entries have no `published` flag — a timeline entry is public the
 * moment it exists — so `hasPublished` is false, which hides the status column
 * and the draft filter.
 */

const config: ResourceConfig = {
  resource: 'experience',
  title: 'Experience',
  singular: 'Entry',
  plural: 'entries',
  description: 'Roles and milestones, ordered by `order`. Everything here is public.',
  hasPublished: false,
  sortable: ['order', 'year', 'title'],
  publicPath: '/experience',
  emptyHint: 'No experience entries yet.',
  defaults: {
    year: new Date().getFullYear(),
    title: '',
    description: '',
    tags: [],
    order: 0,
  },
  columns: [
    {
      key: 'title',
      label: 'Role',
      sortKey: 'title',
      className: 'adm-td-title',
      render: (row) => (
        <>
          {String(row.title ?? 'Untitled')}
          {row.description ? (
            <div className="adm-td-mono" style={{ marginTop: 4 }}>
              {String(row.description).slice(0, 90)}
              {String(row.description).length > 90 ? '…' : ''}
            </div>
          ) : null}
        </>
      ),
    },
    {
      key: 'year',
      label: 'Year',
      sortKey: 'year',
      className: 'adm-td-num',
      render: (row) => String(row.year ?? '—'),
    },
    {
      key: 'order',
      label: 'Order',
      sortKey: 'order',
      className: 'adm-td-num',
      render: (row) => String(row.order ?? 0),
    },
    {
      key: 'tags',
      label: 'Tags',
      hideOnMobile: true,
      render: (row) => (
        <span style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {Array.isArray(row.tags) && row.tags.length ? (
            (row.tags as string[]).map((t) => (
              <span className="adm-badge" key={t}>
                {t}
              </span>
            ))
          ) : (
            '—'
          )}
        </span>
      ),
    },
  ],
  fields: [
    { name: 'title', label: 'Role', type: 'text', required: true, placeholder: 'Senior Engineer @ …' },
    { name: 'year', label: 'Year', type: 'number', half: true, required: true, hint: '1900–2100.' },
    { name: 'order', label: 'Order', type: 'number', half: true, hint: 'Lower numbers first.' },
    { name: 'description', label: 'Description', type: 'textarea', rows: 4, required: true },
    { name: 'tags', label: 'Tags', type: 'tags' },
  ],
};

export default function ExperienceAdminPage() {
  return <ResourceManager config={config} />;
}
