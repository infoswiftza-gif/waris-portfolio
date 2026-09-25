import { NextResponse } from 'next/server';
import type { ZodSafeParseResult } from 'zod';

/**
 * Shared response + payload helpers for the CMS API routes.
 *
 * Every handler answers with the `{ ok, data | error }` envelope the admin UI
 * already expects, so the shapes stay consistent across resources.
 */

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(error: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error, ...extra }, { status });
}

export const badJson = () => fail('BAD_JSON', 400);
export const notFound = () => fail('NOT_FOUND', 404);
export const unique = (message: string) => fail('UNIQUE', 409, { message });

export function invalid(result: ZodSafeParseResult<unknown>) {
  // The project compiles with `strict: false`, where an explicit `=== false`
  // comparison is what makes TypeScript narrow the discriminated union.
  const fields = result.success === false ? result.error.flatten().fieldErrors : {};
  return fail('VALIDATION', 400, { fields });
}

/** Parse a JSON body, answering 400 itself when the payload is malformed. */
export async function readJson(
  req: Request,
): Promise<{ ok: true; value: Record<string, unknown> } | { ok: false; response: NextResponse }> {
  try {
    return { ok: true, value: (await req.json()) as Record<string, unknown> };
  } catch {
    return { ok: false, response: badJson() };
  }
}

export const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const readingTime = (text: string) =>
  Math.max(1, Math.ceil(text.trim().split(/\s+/).filter(Boolean).length / 200));

/**
 * `where()` only compiles strict equality per field, so an "is not this id"
 * check has to be done in JS after the lookup.
 */
export const isSameId = (doc: { _id?: unknown } | null | undefined, id: string) =>
  !!doc && String(doc._id) === id;

/**
 * Sort helper for lists. `orderBy()` only supports a single key, so
 * multi-key orderings are applied in memory after the query.
 */
export function sortBy<T>(rows: T[], key: (row: T) => number | string, dir: 1 | -1 = 1) {
  return [...rows].sort((a, b) => {
    const av = key(a);
    const bv = key(b);
    if (av === bv) return 0;
    return (av < bv ? -1 : 1) * dir;
  });
}
