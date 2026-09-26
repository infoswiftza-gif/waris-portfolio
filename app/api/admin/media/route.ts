import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { guardAdmin } from '@/lib/admin';
import { serverError } from '@/lib/cms/http';
import {
  CMS_FOLDER,
  cloudinaryConfigError,
  cloudinaryConfigured,
  cloudinaryNotConfigured,
  deleteImage,
  listImages,
  publicIdFromUrl,
} from '@/lib/cloudinary';

/**
 * GET    /api/admin/media — list stored uploads (admin only).
 * DELETE /api/admin/media?url=… — delete one upload (admin only).
 *
 * The response shape is `{ ok, data, meta }` with the same asset fields the
 * media grid renders, so the client does not care that the backing store is
 * Cloudinary.
 */

const PAGE_SIZE = 60;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const { response } = await guardAdmin(req);
  if (response) return response;

  const config = cloudinaryConfigured();
  if (!config) return cloudinaryNotConfigured();

  const cursor = new URL(req.url).searchParams.get('cursor') ?? undefined;

  try {
    const { assets, nextCursor } = await listImages({ cursor, maxResults: PAGE_SIZE });

    return NextResponse.json({
      ok: true,
      data: assets,
      meta: { hasMore: Boolean(nextCursor), nextCursor },
    });
  } catch (err) {
    return cloudinaryConfigError(err) ?? serverError(err);
  }
}

export async function DELETE(req: NextRequest) {
  const { response } = await guardAdmin(req);
  if (response) return response;

  const config = cloudinaryConfigured();
  if (!config) return cloudinaryNotConfigured();

  const url = new URL(req.url).searchParams.get('url');
  if (!url) {
    return NextResponse.json(
      { ok: false, error: 'BAD_REQUEST', message: 'url is required.' },
      { status: 400 },
    );
  }

  const publicId = publicIdFromUrl(url, config.cloudName);
  if (!publicId) {
    return NextResponse.json(
      {
        ok: false,
        error: 'UNSUPPORTED_URL',
        message: 'That URL is not a Cloudinary delivery URL for this account.',
      },
      { status: 400 },
    );
  }

  // Only ever delete from this app's own folder, so a crafted request cannot
  // remove an unrelated asset that happens to share the Cloudinary account.
  if (!publicId.startsWith(`${CMS_FOLDER}/`)) {
    return NextResponse.json(
      { ok: false, error: 'FORBIDDEN', message: `Only ${CMS_FOLDER}/ uploads can be deleted here.` },
      { status: 403 },
    );
  }

  try {
    const result = await deleteImage(publicId);
    return NextResponse.json({ ok: true, url, publicId, result });
  } catch (err) {
    return cloudinaryConfigError(err) ?? serverError(err);
  }
}
