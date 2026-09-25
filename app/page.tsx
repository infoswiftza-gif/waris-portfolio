import HomeBody from '@/components/HomeBody';
import { buildBodyHtml } from '@/lib/markup';
import { loadHomeContent } from '@/lib/cms/home';

// The project district, timeline and technology constellation are read from
// MongoDB on every request so the admin CMS is reflected here immediately.
export const dynamic = 'force-dynamic';

/**
 * Home page.
 *
 * The 05 · PROJECT DISTRICT, 06 · EXPERIENCE and 07 · THE STACK sections are
 * rendered from the `projects`, `experience` and `stack_items` collections via
 * `loadHomeContent()`; the rest of the document is the original hand-written
 * markup from `lib/markup.ts`. `HomeBody` injects the result and mounts the
 * ported Three.js city on top of it.
 */
export default async function Home() {
  const home = await loadHomeContent();

  return <HomeBody html={buildBodyHtml(home)} />;
}
