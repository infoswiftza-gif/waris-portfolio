'use client';

import { useCallback, useEffect, useState } from 'react';

import { ConfirmDialog } from '../_components/ConfirmDialog';
import { useToast } from '../_components/Toast';

/**
 * Media library.
 *
 * Lists the images uploaded through the CMS so an existing asset can be reused
 * instead of re-uploaded, and shows what is stored before anything is deleted.
 * Deleting an image a published post still points at would leave a broken
 * image on the live site, so deletion is restricted to this app's own upload
 * folder and unreferenced files are the expected default to clean up.
 *
 * The grid renders the plain delivery URL; Cloudinary's transformation segment
 * (`w_800,q_auto,f_auto/…`) can be inserted after `/image/upload/` when the
 * public pages start optimising through `next/image`.
 */

type Blob = {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
  contentType: string | null;
};

const bytes = (n: number) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

export default function MediaPage() {
  const toast = useToast();
  const [blobs, setBlobs] = useState<Blob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notConfigured, setNotConfigured] = useState(false);
  const [pending, setPending] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/media', { cache: 'no-store' });
      const body = await res.json();
      if (!res.ok || body?.ok === false) {
        // A 503 means image storage itself is unusable (no credentials, or the
        // store's access mode rejects this deployment). That is a setup problem,
        // not a CMS failure, so it gets its own message instead of generic error
        // styling.
        const configError = res.status === 503;
        setNotConfigured(configError);
        setError(
          body?.message ??
            body?.error ??
            `Could not list media (${res.status}). Check that CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are set.`,
        );
        return;
      }
      setNotConfigured(false);
      setBlobs(body.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.ok('URL copied.');
    } catch {
      toast.err('Could not copy — select the URL manually.');
    }
  };

  const remove = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/media?url=${encodeURIComponent(pending.url)}`, {
        method: 'DELETE',
      });
      const body = await res.json();
      if (!res.ok || body?.ok === false) {
        toast.err(body?.message ?? body?.error ?? `Delete failed (${res.status}).`);
        return;
      }
      setBlobs((prev) => prev.filter((b) => b.url !== pending.url));
      toast.ok('Image deleted.');
    } catch (err) {
      toast.err(err instanceof Error ? err.message : 'Network error.');
    } finally {
      setBusy(false);
      setPending(null);
    }
  };

  return (
    <>
      <div className="adm-row">
        <div>
          <h1 className="adm-h">Media</h1>
          <p className="adm-sub" style={{ marginBottom: 0 }}>
            Images uploaded through the CMS. Copy a URL to reuse it, or delete one that is no longer
            referenced.
          </p>
        </div>
        <div className="adm-actions">
          <button type="button" className="adm-btn" onClick={() => void load()}>
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div
          className="adm-card"
          style={{
            borderColor: notConfigured
              ? 'rgba(255,210,122,.4)'
              : 'rgba(255,107,122,.4)',
            marginBottom: 16,
          }}
        >
          <p className="adm-err" role="alert" style={{ margin: 0 }}>
            {error}
          </p>
          {notConfigured ? (
            <p className="adm-sub" style={{ margin: '8px 0 0' }}>
              Uploads and this library stay disabled until the Cloudinary credentials are added.
              Everything else in the CMS keeps working.
            </p>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <div className="adm-stats">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="adm-stat" key={i}>
              <div className="adm-skel" style={{ height: 90 }} />
            </div>
          ))}
        </div>
      ) : blobs.length === 0 ? (
        <div className="adm-tablewrap">
          <div className="adm-empty">
            No images yet. Upload one from a project or blog post and it will appear here.
          </div>        </div>
      ) : (
        <div className="adm-stats">
          {blobs.map((b) => (
            <figure className="adm-media" key={b.url} style={{ margin: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.url} alt="" />
              <figcaption className="adm-media-meta">
                <span>{bytes(b.size)}</span>
                <span>{new Date(b.uploadedAt).toLocaleDateString('en-GB')}</span>
              </figcaption>
              <div className="adm-actions">
                <button type="button" className="adm-btn adm-btn-sm" onClick={() => copy(b.url)}>
                  Copy URL
                </button>
                <a
                  className="adm-btn adm-btn-sm adm-btn-ghost"
                  href={b.url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Open
                </a>
                <button
                  type="button"
                  className="adm-btn adm-btn-sm adm-btn-danger"
                  onClick={() => setPending(b)}
                >
                  Delete
                </button>
              </div>
            </figure>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={pending !== null}
        title="Delete this image?"
        message={
          <>
            <code style={{ wordBreak: 'break-all' }}>{pending?.pathname}</code> will be removed
            from blob storage. Any record still pointing at it will show a broken image.
          </>
        }
        confirmLabel="Delete image"
        busy={busy}
        onConfirm={remove}
        onCancel={() => setPending(null)}
      />
    </>
  );
}
