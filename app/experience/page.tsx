import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import SiteBehaviors from '@/components/SiteBehaviors';
import PageHead from '@/components/PageHead';

export const metadata: Metadata = {
  title: 'Experience — Waris Ali · Process & Timeline · WARIS.DEV',
  description:
    "Waris Ali's journey — a timeline of systems, projects, and problems solved, from first lines of code to full stack systems.",
};

export default function ExperiencePage() {
  return (
    <>
      <SiteNav />
      <SiteBehaviors />

      <main>
        {/* ============== TIMELINE ============== */}
        <section className="section" style={{ paddingTop: '22vh' }}>
          <div className="wrap">
            <PageHead
              index="06"
              label="EXPERIENCE"
              title={<>A timeline of systems, projects, and problems solved.</>}
              lede="Each phase built on the last — foundations, then products, then whole systems."
            />

            <div className="tl">
              <div className="tl-item" data-reveal>
                <span className="tl-dot" aria-hidden="true"></span>
                <p className="tl-year">2024</p>
                <h3 className="tl-role">WEB DEVELOPMENT</h3>
                <p className="tl-desc">Built responsive websites and front-end interfaces — turning design intent into clean, working code and learning the craft end to end.</p>
                <div className="chips">
                  <span className="chip">HTML</span>
                  <span className="chip">CSS</span>
                  <span className="chip">JavaScript</span>
                </div>
              </div>
              <div className="tl-item" data-reveal>
                <span className="tl-dot" aria-hidden="true"></span>
                <p className="tl-year">2025</p>
                <h3 className="tl-role">SEO + DIGITAL PRODUCTS</h3>
                <p className="tl-desc">Shipped content-driven platforms with structured data, search-friendly architecture, and CMS-powered publishing workflows.</p>
                <div className="chips">
                  <span className="chip">Next.js</span>
                  <span className="chip">Sanity</span>
                  <span className="chip">SEO</span>
                  <span className="chip">CMS</span>
                </div>
              </div>
              <div className="tl-item" data-reveal>
                <span className="tl-dot" aria-hidden="true"></span>
                <p className="tl-year">2026</p>
                <h3 className="tl-role">FULL STACK DEVELOPMENT</h3>
                <p className="tl-desc">Designing and building complete systems end to end — interfaces, APIs, databases, authentication, and deployment working as one product.</p>
                <div className="chips">
                  <span className="chip">TypeScript</span>
                  <span className="chip">Node.js</span>
                  <span className="chip">PostgreSQL</span>
                  <span className="chip">Prisma</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============== HOW I WORK ============== */}
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

        {/* ============== CTA ============== */}
        <section className="section" style={{ paddingTop: '10vh' }}>
          <div className="wrap">
            <div className="glass" style={{ padding: 'clamp(34px,5vw,56px)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <div style={{ maxWidth: 640, margin: '0 auto' }}>
                <p className="eyebrow" data-reveal style={{ justifyContent: 'center' }}>
                  <b>09</b> / NOW
                </p>
                <h2 data-reveal style={{ marginBottom: 14 }}>
                  Let&apos;s Write The Next Entry Together.
                </h2>
                <div className="hero-actions" data-reveal style={{ justifyContent: 'center', marginBottom: 0 }}>
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