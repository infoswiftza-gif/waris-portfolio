import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import SiteBehaviors from '@/components/SiteBehaviors';
import PageHead from '@/components/PageHead';
import { cmsDb } from '@/prisma/db';
import type { StackItemRow } from '@/lib/cms/types';

export const metadata: Metadata = {
  title: 'Stack — Waris Ali · Technology Map · WARIS.DEV',
  description:
    'The technology stack Waris Ali works with — frontend, backend, database, CMS, deployment, and the systems that connect them.',
};

// Rendered per request so stack edits made in the CMS show up immediately.
export const dynamic = 'force-dynamic';

/**
 * Collapse the flat `stack_items` list into one panel per category.
 *
 * The constellation grid is a 3-column board of categories (`.const-grid`), and
 * the hover graph in `components/SiteInteractions.tsx` resolves connections by
 * querying `[data-tech]` inside `[data-group]` — so the category belongs on the
 * panel and each technology is its own `.tnode`. Order is the editor's global
 * `order`; panels fall back to the canonical category order.
 */
const CATEGORY_ORDER = ['FRONTEND', 'BACKEND', 'DATABASE', 'CMS', 'DEPLOYMENT', 'OTHER'];

function groupByCategory(items: StackItemRow[]) {
  const groups = new Map<string, string[]>();

  for (const item of items) {
    const category = (item.category ?? 'OTHER').toUpperCase();
    const name = (item.name ?? '').trim();
    if (!name) continue;
    groups.set(category, [...(groups.get(category) ?? []), name]);
  }

  return [...groups.entries()]
    .map(([category, names]) => ({ category, names }))
    .sort((a, b) => {
      const rank = (key: string) => {
        const index = CATEGORY_ORDER.indexOf(key);
        return index === -1 ? CATEGORY_ORDER.length : index;
      };
      return rank(a.category) - rank(b.category);
    });
}

export default async function StackPage() {
  // A transient DB error degrades to an empty stack list instead of crashing
  // the whole page with a 500.
  let items: StackItemRow[] = [];
  try {
    const db = await cmsDb();
    items = (await db.orm.stack_items.orderBy({ order: 1 }).limit(99).all()) as StackItemRow[];
  } catch (err) {
    console.error('[StackPage] falling back to empty list after DB error:', err);
  }
  const panels = groupByCategory(items);

  return (
    <>
      <SiteNav />
      <SiteBehaviors />

      <main>
        <section className="section" style={{ paddingTop: '22vh' }}>
          <div className="wrap">
            <PageHead
              index="07"
              label="THE STACK"
              title={<>The tools behind the city.</>}
              lede="Hover a technology to see how the systems connect. Same stack, one coherent system."
            />

            <div className="const-grid" id="constGrid">
              {panels.map((panel) => (
                <div
                  key={panel.category}
                  className="const-panel glass"
                  data-group={panel.category}
                  data-reveal
                >
                  <h3>{panel.category}</h3>
                  <svg className="const-lines" aria-hidden="true"></svg>
                  <div className="tnodes">
                    {panel.names.map((name) => (
                      <button
                        key={name}
                        type="button"
                        className="tnode"
                        data-tech={name}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
