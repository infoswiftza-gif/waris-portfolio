import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import SiteBehaviors from '@/components/SiteBehaviors';
import PageHead from '@/components/PageHead';
import { cmsDb } from '@/prisma/db';
import type { BlogPostRow } from '@/lib/cms/types';

export const metadata: Metadata = {
  title: 'Journal — Waris Ali · Notes on building · WARIS.DEV',
  description:
    'Notes, breakthroughs and lessons from building fast, scalable digital products — performance, architecture, and the full stack.',
};

// Rendered per request so post edits made in the CMS show up immediately.
export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  // All published posts, newest first.  The editor toggles `published` in the
  // CMS; drafts never reach this page.  `orderBy` compiles a single sort key,
  // so newest-first is applied on `publishedAt` and creation time breaks ties.
  // A transient DB error degrades to an empty post list instead of crashing
  // the whole page with a 500. `featured` below is already guarded with
  // `featured &&`, so an empty array here is safe.
  let published: BlogPostRow[] = [];
  try {
    const db = await cmsDb();
    published = (await db.orm.blog_posts
      .where({ published: true })
      .orderBy({ publishedAt: -1 })
      .limit(99)
      .all()) as BlogPostRow[];
  } catch (err) {
    console.error('[BlogPage] falling back to empty list after DB error:', err);
  }

  const posts: BlogPostRow[] = [...published].sort(
    (a, b) => new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime(),
  );

  // Featured = the single most recent post.
  const featured = posts[0];
  const rest = posts.slice(1);

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
              lede="Breakdowns and lessons from shipping fast, scalable digital products — performance, architecture, and the full stack."
            />

            {featured && (
              <Link
                href={`/blog/${featured.slug}`}
                className="blog-feature glass"
                data-reveal
                style={{ marginTop: 56 }}
              >
                <div className="blog-feature-copy">
                  <div className="post-meta">
                    <span
                      className="post-cat"
                      style={{ color: 'var(--accent)' }}
                    >
                      FEATURED
                    </span>
                    <span className="post-date">
                      {featured.publishedAt
                        ? new Date(featured.publishedAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </span>
                  </div>
                  <h3>{featured.title}</h3>
                  <p className="post-excerpt">{featured.excerpt}</p>
                  <div className="post-tags">
                    {featured.tags?.map((tag: string) => (
                      <span key={tag} className="chip">{tag}</span>
                    ))}
                    <span className="post-read arr">→</span>
                  </div>
                </div>
                <div className="blog-feature-num" aria-hidden="true">01</div>
              </Link>
            )}

            {/* Heading + full list */}
            <h2 className="blog-section-title" data-reveal>
              All notes
            </h2>

            {rest.length === 0 ? (
              <div
                className="glass"
                style={{ marginTop: 22, textAlign: 'center', padding: '40px 24px' }}
              >
                <p style={{ color: 'var(--muted)' }}>No published notes yet.</p>
                <p style={{ color: 'var(--muted-2)', fontSize: 13, marginTop: 4 }}>
                  Write one in the CMS: <Link href="/admin/blog">/admin/blog</Link>
                </p>
              </div>
            ) : (
              rest.map((post) => (
                <Link
                  key={String(post._id)}
                  href={`/blog/${post.slug}`}
                  className="post-card glass"
                >
                  <div className="post-meta">
                    <span
                      className="post-cat"
                      style={{ color: 'var(--accent)' }}
                    >
                      {post.title && post.title.length > 20
                        ? post.title.slice(0, 20) + '…'
                        : post.title}
                    </span>
                    <span className="post-date">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </span>
                  </div>
                  <h3>{post.title}</h3>
                  <p className="post-excerpt">{post.excerpt}</p>
                  <div className="post-tags">
                    {post.tags?.map((tag: string) => (
                      <span key={tag} className="chip">{tag}</span>
                    ))}
                    <span className="post-read arr">→</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="section" style={{ paddingTop: '8vh' }}>
          <div className="wrap">
            <div
              className="hero-actions"
              style={{ marginBottom: 0 }}
            >
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
