import { redirect } from 'next/navigation';

/**
 * `/admin/dashboard` → `/admin`.
 *
 * The dashboard now lives at `/admin`, because that is where the nav (and every
 * bookmark) points, and the previous path never matched the auth matcher. This
 * redirect keeps old links working instead of 404ing them.
 */
export default function AdminDashboardRedirect() {
  redirect('/admin');
}
