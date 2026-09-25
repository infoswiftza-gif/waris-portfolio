import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import SiteBehaviors from '@/components/SiteBehaviors';
import PostReadingProgress from '@/components/PostReadingProgress';
import PostToc from '@/components/PostToc';
import CodeBlock from '@/components/CodeBlock';
import ShareBar from '@/components/ShareBar';
import {
  POSTS,
  getPost,
  getHeadings,
  getRelated,
  getAdjacent,
  headingId,
  CAT_STYLE,
  type PostBlock,
} from '@/lib/posts';

export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPost(params.slug);
  if (!post) return {};
  return {
    title: `${post.title} — WARIS.DEV`,
    description: post.excerpt,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

function Block({ block, id }: { block: PostBlock; id?: string }) {
  switch (block.type) {
    case 'h2':
      return (
        <h2 id={id} className="post-anchor" data-reveal>
          <a className="post-anchor-link" href={`#${id}`} aria-label={`Link to ${block.text}`}>#</a>
          {block.text}
        </h2>
      );
    case 'list':
      return (
        <ul>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case 'quote':
      return <blockquote>{block.text}</blockquote>;
    case 'code':
      return <CodeBlock text={block.text} />;
    default:
      return <p>{block.text}</p>;
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const headings = getHeadings(post);

  const { prev, next } = getAdjacent(post);
  const related = getRelated(post, 2);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Person', name: 'Waris Ali', url: 'https://waris.dev' },
    keywords: post.tags.join(', '),
  };

  return (
    <>
      <SiteNav />
      <SiteBehaviors />
      <PostReadingProgress />

      <main>
        <div className="wrap section" style={{ paddingTop: '20vh' }}>
          <Link className="btn btn-ghost btn-sm" href="/blog" style={{ marginBottom: 48 }}>
            ← Back to the Journal
          </Link>

          <div className="section-head" data-reveal>
            <span className="eyebrow" style={{ color: CAT_STYLE[post.category] || 'var(--accent)' }}>
              {post.category}<b>·</b>
            </span>
            <h1 style={{ fontSize: 'clamp(34px,5vw,58px)', margin: '10px 0 20px' }}>{post.title}</h1>
            <p className="lede">{post.excerpt}</p>
          </div>

          <div className="post-meta" style={{ margin: '26px 0 44px' }} data-reveal>
            <span className="post-date">{post.date} · {post.readTime}</span>
            <div className="post-tags">
              {post.tags.map((tag) => (
                <span className="chip" key={tag}>{tag}</span>
              ))}
            </div>
          </div>

          <div className="post-layout">
            <article className="post-body glass">
              {(() => {
                let h2i = 0;
                return post.blocks.map((block, i) => {
                  const id = block.type === 'h2' ? headingId(block.text, h2i++) : undefined;
                  return <Block key={i} block={block} id={id} />;
                });
              })()}
            </article>

            <aside className="post-side">
              <PostToc headings={headings.map((h) => h.text)} />
              <ShareBar title={post.title} />
            </aside>
          </div>

          <section className="post-nav" data-reveal>
            {prev ? (
              <Link href={`/blog/${prev.slug}`} className="pn-card glass">
                <span className="pn-label">← Older note</span>
                <strong>{prev.title}</strong>
              </Link>
            ) : (
              <span className="pn-card pn-empty glass">
                <span className="pn-label">← Older note</span>
                <strong>You are at the oldest note.</strong>
              </span>
            )}
            {next ? (
              <Link href={`/blog/${next.slug}`} className="pn-card pn-next glass">
                <span className="pn-label">Newer note →</span>
                <strong>{next.title}</strong>
              </Link>
            ) : (
              <span className="pn-card pn-next pn-empty glass">
                <span className="pn-label">Newer note →</span>
                <strong>This is the latest note.</strong>
              </span>
            )}
          </section>

          {related.length > 0 && (
            <section className="related" data-reveal>
              <h2 className="blog-section-title">Keep reading</h2>
              <div className="related-grid">
                {related.map((p) => (
                  <Link key={p.slug} href={`/blog/${p.slug}`} className="related-card glass">
                    <div className="post-meta">
                      <span className="post-cat" style={{ color: CAT_STYLE[p.category] || 'var(--accent)' }}>
                        {p.category}
                      </span>
                      <span className="post-date">{p.readTime}</span>
                    </div>
                    <h3>{p.title}</h3>
                    <span className="post-read arr">→</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div style={{ marginTop: '48px' }} data-reveal>
            <div className="hero-actions" style={{ marginBottom: 0 }}>
              <Link className="btn btn-primary magnetic" href="/blog">
                More Notes <span className="arr">→</span>
              </Link>
              <Link className="btn btn-ghost magnetic" href="/contact">
                Start a Conversation
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Script id="post-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <SiteFooter />
    </>
  );
}