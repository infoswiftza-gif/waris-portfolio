'use client';

import { useEffect } from 'react';

/**
 * Global admin shortcuts: `/` focuses search, `n` starts a new record.
 *
 * Both are ignored while the user is typing in a field or holding a modifier
 * key, so they can never swallow a keystroke destined for the form. The `n`
 * shortcut works by activating the visible "New …" button rather than reaching
 * into React state, which keeps it in sync with whatever the page renders.
 */

export function AdminShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      const typing =
        tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable;

      if (e.key === '/') {
        if (typing) return;
        e.preventDefault();
        const search = document.getElementById('adm-search-input') as HTMLInputElement | null;
        search?.focus();
        search?.select();
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        if (typing) return;
        // Ignore when a dialog is open, so `n` does not open a form behind a modal.
        if (document.querySelector('[role="alertdialog"], [role="dialog"]')) return;
        const buttons = Array.from(document.querySelectorAll('button'));
        const create = buttons.find((b) => b.textContent?.trim().startsWith('+ New'));
        if (create) {
          e.preventDefault();
          create.click();
        }
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return null;
}
