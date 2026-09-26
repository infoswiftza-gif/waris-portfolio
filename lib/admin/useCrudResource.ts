'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Data layer for every admin CRUD screen.
 *
 * The four hand-written pages each had their own copy of this logic, and all
 * four shared the same two bugs:
 *
 *  1. `save()` started with `if (!editingId) return;`, so creating a new record
 *     did nothing at all. The POST branches in the API were dead code.
 *  2. `resetSaved()` set the confirmation flag to `false` and never to `true`,
 *     so even a successful edit gave the user no feedback.
 *
 * Both are structurally impossible now: create and update are separate
 * explicit methods, and every outcome reports through a caller-supplied
 * `announce()` (wired to the toast) instead of a flag nothing reads.
 */

export type CrudRow = Record<string, unknown> & { _id?: string };

export type ListMeta = {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type FieldErrors = Record<string, string[] | undefined>;

export type CrudError = {
  /** Envelope `error` code: `VALIDATION`, `UNIQUE`, `SERVER_ERROR`, … */
  code: string;
  message: string;
  fields?: FieldErrors;
};

const DEFAULT_PAGE_SIZE = 20;

type Options = {
  resource: string;
  /** `announce(message, kind)` is called after every mutation. */
  announce: (message: string, kind?: 'ok' | 'err') => void;
  pageSize?: number;
};

export function useCrudResource({ resource, announce, pageSize = DEFAULT_PAGE_SIZE }: Options) {
  const [rows, setRows] = useState<CrudRow[]>([]);
  const [meta, setMeta] = useState<ListMeta>({
    total: 0,
    page: 1,
    pageSize,
    hasMore: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<CrudError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  /** Debounced so typing does not fire a request per keystroke. */
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [sort, setSort] = useState<string>('');
  const [dir, setDir] = useState<'asc' | 'desc'>('asc');

  /**
   * Guards against a slow earlier response overwriting a newer one. Without
   * this, clearing the search box can leave the old, longer list on screen if
   * that request happens to resolve second.
   */
  const requestId = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      // A new search term means the old page number is meaningless.
      setPage(1);
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (status !== 'all') params.set('status', status);
    if (sort) {
      params.set('sort', sort);
      params.set('dir', dir);
    }

    try {
      const res = await fetch(`/api/${resource}?${params.toString()}`, { cache: 'no-store' });
      const body = await res.json();
      if (id !== requestId.current) return;

      if (!res.ok || body?.ok === false) {
        setError(toCrudError(body, res.status));
        setRows([]);
        return;
      }
      setRows(Array.isArray(body.data) ? body.data : []);
      setMeta(body.meta ?? { total: 0, page, pageSize, hasMore: false });
    } catch (err) {
      if (id !== requestId.current) return;
      setError({
        code: 'NETWORK',
        message: err instanceof Error ? err.message : 'Could not reach the server.',
      });
    } finally {
      if (id === requestId.current && mounted.current) setLoading(false);
    }
  }, [resource, page, pageSize, debouncedSearch, status, sort, dir]);

  useEffect(() => {
    void load();
  }, [load]);

  /** Parse the API's `{ ok:false, error, fields }` envelope into one shape. */
  const toCrudError = (body: any, status: number): CrudError => {
    const code = typeof body?.error === 'string' ? body.error : `HTTP_${status}`;
    const message =
      (typeof body?.message === 'string' && body.message) ||
      (typeof body?.error === 'string' && body.error) ||
      `Request failed (${status}).`;
    return { code, message, fields: body?.fields };
  };

  const resetErrors = () => {
    setError(null);
    setFieldErrors({});
  };

  const report = (err: CrudError) => {
    setError(err);
    if (err.fields) setFieldErrors(err.fields);
    announce(err.message, 'err');
  };

  /**
   * Create a record.
   *
   * On success the new row is inserted into the current page immediately (no
   * refetch round trip) and the caller's form is reset, so a "save and add
   * another" flow stays fast.
   */
  const create = useCallback(
    async (payload: Record<string, unknown>): Promise<CrudRow | null> => {
      setSaving(true);
      resetErrors();
      try {
        const res = await fetch(`/api/${resource}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const body = await res.json();
        if (!res.ok || body?.ok === false) {
          report(toCrudError(body, res.status));
          return null;
        }
        const saved = body.data as CrudRow;
        setRows((prev) => [saved, ...prev]);
        setMeta((m) => ({ ...m, total: m.total + 1 }));
        announce(`${labelFor(resource)} created.`);
        return saved;
      } catch (err) {
        report({
          code: 'NETWORK',
          message: err instanceof Error ? err.message : 'Could not reach the server.',
        });
        return null;
      } finally {
        if (mounted.current) setSaving(false);
      }
    },
    [resource, announce],
  );

  /**
   * Update a record, optimistically.
   *
   * The row is patched in place first so the table reflects the save
   * immediately; if the request fails the previous value is put back and the
   * failure is reported. Without the rollback, a failed save would leave the UI
   * claiming a change that never landed in the database.
   */
  const update = useCallback(
    async (id: string, payload: Record<string, unknown>): Promise<CrudRow | null> => {
      if (!id) {
        report({ code: 'BAD_REQUEST', message: 'Cannot update a record without an id.' });
        return null;
      }
      setSaving(true);
      resetErrors();

      const previous = rows.find((r) => String(r._id) === id) ?? null;
      setRows((prev) => prev.map((r) => (String(r._id) === id ? { ...r, ...payload } : r)));

      try {
        const res = await fetch(`/api/${resource}/${id}`, {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const body = await res.json();
        if (!res.ok || body?.ok === false) {
          setRows((prev) =>
            previous ? prev.map((r) => (String(r._id) === id ? previous : r)) : prev,
          );
          report(toCrudError(body, res.status));
          return null;
        }
        const saved = body.data as CrudRow;
        setRows((prev) => prev.map((r) => (String(r._id) === id ? saved : r)));
        announce(`${labelFor(resource)} saved.`);
        return saved;
      } catch (err) {
        setRows((prev) =>
          previous ? prev.map((r) => (String(r._id) === id ? previous : r)) : prev,
        );
        report({
          code: 'NETWORK',
          message: err instanceof Error ? err.message : 'Could not reach the server.',
        });
        return null;
      } finally {
        if (mounted.current) setSaving(false);
      }
    },
    [resource, rows, announce],
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      if (!id) return false;
      setSaving(true);
      resetErrors();
      const snapshot = rows;
      setRows((prev) => prev.filter((r) => String(r._id) !== id));
      setMeta((m) => ({ ...m, total: Math.max(0, m.total - 1) }));

      try {
        const res = await fetch(`/api/${resource}/${id}`, { method: 'DELETE' });
        const body = await res.json();
        if (!res.ok || body?.ok === false) {
          setRows(snapshot);
          setMeta((m) => ({ ...m, total: snapshot.length }));
          report(toCrudError(body, res.status));
          return false;
        }
        announce(`${labelFor(resource)} deleted.`);
        return true;
      } catch (err) {
        setRows(snapshot);
        report({
          code: 'NETWORK',
          message: err instanceof Error ? err.message : 'Could not reach the server.',
        });
        return false;
      } finally {
        if (mounted.current) setSaving(false);
      }
    },
    [resource, rows, announce],
  );

  /** Bulk delete / publish / unpublish. Reports how many ids actually applied. */
  const bulk = useCallback(
    async (ids: string[], action: 'delete' | 'publish' | 'unpublish'): Promise<boolean> => {
      if (!ids.length) return false;
      setSaving(true);
      resetErrors();
      try {
        const res = await fetch(`/api/${resource}/bulk`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ids, action }),
        });
        const body = await res.json();
        if (!res.ok || body?.ok === false) {
          report(toCrudError(body, res.status));
          return false;
        }
        const applied = Number(body?.data?.applied ?? 0);
        const missing = Array.isArray(body?.data?.missing) ? body.data.missing.length : 0;
        const affected = new Set(ids);

        if (action === 'delete') {
          setRows((prev) => prev.filter((r) => !affected.has(String(r._id))));
        } else {
          const published = action === 'publish';
          setRows((prev) => prev.map((r) => (affected.has(String(r._id)) ? { ...r, published } : r)));
        }
        setMeta((m) => ({
          ...m,
          total: action === 'delete' ? Math.max(0, m.total - applied) : m.total,
        }));

        announce(
          missing
            ? `${applied} updated, ${missing} no longer existed.`
            : `${applied} ${action === 'delete' ? 'deleted' : action === 'publish' ? 'published' : 'unpublished'}.`,
        );
        return true;
      } catch (err) {
        report({
          code: 'NETWORK',
          message: err instanceof Error ? err.message : 'Could not reach the server.',
        });
        return false;
      } finally {
        if (mounted.current) setSaving(false);
      }
    },
    [resource, announce],
  );

  /** Cycle the sort column/direction when a table header is clicked. */
  const toggleSort = useCallback(
    (key: string) => {
      if (sort === key) {
        setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSort(key);
        setDir('asc');
      }
      setPage(1);
    },
    [sort],
  );

  /** Changing the sort column from the toolbar always restarts at ascending. */
  const setSortField = useCallback((key: string) => {
    setSort(key);
    setDir('asc');
    setPage(1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.pageSize));

  return useMemo(
    () => ({
      rows,
      meta,
      loading,
      saving,
      error,
      fieldErrors,
      page,
      totalPages,
      search,
      status,
      sort,
      dir,
      setPage,
      setSearch,
      setStatus,
      setSort,
      setDir,
      setSortField,
      reload: load,
      create,
      update,
      remove,
      bulk,
      toggleSort,
      resetErrors,
    }),
    [
      rows, meta, loading, saving, error, fieldErrors, page, totalPages, search, status, sort, dir,
      load, create, update, remove, bulk, toggleSort, setSortField,
    ],
  );
}

const LABELS: Record<string, string> = {
  blog: 'Blog post',
  projects: 'Project',
  experience: 'Experience entry',
  stack: 'Stack item',
};

function labelFor(resource: string) {
  return LABELS[resource] ?? 'Record';
}
