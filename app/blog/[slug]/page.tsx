import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import type { ReactNode } from 'react';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import SiteBehaviors from '@/components/SiteBehaviors';
import PostReadingProgress from '@/components/PostReadingProgress';
import PostToc from '@/components/PostToc';
import CodeBlock from '@/components/CodeBlock';
import ShareBar from '@/components/ShareBar';
import { cmsDb } from '@/prisma/db';
import { headingId, type PostBlock } from '@/lib/posts';
import { markdownToBlocks, parseInline, type InlineToken } from '@/lib/cms/markdown';
import type { BlogPostRow } from '@/lib/cms/types';

/**
 * Public blog post page.
 *
 * `BlogPost.content` holds raw Markdown written in the admin textarea, so the
 * body is parsed into the `PostBlock` union at render time. Known slugs are
 * prerendered by `generateStaticParams`; `dynamicParams` stays on so a post
 * published after the build is still reachable instead of 404ing.
 */
export const dynamicParams = true;

/** On-demand renders are cached, so a cold database costs one request, not one per visit. */
export const revalidate = 300;

/** Every query here is scoped to published posts so drafts stay private. */
async function findPublishedPost(slug: string): Promise<BlogPostRow | null> {
  const db = await cmsDb();
  return ((await db.orm.blog_posts
    .where({ slug, published: true })
    .first()) ?? null) as BlogPostRow | null;
}

/**
 * Prerendering is a build-time optimisation, never a correctness requirement:
 * `dynamicParams = true` above means every slug renders on demand (and is then
 * cached by `revalidate`) even when it is not in the list returned here.
 *
 * So a database that is briefly unreachable from the build machine — a cold
 * Atlas free-tier cluster waking up, a network blip — must not fail the whole
 * deploy. Returning no params degrades the build to fully dynamic rendering,
 * which is slower on first hit but otherwise identical for readers and crawlers.
 */
export async function generateStaticParams() {
  try {
    const db = await cmsDb();
    const posts = (await db.orm.blog_posts
      .where({ published: true })
      .limit(999)
      .all()) as BlogPostRow[];
    return posts.map((post) => ({ slug: String(post.slug ?? '') }));
  } catch (err) {
    console.warn(
      '[blog] generateStaticParams: database unavailable, prerendering skipped —',
      err instanceof Error ? err.message : err
    );
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await findPublishedPost(slug);
  if (!post) return {};

  return {
    title: `${post.title} — WARIS.DEV`,
    description: post.excerpt,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      tags: post.tags,
    },
  };
}

/** Render inline Markdown tokens as real nodes, never as raw HTML. */
function renderInline(tokens: InlineToken[]): ReactNode[] {
  return tokens.map((token, index) => {
    const key = `${token.kind}-${index}`;
    switch (token.kind) {
      case 'strong':
        return <strong key={key}>{token.value}</strong>;
      case 'em':
        return <em key={key}>{token.value}</em>;
      case 'code':
        return <code key={key}>{token.value}</code>;
      case 'link': {
        const external = /^https?:\/\//i.test(token.href);
        return (
          <a
            key={key}
            href={token.href}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {token.value}
          </a>
        );
      }
      default:
        return <span key={key}>{token.value}</span>;
    }
  });
}

function Block({ block, id }: { block: PostBlock; id?: string }) {
  switch (block.type) {
    case 'h2':
      return (
        <h2 id={id} className="post-anchor" data-reveal>
          <a className="post-anchor-link" href={`#${id}`} aria-label={`Link to ${block.text}`}>
            #
          </a>
          {block.text}
        </h2>
      );
    case 'list':
      return (
        <ul>
          {block.items.map((item, index) => (
            <li key={index}>{renderInline(parseInline(item))}</li>
          ))}
        </ul>
      );
    case 'quote':
      return <blockquote>{renderInline(parseInline(block.text))}</blockquote>;
    case 'code':
      return <CodeBlock text={block.text} />;
    default:
      return <p>{renderInline(parseInline(block.text))}</p>;
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await findPublishedPost(slug);
  if (!post) notFound();

  const blocks = markdownToBlocks(post.content ?? '');
  const headings: { text: string; id: string }[] = [];
  let order = 0;
  for (const block of blocks) {
    if (block.type === 'h2') {
      headings.push({ text: block.text, id: headingId(block.text, order++) });
    }
  }

  // Older/newer navigation walks the published list, not the heading ids.
  const db = await cmsDb();
  const siblings = (await db.orm.blog_posts
    .where({ published: true })
    .orderBy({ publishedAt: -1 })
    .limit(999)
    .all()) as BlogPostRow[];
  const index = siblings.findIndex((row) => String(row.slug ?? '') === slug);
  const older = index >= 0 ? siblings[index + 1] : undefined;
  const newer = index > 0 ? siblings[index - 1] : undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { '@type': 'Person', name: 'Waris Ali', url: 'https://waris.dev' },
    keywords: (post.tags ?? []).join(', '),
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
            <span
              className="eyebrow"
              style={{ color: 'var(--accent)', fontFamily: 'var(--display)' }}
            >
              {post.title ? post.title.slice(0, 20) : 'Blog'}
              <b>·</b>
            </span>
            <h1 style={{ fontSize: 'clamp(34px,5vw,58px)' }}>{post.title}</h1>
            <p className="lede">{post.excerpt}</p>
          </div>

          <div
            className="post-meta"
            style={{ margin: '26px 0 44px' }}
            data-reveal
          >
            <span className="post-date">
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—'}{' '}
              · {post.readingTime ?? '—'} min read
            </span>
            <div className="post-tags">
              {post.tags?.map((tag: string) => (
                <span key={tag} className="chip">{tag}</span>
              ))}
            </div>
          </div>

          <div className="post-layout">
            <article className="post-body glass">
              {(() => {
                let h2i = 0;
                return blocks.map((block, i) => {
                  const id = block.type === 'h2' ? headingId(block.text, h2i++) : undefined;
                  return <Block key={i} block={block} id={id} />;
                });
              })()}
            </article>

            <aside className="post-side">
              <PostToc headings={headings.map((h) => h.text)} />
              <ShareBar title={post.title ?? ''} />
            </aside>
          </div>

          <section className="post-nav" data-reveal>
            {older?.slug && (
              <Link href={`/blog/${older.slug}`} className="pn-card glass">
                <span className="pn-label">← Older note</span>
                <strong>{older.title}</strong>
              </Link>
            )}
            {newer?.slug && (
              <Link href={`/blog/${newer.slug}`} className="pn-card pn-next glass">
                <span className="pn-label">Newer note →</span>
                <strong>{newer.title}</strong>
              </Link>
            )}
          </section>

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

      <Script
        id="post-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SiteFooter />
    </>
  );
}
