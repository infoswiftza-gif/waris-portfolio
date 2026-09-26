/**
 * Where a project's "Case Study" button points.
 *
 * Every project gets a case study page at `/projects/<slug>`, which
 * `app/projects/[slug]/page.tsx` renders straight from the CMS record. The
 * `caseStudyUrl` field is therefore *not* something the editor has to fill in
 * for the common case — it exists only to point a project at a case study
 * hosted somewhere else.
 *
 * Deriving the link here (rather than at each call site) keeps the home page,
 * the projects index and the admin preview all agreeing on one href.
 */

export type CaseStudySource = {
  slug?: string | null;
  caseStudyUrl?: string | null;
};

const clean = (value: string | null | undefined) => (value ?? '').trim();

/** The canonical in-site case study path for a project slug. */
export const caseStudyPath = (slug: string | null | undefined) => {
  const s = clean(slug);
  return s ? `/projects/${s}` : '';
};

/**
 * Resolves the case study href.
 *
 * - No `caseStudyUrl` → the auto-generated `/projects/<slug>`.
 * - An absolute URL that points at *this site's own* `/projects/<slug>` → the
 *   relative path. Records saved with a hard-coded production origin (an old
 *   absolute link typed by hand) would otherwise keep pointing at whatever host
 *   was pasted, which breaks the link on every other environment and forces a
 *   data migration for something the slug already determines.
 * - Anything else → used as-is, since it is a genuinely external case study.
 */
export const caseStudyHref = (project: CaseStudySource): string => {
  const stored = clean(project.caseStudyUrl);
  const own = caseStudyPath(project.slug);
  if (!stored) return own;

  if (/^https?:\/\//i.test(stored)) {
    try {
      const parsed = new URL(stored);
      const sameTarget = own && parsed.pathname.replace(/\/+$/, '') === own;
      // Any host is accepted here: the stored link is only collapsed to a
      // relative path when its *path* is this project's case study, so a
      // production-origin link still works on localhost and on preview deploys.
      if (sameTarget) return own;
    } catch {
      return stored;
    }
    return stored;
  }

  // A relative stored path wins only when it is not the auto-generated one, so
  // an editor can still redirect a case study elsewhere on the site.
  return stored.replace(/\/+$/, '') || own;
};
