'use client';
import { useState } from 'react';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errMsg, setErrMsg] = useState('');
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '', hp: '' });

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setErrMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus('sent');
      } else {
        const friendly: Record<string, string> = {
          NAME: 'Name is required.',
          EMAIL: 'Please enter a valid email.',
          MESSAGE: 'Message should be at least 10 characters.',
          RATE: 'Please wait a moment before sending another message.',
          MAIL: 'Message could not be delivered. Try again shortly.',
          SMTP_ERR: 'Email service is not configured yet.',
        };
        setErrMsg(friendly[data.error] || 'Something went wrong. Please try again.');
        setStatus('error');
      }
    } catch {
      setErrMsg('Network error — please try again.');
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="term glass contact-sent" role="status">
        <div className="term-bar">
          <i></i>
          <i></i>
          <i></i>
          <span className="t">WARIS.DEV — MAIL QUEUE</span>
        </div>
        <div className="term-body">
          <div className="ln ok" data-term>&gt; message_delivered ✓</div>
          <div className="ln ok" data-term>COPY_TO: in your inbox</div>
          <div className="ln ok" data-term>COPY_TO: sender's inbox</div>
          <div className="ln" data-term>&gt; I usually reply within 24 hours.</div>
        </div>
      </div>
    );
  }

  return (
    <form className="contact-form glass" onSubmit={submit} noValidate data-reveal>
      <div className="contact-form-row">
        <label className="field">
          <span className="field-label">NAME*</span>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={set('name')}
            placeholder="Your name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={120}
          />
        </label>
        <label className="field">
          <span className="field-label">EMAIL*</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={set('email')}
            placeholder="you@example.com"
            autoComplete="email"
            required
            maxLength={200}
          />
        </label>
      </div>
      <label className="field">
        <span className="field-label">COMPANY / PROJECT</span>
        <input
          type="text"
          name="company"
          value={form.company}
          onChange={set('company')}
          placeholder="Optional — who or what is this about?"
          autoComplete="organization"
          maxLength={120}
        />
      </label>
      <label className="field">
        <span className="field-label">MESSAGE*</span>
        <textarea
          name="message"
          value={form.message}
          onChange={set('message')}
          placeholder="Tell me about the idea, the timeline, the deadline…"
          rows={5}
          required
          minLength={10}
          maxLength={5000}
        ></textarea>
      </label>
      <div className="hp-field" aria-hidden="true">
        <label>Leave this field empty
          <input
            type="text"
            name="hp"
            value={form.hp}
            onChange={set('hp')}
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      {status === 'error' && <p className="contact-error" role="alert">{errMsg}</p>}

      <div className="contact-form-foot">
        <p className="contact-note">
          A confirmation copy goes to your inbox too, so we both have a record.
        </p>
        <button
          className="btn btn-primary magnetic"
          type="submit"
          disabled={status === 'sending'}
        >
          {status === 'sending' ? 'Transmitting…' : 'Send Message '}
          {status === 'sending' ? '' : <span className="arr">→</span>}
        </button>
      </div>
    </form>
  );
}