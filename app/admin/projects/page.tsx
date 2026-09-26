'use client';

import { PREVIEW_VARIANTS } from '@/lib/cms/preview';
import { ResourceManager, type ResourceConfig } from '../_components/ResourceManager';

/**
 * Projects.
 *
 * Note the image field: the old page rendered `<FileUpload>` with no `value`
 * and no `onChange`, so picking a file uploaded it to Blob and then threw the
 * URL away — `imageUrl` could never be set from this screen. The generic form
 * wires the control properly.
 */

const config: ResourceConfig = {
  resource: 'projects',
  title: 'Projects',
  singular: 'Project',
  plural: 'projects',
  description:
    'Case studies and shipped work. `order` controls the sequence on the public page; the lowest number comes first.',
  hasPublished: true,
  sortable: ['order', 'title', 'slug'],
  publicPath: '/projects',
  emptyHint: 'No projects yet. Create your first one.',
  defaults: {
    title: '',
    slug: '',
    category: '',
    visual: 'default',
    description: '',
    liveUrl: '',
    caseStudyUrl: '',
    sourceUrl: '',
    tags: [],
    imageUrl: '',
    order: 0,
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
          {row.category ? (
            <div style={{ marginTop: 4 }}>
              <span className="adm-badge">{String(row.category)}</span>
            </div>
          ) : null}
        </>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) =>
        row.published ? (
          <span className="adm-badge adm-badge-live">
            <span className="adm-dot" />
            Live
          </span>
        ) : (
          <span className="adm-badge adm-badge-draft">
            <span className="adm-dot" />
            Draft
          </span>
        ),
    },
    {
      key: 'order',
      label: 'Order',
      sortKey: 'order',
      className: 'adm-td-num',
      render: (row) => String(row.order ?? 0),
    },
    {
      key: 'links',
      label: 'Links',
      hideOnMobile: true,
      render: (row) => (
        <span className="adm-td-mono">
          {row.liveUrl ? 'live' : '—'} · {row.sourceUrl ? 'src' : '—'}
        </span>
      ),
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
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'text', required: true, half: true, hint: 'Used in the URL.' },
    {
      name: 'order',
      label: 'Order',
      type: 'number',
      half: true,
      hint: 'Lower numbers appear first.',
    },
    {
      name: 'published',
      label: 'Published',
      type: 'checkbox',
      half: true,
      checkboxLabel: 'Visible on the public site',
    },
    {
      name: 'visual',
      label: 'Card style',
      type: 'select',
      half: true,
      options: PREVIEW_VARIANTS.map((v) => ({ value: v, label: v })),
      hint: 'Decorative browser-chrome variant.',
    },
    { name: 'category', label: 'Category', type: 'text', placeholder: 'Web app, CLI, …' },
    { name: 'description', label: 'Description', type: 'textarea', rows: 3, required: true },
    { name: 'imageUrl', label: 'Image', type: 'image', recordType: 'Project' },
    { name: 'liveUrl', label: 'Live URL', type: 'text', type_: 'url', inputMode: 'url', half: true },
    {
      name: 'caseStudyUrl',
      label: 'External case study',
      type: 'text',
      type_: 'url',
      inputMode: 'url',
      half: true,
      hint: 'Optional. Leave blank and the case study is generated at /projects/<slug>.',
    },
    { name: 'sourceUrl', label: 'Source URL', type: 'text', type_: 'url', inputMode: 'url' },
    { name: 'tags', label: 'Tags', type: 'tags' },
  ],
};

export default function ProjectsAdminPage() {
  return <ResourceManager config={config} />;
}
