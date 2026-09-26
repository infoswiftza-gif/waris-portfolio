import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import SiteBehaviors from '@/components/SiteBehaviors';
import { cmsDb } from '@/prisma/db';
import { cloudinaryTransform } from '@/lib/cloudinary';
import { caseStudyHref, caseStudyPath } from '@/lib/project-links';
import type { ProjectRow } from '@/lib/cms/types';

/**
 * Auto-generated case study page.
 *
 * Every published project gets a case study at `/projects/<slug>` from its CMS
 * record, so publishing a project is enough to make its "Case Study" button work
 * — the editor never has to create a route or type a URL. The hand-written
 * pages in `app/projects/<name>/page.tsx` are static routes and therefore still
 * take precedence for those specific slugs; this one is the fallback that makes
 * the link valid for everything else.
 *
 * Only published projects resolve here, so an unpublished project is a 404 on
 * the public site even though the record exists in the CMS.
 */
export const dynamicParams = true;

/** On-demand renders are cached, so a cold database costs one request, not one per visit. */
export const revalidate = 300;

/**
 * A transient DB error is treated as "not found" rather than propagating into a
 * hard 500 — a 404 for a case study that briefly can't be fetched is a much
 * softer failure for a visitor than a crashed page, and the error is still
 * logged server-side for diagnosis.
 */
async function findPublishedProject(slug: string): Promise<ProjectRow | null> {
  try {
    const db = await cmsDb();
    return ((await db.orm.projects
      .where({ slug, published: true })
      .first()) ?? null) as ProjectRow | null;
  } catch (err) {
    console.error(`[CaseStudyPage] findPublishedProject(${slug}) failed:`, err);
    return null;
  }
}

/**
 * Prerendering is a build-time optimisation, never a correctness requirement:
 * `dynamicParams = true` means any slug renders on demand (and is then cached
 * by `revalidate`). A database that is briefly unreachable from the build
 * machine must not fail the deploy, so this degrades to fully dynamic rendering.
 */
export async function generateStaticParams() {
  try {
    const db = await cmsDb();
    const projects = (await db.orm.projects
      .where({ published: true })
      .limit(999)
      .all()) as ProjectRow[];
    return projects.map((project) => ({ slug: String(project.slug ?? '') }));
  } catch (err) {
    console.warn(
      '[projects] generateStaticParams: database unavailable, prerendering skipped —',
      err instanceof Error ? err.message : err
    );
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await findPublishedProject(slug);
  if (!project) return {};

  const title = project.title || slug;
  const description = project.description || `Case study: ${title}.`;
  return {
    title: `${title} — Case Study · WARIS.DEV`,
    description,
    keywords: project.tags ?? undefined,
    openGraph: {
      title: `${title} — Case Study`,
      description,
      images: project.imageUrl ? [cloudinaryTransform(project.imageUrl, { width: 1200, height: 630 })] : undefined,
    },
  };
}

const text = (value: string | null | undefined) => (value ?? '').trim();
const external = (value: string) => /^https?:\/\//i.test(value);

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await findPublishedProject(slug);
  if (!project || !text(project.slug)) notFound();

  const title = text(project.title) || slug;
  const category = text(project.category);
  const description = text(project.description);
  const tags = (project.tags ?? []).map((tag) => String(tag)).filter(Boolean);
  const liveUrl = text(project.liveUrl);
  const sourceUrl = text(project.sourceUrl);
  const image = text(project.imageUrl);

  // An explicit external case study link wins; otherwise this page *is* the case
  // study and "back to projects" is the only sensible way out.
  const backHref = caseStudyHref(project);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: title,
    description,
    url: `https://waris.dev${caseStudyPath(slug)}`,
    ...(image ? { image } : {}),
    ...(tags.length ? { keywords: tags.join(', ') } : {}),
  };

  return (
    <>
      <SiteNav />
      <SiteBehaviors />
      <main>
        <div className="wrap section" style={{ paddingTop: '22vh' }}>
          <Link
            className="btn btn-ghost btn-sm"
            href={backHref || '/projects'}
            style={{ marginBottom: 48 }}
          >
            ← Back to Projects
          </Link>

          <div className="section-head" data-reveal>
            {category && (
              <span className="eyebrow">
                {category.toUpperCase()}
                <b>·</b>
              </span>
            )}
            <h1 style={{ fontSize: 'clamp(36px,5vw,64px)', margin: '10px 0 18px' }}>{title}</h1>
            {description && <p className="lede">{description}</p>}
          </div>

          {image && (
            <div
              className="glass"
              data-reveal
              style={{
                margin: '32px 0 8px',
                padding: 10,
                borderRadius: '18px',
                overflow: 'hidden',
              }}
            >
              <Image
                src={cloudinaryTransform(image, { width: 1600, height: 900 })}
                alt={`${title} case study`}
                width={1600}
                height={900}
                sizes="(max-width: 900px) 100vw, 1200px"
                style={{ width: '100%', height: 'auto', borderRadius: '12px', display: 'block' }}
                priority
              />
            </div>
          )}

          {tags.length > 0 && (
            <div className="chips p-tech" style={{ margin: '28px 0 48px' }} data-reveal>
              {tags.map((tag) => (
                <span key={tag} className="chip">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {description && (
            <div
              className="glass"
              style={{ padding: '36px', borderRadius: '18px', marginBottom: '24px' }}
              data-reveal
            >
              <h2 style={{ fontSize: '22px', marginBottom: '12px' }}>Overview</h2>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{description}</p>
            </div>
          )}

          {(liveUrl || sourceUrl) && (
            <div style={{ marginTop: '48px' }} data-reveal>
              <div className="hero-actions" style={{ marginBottom: 0 }}>
                {liveUrl && (
                  <a
                    className="btn btn-primary"
                    href={liveUrl}
                    target={external(liveUrl) ? '_blank' : undefined}
                    rel="noopener"
                  >
                    Visit Live Site <span className="arr">→</span>
                  </a>
                )}
                {sourceUrl && (
                  <a
                    className="btn btn-ghost"
                    href={sourceUrl}
                    target={external(sourceUrl) ? '_blank' : undefined}
                    rel="noopener"
                  >
                    View Source <span className="arr">→</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Script
        id="case-study-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SiteFooter />
    </>
  );
}
