import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import SiteBehaviors from '@/components/SiteBehaviors';
import PageHead from '@/components/PageHead';

export const metadata: Metadata = {
  title: 'About — Waris Ali · Full Stack Developer · WARIS.DEV',
  description:
    'Waris Ali — Full Stack Developer building fast, scalable, and visually refined digital experiences from interface to infrastructure.',
};

export default function AboutPage() {
  return (
    <>
      <SiteNav />
      <SiteBehaviors />

      <main>
        {/* ============== WHO I AM ============== */}
        <section className="section" style={{ paddingTop: '22vh' }}>
          <div className="wrap">
            <PageHead
              index="01"
              label="THE CORE"
              title={
                <>
                  More than a developer. I build the <span className="grad">system</span> behind the experience.
                </>
              }
              lede="Full Stack Developer shaping fast, scalable, and visually refined digital products from interface to infrastructure."
            />
            <p className="status" style={{ marginTop: 34 }} data-reveal>
              <span className="dot" aria-hidden="true"></span>AVAILABLE FOR SELECT PROJECTS
            </p>

            <div className="core-grid">
              <div className="core-card glass" data-reveal>
                <span className="tag">FRONTEND</span>
                <p>Interfaces that feel fast, intentional, and intuitive — built with clean component architecture and responsive interaction.</p>
              </div>
              <div className="core-card glass" data-reveal>
                <span className="tag">BACKEND</span>
                <p>Reliable APIs and application logic built to scale, with clean data flow and sensible separation of concerns.</p>
              </div>
              <div className="core-card glass" data-reveal>
                <span className="tag">SYSTEMS</span>
                <p>Databases, CMS, authentication, deployment, and integrations working together as one product.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============== BIO ============== */}
        <section className="section" id="who-i-am">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow" data-reveal>
                <b>02</b> / THE WHO
              </p>
              <h2 data-reveal>Designer&apos;s eye. Engineer&apos;s discipline.</h2>
              <p className="lede" data-reveal>
                I care about the details people notice — the pixel-perfect header, the instant page load, the API that never drops a request.
              </p>
            </div>

            <div className="glass" style={{ padding: 'clamp(28px,4vw,44px)', borderRadius: 'var(--radius-lg)', marginTop: 52 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 32 }}>
                <div style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: 1.75 }}>
                  <p style={{ marginBottom: 14 }}>
                    I&apos;m Waris Ali — a developer who treats the frontend and backend as one system. I&apos;ve shipped everything from
                    content-driven marketing platforms to full commerce builds, always keeping the end-user experience and the business goal
                    in the same frame.
                  </p>
                  <p>
                    My work sits at the intersection of design, engineering, and strategy: clean interfaces, typed data models, APIs that are
                    a joy to consume, and deployments that stay out of the way.
                  </p>
                </div>
                <div>
                  <p className="foot-h" style={{ marginBottom: 14 }}>
                    HOW I THINK
                  </p>
                  <div className="status-list">
                    <div className="status-row">
                      <span className="k">COMPLEXITY</span>
                      <span className="v">REDUCED</span>
                    </div>
                    <div className="status-row">
                      <span className="k">PERFORMANCE</span>
                      <span className="v">DEFAULT</span>
                    </div>
                    <div className="status-row">
                      <span className="k">DETAIL</span>
                      <span className="v">OBSESSED</span>
                    </div>
                    <div className="status-row">
                      <span className="k">MOTION</span>
                      <span className="v">PURPOSEFUL</span>
                    </div>
                  </div>
                  <div className="chips" style={{ marginTop: 24 }}>
                    <span className="chip">React</span>
                    <span className="chip">Next.js</span>
                    <span className="chip">TypeScript</span>
                    <span className="chip">Node.js</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============== CAPABILITIES ============== */}
        <section className="section" id="capabilities">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow" data-reveal>
                <b>03</b> / CAPABILITIES
              </p>
              <h2 data-reveal>What I bring to a project.</h2>
            </div>

            <div className="fe-grid" style={{ marginTop: 0 }}>
              <div>
                <p className="eyebrow" data-reveal style={{ marginBottom: 16 }}>
                  <b>A</b> / FRONTEND
                </p>
                <p className="lede" data-reveal style={{ marginBottom: 28 }}>
                  Component-driven interfaces with a strong visual system — from landing pages to complex web applications.
                </p>
                <div className="chips" data-reveal>
                  <span className="chip">React</span>
                  <span className="chip">Next.js</span>
                  <span className="chip">TypeScript</span>
                  <span className="chip">CSS</span>
                  <span className="chip">Tailwind</span>
                  <span className="chip">Framer Motion</span>
                </div>
              </div>
              <div className="holo glass" data-reveal aria-label="Frontend checklist">
                <div className="holo-scan" aria-hidden="true"></div>
                <div className="holo-head">
                  <span>FRONTEND SYSTEM</span>
                  <span className="live">● LIVE</span>
                </div>
                <div className="holo-row">
                  <span>Component Architecture</span>
                  <span className="ok">✓</span>
                </div>
                <div className="holo-row">
                  <span>Responsive UI</span>
                  <span className="ok">✓</span>
                </div>
                <div className="holo-row">
                  <span>Animations</span>
                  <span className="ok">✓</span>
                </div>
                <div className="holo-row">
                  <span>Accessibility</span>
                  <span className="ok">✓</span>
                </div>
                <div className="holo-row">
                  <span>Performance</span>
                  <span className="ok">✓</span>
                </div>
              </div>
            </div>

            <div className="be-grid" style={{ marginTop: 80 }}>
              <div>
                <p className="eyebrow" data-reveal style={{ marginBottom: 16 }}>
                  <b>B</b> / BACKEND
                </p>
                <p className="lede" data-reveal style={{ marginBottom: 28 }}>
                  APIs and logic engineered to be testable, observable, and scalable from day one.
                </p>
                <div className="chips" data-reveal>
                  <span className="chip">Node.js</span>
                  <span className="chip">Express</span>
                  <span className="chip">REST APIs</span>
                  <span className="chip">Authentication</span>
                  <span className="chip">Webhooks</span>
                </div>
              </div>
              <div className="arch" data-reveal role="img" aria-label="Architecture flow: client, application, API, business logic, database, cloud" style={{ maxWidth: 'none' }}>
                <div className="arch-step">
                  CLIENT <i>UI / SSR</i>
                </div>
                <div className="arch-link" aria-hidden="true"></div>
                <div className="arch-step">
                  APPLICATION <i>NEXT.JS</i>
                </div>
                <div className="arch-link" aria-hidden="true"></div>
                <div className="arch-step">
                  API <i>REST</i>
                </div>
                <div className="arch-link" aria-hidden="true"></div>
                <div className="arch-step">
                  BUSINESS LOGIC <i>NODE.JS</i>
                </div>
                <div className="arch-link" aria-hidden="true"></div>
                <div className="arch-step">
                  DATABASE <i>SQL / ORM</i>
                </div>
                <div className="arch-link" aria-hidden="true"></div>
                <div className="arch-step">
                  CLOUD <i>DEPLOY</i>
                </div>
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
                  <b>04</b> / NEXT MOVE
                </p>
                <h2 data-reveal style={{ marginBottom: 14 }}>
                  Let&apos;s build something worth shipping.
                </h2>
                <p className="lede" data-reveal style={{ margin: '0 auto 34px' }}>
                  Have a product, platform, or problem that needs a developer who sees the whole system?
                </p>
                <div className="hero-actions" data-reveal style={{ justifyContent: 'center', marginBottom: 0 }}>
                  <Link className="btn btn-primary magnetic" href="/projects">
                    View My Work <span className="arr">→</span>
                  </Link>
                  <Link className="btn btn-ghost magnetic" href="/contact">
                    Start a Conversation
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