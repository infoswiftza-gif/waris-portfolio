'use client';

import { STACK_CATEGORIES } from '@/lib/cms/registry';
import { ResourceManager, type ResourceConfig } from '../_components/ResourceManager';

/**
 * Stack / tools list.
 *
 * Smallest of the four screens: a name, a category and an order. It shares the
 * exact same `ResourceManager` as blog, which is the point — the differences
 * between these pages are now data, not code.
 */

const config: ResourceConfig = {
  resource: 'stack',
  title: 'Stack',
  singular: 'Item',
  plural: 'items',
  description: 'Tools and technologies, grouped by category. Everything here is public.',
  hasPublished: false,
  sortable: ['order', 'name', 'category'],
  publicPath: '/stack',
  emptyHint: 'No stack items yet.',
  defaults: {
    name: '',
    category: 'FRONTEND',
    order: 0,
  },
  columns: [
    {
      key: 'name',
      label: 'Name',
      sortKey: 'name',
      className: 'adm-td-title',
      render: (row) => String(row.name ?? ''),
    },
    {
      key: 'category',
      label: 'Category',
      sortKey: 'category',
      render: (row) => <span className="adm-badge">{String(row.category ?? '')}</span>,
    },
    {
      key: 'order',
      label: 'Order',
      sortKey: 'order',
      className: 'adm-td-num',
      render: (row) => String(row.order ?? 0),
    },
  ],
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Next.js' },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      half: true,
      required: true,
      options: STACK_CATEGORIES,
    },
    { name: 'order', label: 'Order', type: 'number', half: true, hint: 'Lower numbers first.' },
  ],
};

export default function StackAdminPage() {
  return <ResourceManager config={config} />;
}
