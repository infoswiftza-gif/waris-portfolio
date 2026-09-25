import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import SiteBehaviors from '@/components/SiteBehaviors';
import PageHead from '@/components/PageHead';
import BlogFilter from '@/components/BlogFilter';
import { getAllPosts, CAT_STYLE } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Journal — Waris Ali · Notes on building · WARIS.DEV',
  description:
    'Notes, breakdowns and lessons from building fast, scalable digital products — performance, WebGL, architecture, and the full stack.',
};

export default function BlogPage() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <>
      <SiteNav />
      <SiteBehaviors />

      <main>
        <section className="section" style={{ paddingTop: '22vh' }}>
          <div className="wrap">
            <PageHead
              index="10"
              label="THE JOURNAL"
              title={<>Notes on building <span className="grad">things that ship.</span></>}
              lede="Breakdowns and lessons from shipping fast, scalable digital products — performance, WebGL, architecture, and the full stack."
            />

            <Link
              href={`/blog/${featured.slug}`}
              className="blog-feature glass"
              data-reveal
              style={{ marginTop: 56 }}
            >
              <div className="blog-feature-copy">
                <div className="post-meta">
                  <span className="post-cat" style={{ color: CAT_STYLE[featured.category] || 'var(--accent)' }}>
                    FEATURED · {featured.category}
                  </span>
                  <span className="post-date">{featured.date} · {featured.readTime}</span>
                </div>
                <h3>{featured.title}</h3>
                <p className="post-excerpt">{featured.excerpt}</p>
                <div className="post-tags">
                  {featured.tags.map((tag) => (
                    <span className="chip" key={tag}>{tag}</span>
                  ))}
                  <span className="post-read arr">→</span>
                </div>
              </div>
              <div className="blog-feature-num" aria-hidden="true">01</div>
            </Link>

            <h2 className="blog-section-title" data-reveal>All notes</h2>

            <BlogFilter posts={rest} />
          </div>
        </section>

        <section className="section" style={{ paddingTop: '8vh' }}>
          <div className="wrap">
            <div className="hero-actions" data-reveal style={{ marginBottom: 0 }}>
              <Link className="btn btn-primary magnetic" href="/projects">
                See It In Practice <span className="arr">→</span>
              </Link>
              <Link className="btn btn-ghost magnetic" href="/contact">
                Start a Conversation
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}