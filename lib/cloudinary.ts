import { NextResponse } from 'next/server';

/**
 * Cloudinary image storage.
 *
 * The CMS talks to Cloudinary over its REST API with `fetch` rather than the
 * `cloudinary` SDK: three calls (upload, list, delete) are all that is needed,
 * and going direct keeps a multi-megabyte dependency out of the server bundle
 * and out of the file trace.
 *
 * Auth is HTTP Basic with the account's API key as the username and the API
 * secret as the password. That is the *admin* credential, so it must only ever
 * be read on the server — which is why every caller here is an authenticated
 * `/api/admin/*` or `/api/upload` route.
 *
 * Delivery URLs (`secure_url`) are public by default, which is what a portfolio
 * needs: no signed URL required, and `next/image` can optimise them once
 * `res.cloudinary.com` is in `images.remotePatterns`.
 */

/** Folder every CMS upload lands in. Deletion is restricted to this prefix. */
export const CMS_FOLDER = 'cms';

export type CloudinaryAsset = {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
  contentType: string | null;
};

type Config = { cloudName: string; apiKey: string; apiSecret: string };

/** True when all three credentials are present. */
export function cloudinaryConfigured(): Config | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

function api(config: Config, resource: string) {
  return `https://api.cloudinary.com/v1_1/${config.cloudName}/${resource}`;
}

function auth(config: Config) {
  return `Basic ${Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString('base64')}`;
}

/** The URL images are served from, without any transformation suffix. */
export function deliveryBase(cloudName: string) {
  return `https://res.cloudinary.com/${cloudName}/image/upload`;
}

/** Cloudinary error payload → a thrown Error carrying the HTTP status. */
export class CloudinaryError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'CloudinaryError';
  }
}

async function call(config: Config, resource: string, init: RequestInit) {
  const res = await fetch(api(config, resource), {
    ...init,
    headers: { Authorization: auth(config), ...(init.headers ?? {}) },
    cache: 'no-store',
  });

  const body = (await res.json().catch(() => null)) as
    | { error?: { message?: string } }
    | null;

  if (!res.ok) {
    throw new CloudinaryError(body?.error?.message ?? `Cloudinary returned ${res.status}`, res.status);
  }
  return body;
}

/**
 * Uploads one image from a data URL or raw base64 payload and returns its
 * public delivery URL. `folder` keeps CMS assets grouped so the media library
 * can list them without mixing in anything else in the account.
 */
export async function uploadImage(opts: {
  data: Buffer;
  contentType: string;
  filename: string;
}): Promise<{ url: string; publicId: string; bytes: number; format: string }> {
  const config = cloudinaryConfigured();
  if (!config) throw new CloudinaryError('Cloudinary is not configured.', 503);

  const form = new FormData();
  form.set('file', `data:${opts.contentType};base64,${opts.data.toString('base64')}`);
  form.set('folder', CMS_FOLDER);
  // Deterministic-ish id: a timestamp plus a sanitised name keeps the library
  // readable, and avoids the collisions a bare original filename would cause.
  form.set('public_id', `${Date.now()}-${opts.filename.replace(/\.[^.]+$/, '')}`);

  const body = (await call(config, 'image/upload', {
    method: 'POST',
    body: form,
  })) as {
    secure_url?: string;
    public_id?: string;
    bytes?: number;
    format?: string;
    error?: { message?: string };
  };

  if (!body?.secure_url) {
    throw new CloudinaryError(body?.error?.message ?? 'Upload returned no URL.', 502);
  }

  return {
    url: body.secure_url,
    publicId: body.public_id ?? '',
    bytes: body.bytes ?? 0,
    format: body.format ?? 'jpg',
  };
}

/**
 * Rewrites a stored delivery URL to request a sized, cropped variant.
 *
 * The CMS stores the raw `secure_url` so a record never depends on a
 * transformation existing, and each surface asks for the size it actually
 * renders at. A delivery URL puts its transformation segment *before* the
 * version and public id:
 *
 *   .../image/upload/v1712.../cms/123-photo.jpg
 *   -> .../image/upload/c_fill,g_auto,w_1200,h_800,q_auto,f_auto/v1712.../cms/123-photo.jpg
 *
 * `f_auto` lets Cloudinary negotiate WebP/AVIF per request. It is opt-in via
 * `autoFormat` because it is only wanted where Next is *not* in the pipeline:
 * `next.config.mjs` already lists `image/avif` and `image/webp` for
 * `next/image`, so asking Cloudinary for a format there as well would re-encode
 * an already-negotiated file. Pass `autoFormat: true` for a raw `<img>` (the
 * string renderer in `lib/markup.ts`), and leave it off behind `next/image`.
 * Non-Cloudinary URLs (a hand-typed external image, or a legacy record) are
 * returned untouched rather than silently mangled.
 */
export function cloudinaryTransform(
  url: string,
  opts: { width?: number; height?: number; autoFormat?: boolean },
): string {
  const marker = '/image/upload/';
  let prefix: string;
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'res.cloudinary.com') return url;
    if (parsed.pathname.indexOf(marker) === -1) return url;
    prefix = `${parsed.origin}${parsed.pathname.slice(0, parsed.pathname.indexOf(marker) + marker.length)}`;
  } catch {
    return url;
  }

  const parts: string[] = ['c_fill', 'g_auto'];
  if (opts.width) parts.push(`w_${Math.round(opts.width)}`);
  if (opts.height) parts.push(`h_${Math.round(opts.height)}`);
  parts.push('q_auto');
  if (opts.autoFormat) parts.push('f_auto');

  let rest = url.slice(url.indexOf(prefix) + prefix.length);
  // Drop an existing transformation so repeated calls stay idempotent.
  rest = rest.replace(/^[^/]+,\w+(?:,[^/]+)*\//, '');

  return `${prefix}${parts.join(',')}/${rest}`;
}

type ListResponse = {
  resources?: Array<{
    public_id?: string;
    asset_id?: string;
    secure_url?: string;
    format?: string;
    bytes?: number;
    created_at?: string;
  }>;
  next_cursor?: string;
};

/**
 * Lists CMS uploads, newest first, one page per call.
 *
 * Cloudinary returns `next_cursor` rather than a page number, so the media
 * library passes it back verbatim to walk forward.
 */
export async function listImages(opts: { cursor?: string; maxResults?: number }) {
  const config = cloudinaryConfigured();
  if (!config) throw new CloudinaryError('Cloudinary is not configured.', 503);

  const params = new URLSearchParams({
    type: 'upload',
    max_results: String(Math.min(opts.maxResults ?? 60, 100)),
  });
  if (opts.cursor) params.set('next_cursor', opts.cursor);
  if (CMS_FOLDER) params.set('prefix', `${CMS_FOLDER}/`);

  const body = (await call(config, `resources/image?${params}`, { method: 'GET' })) as ListResponse;
  const resources = body?.resources ?? [];

  return {
    assets: resources.map<CloudinaryAsset>((r) => ({
      url: r.secure_url ?? '',
      pathname: r.public_id ?? '',
      size: r.bytes ?? 0,
      uploadedAt: r.created_at ?? '',
      contentType: r.format ?? null,
    })),
    nextCursor: body?.next_cursor ?? null,
  };
}

/**
 * Recovers a `public_id` from a delivery URL.
 *
 * The CMS stores `secure_url` in `coverImage`, but Cloudinary's delete API wants
 * the id, so the id is derived back out of the URL:
 *
 *   https://res.cloudinary.com/<cloud>/image/upload/v1712.../cms/123-photo.jpg
 *   -> cms/123-photo
 *
 * Transformation segments (`w_800,q_auto/...`) may sit between the version and
 * the folder, so those are stripped too.
 */
export function publicIdFromUrl(url: string, cloudName?: string): string | null {
  let pathname: string;
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'res.cloudinary.com') return null;
    if (cloudName && !parsed.pathname.includes(`/${cloudName}/`)) return null;
    pathname = parsed.pathname;
  } catch {
    return null;
  }

  const marker = '/image/upload/';
  const at = pathname.indexOf(marker);
  if (at === -1) return null;

  let rest = pathname.slice(at + marker.length);
  // Drop the version segment (`v1712345678`) when present.
  rest = rest.replace(/^v\d+\//, '');
  // Drop transformation segments, e.g. `w_800,q_auto,f_auto/`.
  rest = rest.replace(/^[^/]+,\w+(?:,[^/]+)*\//, '');
  // Drop the file extension from the last segment.
  rest = rest.replace(/\.[a-z0-9]+$/i, '');

  if (!rest) return null;
  try {
    return decodeURIComponent(rest);
  } catch {
    return rest;
  }
}

/** Deletes one asset by its public id. `not found` is treated as success. */
export async function deleteImage(publicId: string) {
  const config = cloudinaryConfigured();
  if (!config) throw new CloudinaryError('Cloudinary is not configured.', 503);

  const form = new FormData();
  form.set('public_id', publicId);
  form.set('invalidate', 'true');

  const body = (await call(config, 'image/destroy', { method: 'POST', body: form })) as {
    result?: string;
  };

  return body?.result === 'not found' ? 'missing' : 'deleted';
}

const NOT_CONFIGURED =
  'Image storage is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in the environment.';

/**
 * 503 for the "storage was never configured" case.
 *
 * A missing env var is a setup mistake, not a server fault, and the admin UI
 * needs to say so rather than showing a generic 500. Call this directly when
 * `cloudinaryConfigured()` returns null — `cloudinaryConfigError()` only maps a
 * `CloudinaryError` that was actually thrown.
 */
export function cloudinaryNotConfigured() {
  return NextResponse.json(
    { ok: false, error: 'CLOUDINARY_NOT_CONFIGURED', message: NOT_CONFIGURED },
    { status: 503 },
  );
}

/** Maps a thrown `CloudinaryError` to its 503, or `null` for a real 500. */
export function cloudinaryConfigError(err: unknown) {
  if (err instanceof CloudinaryError && err.status === 503) {
    return cloudinaryNotConfigured();
  }
  return null;
}
