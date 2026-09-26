'use client';

import { useCallback, useEffect, useState } from 'react';

import { useToast } from '../_components/Toast';

/**
 * Audit log.
 *
 * Every create / update / delete / bulk action writes a row to `audit_log`
 * (see `lib/cms/audit.ts`), and this page is where that trail is read back. It
 * answers the question the old CMS could not: who changed this, when, and what
 * did the document look like before.
 */

type Entry = {
  id: string;
  action: string;
  resource: string;
  recordId: string;
  label: string;
  actor: string;
  createdAt: string | null;
};

const RESOURCES = ['', 'blog', 'projects', 'experience', 'stack'];

const ACTION_TONE: Record<string, string> = {
  create: 'adm-badge-live',
  update: '',
  delete: 'adm-badge-draft',
  bulk: '',
};

export default function AuditPage() {
  const toast = useToast();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [resource, setResource] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 20, hasMore: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' });
      if (resource) params.set('resource', resource);
      const res = await fetch(`/api/admin/audit?${params}`, { cache: 'no-store' });
      const body = await res.json();
      if (!res.ok || body?.ok === false) {
        setError(body?.message ?? body?.error ?? `Failed (${res.status}).`);
        return;
      }
      setEntries(body.data ?? []);
      setMeta(body.meta ?? { total: 0, page, pageSize: 20, hasMore: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error.');
    } finally {
      setLoading(false);
    }
  }, [page, resource]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <div className="adm-row">
        <div>
          <h1 className="adm-h">Audit log</h1>
          <p className="adm-sub" style={{ marginBottom: 0 }}>
            Every content change, newest first. Written automatically on save.
          </p>
        </div>
        <div className="adm-actions">
          <button type="button" className="adm-btn" onClick={() => void load()}>
            Refresh
          </button>
        </div>
      </div>

      <div className="adm-toolbar">
        <label className="adm-sr" htmlFor="audit-resource">
          Filter by collection
        </label>
        <select
          id="audit-resource"
          className="adm-select"
          style={{ width: 'auto' }}
          value={resource}
          onChange={(e) => {
            setResource(e.target.value);
            setPage(1);
          }}
        >
          {RESOURCES.map((r) => (
            <option key={r || 'all'} value={r}>
              {r === '' ? 'All collections' : r}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <div className="adm-card" style={{ borderColor: 'rgba(255,107,122,.4)', marginBottom: 14 }}>
          <p className="adm-err" role="alert" style={{ margin: 0 }}>
            {error}
          </p>
        </div>
      ) : null}

      <div className="adm-tablewrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th style={{ width: 150 }}>When</th>
              <th style={{ width: 90 }}>Action</th>
              <th style={{ width: 110 }}>Collection</th>
              <th>Record</th>
              <th style={{ width: 170 }} className="adm-hide-sm">
                By
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}>
                  <div className="adm-skel" style={{ width: '60%' }} />
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="adm-empty">
                    {meta.total === 0
                      ? 'No activity recorded yet. Edits will show up here.'
                      : 'Nothing on this page.'}
                  </div>
                </td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr
                  key={e.id}
                  onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="adm-td-mono">
                    {e.createdAt
                      ? new Date(e.createdAt).toLocaleString('en-GB', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })
                      : '—'}
                  </td>
                  <td>
                    <span className={`adm-badge ${ACTION_TONE[e.action] ?? ''}`}>{e.action}</span>
                  </td>
                  <td className="adm-td-mono">{e.resource}</td>
                  <td className="adm-td-title">{e.label || e.recordId || '—'}</td>
                  <td className="adm-td-mono adm-hide-sm">{e.actor || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {expanded ? (
        <p className="adm-hint" style={{ marginTop: 10 }}>
          Record id <code>{entries.find((e) => e.id === expanded)?.recordId || '—'}</code>
        </p>
      ) : null}

      <div className="adm-pager">
        <span>
          {meta.total === 0 ? 'No entries' : `${meta.total} entries`}
          {meta.total > 20 ? ` · page ${meta.page}` : ''}
        </span>
        <div className="adm-pager-btns">
          <button
            type="button"
            className="adm-btn adm-btn-sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Prev
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!meta.hasMore}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
