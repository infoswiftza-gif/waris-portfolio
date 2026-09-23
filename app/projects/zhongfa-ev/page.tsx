import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import SiteBehaviors from "@/components/SiteBehaviors";

export const metadata: Metadata = {
  title: "Zhongfa EV — Case Study · WARIS.DEV",
  description:
    "Zhongfa EV — a modern digital experience for electric mobility products combining product presentation, content, SEO, and conversion-focused UX.",
};

export default function ZhongfaCaseStudy() {
  return (
    <>
      <SiteNav />
      <SiteBehaviors />
      <main>
        <div className="wrap section" style={{ paddingTop: "22vh" }}>
          <Link className="btn btn-ghost btn-sm" href="/projects" style={{ marginBottom: 48 }}>
            ← Back to Projects
          </Link>
          <div className="section-head" data-reveal>
          <span className="eyebrow">ELECTRIC MOBILITY PLATFORM<b>·</b></span>
          <h1 style={{ fontSize: "clamp(36px,5vw,64px)", margin: "10px 0 18px" }}>Zhongfa EV</h1>
          <p className="lede">
            A modern digital experience for electric mobility products, combining product
            presentation, content, SEO, and conversion-focused UX.
          </p>
        </div>

        <div className="chips p-tech" style={{ margin: "28px 0 48px" }} data-reveal>
          <span className="chip">Web</span>
          <span className="chip">SEO</span>
          <span className="chip">Content</span>
          <span className="chip">UX</span>
        </div>

        <div className="glass" style={{ padding: "36px", borderRadius: "18px", marginBottom: "24px" }} data-reveal>
          <h2 style={{ fontSize: "22px", marginBottom: "12px" }}>The Brief</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            An EV brand needed a site that could explain range, charging, and performance
            specs at a glance while still feeling premium — spec-heavy content presented in
            a way that supports the buying decision rather than overwhelming it.
          </p>
        </div>

        <div className="glass" style={{ padding: "36px", borderRadius: "18px", marginBottom: "24px" }} data-reveal>
          <h2 style={{ fontSize: "22px", marginBottom: "12px" }}>Approach</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            Spec data (range, charge time, motor output, connectivity) is presented through
            clear visual comparisons rather than plain tables, backed by SEO-structured
            content pages so model pages surface for the right searches.
          </p>
        </div>

        <div className="glass" style={{ padding: "36px", borderRadius: "18px" }} data-reveal>
          <h2 style={{ fontSize: "22px", marginBottom: "12px" }}>Stack Notes</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            Server-rendered web frontend · content-managed spec/model pages · technical SEO
            · conversion-focused UX for high-consideration purchases.
          </p>
        </div>

        <div style={{ marginTop: "48px" }} data-reveal>
          <a className="btn btn-primary" href="https://zhongfa-ev.com" target="_blank" rel="noopener">
            Visit Live Site <span className="arr">→</span>
          </a>
        </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
