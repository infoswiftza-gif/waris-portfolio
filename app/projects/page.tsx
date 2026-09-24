import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import SiteBehaviors from '@/components/SiteBehaviors';
import PageHead from '@/components/PageHead';

export const metadata: Metadata = {
  title: 'Projects — Waris Ali · Project District · WARIS.DEV',
  description:
    'Selected projects by Waris Ali — Swiftza, Zirconia Express, and Zhongfa EV. Where design, engineering, and business requirements meet.',
};

export default function ProjectsPage() {
  return (
    <>
      <SiteNav />
      <SiteBehaviors />

      <main>
        {/* ============== PROJECT DISTRICT ============== */}
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

            {/* PROJECT 01 · Swiftza */}
            <article className="project glass" data-reveal data-project>
              <span className="p-index" aria-hidden="true">01</span>
              <div className="p-visual">
                <div className="pv pv-swiftza" role="img" aria-label="Swiftza interface preview — luxury watch commerce platform">
                  <div className="pv-chrome">
                    <i></i>
                    <i></i>
                    <i></i>
                    <span className="url">swiftza.store</span>
                    <div className="pv-badges">
                      <span className="b-live">LIVE</span>
                      <span>CASE STUDY</span>
                      <span>SOURCE</span>
                    </div>
                  </div>
                  <div className="pv-body">
                    <div className="pv-hero">
                      <span className="wm">SWIFTZA</span>
                      <span className="sk tl"></span>
                    </div>
                    <div className="pv-watch">
                      <div className="pv-card">
                        <span className="face"></span>
                        <span className="lines">
                          <span className="sk"></span>
                          <span className="sk dim"></span>
                        </span>
                        <span className="price"></span>
                      </div>
                      <div className="pv-card">
                        <span className="face"></span>
                        <span className="lines">
                          <span className="sk"></span>
                          <span className="sk dim"></span>
                        </span>
                        <span className="price"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-info">
                <span className="cat">LUXURY WATCH COMMERCE PLATFORM</span>
                <h3>Swiftza</h3>
                <p>A premium e-commerce ecosystem designed for luxury watch discovery, product management, content, and conversion-focused shopping experiences.</p>
                <div className="p-actions">
                  <a className="btn btn-primary btn-sm magnetic" href="https://swiftza.store" target="_blank" rel="noopener" aria-label="View Swiftza project">
                    View Project <span className="arr">→</span>
                  </a>
                  <Link className="btn btn-ghost btn-sm magnetic" href="/projects/swiftza" aria-label="Open Swiftza case study">
                    Case Study <span className="arr">↗</span>
                  </Link>
                </div>
                <div className="chips p-tech">
                  <span className="chip">Next.js</span>
                  <span className="chip">TypeScript</span>
                  <span className="chip">Sanity</span>
                  <span className="chip">Database</span>
                  <span className="chip">API</span>
                  <span className="chip">E-commerce</span>
                </div>
              </div>
            </article>

            {/* PROJECT 02 · Zirconia Express */}
            <article className="project glass" data-reveal data-project>
              <span className="p-index" aria-hidden="true">02</span>
              <div className="p-visual">
                <div className="pv pv-zirconia" role="img" aria-label="Zirconia Express interface preview — dental e-commerce platform">
                  <div className="pv-chrome">
                    <i></i>
                    <i></i>
                    <i></i>
                    <span className="url">zirconiaexpress.com</span>
                    <div className="pv-badges">
                      <span className="b-live">LIVE</span>
                      <span>CASE STUDY</span>
                      <span>SOURCE</span>
                    </div>
                  </div>
                  <div className="pv-body">
                    <div className="side">
                      <span className="sk" style={{ width: '70%' }}></span>
                      <span className="sk dim"></span>
                      <span className="sk dim"></span>
                      <span className="sk dim"></span>
                      <span className="sk dim"></span>
                    </div>
                    <div className="cat">
                      <div className="zc">
                        <i></i>
                      </div>
                      <div className="zc">
                        <i></i>
                      </div>
                      <div className="zc">
                        <i></i>
                      </div>
                      <div className="zc">
                        <i></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-info">
                <span className="cat">DENTAL E-COMMERCE PLATFORM</span>
                <h3>Zirconia Express</h3>
                <p>A specialized digital platform focused on presenting dental zirconia products through a structured, search-friendly and conversion-focused experience.</p>
                <div className="p-actions">
                  <a className="btn btn-primary btn-sm magnetic" href="https://zirconiaexpress.com" target="_blank" rel="noopener" aria-label="View Zirconia Express project">
                    View Project <span className="arr">→</span>
                  </a>
                  <Link className="btn btn-ghost btn-sm magnetic" href="/projects/zirconia-express" aria-label="Open Zirconia Express case study">
                    Case Study <span className="arr">↗</span>
                  </Link>
                </div>
                <div className="chips p-tech">
                  <span className="chip">Web</span>
                  <span className="chip">SEO</span>
                  <span className="chip">CMS</span>
                  <span className="chip">E-commerce</span>
                  <span className="chip">Content</span>
                </div>
              </div>
            </article>

            {/* PROJECT 03 · Zhongfa EV */}
            <article className="project glass" data-reveal data-project>
              <span className="p-index" aria-hidden="true">03</span>
              <div className="p-visual">
                <div className="pv pv-ev" role="img" aria-label="Zhongfa EV interface preview — electric mobility platform">
                  <div className="pv-chrome">
                    <i></i>
                    <i></i>
                    <i></i>
                    <span className="url">zhongfa-ev.com</span>
                    <div className="pv-badges">
                      <span className="b-live">LIVE</span>
                      <span>CASE STUDY</span>
                      <span>SOURCE</span>
                    </div>
                  </div>
                  <div className="pv-body">
                    <div className="stage">
                      <span className="beam"></span>
                      <span className="car"></span>
                    </div>
                    <div className="pv-specs">
                      <div className="row">
                        <span className="lb">RANGE</span>
                        <span className="bar" style={{ ['--w' as string]: '78%' }}></span>
                      </div>
                      <div className="row">
                        <span className="lb">CHARGE</span>
                        <span className="bar" style={{ ['--w' as string]: '56%' }}></span>
                      </div>
                      <div className="row">
                        <span className="lb">MOTOR</span>
                        <span className="bar" style={{ ['--w' as string]: '66%' }}></span>
                      </div>
                      <div className="row">
                        <span className="lb">CONNECT</span>
                        <span className="bar" style={{ ['--w' as string]: '44%' }}></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-info">
                <span className="cat">ELECTRIC MOBILITY PLATFORM</span>
                <h3>Zhongfa EV</h3>
                <p>A modern digital experience for electric mobility products, combining product presentation, content, SEO, and conversion-focused UX.</p>
                <div className="p-actions">
                  <a className="btn btn-primary btn-sm magnetic" href="https://zhongfa-ev.com" target="_blank" rel="noopener" aria-label="View Zhongfa EV project">
                    View Project <span className="arr">→</span>
                  </a>
                  <Link className="btn btn-ghost btn-sm magnetic" href="/projects/zhongfa-ev" aria-label="Open Zhongfa EV case study">
                    Case Study <span className="arr">↗</span>
                  </Link>
                </div>
                <div className="chips p-tech">
                  <span className="chip">Frontend</span>
                  <span className="chip">CMS</span>
                  <span className="chip">SEO</span>
                  <span className="chip">Responsive UI</span>
                  <span className="chip">Content</span>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* ============== CTA ============== */}
        <section className="section" style={{ paddingTop: '10vh' }}>
          <div className="wrap">
            <div className="glass" style={{ padding: 'clamp(34px,5vw,56px)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <div style={{ maxWidth: 640, margin: '0 auto' }}>
                <p className="eyebrow" data-reveal style={{ justifyContent: 'center' }}>
                  <b>06</b> / NEXT PROJECT
                </p>
                <h2 data-reveal style={{ marginBottom: 14 }}>
                  Your Project Could Be Next.
                </h2>
                <p className="lede" data-reveal style={{ margin: '0 auto 34px' }}>
                  From concept to deployed product — let&apos;s define what we&apos;re building.
                </p>
                <div className="hero-actions" data-reveal style={{ justifyContent: 'center', marginBottom: 0 }}>
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