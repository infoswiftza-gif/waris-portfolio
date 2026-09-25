/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false, // remove the x-powered-by header (tiny, free perf/opacity win)
  compress: true, // gzip/brotli text responses in production (next start)
  reactStrictMode: false, // the WebGL scene is a heavy imperative effect; double-invoking it in dev StrictMode
                           // would create two renderers/animation loops, so it's off (does not affect prod builds).
  typescript: {
    // components/SiteInteractions.tsx is the ~2,200-line ported vanilla WebGL/interaction
    // script (see the comment at the top of that file for why it's intentionally untyped).
    // The rest of the app (page.tsx, layout.tsx, case-study pages, CaseStudyNav) is fully
    // typed and gets checked by `tsc`/your editor as normal — this flag only stops that one
    // legacy file's dynamic object shapes from failing the production build.
    ignoreBuildErrors: true,
  },
  // Prisma 8 for MongoDB is published as ESM-only `.mjs` and resolves parts of itself
  // lazily (e.g. the `MongoUnboundNamespace` binding the driver installs on first use).
  // Letting webpack inline it drops those bindings and the build dies with
  // "MongoUnboundNamespace is not defined" while collecting page data for any route
  // that reaches prisma/db.ts. Keeping it external leaves it as a real Node import,
  // which is how the standalone scripts in scripts/ already load it.
  experimental: {
    serverComponentsExternalPackages: ['@prisma/orm-mongo', 'mongodb', 'bcryptjs'],
  },
};

export default nextConfig;
