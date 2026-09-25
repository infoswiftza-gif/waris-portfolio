'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CAT_STYLE, type Post } from '@/lib/posts';

const ALL = 'All';

export default function BlogFilter({ posts }: { posts: Post[] }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState(ALL);

  const cats = [ALL, ...Array.from(new Set(posts.map((p) => p.category)))];

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return posts.filter((post) => {
      const okCat = cat === ALL || post.category === cat;
      const okQuery =
        !query ||
        `${post.title} ${post.excerpt} ${post.tags.join(' ')}`.toLowerCase().includes(query);
      return okCat && okQuery;
    });
  }, [posts, q, cat]);

  return (
    <>
      <div className="blog-controls" data-reveal>
        <label className="blog-search glass">
          <span className="blog-search-ic" aria-hidden="true"></span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the journal…"
            aria-label="Search posts"
          />
          {q && (
            <button className="blog-clear" onClick={() => setQ('')} aria-label="Clear search">
              ✕
            </button>
          )}
        </label>
        <div className="blog-chips" role="group" aria-label="Filter by category">
          {cats.map((c) => (
            <button
              key={c}
              className={`chip${cat === c ? ' on' : ''}`}
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="blog-count" data-reveal>
        {filtered.length} / {posts.length} notes
      </div>

      {filtered.length > 0 ? (
        <div className="blog-list" key={`${cat}|${q}`} style={{ marginTop: 22 }}>
          {filtered.map((post) => (
            <Link href={`/blog/${post.slug}`} className="post-card glass" key={post.slug}>
              <div className="post-meta">
                <span
                  className="post-cat"
                  style={{ color: CAT_STYLE[post.category] || 'var(--accent)' }}
                >
                  {post.category}
                </span>
                <span className="post-date">
                  {post.date} · {post.readTime}
                </span>
              </div>
              <h3>{post.title}</h3>
              <p className="post-excerpt">{post.excerpt}</p>
              <div className="post-tags">
                {post.tags.map((tag) => (
                  <span className="chip" key={tag}>
                    {tag}
                  </span>
                ))}
                <span className="post-read arr">→</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="no-results glass" style={{ marginTop: 22 }}>
          <strong>Nothing matches.</strong>
          <span>Try a different keyword or clear the filters.</span>
          <button className="chip on" onClick={() => { setQ(''); setCat(ALL); }}>
            Reset filters
          </button>
        </div>
      )}
    </>
  );
}