import type { NextRequest } from 'next/server';

import { guardAdmin } from '@/lib/admin';
import { cmsDb } from '@/prisma/db';
import { labelFor, writeAudit } from './audit';
import {
  badJson,
  fail,
  forbidden,
  invalid,
  isSameId,
  notFound,
  ok,
  okList,
  readJson,
  serverError,
  slugify,
  unique,
  unauthorized,
} from './http';
import { revalidatePublicPaths } from './revalidate';
import {
  LIST_READ_CAP,
  byId,
  matchesSearch,
  parseListQuery,
  str,
  type BulkAction,
  type ListQuery,
  type ResourceDef,
  type Row,
} from './registry';

/**
 * Turns a `ResourceDef` into the complete handler set the API routes expose.
 *
 * Every resource gets the same behaviour, which is what the four hand-written
 * modules could not guarantee:
 *  - `guardAdmin` on *every* handler, reads included. The old `handleGet()`
 *    took no request and returned drafts to anonymous callers.
 *  - a `try/catch` per handler, so a Mongo failure answers `SERVER_ERROR` in
 *    the shared envelope instead of an unhandled rejection the UI renders as
 *    an empty list.
 *  - the create path that the old admin UI could never reach: it used to bail
 *    out with `if (!editingId) return`, so POST was dead code on three of four
 *    pages.
 *  - one audit row per successful mutation.
 */

/** `db.orm` is keyed by lowercased plural contract roots, so the def's `orm` names it. */
function ormFor(db: unknown, orm: string) {
  return (db as { orm: Record<string, unknown> }).orm[orm] as {
    where: (f: Row) => any;
    orderBy?: (f: Row) => any;
    limit: (n: number) => any;
    offset?: (n: number) => any;
    all: () => Promise<Row[]>;
    first: () => Promise<Row | null>;
    create: (data: Row) => Promise<Row>;
    update: (data: Row) => Promise<Row>;
    delete: () => Promise<Row>;
  };
}

/**
 * Apply the parts of a list query the database can serve, then do the rest in
 * JS. `where` only compiles strict equality and there is no `count()`, so the
 * `published` flag is filtered in the query and everything else after it.
 */
async function readRows(def: ResourceDef, opts: { publishedOnly?: boolean; query?: ListQuery }) {
  const db = await cmsDb();
  let q = ormFor(db, def.orm);

  if (opts.publishedOnly || opts.query?.status === 'published') {
    q = q.where({ published: true });
  }

  const sortKey = opts.query?.sort;
  if (sortKey && def.sortable.includes(sortKey)) {
    q = q.orderBy({ [sortKey]: opts.query!.dir });
  }

  let rows = (await q.limit(LIST_READ_CAP).all()) as Row[];

  if (def.fallbackSort) rows = def.fallbackSort(rows);

  const query = opts.query;
  if (!query) return rows;

  // `published: false` does not match documents where the field is absent, so
  // the draft filter has to run in JS.
  if (query.status === 'draft') rows = rows.filter((r) => !r.published);
  if (query.search) rows = rows.filter((r) => matchesSearch(r, def.searchFields, query.search));

  return rows;
}

function paginate(rows: Row[], query: ListQuery) {
  const total = rows.length;
  const start = (query.page - 1) * query.pageSize;
  // `total` is reported once in `meta`; stamping it onto every row used to leak
  // `__total`/`__index` into the JSON the admin table renders.
  return {
    page: rows.slice(start, start + query.pageSize),
    meta: { total, page: query.page, pageSize: query.pageSize, hasMore: start + query.pageSize < total },
  };
}

/** Ensure a slug is unique, ignoring the document being updated. */
async function assertSlugFree(
  def: ResourceDef,
  slug: string,
  selfId: string | null,
  conflictMessage: string,
) {
  if (!def.slugField) return;
  const db = await cmsDb();
  const existing = await ormFor(db, def.orm).where({ [def.slugField]: slug }).first();
  if (existing && !isSameId(existing, selfId ?? '')) {
    return unique(conflictMessage);
  }
  return null;
}

function revalidate(def: ResourceDef, row: Row) {
  const paths = def.revalidateFor?.(row) ?? [def.publicPath, '/'];
  revalidatePublicPaths(...paths);
}

export function createResource(def: ResourceDef) {
  const conflictMessage = `A ${def.label.toLowerCase()} with this slug already exists.`;

  /** Admin list: every document, drafts included, with search + pagination. */
  async function list(req: NextRequest) {
    const { response } = await guardAdmin(req);
    if (response) return response;

    try {
      const query = parseListQuery(req, def);
      const rows = await readRows(def, { query });
      const { page, meta } = paginate(rows, query);
      return okList(page, meta);
    } catch (err) {
      return serverError(err);
    }
  }

  /**
   * Public list: published documents only, no auth. This is what
   * `/api/public/<key>` serves; the admin list above is the only place drafts
   * are readable.
   */
  async function publicList(req: NextRequest) {
    try {
      const query = parseListQuery(req, def);
      const rows = await readRows(def, { publishedOnly: true, query });
      const { page, meta } = paginate(rows, query);
      return okList(page, meta);
    } catch (err) {
      return serverError(err);
    }
  }

  /** Single record, admin only. */
  async function get(req: NextRequest, id: string) {
    const { response } = await guardAdmin(req);
    if (response) return response;

    try {
      const db = await cmsDb();
      const row = await ormFor(db, def.orm).where({ _id: id }).first();
      if (!isSameId(row, id)) return notFound();
      return ok(row);
    } catch (err) {
      return serverError(err);
    }
  }

  async function create(req: NextRequest) {
    const { session, response } = await guardAdmin(req);
    if (response) return response;

    try {
      const body = await readJson(req);
      if (body.ok === false) return body.response;

      const parsed = def.schema.safeParse(body.value);
      if (parsed.success === false) return invalid(parsed);

      const input = parsed.data as Row;
      const draft = def.toCreate(input, null);

      if (def.slugField) {
        // Resolution order: an explicit slug in the request, then whatever
        // `toCreate` derived, then a slugified title. The explicit value has to
        // win — reading only `draft[slugField]` silently discarded a slug the
        // admin typed, and made the uniqueness check below test the wrong
        // string, so two posts with the same requested slug were both accepted.
        const requested = str(input[def.slugField]);
        const derived = str(draft[def.slugField]);
        const slug =
          requested || derived || slugify(String(draft.title ?? input.title ?? ''));
        draft[def.slugField] = slug;
        const conflict = await assertSlugFree(def, slug, null, conflictMessage);
        if (conflict) return conflict;
      }

      const db = await cmsDb();
      const row = await ormFor(db, def.orm).create(draft);

      await writeAudit({
        action: 'create',
        resource: def.key,
        recordId: String(row._id ?? ''),
        label: labelFor(row, def.label),
        actor: session?.user?.email ?? '',
        after: draft,
      });

      revalidate(def, row);
      return ok(row, 201);
    } catch (err) {
      return serverError(err);
    }
  }

  async function update(req: NextRequest, id: string) {
    const { session, response } = await guardAdmin(req);
    if (response) return response;

    try {
      const body = await readJson(req);
      if (body.ok === false) return body.response;

      const parsed = def.schema.partial().safeParse(body.value);
      if (parsed.success === false) return invalid(parsed);

      const db = await cmsDb();
      const existing = await ormFor(db, def.orm).where({ _id: id }).first();
      if (!isSameId(existing, id)) return notFound();

      const patch = def.toUpdate(parsed.data as Row, existing as Row);

      if (def.slugField && patch[def.slugField]) {
        const slug = String(patch[def.slugField]).trim();
        const conflict = await assertSlugFree(def, slug, id, conflictMessage);
        if (conflict) return conflict;
      }

      const row = await ormFor(db, def.orm).where({ _id: id }).update(patch);

      await writeAudit({
        action: 'update',
        resource: def.key,
        recordId: String(row._id ?? id),
        label: labelFor(row, def.label),
        actor: session?.user?.email ?? '',
        before: pickChanged(existing as Row, patch),
        after: patch,
      });

      revalidate(def, row);
      return ok(row);
    } catch (err) {
      return serverError(err);
    }
  }

  async function remove(req: NextRequest, id: string) {
    const { session, response } = await guardAdmin(req);
    if (response) return response;

    try {
      const db = await cmsDb();
      const existing = await ormFor(db, def.orm).where({ _id: id }).first();
      if (!isSameId(existing, id)) return notFound();

      const row = await ormFor(db, def.orm).where({ _id: id }).delete();

      await writeAudit({
        action: 'delete',
        resource: def.key,
        recordId: String(id),
        label: labelFor(existing as Row, def.label),
        actor: session?.user?.email ?? '',
        before: existing as Row,
      });

      revalidate(def, row);
      return ok({ id, deleted: labelFor(existing as Row, def.label) });
    } catch (err) {
      return serverError(err);
    }
  }

  /**
   * Bulk action over many ids.
   *
   * `.where()` only compiles equality, so there is no `in([...])` to lean on and
   * the ids are applied one at a time. That is the honest option: a silently
   * partial bulk write would be worse than a handful of round trips on a
   * collection this size. `missing` reports ids that did not resolve, so the UI
   * can tell the user which rows were already gone.
   */
  async function bulk(req: NextRequest) {
    const { session, response } = await guardAdmin(req);
    if (response) return response;

    try {
      const body = await readJson(req);
      if (body.ok === false) return body.response;

      const ids = Array.isArray((body.value as Row)?.ids)
        ? ((body.value as Row).ids as unknown[]).map(String).slice(0, 200)
        : null;
      const action = (body.value as Row)?.action as BulkAction | undefined;

      if (!ids?.length) return fail('BAD_REQUEST', 400, { message: 'ids is required.' });
      if (action !== 'delete' && action !== 'publish' && action !== 'unpublish') {
        return fail('BAD_REQUEST', 400, { message: 'action must be delete, publish or unpublish.' });
      }
      if ((action === 'publish' || action === 'unpublish') && !def.hasPublished) {
        return fail('BAD_REQUEST', 400, { message: `${def.plural} are always published.` });
      }

      const db = await cmsDb();
      const applied: string[] = [];
      const missing: string[] = [];
      const labels: string[] = [];

      for (const id of ids) {
        const existing = await ormFor(db, def.orm).where({ _id: id }).first();
        if (!isSameId(existing, id)) {
          missing.push(id);
          continue;
        }

        if (action === 'delete') {
          await ormFor(db, def.orm).where({ _id: id }).delete();
          labels.push(labelFor(existing as Row, def.label));
        } else {
          const published = action === 'publish';
          const patch: Row = { published };
          // Stamping publishedAt on every save would reorder the list, so it is
          // only set on the transition into published.
          if (published && !existing.published) patch.publishedAt = new Date();
          if (!published) patch.publishedAt = null;
          await ormFor(db, def.orm).where({ _id: id }).update(patch);
          labels.push(labelFor(existing as Row, def.label));
        }
        applied.push(id);
      }

      await writeAudit({
        action: 'bulk',
        resource: def.key,
        recordId: applied.join(','),
        label: `${action} x${applied.length}${labels.length ? ` · ${labels.slice(0, 5).join(', ')}` : ''}`,
        actor: session?.user?.email ?? '',
        after: { action, count: applied.length },
      });

      revalidate(def, {});
      return ok({ action, applied: applied.length, missing });
    } catch (err) {
      return serverError(err);
    }
  }

  return { def, list, publicList, get, create, update, remove, bulk, isSameId, unauthorized, forbidden, badJson };
}

/** Only the fields a request actually touched, so the audit diff stays readable. */
function pickChanged(existing: Row, patch: Row) {
  const out: Row = {};
  for (const key of Object.keys(patch)) out[key] = existing[key];
  return out;
}
