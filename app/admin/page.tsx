'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * `/admin` — the dashboard.
 *
 * This route did not exist: the admin nav linked to `/admin`, so the first link
 * in the CMS was a 404. It now shows real counts per collection, a draft
 * shortcut, recent admin activity from the audit trail, and keyboard shortcuts.
 */

type Stat = {
  key: string;
  label: string;
  total: number;
  published: number;
  drafts: number;
  hasPublished: boolean;
  publicPath: string;
};

type Activity = {
  id: string;
  action: string;
  resource: string;
  recordId?: string;
  label: string;
  actor: string;
  createdAt: string | null;
};

const HREF: Record<string, string> = {
  blog: '/admin/blog',
  projects: '/admin/projects',
  experience: '/admin/experience',
  stack: '/admin/stack',
};

export default function AdminDashboard() {
  const [resources, setResources] = useState<Stat[]>([]);
  const [recent, setRecent] = useState<Activity[]>([]);
  const [totals, setTotals] = useState({ records: 0, drafts: 0, published: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/stats', { cache: 'no-store' });
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok || body?.ok === false) {
          setError(body?.message ?? body?.error ?? `Failed (${res.status}).`);
          return;
        }
        setResources(body.data.resources ?? []);
        setRecent(body.data.recent ?? []);
        setTotals(body.data.totals ?? { records: 0, drafts: 0, published: 0 });
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Network error.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div className="adm-row">
        <div>
          <h1 className="adm-h">Dashboard</h1>
          <p className="adm-sub" style={{ marginBottom: 0 }}>
            Content at a glance, straight from the database.
          </p>
        </div>
        <div className="adm-actions">
          <a className="adm-btn" href="/" target="_blank" rel="noreferrer noopener">
            View site ↗
          </a>
        </div>
      </div>

      {error ? (
        <div className="adm-card" style={{ borderColor: 'rgba(255,107,122,.4)', marginBottom: 20 }}>
          <p className="adm-err" role="alert" style={{ margin: 0 }}>
            {error}
          </p>
        </div>
      ) : null}

      <div className="adm-stats">
        <div className="adm-stat">
          <div className="adm-stat-n">{loading ? '—' : totals.records}</div>
          <div className="adm-stat-l">Total records</div>
        </div>
        <div className="adm-stat adm-stat--live">
          <div className="adm-stat-n">{loading ? '—' : totals.published}</div>
          <div className="adm-stat-l">Published</div>
        </div>
        <div className="adm-stat adm-stat--draft">
          <div className="adm-stat-n">{loading ? '—' : totals.drafts}</div>
          <div className="adm-stat-l">Drafts</div>
        </div>
      </div>

      {resources.map((r) => (
        <div key={r.key} style={{ marginBottom: 22 }}>
          <div className="adm-row" style={{ marginBottom: 10 }}>
            <h2 className="adm-h" style={{ fontSize: 16, margin: 0 }}>
              {r.label}
            </h2>
            <div className="adm-actions">
              {r.hasPublished && r.drafts > 0 ? (
                <Link className="adm-btn adm-btn-sm" href={`${HREF[r.key]}?status=draft`}>
                  {r.drafts} draft{r.drafts === 1 ? '' : 's'}
                </Link>
              ) : null}
              <Link className="adm-btn adm-btn-sm adm-btn-primary" href={HREF[r.key]}>
                Manage
              </Link>
            </div>
          </div>
          <div className="adm-stats" style={{ marginBottom: 0 }}>
            <div className="adm-stat">
              <div className="adm-stat-n">{loading ? '—' : r.total}</div>
              <div className="adm-stat-l">{r.label}</div>
            </div>
            {r.hasPublished ? (
              <>
                <div className="adm-stat adm-stat--live">
                  <div className="adm-stat-n">{loading ? '—' : r.published}</div>
                  <div className="adm-stat-l">Live</div>
                </div>
                <div className="adm-stat adm-stat--draft">
                  <div className="adm-stat-n">{loading ? '—' : r.drafts}</div>
                  <div className="adm-stat-l">Drafts</div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 30 }}>
        <h2 className="adm-h" style={{ fontSize: 16 }}>
          Recent activity
        </h2>
        <div className="adm-card" style={{ marginTop: 10 }}>
          {recent.length === 0 ? (
            <p className="adm-hint" style={{ margin: 0 }}>
              No edits recorded yet. Changes appear here as soon as you save
              something.
            </p>
          ) : (
            <div className="adm-reflist">
              {recent.map((a) => (
                <div className="adm-refrow" key={a.id}>
                  <span className="adm-reftime">
                    {a.createdAt
                      ? new Date(a.createdAt).toLocaleString('en-GB', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })
                      : '—'}
                  </span>
                  <span className="adm-reflabel">{a.label || a.recordId || '—'}</span>
                  <span className="adm-refact">{a.action}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 30 }}>
        <h2 className="adm-h" style={{ fontSize: 16 }}>
          Keyboard shortcuts
        </h2>
        <div className="adm-card" style={{ marginTop: 10 }}>
          <div className="adm-reflist">
            <div className="adm-refrow">
              <span className="adm-reftime">
                <span className="adm-kbd">/</span>
              </span>
              <span className="adm-reflabel">Jump to the search box on any list</span>
            </div>
            <div className="adm-refrow">
              <span className="adm-reftime">
                <span className="adm-kbd">n</span>
              </span>
              <span className="adm-reflabel">Start a new record</span>
            </div>
            <div className="adm-refrow">
              <span className="adm-reftime">
                <span className="adm-kbd">Esc</span>
              </span>
              <span className="adm-reflabel">Close the open dialog</span>
            </div>
            <div className="adm-refrow">
              <span className="adm-reftime">
                <span className="adm-kbd">Tab</span>
              </span>
              <span className="adm-reflabel">Move through every control; focus is never trapped outside a dialog</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
