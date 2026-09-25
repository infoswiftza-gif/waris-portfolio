'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FileUpload } from '@/components/FileUpload';
import { PREVIEW_VARIANTS } from '@/lib/cms/preview';

/**
 * /admin/projects
 *
 * Server-rendered shell that owns the two CRUD flows the admin needs:
 *  - /api/projects  (GET/POST/PUT/DELETE)
 *  - /api/upload    (Vercel Blob)
 *
 * Editing is a controlled form that submits to PUT /api/projects/[id] on save,
 * so the same component renders the "add" and "edit" states. Login is handled
 * by /admin/login via the Credentials provider.
 */
type Props = {};

const ORDER_HINT = '1 · 2 · 3 … (lower = appears first)';

export default function AdminProjectsPage({}: Props) {
  const [list, setList] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load the full project list (published + drafts) on mount.
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
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

  async function persist(payload: Record<string, unknown>, id?: string) {
    setSaving(true);
    try {
      const method = id ? 'PUT' : 'POST';
      const url = id ? `/api/projects/${id}` : '/api/projects';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(`Save failed: ${body.message || body.error || `status ${res.status}`}.`);
        return;
      }

      resetSaved();
      setEditing(null);
      await load();
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
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

  function startEdit(project: Record<string, unknown>) {
    setEditing({ ...project });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditing(null);
  }

  async function save(payload: Record<string, unknown>) {
    if (!editingId) return;
    await persist(payload, editingId);
  }

  const editingId = editing?._id?.toString() ?? null;

  const getStr = (obj: Record<string, unknown>, key: string, fallback: string | number = '') =>
    String(obj[key] ?? fallback);

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
        Loading projects…
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
            flexDirection: 'column',
            gap: 8,
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
            Projects
          </h2>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>
            {list.length} project{list.length !== 1 ? 's' : ''} · order
            ascending · drafts hide from the public.
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
            + Add project
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
              {['', 'title', 'card label', 'preview', 'live URL', 'order', 'published', 'actions'].map((h) => (
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
            {list.map((project) => {
              const title = getStr(project, 'title');
              const category = getStr(project, 'category');
              const visual = getStr(project, 'visual', 'default');
              const liveUrl = getStr(project, 'liveUrl');
              const order = getStr(project, 'order', 0);
              const published = !!project.published;
              const id = project._id?.toString() ?? '';

              return (
                <tr
                  key={id}
                  style={{
                    borderBottom: '1px solid var(--line)',
                    background: published ? 'rgba(100,245,176,.03)' : 'rgba(255,210,122,.02)',
                    transition: 'background .2s',
                  }}
                >
                  <td style={{ padding: '12px 16px', color: 'var(--muted-2)' }}>{id.slice(0, 8)}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--ink)' }}>
                    {title || '—'}
                  </td>
                  <td
                    style={{
                      padding: '12px 16px',
                      color: 'var(--muted)',
                      fontSize: 11.5,
                      letterSpacing: '.06em',
                      maxWidth: 200,
                    }}
                  >
                    {category || '—'}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted-2)', fontSize: 11.5 }}>
                    {visual}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--accent)' }}>
                    {liveUrl ? <a href={liveUrl} target="_blank" rel="noopener">{liveUrl}</a> : '—'}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{order || '—'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '3px 9px',
                        borderRadius: 999,
                        background: published ? 'var(--accent)' : 'var(--line-strong)',
                        color: published ? '#04140c' : 'var(--muted-2)',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        fontSize: 11,
                        letterSpacing: '.06em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {published ? 'live' : 'draft'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => startEdit(project)}
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
            {list.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--muted)' }}>
                  No projects yet. Click <b>+ Add project</b> or seed the DB.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <Form
          key={editingId}
          initial={editing}
          onSave={save}
          onCancel={cancelEdit}
          saving={saving}
          revision={saved ? 'saved' : 'updated'}
        />
      )}
    </div>
  );
}

function Form({
  initial,
  onSave,
  onCancel,
  saving,
  revision,
}: {
  initial: Record<string, unknown>;
  onSave: (payload: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
  revision: 'saved' | 'updated';
}) {
  const [form, setForm] = useState<Record<string, unknown>>(() => {
    const empty: Record<string, unknown> = {
      title: initial.title ?? '',
      category: initial.category ?? '',
      visual: PREVIEW_VARIANTS.includes(initial.visual as never) ? initial.visual : 'default',
      description: initial.description ?? '',
      liveUrl: initial.liveUrl ?? '',
      caseStudyUrl: initial.caseStudyUrl ?? '',
      sourceUrl: initial.sourceUrl ?? '',
      tags: Array.isArray(initial.tags) ? initial.tags.map(String) : [],
      order: typeof initial.order === 'number' ? initial.order : 0,
      published: !!initial.published,
    };
    return empty;
  });

  const [title, setTitle] = useState(String(form.title ?? ''));
  const [category, setCategory] = useState(String(form.category ?? ''));
  const [visual, setVisual] = useState(String(form.visual ?? 'default'));
  const [description, setDescription] = useState(String(form.description ?? ''));
  const [liveUrl, setLiveUrl] = useState(String(form.liveUrl ?? ''));
  const [caseStudyUrl, setCaseStudyUrl] = useState(String(form.caseStudyUrl ?? ''));
  const [sourceUrl, setSourceUrl] = useState(String(form.sourceUrl ?? ''));
  const [tags, setTags] = useState<string[]>(form.tags as string[]);
  const [order, setOrder] = useState(String(form.order ?? 0));
  const [published, setPublished] = useState(Boolean(form.published));

  const slug =
    title.trim() &&
    ((form.slug as string) ||
      title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, ''));

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title,
      slug: slug || undefined,
      category: category.trim() || undefined,
      visual,
      description,
      liveUrl: liveUrl.trim() || undefined,
      caseStudyUrl: caseStudyUrl.trim() || undefined,
      sourceUrl: sourceUrl.trim() || undefined,
      tags,
      order: order ? Number(order) : undefined,
      published,
    } as Record<string, unknown>;
    await onSave(payload);
  }

  return (
    <form
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: 22,
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
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Project name"
          style={inputStyle}
          autoFocus
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
          Slug <span style={{ color: 'var(--muted-2)' }}>(auto from title if blank)</span>
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => set('slug', e.target.value)}
          placeholder="my-project"
          style={{ ...inputStyle, color: 'var(--accent)' }}
          title="Leave blank to auto-generate from the title."
        />
        <p style={{ margin: 0, fontSize: 11, color: 'var(--muted-2)' }}>
          Used in the public URL, e.g. <b>/projects/my-project</b>.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
            Card label
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="LUXURY WATCH COMMERCE PLATFORM"
            style={inputStyle}
          />
          <p style={{ margin: 0, fontSize: 11, color: 'var(--muted-2)' }}>
            Small uppercase line above the title on the home + projects cards.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
            Preview style
          </label>
          <select
            value={visual}
            onChange={(e) => setVisual(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer', fontFamily: 'monospace', fontSize: 13.5 }}
          >
            {PREVIEW_VARIANTS.map((variant) => (
              <option key={variant} value={variant}>
                {variant}
              </option>
            ))}
          </select>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--muted-2)' }}>
            Which decorative card mockup to draw. <b>default</b> suits anything new.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="What was built, for whom, and why."
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
            Live URL
          </label>
          <input
            type="url"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            placeholder="https://swiftza.store"
            style={inputStyle}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
            Image (project banner)
          </label>
          <FileUpload name="projectImage" recordType="Project" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
            Case study URL
          </label>
          <input
            type="url"
            value={caseStudyUrl}
            onChange={(e) => setCaseStudyUrl(e.target.value)}
            placeholder="https://…"
            style={inputStyle}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
            Source URL
          </label>
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://github.com/…"
            style={inputStyle}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
            Order
          </label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            placeholder="1"
            style={inputStyle}
          />
          <p style={{ margin: 0, fontSize: 11, color: 'var(--muted-2)' }}>{ORDER_HINT}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
          Tags
        </label>
        <input
          type="text"
          value={tags.join(', ')}
          onChange={(e) => setTags(e.target.value.split(',').map((t) => t.trim()).filter(Boolean))}
          placeholder="Next.js, SaaS, Design"
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
          Published <span style={{ color: 'var(--muted-2)', fontSize: 12 }}>(live on the public site)</span>
        </label>
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
          {saving ? 'Saving…' : 'Save project'}
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
