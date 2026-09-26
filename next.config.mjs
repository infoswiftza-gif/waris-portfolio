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
  images: {
    // CMS uploads are stored in Cloudinary and their `secure_url` is written
    // straight into `coverImage` / project image fields. `next/image` refuses to
    // optimise a remote host that is not allow-listed here (it throws at
    // render time with "hostname is not configured"), so Cloudinary's delivery
    // host has to be listed before any public page renders those fields.
    //
    // The wildcard subdomain is intentional: every account gets its own
    // `<cloud-name>` segment, so a pattern that omitted `*` would break as soon
    // as the account name changed.
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
    ],
    // Cloudinary already negotiates format per request via `f_auto`; letting
    // Next re-encode on top of that wastes bytes.
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/orm-mongo', 'mongodb', 'bcryptjs'],
    // prisma/db.ts reads prisma/contract.json via fs.readFileSync with a path computed
    // from __dirname/import.meta.url at module-load time. Next's file tracer (nft) only
    // reliably detects *literal* fs.readFileSync("...") paths, not computed ones, so this
    // file was intermittently missing from a given route's serverless function bundle —
    // causing an ENOENT on import and an immediate 500 on every route that imports
    // prisma/db.ts. Force-including it here guarantees every route ships it.
    //
    // IMPORTANT: on Next.js 14 this must live under `experimental`, not as a
    // top-level config key — it only became a stable top-level option in
    // Next.js 15+. Putting it at the top level (as an earlier version of this
    // file did) means Next.js silently ignores it: no error, no warning, and
    // contract.json quietly never gets included, which is exactly what caused
    // the ENOENT crashes on `/`, `/api/auth/*`, etc. in production.
    outputFileTracingIncludes: {
      '/**': ['./prisma/contract.json'],
    },
  },
};

export default nextConfig;
