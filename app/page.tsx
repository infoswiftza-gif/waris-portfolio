'use client';
import { BODY_HTML } from "@/lib/markup";
import dynamic from "next/dynamic";

// The Three.js city loads as an async, client-only chunk after hydration —
// keeps the initial JS small and the main thread free for first paint (PageSpeed).
const SiteInteractions = dynamic(() => import("@/components/SiteInteractions"), {
  ssr: false,
});

// Home page: markup is injected verbatim from the original build (see lib/markup.ts),
// and SiteInteractions mounts the ported Three.js city + all UI interactions on top of it.
export default function Home() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: BODY_HTML }} />
      <SiteInteractions />
    </>
  );
}
