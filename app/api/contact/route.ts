import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';
export const maxDuration = 30;

const TO = process.env.CONTACT_TO?.trim();
const SMTP = {
  host: process.env.SMTP_HOST?.trim() || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  user: process.env.SMTP_USER?.trim(),
  pass: process.env.SMTP_PASS || '',
  name: process.env.MAIL_FROM_NAME?.trim() || 'Waris.dev',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GMAIL_HOSTS = new Set(['smtp.gmail.com', 'smtp.googlemail.com']);
const lastSent = new Map<string, number>();
const RATE_MS = 2 * 60 * 1000;

// Gmail App Passwords are always exactly 16 lowercase letters, shown as
// 4 groups of 4. Copy/paste slips routinely add or drop a character, which
// Gmail then rejects with an opaque 535-5.7.8 at send time.
function passProblem(): string | null {
  if (!SMTP.pass || SMTP.pass.startsWith('REPLACE_')) return 'SMTP_PASS missing or still the placeholder';
  if (!GMAIL_HOSTS.has(SMTP.host.toLowerCase())) return null;
  const compact = SMTP.pass.replace(/\s+/g, '');
  if (!/^[a-z]{16}$/.test(compact)) {
    return `SMTP_PASS is not a valid Gmail App Password (${compact.length} chars, expected 16 lowercase letters)`;
  }
  return null;
}

function ok() {
  const problem = passProblem();
  if (problem) {
    console.error(`[contact] SMTP not configured: ${problem}`);
    return false;
  }
  return !!TO && !!SMTP.user && !!EMAIL_RE.test(TO);
}

function throttleKey(ip?: string, email?: string) {
  return ip || email || 'unknown';
}

export async function POST(req: Request) {
  if (!ok()) {
    return NextResponse.json(
      { ok: false, error: 'SMTP_ERR', message: 'Email service is not configured yet.' },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'BAD_JSON' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const company = typeof body.company === 'string' ? body.company.trim() : '';
  const hp = typeof body.hp === 'string' ? body.hp.trim() : '';

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip')?.trim() ||
    '';

  if (hp.length > 0) {
    return NextResponse.json({ ok: true, sent: false }, { status: 200 });
  }
  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ ok: false, error: 'NAME' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ ok: false, error: 'EMAIL' }, { status: 400 });
  }
  if (message.length < 10 || message.length > 5000) {
    return NextResponse.json({ ok: false, error: 'MESSAGE' }, { status: 400 });
  }

  const key = throttleKey(ip, email);
  const now = Date.now();
  if (lastSent.has(key) && now - (lastSent.get(key) || 0) < RATE_MS) {
    return NextResponse.json({ ok: false, error: 'RATE' }, { status: 429 });
  }
  lastSent.set(key, now);
  if (lastSent.size > 2000) {
    const oldest = now;
    for (const [k, t] of lastSent) if (t < oldest) lastSent.delete(k);
  }

  const from = `${SMTP.name} <${SMTP.user}>`;
  const transporter = nodemailer.createTransport({
    host: SMTP.host,
    port: SMTP.port,
    secure: SMTP.port === 465,
    auth: { user: SMTP.user, pass: SMTP.pass.replace(/\s+/g, '') },
  });

  const sentAt = new Date().toLocaleString('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  try {
    await transporter.sendMail({
      from,
      to: TO,
      replyTo: email,
      subject: `New message from ${name} — waris.dev contact`,
      text: [
        `Name:      ${name}`,
        company && `Company:   ${company}`,
        `Email:     ${email}`,
        `Sent at:   ${sentAt}`,
        `IP:        ${ip || 'n/a'}`,
        '',
        '— Message —',
        message,
        '',
        '—',
        'Reply directly to this email to respond to the sender.',
      ]
        .filter(Boolean)
        .join('\n'),
      headers: { 'X-Contact-IP': ip || 'n/a' },
    });

    try {
      await transporter.sendMail({
        from,
        to: email,
        subject: 'Thanks for reaching out — Waris.dev',
        text: `Hi ${name},

Thanks for your message. I've received it and will get back to you as soon as I can.

For your records, here's what you sent:

"${message.slice(0, 400)}${message.length > 400 ? '…' : ''}"

If it's urgent, you can always reply to the welcome email I just sent myself — well, just hit reply here.

— Waris
https://waris.dev`,
      });
    } catch (err) {
      console.error('[contact] auto-reply failed:', err);
    }
  } catch (err: any) {
    console.error(
      `[contact] mail failed (code=${err?.code || 'n/a'}) — smtp=${SMTP.host}:${SMTP.port} user=${SMTP.user}`,
      err?.message || err
    );
    lastSent.delete(key);
    return NextResponse.json(
      { ok: false, error: 'MAIL', message: 'Message could not be delivered. Try again shortly.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, sent: true });
}