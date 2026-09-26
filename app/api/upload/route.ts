import { NextRequest, NextResponse } from 'next/server';
import { guardAdmin } from '@/lib/admin';
import { serverError } from '@/lib/cms/http';
import { cloudinaryConfigError, cloudinaryConfigured, cloudinaryNotConfigured, uploadImage } from '@/lib/cloudinary';

/**
 * /api/upload — Cloudinary image upload for the admin image fields.
 *
 * `FileUpload` reads the chosen file as a base64 data URL and posts it as the
 * `file` form field, so this route normalises either that data URL or a real
 * multipart `File` into a Buffer before storing it. It returns `{ url }` and
 * the caller writes that URL into the Project/BlogPost record via PUT, so this
 * route never writes to the CMS itself.
 */

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const MAX_BYTES = 10 * 1024 * 1024;

export const runtime = 'nodejs';
export const maxDuration = 60;

type Normalized = { data: Buffer; type: string; name: string };

function fail(status: number, error: string, message: string) {
  return NextResponse.json({ ok: false, error, message }, { status });
}

/**
 * Accepts the base64 data URL the admin uploader sends, or a real multipart
 * File, and returns raw bytes plus the detected mime type.
 */
async function normalize(entry: FormDataEntryValue | null): Promise<Normalized | null> {
  if (!entry) return null;

  if (typeof entry === 'string') {
    const match = /^data:([\w.+/-]+);base64,(.*)$/s.exec(entry);
    if (!match) return null;
    const [, type, base64] = match;
    const data = Buffer.from(base64, 'base64');
    return { data, type, name: 'upload' };
  }

  const data = Buffer.from(await entry.arrayBuffer());
  return { data, type: entry.type, name: entry.name || 'upload' };
}

export async function POST(req: NextRequest) {
  const { response } = await guardAdmin(req);
  if (response) return response;

  if (!cloudinaryConfigured()) return cloudinaryNotConfigured();

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, 'BAD_FORM', 'Expected a multipart/form-data body.');
  }

  const file = await normalize(form.get('file'));
  if (!file) {
    return fail(400, 'MISSING_FILE', 'No image was uploaded.');
  }

  if (!ALLOWED.includes(file.type)) {
    return fail(400, 'INVALID_TYPE', 'Only JPEG, PNG, WebP or SVG images are allowed.');
  }

  if (file.data.byteLength > MAX_BYTES) {
    return fail(400, 'TOO_LARGE', 'File must be under 10 MB.');
  }

  // Sanitise the filename to avoid path traversal and duplicate-object errors.
  const safeName =
    file.name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/(\..*)?(\..*)/, '$1') || 'upload';

  try {
    const { url, bytes } = await uploadImage({
      data: file.data,
      contentType: file.type,
      filename: safeName,
    });

    return NextResponse.json({ ok: true, url, size: bytes });
  } catch (err) {
    return cloudinaryConfigError(err) ?? serverError(err);
  }
}
