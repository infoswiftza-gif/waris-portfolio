import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import SiteBehaviors from '@/components/SiteBehaviors';
import PageHead from '@/components/PageHead';
import { cmsDb } from '@/prisma/db';
import type { ExperienceRow } from '@/lib/cms/types';

export const metadata: Metadata = {
  title: 'Experience — Waris Ali · Process & Timeline · WARIS.DEV',
  description:
    "Waris Ali's journey — a timeline of systems, projects, and problems solved, from first lines of code to full stack systems.",
};

// Rendered per request so timeline edits made in the CMS show up immediately.
export const dynamic = 'force-dynamic';

export default async function ExperiencePage() {
  // Ordered `order` ascending so the timeline reads chronologically as the
  // editor arranged it.  The `Experience` model has no `published` field, so
  // every entry is public and the admin can toggle drafts only on projects
  // and blog posts.
  // A transient DB error degrades to an empty timeline instead of crashing
  // the whole page with a 500.
  let experience: ExperienceRow[] = [];
  try {
    const db = await cmsDb();
    experience = (await db.orm.experience
      .orderBy({ order: 1 })
      .limit(50)
      .all()) as ExperienceRow[];
  } catch (err) {
    console.error('[ExperiencePage] falling back to empty list after DB error:', err);
  }

  return (
    <>
      <SiteNav />
      <SiteBehaviors />

      <main>
        <section className="section" style={{ paddingTop: '22vh' }}>
          <div className="wrap">
            <PageHead
              index="06"
              label="EXPERIENCE"
              title={<>A timeline of systems, projects, and problems solved.</>}
              lede="Each phase built on the last — foundations, then products, then whole systems."
            />

            {experience.length === 0 ? (
              <div
                className="glass"
                style={{ marginTop: 24, textAlign: 'center', padding: '48px 24px' }}
                data-reveal
              >
                <p style={{ color: 'var(--muted)', marginBottom: 8 }}>
                  No published experience entries yet.
                </p>
                <p style={{ color: 'var(--muted-2)', fontSize: 14 }}>
                  Edit them in the CMS: <Link href="/admin/experience">/admin/experience</Link>
                </p>
              </div>
            ) : (
              <div className="tl">
                {experience.map((entry, index) => (
                  <div key={String(entry._id)} className="tl-item" data-reveal>
                    <span className="tl-dot" aria-hidden="true"></span>
                    <p className="tl-year">{entry.year ?? '—'}</p>
                    <h3 className="tl-role">{entry.title || 'Unknown role'}</h3>
                    <p className="tl-desc">{entry.description || ''}</p>
                    <div className="chips">
                      {(entry.tags ?? []).map((tag: string) => (
                        <span key={tag} className="chip">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* HOW I WORK */}
        <section className="section" id="how-i-work">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow" data-reveal>
                <b>08</b> / THE PROCESS
              </p>
              <h2 data-reveal>From Idea To Deployed Product.</h2>
            </div>
            <div className="proc">
              <div className="proc-rail" aria-hidden="true"></div>
              <div className="proc-step" data-reveal>
                <div className="proc-num">01</div>
                <h3>DISCOVER</h3>
                <p>Understand the problem, audience, goals, and technical requirements.</p>
              </div>
              <div className="proc-step" data-reveal>
                <div className="proc-num">02</div>
                <h3>DESIGN</h3>
                <p>Define the structure, interaction system, content hierarchy, and visual direction.</p>
              </div>
              <div className="proc-step" data-reveal>
                <div className="proc-num">03</div>
                <h3>BUILD</h3>
                <p>Develop the frontend, backend, APIs, database, CMS, and integrations.</p>
              </div>
              <div className="proc-step" data-reveal>
                <div className="proc-num">04</div>
                <h3>DEPLOY</h3>
                <p>Test, optimize, deploy, monitor, and continuously improve.</p>
              </div>
            </div>
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
                  <b>09</b> / NOW
                </p>
                <h2 data-reveal style={{ marginBottom: 14 }}>
                  Let&apos;s Write The Next Entry Together.
                </h2>
                <div
                  className="hero-actions"
                  data-reveal
                  style={{ justifyContent: 'center', marginBottom: 0 }}
                >
                  <Link className="btn btn-primary magnetic" href="/contact">
                    Start a Conversation <span className="arr">→</span>
                  </Link>
                  <Link className="btn btn-ghost magnetic" href="/projects">
                    View My Work
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
