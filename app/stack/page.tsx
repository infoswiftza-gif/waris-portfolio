import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import SiteBehaviors from '@/components/SiteBehaviors';
import PageHead from '@/components/PageHead';

export const metadata: Metadata = {
  title: 'Stack — Waris Ali · Technology Map · WARIS.DEV',
  description:
    'The technology stack Waris Ali works with — frontend, backend, database, CMS, deployment, and the systems that connect them.',
};

export default function StackPage() {
  return (
    <>
      <SiteNav />
      <SiteBehaviors />

      <main>
        {/* ============== TECHNOLOGY MAP ============== */}
        <section className="section" style={{ paddingTop: '22vh' }}>
          <div className="wrap">
            <PageHead
              index="07"
              label="THE STACK"
              title={<>The tools behind the city.</>}
              lede="Hover a technology to see how the systems connect. Same stack, one coherent system."
            />

            <div className="const-grid" id="constGrid">
              <div className="const-panel glass" data-group="FRONTEND" data-reveal>
                <h3>FRONTEND</h3>
                <svg className="const-lines" aria-hidden="true"></svg>
                <div className="tnodes">
                  <button type="button" className="tnode" data-tech="React">React</button>
                  <button type="button" className="tnode" data-tech="Next.js">Next.js</button>
                  <button type="button" className="tnode" data-tech="TypeScript">TypeScript</button>
                  <button type="button" className="tnode" data-tech="JavaScript">JavaScript</button>
                  <button type="button" className="tnode" data-tech="HTML">HTML</button>
                  <button type="button" className="tnode" data-tech="CSS">CSS</button>
                  <button type="button" className="tnode" data-tech="Tailwind">Tailwind</button>
                </div>
              </div>
              <div className="const-panel glass" data-group="BACKEND" data-reveal>
                <h3>BACKEND</h3>
                <svg className="const-lines" aria-hidden="true"></svg>
                <div className="tnodes">
                  <button type="button" className="tnode" data-tech="Node.js">Node.js</button>
                  <button type="button" className="tnode" data-tech="Express">Express</button>
                  <button type="button" className="tnode" data-tech="REST APIs">REST APIs</button>
                </div>
              </div>
              <div className="const-panel glass" data-group="DATABASE" data-reveal>
                <h3>DATABASE</h3>
                <svg className="const-lines" aria-hidden="true"></svg>
                <div className="tnodes">
                  <button type="button" className="tnode" data-tech="PostgreSQL">PostgreSQL</button>
                  <button type="button" className="tnode" data-tech="MySQL">MySQL</button>
                  <button type="button" className="tnode" data-tech="Prisma">Prisma</button>
                  <button type="button" className="tnode" data-tech="Supabase">Supabase</button>
                  <button type="button" className="tnode" data-tech="Neon">Neon</button>
                </div>
              </div>
              <div className="const-panel glass" data-group="CMS" data-reveal>
                <h3>CMS</h3>
                <svg className="const-lines" aria-hidden="true"></svg>
                <div className="tnodes">
                  <button type="button" className="tnode" data-tech="Sanity">Sanity</button>
                </div>
              </div>
              <div className="const-panel glass" data-group="DEPLOYMENT" data-reveal>
                <h3>DEPLOYMENT</h3>
                <svg className="const-lines" aria-hidden="true"></svg>
                <div className="tnodes">
                  <button type="button" className="tnode" data-tech="Vercel">Vercel</button>
                  <button type="button" className="tnode" data-tech="Git">Git</button>
                  <button type="button" className="tnode" data-tech="GitHub">GitHub</button>
                </div>
              </div>
              <div className="const-panel glass" data-group="OTHER" data-reveal>
                <h3>OTHER</h3>
                <svg className="const-lines" aria-hidden="true"></svg>
                <div className="tnodes">
                  <button type="button" className="tnode" data-tech="SEO">SEO</button>
                  <button type="button" className="tnode" data-tech="API Integration">API Integration</button>
                  <button type="button" className="tnode" data-tech="Automation">Automation</button>
                  <button type="button" className="tnode" data-tech="AI Integration">AI Integration</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============== BACKEND TOWER ============== */}
        <section className="section" id="backend">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow" data-reveal>
                <b>03</b> / BACKEND TOWER
              </p>
              <h2 data-reveal>The experience is only as strong as the system behind it.</h2>
            </div>
            <div className="be-grid">
              <div className="arch" data-reveal role="img" aria-label="Architecture flow: client, application, API, business logic, database, cloud">
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
              <div>
                <div className="chips" data-reveal>
                  <span className="chip">Node.js</span>
                  <span className="chip">Express</span>
                  <span className="chip">Next.js</span>
                  <span className="chip">REST APIs</span>
                  <span className="chip">Authentication</span>
                  <span className="chip">Webhooks</span>
                  <span className="chip">Server Logic</span>
                </div>
                <div className="status-list" data-reveal>
                  <div className="status-row">
                    <span className="k">API STATUS</span>
                    <span className="v">ONLINE</span>
                  </div>
                  <div className="status-row">
                    <span className="k">DATABASE</span>
                    <span className="v">CONNECTED</span>
                  </div>
                  <div className="status-row">
                    <span className="k">AUTH</span>
                    <span className="v">SECURE</span>
                  </div>
                  <div className="status-row">
                    <span className="k">DEPLOYMENT</span>
                    <span className="v">ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============== DATA VAULT ============== */}
        <section className="section" id="data">
          <div className="wrap">
            <div style={{ display: 'grid', gridTemplateColumns: '.9fr 1.1fr', gap: 60, alignItems: 'center', marginTop: 20 }}>
              <div className="db-stack" style={{ position: 'relative' }} data-reveal aria-hidden="true">
                <div className="db-glow"></div>
                <div className="disc"></div>
                <div className="disc"></div>
                <div className="disc"></div>
              </div>
              <div>
                <p className="eyebrow" data-reveal>
                  <b>04</b> / DATA VAULT
                </p>
                <h2 data-reveal>Structured data. Reliable systems. Clean architecture.</h2>
                <div className="dflow" data-reveal aria-label="Query flow: query, ORM, database, result">
                  <span className="packet" aria-hidden="true"></span>
                  <div className="dflow-step">
                    <span className="n">01</span>
                    <span className="t">QUERY</span>
                    <span className="d">typed requests from the app layer</span>
                  </div>
                  <div className="dflow-step">
                    <span className="n">02</span>
                    <span className="t">ORM</span>
                    <span className="d">Prisma models &amp; migrations</span>
                  </div>
                  <div className="dflow-step">
                    <span className="n">03</span>
                    <span className="t">DATABASE</span>
                    <span className="d">structured, indexed, consistent</span>
                  </div>
                  <div className="dflow-step">
                    <span className="n">04</span>
                    <span className="t">RESULT</span>
                    <span className="d">fast, predictable responses</span>
                  </div>
                </div>
                <div className="chips" style={{ marginTop: 30 }} data-reveal>
                  <span className="chip">PostgreSQL</span>
                  <span className="chip">MySQL</span>
                  <span className="chip">Prisma</span>
                  <span className="chip">Supabase</span>
                  <span className="chip">Neon</span>
                  <span className="chip">MongoDB</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============== CTA ============== */}
        <section className="section" style={{ paddingTop: '8vh' }}>
          <div className="wrap">
            <div className="hero-actions" data-reveal style={{ marginBottom: 0 }}>
              <Link className="btn btn-primary magnetic" href="/projects">
                See It In Practice <span className="arr">→</span>
              </Link>
              <Link className="btn btn-ghost magnetic" href="/process">
                How I Build
              </Link>
            </div>
          </div>
        </section>
      </main>

      <div className="tip" id="tip" role="tooltip"></div>
      <SiteFooter />
    </>
  );
}