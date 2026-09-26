import type { Metadata } from 'next';

import { AdminNav } from './_components/AdminNav';
import { AdminShortcuts } from './_components/AdminShortcuts';
import { ToastProvider } from './_components/Toast';

import './admin.css';

/**
 * Admin shell.
 *
 * The nav used to be five copies of the same inline-styled anchor wired through
 * a `ClientHoverLink` that wrote to `element.style` on hover, inside ~200 lines
 * of `style={{...}}` objects. It is a styled `<Link>` list in `admin.css` now,
 * so it supports middle-click and cmd-click, marks the active section with
 * `aria-current`, and its hover state is reachable by keyboard.
 *
 * `ToastProvider` wraps the whole shell because the confirmation feedback is
 * now a toast rather than the dead `saved` flag the old pages carried.
 *
 * The section nav is a right-hand sidebar rather than a row in the header: the
 * header only carries the brand, so the eight sections get a full-height column
 * that does not wrap on a laptop screen. `.adm-shell` is the two-column frame
 * and collapses back to a stacked layout on narrow viewports.
 */
export const metadata: Metadata = {
  title: 'Admin · WARIS.DEV CMS',
  description: 'Content management backend for the WARIS.DEV portfolio.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm">
      <ToastProvider>
        <AdminShortcuts />
        <div className="adm-shell">
          <div className="adm-col">
            <header className="adm-top">
              <div className="adm-brand">
                <span className="adm-mark" aria-hidden="true">
                  �sT
                </span>
                <h1 className="adm-title">
                  WARIS.DEV <em>A�</em> CMS
                </h1>
              </div>
            </header>

            <main className="adm-main">{children}</main>

            <footer className="adm-foot">
              <span>WARIS.DEV CMS</span>
              <span>v2.0 A� MongoDB + Prisma 8 A� {new Date().getFullYear()}</span>
            </footer>
          </div>

          <AdminNav />
        </div>
      </ToastProvider>
    </div>
  );
}
