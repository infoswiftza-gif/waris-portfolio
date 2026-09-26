'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Toast notifications.
 *
 * The old CRUD pages had a `resetSaved()` that set `saved` to `false` twice and
 * never to `true`, so a successful save showed the user nothing at all. This
 * replaces that dead flag with an actual, announced confirmation.
 */

type ToastKind = 'ok' | 'err';

type Toast = {
  id: number;
  kind: ToastKind;
  message: string;
};

type ToastApi = {
  /** `ok` for success, `err` for a failure worth reading. */
  notify: (message: string, kind?: ToastKind) => void;
  ok: (message: string) => void;
  err: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const LIFETIME = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, kind: ToastKind = 'ok') => {
      if (!message) return;
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-3), { id, kind, message }]);
      timers.current.push(setTimeout(() => dismiss(id), LIFETIME));
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      notify,
      ok: (m: string) => notify(m, 'ok'),
      err: (m: string) => notify(m, 'err'),
    }),
    [notify],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/*
        `aria-live="polite"` means a screen reader announces the result of a save
        without stealing focus mid-edit; `role="status"` on the container keeps
        the announcement out of the assertive/error channel.
      */}
      <div className="adm-toasts" role="status" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <div key={t.id} className={`adm-toast ${t.kind === 'err' ? 'adm-toast-err' : 'adm-toast-ok'}`}>
            <span aria-hidden="true">{t.kind === 'err' ? '⚠' : '✓'}</span>
            <span>{t.message}</span>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss notification">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
