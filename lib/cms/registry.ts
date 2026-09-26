import type { z } from 'zod';

/**
 * The single description of every admin-managed collection.
 *
 * Everything that used to be copy-pasted four times -- the zod schema, the
 * human labels, which fields the list can search and sort on, how a create
 * payload becomes a document -- lives here once, and `lib/cms/factory.ts`
 * turns a `ResourceDef` into the full set of route handlers. Adding a
 * collection is now a def plus a two-line `route.ts` instead of a new
 * 150-line module.
 */

/** Enum values shared by the zod schema, the admin <select> and the public renderer. */
export const STACK_CATEGORIES = [
  'FRONTEND',
  'BACKEND',
  'DATABASE',
  'CMS',
  'DEPLOYMENT',
  'OTHER',
] as const;

export type StackCategory = (typeof STACK_CATEGORIES)[number];

export type Row = Record<string, unknown>;

/**
 * Every resource validates an object, and `update` needs `.partial()`, so the
 * defs are typed against `ZodObject` rather than the looser `ZodTypeAny`.
 */
export type ObjectSchema = z.ZodObject<any>;

/**
 * Trim an optional string field off a loosely-typed payload.
 *
 * A `<input>` can submit `""` (or `undefined` when the field was never
 * touched), and `""` is not the same as "absent" for a URL: storing it would
 * produce `<a href="">`, which reloads the current page. Every optional string
 * field is therefore normalised to `undefined` when blank.
 */
export const str = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

/** Required string field: always returns a trimmed string. */
export const req = (value: unknown): string => (typeof value === 'string' ? value.trim() : String(value ?? ''));

export type SortDir = 1 | -1;

export type StatusFilter = 'all' | 'published' | 'draft';

export type ListQuery = {
  page: number;
  pageSize: number;
  search: string;
  sort: string;
  dir: SortDir;
  status: StatusFilter;
};

export type BulkAction = 'delete' | 'publish' | 'unpublish';

export type ResourceDef = {
  /** URL segment: `/api/<key>`. */
  key: string;
  /** Key on `db.orm`, the lowercased plural contract root. */
  orm: string;
  /** Singular label, e.g. "Blog post". */
  label: string;
  /** Plural label, e.g. "Blog posts". */
  plural: string;
  /** Public route this collection feeds, used for revalidation + deep links. */
  publicPath: string;
  schema: ObjectSchema;
  /** True when documents carry a `published` flag (blog posts, projects). */
  hasPublished: boolean;
  /** Fields scanned by the admin search box. */
  searchFields: string[];
  /** Fields the admin list can sort on. First entry is the default. */
  sortable: string[];
  defaultSort: { key: string; dir: SortDir };
  /** Present only when the collection is addressable by slug. */
  slugField?: string;
  /** Build the document for a create. */
  toCreate: (input: Row, existing: null) => Row;
  /** Build the patch for an update; `existing` is the stored document. */
  toUpdate: (input: Row, existing: Row) => Row;
  /** Public paths to revalidate, given the affected document. */
  revalidateFor?: (row: Row) => string[];
  /** Sort applied in memory when the requested key is not DB-sortable. */
  fallbackSort?: (rows: Row[]) => Row[];
};

export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;

/**
 * Ceiling for a single list read.
 *
 * The Prisma 8 Mongo ORM has no `count()` and no substring/regex filter (its
 * object filter compiles to strict equality only), so search, the draft filter
 * and pagination are applied in JS over one bounded read. That is the right
 * trade for a portfolio CMS where collections hold tens of rows; a collection
 * that outgrows it needs a real text index and a query-builder pipeline, not a
 * bigger constant here.
 */
export const LIST_READ_CAP = 1000;

const toInt = (raw: string | null, fallback: number, min: number, max: number) => {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
};

/**
 * Parse `?page=&pageSize=&search=&sort=&dir=&status=` into a `ListQuery`,
 * clamping anything nonsensical so a hand-edited URL cannot ask for page -3 or
 * a 10_000-row page.
 */
export function parseListQuery(req: Request, def: ResourceDef): ListQuery {
  const url = new URL(req.url);
  const q = url.searchParams;

  const rawSort = q.get('sort');
  const sort = rawSort && def.sortable.includes(rawSort) ? rawSort : def.defaultSort.key;
  const dir: SortDir = q.get('dir') === 'asc' ? 1 : q.get('dir') === 'desc' ? -1 : def.defaultSort.dir;

  const rawStatus = q.get('status');
  const status: StatusFilter =
    def.hasPublished && (rawStatus === 'published' || rawStatus === 'draft') ? rawStatus : 'all';

  return {
    page: toInt(q.get('page'), 1, 1, 10_000),
    pageSize: toInt(q.get('pageSize'), DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE),
    search: (q.get('search') ?? '').trim().slice(0, 120),
    sort,
    dir,
    status,
  };
}

/** Case-insensitive substring match across the resource's search fields. */
export function matchesSearch(row: Row, fields: string[], term: string) {
  if (!term) return true;
  const needle = term.toLowerCase();
  return fields.some((field) => {
    const value = row[field];
    if (value === null || value === undefined) return false;
    if (Array.isArray(value)) return value.some((v) => String(v).toLowerCase().includes(needle));
    return String(value).toLowerCase().includes(needle);
  });
}

/** Stable tiebreak so pagination cannot show or skip the same row twice. */
export function byId(a: Row, b: Row) {
  return String(a._id ?? '').localeCompare(String(b._id ?? ''));
}
