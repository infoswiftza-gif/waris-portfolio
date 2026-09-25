/**
 * Decorative project-card preview variants.
 *
 * These map to the `.pv-*` rules in `app/globals.css`, which the home page
 * (`lib/markup.ts`) and `app/projects/page.tsx` both use to draw a fake browser
 * window for a project.
 *
 * Kept in its own module (no server imports) so the admin form — a client
 * component — can import the list without pulling the Prisma runtime into the
 * browser bundle. `lib/cms/home.ts` re-exports it for server callers.
 */
export const PREVIEW_VARIANTS = ['swiftza', 'zirconia', 'ev', 'default'] as const;

export type PreviewVariant = (typeof PREVIEW_VARIANTS)[number];
