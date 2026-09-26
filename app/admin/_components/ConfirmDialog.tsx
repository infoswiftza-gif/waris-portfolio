'use client';

import { useEffect, useRef } from 'react';

/**
 * Confirmation dialog for destructive actions.
 *
 * Replaces the `window.alert()` / `window.confirm()` calls the CRUD pages used
 * for deletes and bulk actions. Besides looking like the rest of the CMS, this
 * one is keyboard- and screen-reader-correct: focus moves into the dialog on
 * open, Escape cancels, Tab is trapped inside it, and focus returns to whatever
 * opened it.
 */

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  destructive = true,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const confirmBtn = useRef<HTMLButtonElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreTo.current = document.activeElement as HTMLElement | null;
    confirmBtn.current?.focus();
    return () => restoreTo.current?.focus?.();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }
      if (e.key !== 'Tab') return;

      // Focus trap: without it, Tab walks out of the dialog into the page
      // behind, which is still mounted and still focusable.
      const focusable = panel.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="adm-backdrop"
      onMouseDown={(e) => {
        // Only a click on the backdrop itself cancels, so a drag that starts
        // inside the panel and ends outside does not dismiss the dialog.
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        ref={panel}
        className="adm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="adm-confirm-title"
        aria-describedby="adm-confirm-msg"
      >
        <h2 id="adm-confirm-title">{title}</h2>
        <p id="adm-confirm-msg">{message}</p>
        <div className="adm-modal-foot">
          <button type="button" className="adm-btn" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            ref={confirmBtn}
            type="button"
            className={`adm-btn ${destructive ? 'adm-btn-danger' : 'adm-btn-primary'}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
