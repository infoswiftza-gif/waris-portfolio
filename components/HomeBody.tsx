'use client';

import dynamic from 'next/dynamic';

/**
 * Client half of the home page.
 *
 * The document is still injected as one HTML string (see `lib/markup.ts`) so the
 * ported Three.js city and the vanilla interaction script keep querying exactly
 * the DOM they were written against. This component only exists so the server
 * can render that string from MongoDB while the heavy `ssr: false` import of
 * `SiteInteractions` stays inside a client boundary.
 */

// The Three.js city loads as an async, client-only chunk after hydration —
// keeps the initial JS small and the main thread free for first paint (PageSpeed).
const SiteInteractions = dynamic(() => import('@/components/SiteInteractions'), {
  ssr: false,
});

export default function HomeBody({ html }: { html: string }) {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <SiteInteractions />
    </>
  );
}
