import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import SiteBehaviors from '@/components/SiteBehaviors';
import PageHead from '@/components/PageHead';

export const metadata: Metadata = {
  title: 'Process — Waris Ali · How I Build · WARIS.DEV',
  description:
    'How Waris Ali builds digital products — discover, design, build, deploy. A repeatable process that takes ideas to shipped products.',
};

const STEPS = [
  {
    n: '01',
    title: 'DISCOVER',
    desc: 'The product only works if the problem is understood first — the audience, the goal, the constraints, and what success actually looks like for the business.',
    points: ['Clarify goals & success metrics', 'Map the audience & their journey', 'Audit existing content & systems'],
  },
  {
    n: '02',
    title: 'DESIGN',
    desc: 'Structure before pixels. Decisions are made about information hierarchy, interaction, and visual direction — then turned into something concrete you can react to.',
    points: ['Information architecture & flow', 'Interaction + visual system', 'Content model & hierarchy'],
  },
  {
    n: '03',
    title: 'BUILD',
    desc: 'Frontend, backend, APIs, database, and CMS are developed together so every layer stays consistent — typed, tested, and performant by default.',
    points: ['Component-driven frontend', 'APIs, data & auth', 'CMS wiring & integrations'],
  },
  {
    n: '04',
    title: 'DEPLOY',
    desc: 'Ship, measure, and keep improving. Performance budgets, analytics, and monitoring turn a launch into a living system that gets better over time.',
    points: ['QA, SEO & performance tuning', 'Deploy + monitoring', 'Iterate on real feedback'],
  },
];

export default function ProcessPage() {
  return (
    <>
      <SiteNav />
      <SiteBehaviors />

      <main>
        {/* ============== THE PROCESS ============== */}
        <section className="section" style={{ paddingTop: '22vh' }}>
          <div className="wrap">
            <PageHead
              index="08"
              label="THE PROCESS"
              title={<>From idea to deployed product.</>}
              lede="A repeatable process that keeps momentum — no mystery, no black boxes, just steady progress from first call to shipped product."
            />

            <div className="proc" style={{ marginTop: 90 }}>
              <div className="proc-rail" aria-hidden="true"></div>
              {STEPS.map((s) => (
                <div className="proc-step" data-reveal key={s.n}>
                  <div className="proc-num">{s.n}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============== DETAILS ============== */}
        <section className="section" id="details">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow" data-reveal>
                <b>02</b> / WHAT THAT MEANS
              </p>
              <h2 data-reveal>The same steps, whatever the size.</h2>
              <p className="lede" data-reveal>
                Whether it&apos;s a landing page or a full commerce system, the rhythm stays the same — right-sized for the scope.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18, marginTop: 52 }}>
              {STEPS.map((s) => (
                <div className="glass" data-reveal key={s.n} style={{ padding: '28px 26px', borderRadius: 'var(--radius)' }}>
                  <p className="foot-h" style={{ marginBottom: 16 }}>
                    STEP {s.n} · {s.title}
                  </p>
                  <ul className="c-status" style={{ marginTop: 0 }}>
                    {s.points.map((p) => (
                      <li key={p} style={{ fontSize: '12px' }}>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============== CTA ============== */}
        <section className="section" style={{ paddingTop: '10vh' }}>
          <div className="wrap">
            <div className="glass" style={{ padding: 'clamp(34px,5vw,56px)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <div style={{ maxWidth: 640, margin: '0 auto' }}>
                <p className="eyebrow" data-reveal style={{ justifyContent: 'center' }}>
                  <b>03</b> / STEP ONE
                </p>
                <h2 data-reveal style={{ marginBottom: 14 }}>
                  Ready to discover?
                </h2>
                <p className="lede" data-reveal style={{ margin: '0 auto 34px' }}>
                  The first conversation is free, zero pressure, and usually the most useful one.
                </p>
                <div className="hero-actions" data-reveal style={{ justifyContent: 'center', marginBottom: 0 }}>
                  <Link className="btn btn-primary magnetic" href="/contact">
                    Start a Conversation <span className="arr">→</span>
                  </Link>
                  <Link className="btn btn-ghost magnetic" href="/projects">
                    See Examples
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