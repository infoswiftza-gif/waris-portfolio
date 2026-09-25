'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileUpload } from '@/components/FileUpload';

/**
 * /admin/blog
 *
 * CRUD screen for blog posts. The admin writes raw Markdown in a textarea,
 * gets a slug auto-generated from the title, uploads a cover image and flips a
 * draft/publish toggle. On save we POST/PUT the record via `/api/blog`, which
 * writes Markdown content straight into the `BlogPost` collection.
 */

type Props = {};

const ORDER_HINT = 'n/a';
const MIN_EXCERPT = 20;

export default function AdminBlogPage({}: Props) {
  const [list, setList] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blog');
      const body = await res.json();
      if (body.ok) setList(body.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function resetSaved() {
    setSaved(false);
    setTimeout(() => setSaved(false), 2500);
  }

  function slugFromTitle(title: string) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async function persist(body: Record<string, unknown>) {
    const contentText = String(body.content ?? '');
    const excerptText = String(body.excerpt ?? '');
    if (!body.title || contentText.trim().length < 20) {
      alert('Title and at least 20 characters of content are required.');
      return;
    }
    if (excerptText && excerptText.trim().length < MIN_EXCERPT) {
      alert(`Excerpt should be at least ${MIN_EXCERPT} characters.`);
      return;
    }

    setSaving(true);
    try {
      const id = body._id?.toString() ?? undefined;
      const method = id ? 'PUT' : 'POST';
      const url = id ? `/api/blog/${id}` : '/api/blog';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(`Save failed: ${json.message || json.error || `status ${res.status}`}.`);
        return;
      }

      resetSaved();
      setEditing(null);
      setCoverPreview(null);
      await load();
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this blog post? It will disappear from the public blog.')) return;
    try {
      const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(`Delete failed: ${body.message || body.error || 'unknown error'}.`);
        return;
      }
      resetSaved();
      await load();
    } catch {
      alert('Network error. Please try again.');
    }
  }

  function startEdit(post: Record<string, unknown>) {
    setEditing({ ...post });
    setCoverPreview(post.coverImage?.toString() ?? null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditing(null);
    setCoverPreview(null);
  }

  const getStr = (obj: Record<string, unknown>, key: string, fallback: string | number = '') =>
    String(obj[key] ?? fallback);

  // Compute derived display strings from each record.
  const publishedMap: Record<string, unknown>[] = [];
  list.forEach((post) => {
    const p: Record<string, unknown> = { ...post, _id: post._id?.toString() ?? '' };
    p.published = Boolean(post.published);
    p.publishedAt = getStr(post, 'publishedAt');
    p.slug = getStr(post, 'slug');
    p.title = getStr(post, 'title');
    p.excerpt = getStr(post, 'excerpt');
    p.coverImage = getStr(post, 'coverImage');
    p.tags = Array.isArray(post.tags) ? post.tags.map(String) : [];
    p.readingTime = getStr(post, 'readingTime', 0);
    publishedMap.push(p);
  });
  publishedMap.sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt as string).getTime() : 0;
    const dateB = b.publishedAt ? new Date(b.publishedAt as string).getTime() : 0;
    return dateB - dateA;
  });

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 320,
          color: 'var(--muted)',
          fontFamily: 'monospace',
          fontSize: 13,
        }}
      >
        Loading blog posts…
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: '"Space Grotesk", "Inter", monospace',
              fontWeight: 700,
              letterSpacing: '-.03em',
              margin: 0,
              color: 'var(--ink)',
            }}
          >
            Blog posts
          </h2>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>
            {publishedMap.length} post{publishedMap.length !== 1 ? 's' : ''}
            {publishedMap.filter((p) => p.published).length > 0 && (
              <>
                · <b>{publishedMap.filter((p) => p.published).length}</b> published,{' '}
                <b>{publishedMap.filter((p) => !p.published).length}</b> draft
              </>
            )}
          </p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing({})}
            style={{
              padding: '12px 18px',
              borderRadius: 10,
              border: '1px solid var(--line-strong)',
              background: 'var(--surface)',
              color: 'var(--ink)',
              fontFamily: 'monospace',
              fontWeight: 600,
              fontSize: 13.5,
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'background .2s, border-color .2s, color .2s',
              WebkitAppearance: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.color = '#04140c';
              e.currentTarget.style.background = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--line-strong)';
              e.currentTarget.style.color = 'var(--ink)';
              e.currentTarget.style.background = 'var(--surface)';
            }}
            disabled={saving}
          >
            + New post
          </button>
        )}
      </div>

      <div
        style={{
          overflowX: 'auto',
          borderRadius: 14,
          border: '1px solid var(--line)',
          background: 'var(--surface)',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 12.5,
            fontFamily: 'monospace',
          }}
        >
          <thead>
            <tr
              style={{
                background: 'var(--bg-2)',
                borderBottom: '1px solid var(--line)',
              }}
            >
              {['', 'title', 'status', 'published date', 'actions'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: h === '' ? 'center' : 'left',
                    padding: '12px 16px',
                    fontWeight: 600,
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    fontSize: 11,
                    color: 'var(--muted-2)',
                    borderBottom: '1px solid var(--line)',
                  }}
                >
                  {h || 'ID'}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {publishedMap.map((post) => {
              const id = String(post._id ?? '');
              const slug = getStr(post, 'slug');
              const isDraft = !post.published;
              const date = post.publishedAt
                ? new Date(post.publishedAt as string).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—';

              return (
                <tr
                  key={id}
                  style={{
                    borderBottom: '1px solid var(--line)',
                    background: isDraft ? 'rgba(255,210,122,.02)' : 'rgba(100,245,176,.03)',
                    transition: 'background .2s',
                  }}
                >
                  <td style={{ padding: '12px 16px', color: 'var(--muted-2)' }}>{id.slice(0, 8)}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--ink)' }}>
                    {getStr(post, 'title') || '—'}
                    {slug && (
                      <span
                        style={{
                          display: 'block',
                          marginTop: 4,
                          fontSize: 11,
                          color: 'var(--muted-2)',
                          fontFamily: 'monospace',
                        }}
                      >
                        /blog/{slug}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '3px 9px',
                        borderRadius: 999,
                        background: isDraft ? 'var(--line-strong)' : 'var(--accent)',
                        color: isDraft ? 'var(--muted-2)' : '#04140c',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        fontSize: 11,
                        letterSpacing: '.06em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {isDraft ? 'draft' : 'live'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{date}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => startEdit(post)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          border: '1px solid var(--line-strong)',
                          background: 'var(--surface)',
                          color: 'var(--ink)',
                          fontFamily: 'monospace',
                          fontWeight: 500,
                          fontSize: 11.5,
                          cursor: 'pointer',
                          transition: 'border-color .2s, background .2s',
                          WebkitAppearance: 'none',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--line-strong)')}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          border: '1px solid var(--line-strong)',
                          background: 'var(--surface)',
                          color: 'var(--muted)',
                          fontFamily: 'monospace',
                          fontWeight: 500,
                          fontSize: 11.5,
                          cursor: 'pointer',
                          transition: 'border-color .2s, color .2s',
                          WebkitAppearance: 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--danger)';
                          e.currentTarget.style.color = 'var(--danger)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--line-strong)';
                          e.currentTarget.style.color = 'var(--muted)';
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {publishedMap.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--muted)' }}>
                  No posts yet. Click <b>+ New post</b> or seed the DB.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <BlogForm
          key={editing._id?.toString() ?? 'new'}
          post={editing}
          onCancel={cancelEdit}
          saving={saving}
          revision={saved ? 'saved' : 'updated'}
          coverPreview={coverPreview}
          setCoverPreview={setCoverPreview}
          onLocalPersist={persist}
        />
      )}
    </div>
  );
}

function BlogForm({
  post,
  onCancel,
  saving,
  revision,
  coverPreview,
  setCoverPreview,
  onLocalPersist,
}: {
  post: Record<string, unknown>;
  onCancel: () => void;
  saving: boolean;
  revision: 'saved' | 'updated';
  coverPreview: string | null;
  setCoverPreview: (url: string | null) => void;
  onLocalPersist: (body: Record<string, unknown>) => Promise<void>;
}) {
  const [title, setTitle] = useState(String(post.title ?? ''));
  const [slugInput, setSlugInput] = useState(String(post.slug ?? ''));
  const [excerpt, setExcerpt] = useState(String(post.excerpt ?? ''));
  const [content, setContent] = useState(String(post.content ?? ''));
  const [tags, setTags] = useState<string[]>(post.tags as string[]);
  const [published, setPublished] = useState(Boolean(post.published));
  const [publishedAt] = useState(() =>
    post.publishedAt ? new Date(post.publishedAt as string).toISOString().slice(0, 16) : '',
  );

  const slug = slugInput.trim() || title.trim() ? slugFromTitle(title) : '';

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setTitle(next);
    if (!slugInput.trim()) {
      setSlugInput(slugFromTitle(next));
    }
  };

  const handleSlugInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setSlugInput(next);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    // `persist` picks PUT vs POST from `_id`, so it must be echoed back when
    // an existing post is being edited — otherwise every save creates a new one.
    const payload = {
      ...(post._id ? { _id: post._id } : {}),
      title,
      slug: slug || undefined,
      excerpt,
      content,
      coverImage: coverPreview,
      tags,
      published,
      publishedAt: published ? publishedAt : undefined,
    } as Record<string, unknown>;
    await onLocalPersist(payload);
  }

  return (
    <form
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: 24,
        borderRadius: 14,
        border: '1px solid var(--line)',
        background: 'var(--surface)',
      }}
      onSubmit={submit}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="How I optimised this portfolio for Lighthouse"
          style={{ ...inputStyle, fontSize: 14 }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
            Slug <span style={{ color: 'var(--muted-2)' }}>(auto from title)</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={handleSlugInput}
            placeholder="how-i-optimised-this-portfolio-for-lighthouse"
            style={{ ...inputStyle, color: 'var(--accent)' }}
          />
          <p style={{ margin: 0, fontSize: 11, color: 'var(--muted-2)' }}>
            Leave blank and it generates from the title. Used in <b>/blog/{slug}</b>.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
            Reading time
          </label>
          <div
            style={{
              ...inputStyle,
              cursor: 'default',
              background: 'var(--bg-2)',
              color: 'var(--muted)',
            }}
          >
            {content
              ? Math.ceil(content.trim().split(/\s+/).length / 200)
              : '—'}{' '}
            min read
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
          Excerpt
        </label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          placeholder="One or two sentences that show up in the blog list…"
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
          Cover image
        </label>
        <FileUpload name="blogCover" recordType="BlogPost" value={coverPreview ?? ''} onChange={setCoverPreview} />
        {coverPreview && (
          <img
            src={coverPreview}
            alt="Cover preview"
            style={{
              marginTop: 8,
              width: 120,
              height: 80,
              borderRadius: 10,
              border: '1px solid var(--line-strong)',
              objectFit: 'cover',
            }}
          />
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
          Markdown content *
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={24}
          placeholder={'# Heading\n\nParagraphs, **bold**, `code`, lists, quotes…\n\n```js\nconsole.log("markdown")\n```\n\n- Bullet\n- Points'}
          style={{
            ...inputStyle,
            resize: 'vertical',
            fontFamily: 'ui-monospace, SF Mono, Menlo, Consolas, monospace',
            fontSize: 13,
            lineHeight: 1.7,
          }}
        />
        <p style={{ margin: 0, fontSize: 11, color: 'var(--muted-2)' }}>
          Use <b>#</b>, <b>-</b>, <b>`code`</b>, <b>```js</b> blocks. The public
          blog renders it with `react-markdown`.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
          Tags
        </label>
        <input
          type="text"
          value={tags.join(', ')}
          onChange={(e) => setTags(e.target.value.split(',').map((t) => t.trim()).filter(Boolean))}
          placeholder="WebGL, Performance, Next.js"
          style={{ ...inputStyle, fontSize: 13 }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            style={{ width: 17, height: 17, accentColor: 'var(--accent)' }}
          />
          Publish <span style={{ color: 'var(--muted-2)', fontSize: 12 }}>(visible on /blog)</span>
        </label>
        {publishedAt && published && (
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => {}}
            style={{ ...inputStyle, cursor: 'default' }}
          />
        )}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '12px 20px',
            borderRadius: 10,
            border: '1px solid var(--line-strong)',
            background: 'var(--surface)',
            color: 'var(--ink)',
            fontFamily: 'monospace',
            fontWeight: 600,
            fontSize: 13.5,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'background .2s, border-color .2s, color .2s, transform .2s',
            WebkitAppearance: 'none',
          }}
          onMouseEnter={(e) => {
            if (saving) return;
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = '#04140c';
            e.currentTarget.style.background = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--line-strong)';
            e.currentTarget.style.color = 'var(--ink)';
            e.currentTarget.style.background = 'var(--surface)';
          }}
          onMouseDown={(e) => {
            if (saving) return;
            e.currentTarget.style.transform = 'translateY(1px)';
          }}
          onMouseUp={(e) => {
            if (saving) return;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {saving ? 'Saving…' : 'Save post'}
        </button>
        {revision === 'saved' && (
          <span
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              background: 'rgba(100,245,176,.12)',
              border: '1px solid var(--accent)',
              color: 'var(--accent)',
              fontFamily: 'monospace',
              fontSize: 12,
              letterSpacing: '.04em',
            }}
          >
            ✓ Saved
          </span>
        )}
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '12px 18px',
            borderRadius: 10,
            border: '1px solid var(--line-strong)',
            background: 'transparent',
            color: 'var(--muted)',
            fontFamily: 'monospace',
            fontWeight: 500,
            fontSize: 13.5,
            cursor: 'pointer',
            transition: 'color .2s, border-color .2s',
            WebkitAppearance: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--ink)';
            e.currentTarget.style.borderColor = 'var(--line)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--muted)';
            e.currentTarget.style.borderColor = 'var(--line-strong)';
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function slugFromTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 13px',
  borderRadius: 10,
  border: '1px solid var(--line-strong)',
  background: 'var(--bg-2)',
  color: 'var(--ink)',
  fontFamily: 'monospace',
  fontSize: 13.5,
  outline: 'none',
  transition: 'border-color .2s, box-shadow .2s',
};
