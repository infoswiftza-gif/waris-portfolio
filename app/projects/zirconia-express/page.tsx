import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import SiteBehaviors from "@/components/SiteBehaviors";

export const metadata: Metadata = {
  title: "Zirconia Express — Case Study · WARIS.DEV",
  description:
    "Zirconia Express — a specialized digital platform for dental zirconia products with a structured, search-friendly, conversion-focused experience.",
};

export default function ZirconiaCaseStudy() {
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
          <span className="eyebrow">DENTAL E-COMMERCE PLATFORM<b>·</b></span>
          <h1 style={{ fontSize: "clamp(36px,5vw,64px)", margin: "10px 0 18px" }}>Zirconia Express</h1>
          <p className="lede">
            A specialized digital platform focused on presenting dental zirconia products
            through a structured, search-friendly and conversion-focused experience.
          </p>
        </div>

        <div className="chips p-tech" style={{ margin: "28px 0 48px" }} data-reveal>
          <span className="chip">Web</span>
          <span className="chip">SEO</span>
          <span className="chip">CMS</span>
          <span className="chip">E-commerce</span>
          <span className="chip">Content</span>
        </div>

        <div className="glass" style={{ padding: "36px", borderRadius: "18px", marginBottom: "24px" }} data-reveal>
          <h2 style={{ fontSize: "22px", marginBottom: "12px" }}>The Brief</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            A B2B dental supplier needed a catalog site that dental labs could actually
            search and compare products in — clear categorization, fast filtering, and
            content that ranks for the specific technical terms buyers search for.
          </p>
        </div>

        <div className="glass" style={{ padding: "36px", borderRadius: "18px", marginBottom: "24px" }} data-reveal>
          <h2 style={{ fontSize: "22px", marginBottom: "12px" }}>Approach</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            Product data is structured for both browsing and SEO — category pages, product
            detail pages, and supporting content are all templated and CMS-managed, with
            on-page SEO baked into every content type rather than bolted on afterward.
          </p>
        </div>

        <div className="glass" style={{ padding: "36px", borderRadius: "18px" }} data-reveal>
          <h2 style={{ fontSize: "22px", marginBottom: "12px" }}>Stack Notes</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            Server-rendered web frontend · CMS-driven content and catalog · technical SEO
            (structured data, sitemaps, page-speed tuning) · e-commerce checkout flow.
          </p>
        </div>

        <div style={{ marginTop: "48px" }} data-reveal>
          <a className="btn btn-primary" href="https://zirconiaexpress.com" target="_blank" rel="noopener">
            Visit Live Site <span className="arr">→</span>
          </a>
        </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
