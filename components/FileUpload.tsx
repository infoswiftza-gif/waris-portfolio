'use client';

import { useRef, useState } from 'react';

/**
 * Reusable image uploader for the admin dashboard.
 *
 * Injects a hidden file input, reads the chosen `File` as base64, and POSTs it
 * to `/api/upload`.  The Vercel Blob `put()` route stores the blob and returns
 * `{ url }`, which the parent then writes into the Project or BlogPost record.
 *
 * Props mirror a controlled `<input type="file">`:
 *  - `value`: URL of the currently picked image (or `''`).
 *  - `onChange(url)`: pushed by the component when a file is selected or the
 *    user clears the field.
 */

type Props = {
  name: string;
  recordType: 'Project' | 'BlogPost';
  value?: string;
  onChange?: (url: string | null) => void;
};

export function FileUpload({ name, recordType, value = '', onChange }: Props) {
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        name={name}
        style={{ display: 'none' }}
        onChange={onFileChange}
        disabled={busy}
      />
      <button
        type="button"
        onClick={trigger}
        disabled={busy}
        style={{
          padding: '9px 14px',
          borderRadius: 9,
          border: '1px dashed var(--line-strong)',
          background: 'var(--surface)',
          color: 'var(--ink)',
          fontFamily: 'monospace',
          fontWeight: 500,
          fontSize: 12.5,
          letterSpacing: '.04em',
          cursor: 'pointer',
          transition: 'border-color .2s, background .2s, color .2s',
          WebkitAppearance: 'none',
        }}
        onMouseEnter={(e) => {
          if (busy) return;
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.color = '#04140c';
          e.currentTarget.style.background = 'var(--accent)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--line-strong)';
          e.currentTarget.style.color = 'var(--ink)';
          e.currentTarget.style.background = 'var(--surface)';
        }}
      >
        {busy ? 'Uploading…' : 'Choose image'}
      </button>
      {value && (
        <button
          type="button"
          onClick={onClear}
          style={{
            padding: '9px 14px',
            borderRadius: 9,
            border: '1px solid var(--line-strong)',
            background: 'var(--surface)',
            color: 'var(--muted)',
            fontFamily: 'monospace',
            fontWeight: 500,
            fontSize: 12.5,
            letterSpacing: '.04em',
            cursor: 'pointer',
            transition: 'color .2s, border-color .2s',
            WebkitAppearance: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--ink)';
            e.currentTarget.style.borderColor = 'var(--line)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--muted)';
            e.currentTarget.style.borderColor = 'var(--line-strong)';
          }}
        >
          Change
        </button>
      )}
      {error && (
        <span
          style={{
            color: 'var(--danger)',
            fontSize: 12,
            fontFamily: 'monospace',
          }}
        >
          {error}
        </span>
      )}
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
