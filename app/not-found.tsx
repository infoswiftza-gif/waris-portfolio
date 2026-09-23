import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import SiteBehaviors from '@/components/SiteBehaviors';

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <SiteBehaviors />

      <main>
        <section className="section" style={{ paddingTop: '26vh', minHeight: '100vh' }}>
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow" data-reveal>
                <b>404</b> / LOST SECTOR
              </p>
              <h1
                data-reveal
                style={{
                  fontFamily: 'var(--display)',
                  fontSize: 'clamp(42px,7vw,88px)',
                  fontWeight: 800,
                  lineHeight: 1.02,
                  letterSpacing: '-.04em',
                  marginBottom: 22,
                }}
              >
                This coordinate doesn&apos;t exist.
              </h1>
              <p className="lede" data-reveal>
                The page you&apos;re looking for was never mapped in the digital city. Let&apos;s get you back to the known grid.
              </p>
              <div className="hero-actions" style={{ marginTop: 34 }} data-reveal>
                <Link className="btn btn-primary magnetic" href="/">
                  Back to Base <span className="arr">→</span>
                </Link>
                <Link className="btn btn-ghost magnetic" href="/projects">
                  View Projects
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}