'use client';

import { useRef, useState } from 'react';

/**
 * Reusable image uploader for the admin dashboard.
 *
 * Injects a hidden file input, reads the chosen `File` as base64, and POSTs it
 * to `/api/upload`. The Vercel Blob `put()` route stores the blob and returns
 * `{ url }`, which the caller then writes into the Project or BlogPost record.
 *
 * Props mirror a controlled `<input type="file">`:
 *  - `value`: URL of the currently picked image (or `''`).
 *  - `onChange(url)`: pushed by the component when a file is selected or the
 *    user clears the field. `null` means "clear the image".
 *
 * The trigger used to swap colours by writing to `element.style` on hover; it is
 * a styled `<button>` now, so the same state is reachable by keyboard.
 */

type Props = {
  name: string;
  recordType: 'Project' | 'BlogPost';
  value?: string;
  onChange?: (url: string | null) => void;
  label?: string;
};

export function FileUpload({ name, recordType, value = '', onChange, label = 'Choose image' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const trigger = () => inputRef.current?.click();

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const blob = await fileToText(file);

    const form = new FormData();
    form.append('file', blob);
    form.append('recordType', recordType);

    setBusy(true);
    setError('');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: form,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.message || body.error || 'Upload failed.');
        return;
      }
      onChange?.(body.url);
      e.target.value = '';
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function onClear() {
    if (inputRef.current) inputRef.current.value = '';
    onChange?.(null);
  }

  return (
    <div className="adm-field">
      <div className="adm-actions">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          name={name}
          className="adm-sr"
          onChange={onFileChange}
          disabled={busy}
        />
        <button type="button" className="adm-btn" onClick={trigger} disabled={busy}>
          {busy ? 'Uploading…' : label}
        </button>
        {value ? (
          <button type="button" className="adm-btn adm-btn-sm" onClick={onClear}>
            Remove
          </button>
        ) : null}
        {value ? (
          <a
            className="adm-btn adm-btn-sm adm-btn-ghost"
            href={value}
            target="_blank"
            rel="noreferrer noopener"
          >
            View
          </a>
        ) : null}
      </div>
      {value ? (
        <span className="adm-hint adm-td-mono">{value}</span>
      ) : (
        <span className="adm-hint">No image selected.</span>
      )}
      {error ? (
        <span className="adm-err" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

async function fileToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(file);
    } catch {
      reject(new Error('Failed to read file.'));
    }
  });
}
