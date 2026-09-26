import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import SiteBehaviors from '@/components/SiteBehaviors';
import PageHead from '@/components/PageHead';
import { cmsDb } from '@/prisma/db';
import { cloudinaryTransform } from '@/lib/cloudinary';
import { caseStudyHref } from '@/lib/project-links';
import type { ProjectRow } from '@/lib/cms/types';

export const metadata: Metadata = {
  title: 'Projects — Waris Ali · Project District · WARIS.DEV',
  description:
    'Selected projects by Waris Ali — Swiftza, Zirconia Express, and Zhongfa EV. Where design, engineering, and business requirements meet.',
};

// Rendered per request so project edits made in the CMS show up immediately.
export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  // Fetch from MongoDB (Prisma 8 query builder) and filter `published: true`.
  // Ordered by `order` ascending so editors control the on-page sequence.
  // A transient DB error degrades to the existing "no projects yet" empty
  // state below, instead of crashing the whole page with a 500.
  let projects: ProjectRow[] = [];
  try {
    const db = await cmsDb();
    projects = (await db.orm.projects
      .where({ published: true })
      .orderBy({ order: 1 })
      .limit(99)
      .all()) as ProjectRow[];
  } catch (err) {
    console.error('[ProjectsPage] falling back to empty list after DB error:', err);
  }

  return (
    <>
      <SiteNav />
      <SiteBehaviors />

      <main>
        <section className="section" style={{ paddingTop: '22vh' }}>
          <div className="wrap">
            <PageHead
              index="05"
              label="PROJECT DISTRICT"
              title={<>Things I&apos;ve actually built.</>}
              lede="Selected projects where design, engineering, and business requirements meet."
            />

            <div className="chips" style={{ marginTop: 40 }} data-reveal>
              <span className="chip">E-commerce</span>
              <span className="chip">SEO</span>
              <span className="chip">CMS</span>
              <span className="chip">Web Apps</span>
              <span className="chip">Content Platforms</span>
            </div>

            {projects.length === 0 ? (
              <div
                className="glass"
                style={{ marginTop: 24, textAlign: 'center', padding: '48px 24px' }}
                data-reveal
              >
                <p style={{ color: 'var(--muted)', marginBottom: 8 }}>
                  No published projects yet.
                </p>
                <p style={{ color: 'var(--muted-2)', fontSize: 14 }}>
                  Add one in the admin CMS: <Link href="/admin/projects">/admin/projects</Link>
                </p>
              </div>
            ) : (
              projects.map((project, index) => (
                <article
                  key={String(project._id)}
                  className="project glass"
                  data-reveal
                  data-project
                  style={{ marginTop: index === 0 ? 0 : 46 }}
                >
                  <span className="p-index" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <div
                    className="p-visual"
                    style={{ background: 'var(--bg-2)', borderColor: 'var(--line)' }}
                  >
                    {/* A real uploaded screenshot wins over the decorative
                    mockup. `visual` only picks which mockup to draw when there
                    is no image, exactly like the home page does. */}
                    {project.imageUrl ? (
                      <Image
                        src={cloudinaryTransform(project.imageUrl, { width: 1200, height: 750 })}
                        alt={`${project.title || 'Project'} screenshot`}
                        width={1200}
                        height={750}
                        sizes="(max-width: 900px) 100vw, 560px"
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                    ) : (
                      <>
                    {/* Visual is decorative - the on-image intent is carried by
                    the imageUrl / liveUrl fields. Render an inline SVG so the
                    page never 404s on a missing file. The `visual` field picks
                    which mockup to draw, exactly like the home page does. */}
                    <div
                      className={`pv pv-${project.visual || 'default'}`}
                      role="img"
                      aria-label={`${project.title ?? 'Project'} preview`}
                    >
                      <div className="pv-chrome">
                        <i />
                        <i />
                        <i />
                        <span className="url">{project.liveUrl || '/'}</span>
                        <div className="pv-badges">
                          <span className="b-live">LIVE</span>
                          <span>CASE STUDY</span>
                          <span>SOURCE</span>
                        </div>
                      </div>
                      <div className="pv-body">
                        <div className="pv-hero">
                          <span className="wm">{project.title || 'PROJECT'}</span>
                          <span className="sk tl" />
                        </div>
                        <div className="pv-watch">
                          <div className="pv-card">
                            <span className="face" />
                            <span className="lines">
                              <span className="sk" />
                              <span className="sk dim" />
                            </span>
                            <span className="price" />
                          </div>
                          <div className="pv-card">
                            <span className="face" />
                            <span className="lines">
                              <span className="sk" />
                              <span className="sk dim" />
                            </span>
                            <span className="price" />
                          </div>
                        </div>
                      </div>
                    </div>
                      </>
                    )}
                  </div>

                  <div className="p-info">
                    <span className="cat">
                      {project.category || (project.description || '').slice(0, 60) || 'PROJECT'}
                    </span>
                    <h3 style={{ fontFamily: 'var(--display)' }}>{project.title || 'Untitled'}</h3>
                    <p className="lede" style={{ maxWidth: 440 }}>
                      {project.description || 'No description yet.'}
                    </p>
                    <div className="p-actions">
                      {project.liveUrl && (
                        <a
                          className="btn btn-primary btn-sm magnetic"
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener"
                          aria-label={`View ${project.title} project`}
                        >
                          View Project <span className="arr">→</span>
                        </a>
                      )}
                      <Link
                        className="btn btn-ghost btn-sm magnetic"
                        href={caseStudyHref({ slug: project.slug, caseStudyUrl: project.caseStudyUrl })}
                        aria-label={`Open ${project.title} case study`}
                      >
                        Case Study <span className="arr">↗</span>
                      </Link>
                    </div>
                    <div className="chips p-tech">
                      {project.tags?.map((tag: string) => (
                        <span key={tag} className="chip">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="section" style={{ paddingTop: '10vh' }}>
          <div className="wrap">
            <div
              className="glass"
              style={{ padding: 'clamp(34px,5vw,56px)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}
            >
              <div style={{ maxWidth: 640, margin: '0 auto' }}>
                <p
                  className="eyebrow"
                  data-reveal
                  style={{ justifyContent: 'center' }}
                >
                  <b>06</b> / NEXT PROJECT
                </p>
                <h2 data-reveal style={{ marginBottom: 14 }}>
                  Your Project Could Be Next.
                </h2>
                <p className="lede" data-reveal style={{ margin: '0 auto 34px' }}>
                  From concept to deployed product — let&apos;s define what we&apos;re building.
                </p>
                <div
                  className="hero-actions"
                  data-reveal
                  style={{ justifyContent: 'center', marginBottom: 0 }}
                >
                  <Link className="btn btn-primary magnetic" href="/contact">
                    Start a Conversation <span className="arr">→</span>
                  </Link>
                  <Link className="btn btn-ghost magnetic" href="/experience">
                    View Experience
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
