'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * /admin/experience
 *
 * Timeline CRUD for the `/experience` public page. Rows are ordered by the
 * `order` field (lower = appears earlier).
 */

type Props = {};

const ORDER_HINT = '1 · 2 · 3 … (lower = appears earlier)';

export default function AdminExperiencePage({}: Props) {
  const [list, setList] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/experience');
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
      const url = id ? `/api/experience/${id}` : '/api/experience';
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
    if (!confirm('Delete this experience entry? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/experience/${id}`, { method: 'DELETE' });
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

  function startEdit(entry: Record<string, unknown>) {
    setEditing({ ...entry });
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
  const toStr = (obj: Record<string, unknown>, key: string, fallback: string | number = '') => String(obj[key] ?? fallback);

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
        Loading experience…
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
            Experience timeline
          </h2>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>
            {list.length} entry{list.length !== 1 ? 's' : ''} · ordered by `order` ascending.
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
            + Add entry
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
              {['', 'year', 'title', 'description', 'order', 'actions'].map((h) => (
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
            {list.map((entry) => {
              const id = entry._id?.toString() ?? '';
              const year = toStr(entry, 'year', 0);
              const title = toStr(entry, 'title');
              const desc = toStr(entry, 'description', '').slice(0, 90) + (toStr(entry, 'description').length > 90 ? '…' : '');

              return (
                <tr
                  key={id}
                  style={{
                    borderBottom: '1px solid var(--line)',
                    transition: 'background .2s',
                  }}
                >
                  <td style={{ padding: '12px 16px', color: 'var(--muted-2)' }}>{id.slice(0, 8)}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--accent)' }}>{year || '—'}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--ink)' }}>{title || '—'}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)', maxWidth: 340, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {desc || '—'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--muted)' }}>{toStr(entry, 'order', 0) || '—'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => startEdit(entry)}
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
                <td colSpan={6} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--muted)' }}>
                  No experience entries yet. Click <b>+ Add entry</b> or seed the DB.
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
  const [form, setForm] = useState<Record<string, unknown>>(() => ({
    year: typeof initial.year === 'number' ? initial.year : 2026,
    title: initial.title ?? '',
    description: initial.description ?? '',
    tags: Array.isArray(initial.tags) ? initial.tags.map(String) : [],
    order: typeof initial.order === 'number' ? initial.order : 0,
  }));

  const [year, setYear] = useState(String(form.year));
  const [title, setTitle] = useState(String(form.title));
  const [description, setDescription] = useState(String(form.description));
  const [tags, setTags] = useState<string[]>(form.tags as string[]);
  const [order, setOrder] = useState(String(form.order ?? 0));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      year: Number(year),
      title,
      description,
      tags,
      order: order ? Number(order) : 0,
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
            Year *
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2026"
            style={inputStyle}
            autoFocus
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
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Full-stack developer"
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="What you did, the systems you used, the outcomes."
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
          Tags
        </label>
        <input
          type="text"
          value={tags.join(', ')}
          onChange={(e) => setTags(e.target.value.split(',').map((t) => t.trim()).filter(Boolean))}
          placeholder="TypeScript, Next.js, PostgreSQL"
          style={{ ...inputStyle, fontSize: 13 }}
        />
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
          {saving ? 'Saving…' : 'Save entry'}
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
