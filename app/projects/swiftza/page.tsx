import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import SiteBehaviors from "@/components/SiteBehaviors";

export const metadata: Metadata = {
  title: "Swiftza — Case Study · WARIS.DEV",
  description:
    "Swiftza — a premium e-commerce ecosystem for luxury watch discovery, product management, content, and conversion-focused shopping.",
};

export default function SwiftzaCaseStudy() {
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
          <span className="eyebrow">LUXURY WATCH COMMERCE PLATFORM<b>·</b></span>
          <h1 style={{ fontSize: "clamp(36px,5vw,64px)", margin: "10px 0 18px" }}>Swiftza</h1>
          <p className="lede">
            A premium e-commerce ecosystem designed for luxury watch discovery, product
            management, content, and conversion-focused shopping experiences.
          </p>
        </div>

        <div className="chips p-tech" style={{ margin: "28px 0 48px" }} data-reveal>
          <span className="chip">Next.js</span>
          <span className="chip">TypeScript</span>
          <span className="chip">Sanity</span>
          <span className="chip">Database</span>
          <span className="chip">API</span>
          <span className="chip">E-commerce</span>
        </div>

        <div className="glass" style={{ padding: "36px", borderRadius: "18px", marginBottom: "24px" }} data-reveal>
          <h2 style={{ fontSize: "22px", marginBottom: "12px" }}>The Brief</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            Swiftza needed a storefront that matched the feel of a luxury boutique online —
            fast, editorial, and trustworthy enough to sell high-value watches sight unseen.
            The build combines a headless CMS for product and editorial content with a
            performance-first Next.js frontend.
          </p>
        </div>

        <div className="glass" style={{ padding: "36px", borderRadius: "18px", marginBottom: "24px" }} data-reveal>
          <h2 style={{ fontSize: "22px", marginBottom: "12px" }}>Approach</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            Product and content are modeled in Sanity so the store team can publish new
            collections without a deploy. Next.js server rendering keeps product pages fast
            and SEO-friendly, with a typed API layer connecting catalog, pricing, and checkout.
          </p>
        </div>

        <div className="glass" style={{ padding: "36px", borderRadius: "18px" }} data-reveal>
          <h2 style={{ fontSize: "22px", marginBottom: "12px" }}>Stack Notes</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            Next.js · TypeScript · Sanity CMS · a relational database for orders/accounts ·
            a typed REST/GraphQL API layer.
          </p>
        </div>

        <div style={{ marginTop: "48px" }} data-reveal>
          <a className="btn btn-primary" href="https://swiftza.store" target="_blank" rel="noopener">
            Visit Live Site <span className="arr">→</span>
          </a>
        </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
