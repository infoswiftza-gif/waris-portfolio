'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

/**
 * /admin/login
 *
 * Client credentials form. `signIn` from `next-auth/react` performs the full
 * NextAuth handshake (CSRF token -> POST /api/auth/callback/credentials ->
 * session cookie) and sets the cookie for us, so we only have to handle the
 * error result and redirect.
 * Inline styles mirror the public `globals.css` dark palette and the
 * monospace accent the whole CMS uses.
 */

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: 'Invalid email or password.',
  CSRFError: 'Your session expired. Please try again.',
  AccessDenied: 'Access denied.',
  Configuration: 'Authentication is not configured correctly.',
  Default: 'Something went wrong. Please try again.',
};

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl: '/admin/dashboard',
      });

      if (result?.error) {
        setError(ERROR_MESSAGES[result.error] ?? ERROR_MESSAGES.Default);
        return;
      }

      if (result?.ok) {
        window.location.href = result.url ?? '/admin/dashboard';
        return;
      }

      setError(ERROR_MESSAGES.Default);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background:
          'radial-gradient(90% 60% at 50% 110%, rgba(39,216,137,.07) 0%, transparent 60%), var(--bg)',
      }}
    >
      <form
        style={{
          width: '100%',
          maxWidth: 380,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          padding: '40px 34px',
          borderRadius: 18,
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          boxShadow: 'var(--shadow)',
        }}
        onSubmit={submit}
      >
        <div
          style={{
            fontFamily: '"Space Grotesk", "Inter", monospace',
            fontWeight: 700,
            letterSpacing: '-.03em',
            color: 'var(--ink)',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 18,
            }}
          >
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background:
                  'linear-gradient(180deg, var(--accent), var(--accent-blue))',
                display: 'grid',
                placeItems: 'center',
                fontSize: 15,
                fontWeight: 700,
                color: '#04140c',
              }}
            >
              ⚙
            </span>
            WARIS.DEV CMS
          </span>
          <p
            style={{
              marginTop: 8,
              color: 'var(--muted)',
              fontSize: 13,
            }}
          >
            Sign in to manage projects, experience and blog posts.
          </p>
        </div>

        {error && (
          <p
            style={{
              color: 'var(--danger)',
              fontSize: 13,
              fontFamily: 'monospace',
            }}
          >
            {error}
          </p>
        )}

        <label
          style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted-2)' }}
        >
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 10,
            border: '1px solid var(--line-strong)',
            background: 'var(--bg-2)',
            color: 'var(--ink)',
            fontFamily: 'monospace',
            fontSize: 14,
            outline: 'none',
            transition: 'border-color .2s, box-shadow .2s',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line-strong)')}
          autoComplete="email"
          required
          disabled={busy}
        />

        <label
          style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted-2)' }}
        >
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 10,
            border: '1px solid var(--line-strong)',
            background: 'var(--bg-2)',
            color: 'var(--ink)',
            fontFamily: 'monospace',
            fontSize: 14,
            outline: 'none',
            transition: 'border-color .2s, box-shadow .2s',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line-strong)')}
          autoComplete="current-password"
          required
          disabled={busy}
        />

        <button
          type="submit"
          disabled={busy}
          style={{
            padding: '14px 22px',
            borderRadius: 10,
            border: '1px solid var(--line-strong)',
            background: 'var(--surface)',
            color: 'var(--ink)',
            fontFamily: 'monospace',
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'background .2s, border-color .2s, color .2s, transform .2s',
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
          onMouseDown={(e) => {
            if (busy) return;
            e.currentTarget.style.transform = 'translateY(1px)';
          }}
          onMouseUp={(e) => {
            if (busy) return;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <p
          style={{
            marginTop: 4,
            fontSize: 11.5,
            color: 'var(--muted-2)',
            textAlign: 'center',
          }}
        >
          Create your first admin account from the seed script before signing in.
        </p>
      </form>
    </div>
  );
}
