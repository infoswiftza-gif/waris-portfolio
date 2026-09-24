import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import SiteBehaviors from '@/components/SiteBehaviors';
import PageHead from '@/components/PageHead';

export const metadata: Metadata = {
  title: 'Contact — Waris Ali · Contact Terminal · WARIS.DEV',
  description:
    'Get in touch with Waris Ali — available for select projects, remote-friendly, and open to building something worth shipping.',
};

export default function ContactPage() {
  return (
    <>
      <SiteNav />
      <SiteBehaviors />

      <main>
        {/* ============== CONTACT TERMINAL ============== */}
        <section className="section" style={{ paddingTop: '22vh' }}>
          <div className="wrap">
            <PageHead
              index="09"
              label="CONTACT TERMINAL"
              title={<>Have something worth building?</>}
              lede="Let's turn the idea into a real digital product."
            />

            <div className="contact-grid" style={{ marginTop: 40 }}>
              <div>
                <p className="status" data-reveal>
                  <span className="dot" aria-hidden="true"></span>AVAILABLE FOR SELECT PROJECTS
                </p>
                <div className="hero-actions" style={{ marginTop: 34 }} data-reveal>
                  <a className="btn btn-primary magnetic" href="mailto:hello@waris.dev">
                    Start a Conversation <span className="arr">→</span>
                  </a>
                  <a className="btn btn-ghost magnetic" href="https://github.com/" target="_blank" rel="noopener">
                    View GitHub <span className="arr">↗</span>
                  </a>
                </div>
                <ul className="c-status" data-reveal>
                  <li>AVAILABLE</li>
                  <li>REMOTE FRIENDLY</li>
                  <li>OPEN TO SELECT PROJECTS</li>
                </ul>
              </div>
              <div className="term glass" data-reveal>
                <div className="term-bar">
                  <i></i>
                  <i></i>
                  <i></i>
                  <span className="t">WARIS.DEV — TERMINAL</span>
                </div>
                <div className="term-body" id="termBody" aria-live="polite">
                  <div className="ln p" data-term>{'>'} initialize_project()<span className="caret"></span></div>
                  <div className="ln" data-term>&gt; loading modules … frontend ✓ &nbsp;backend ✓ &nbsp;database ✓</div>
                  <div className="ln ok" data-term>PROJECT_STATUS: READY</div>
                  <div className="ln ok" data-term>What are we building next?</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============== CONNECT ============== */}
        <section className="section" id="connect">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow" data-reveal>
                <b>02</b> / CONNECT
              </p>
              <h2 data-reveal>The Direct Lines.</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18, marginTop: 52 }}>
              <a className="glass link-card" data-reveal href="mailto:hello@waris.dev" rel="noopener" style={{ padding: '28px 26px', display: 'block' }}>
                <p className="foot-h" style={{ marginBottom: 8 }}>
                  EMAIL
                </p>
                <p style={{ fontFamily: 'var(--display)', fontSize: 'clamp(17px,2.4vw,22px)', fontWeight: 600 }}>
                  hello@waris.dev <span className="arr" style={{ color: 'var(--accent)' }}>→</span>
                </p>
                <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>The fastest way to start a conversation.</p>
              </a>
              <a className="glass link-card" data-reveal href="https://github.com/" target="_blank" rel="noopener" style={{ padding: '28px 26px', display: 'block' }}>
                <p className="foot-h" style={{ marginBottom: 8 }}>
                  GITHUB
                </p>
                <p style={{ fontFamily: 'var(--display)', fontSize: 'clamp(17px,2.4vw,22px)', fontWeight: 600 }}>
                  Code &amp; experiments <span className="arr" style={{ color: 'var(--accent)' }}>↗</span>
                </p>
                <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>Repos, tooling, and things built in public.</p>
              </a>
              <a className="glass link-card" data-reveal href="https://www.linkedin.com/" target="_blank" rel="noopener" style={{ padding: '28px 26px', display: 'block' }}>
                <p className="foot-h" style={{ marginBottom: 8 }}>
                  LINKEDIN
                </p>
                <p style={{ fontFamily: 'var(--display)', fontSize: 'clamp(17px,2.4vw,22px)', fontWeight: 600 }}>
                  Professional profile <span className="arr" style={{ color: 'var(--accent)' }}>↗</span>
                </p>
                <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>Resume, recommendations, and updates.</p>
              </a>
            </div>
          </div>
        </section>

        {/* ============== CTA ============== */}
        <section className="section" style={{ paddingTop: '10vh' }}>
          <div className="wrap">
            <div className="hero-actions" data-reveal style={{ marginBottom: 0 }}>
              <Link className="btn btn-ghost magnetic" href="/projects">
                ← Back to Projects
              </Link>
              <Link className="btn btn-ghost magnetic" href="/">
                Visit Home
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}