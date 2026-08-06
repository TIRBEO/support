'use client';

import { useState } from 'react';
import { CaptchaWidget } from '../components/captcha/captcha-widget';
import { api, ApiError } from '../../lib/api-client';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [captchaRayId, setCaptchaRayId] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setError('');

    const errs: Record<string, string> = {};
    if (!message.trim()) errs.message = 'Please enter a message';
    else if (message.trim().length < 10) errs.message = 'Message should be at least 10 characters';
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Enter a valid email';
    if (Object.keys(errs).length) return setFieldErrors(errs);
    if (!captchaRayId) return setError('Please complete the human verification first');

    setStatus('sending');
    try {
      await api.post('/api/feedback', {
        message: message.trim(),
        email: email.trim() || undefined,
        name: name.trim() || undefined,
        source: 'footer',
        captchaRayId,
      });
      setStatus('sent');
      setName('');
      setEmail('');
      setMessage('');
      setCaptchaRayId('');
    } catch (err) {
      setStatus('error');
      setError(err instanceof ApiError ? err.message : 'Failed to send your message. Please try again.');
    }
  };

  if (status === 'sent') {
    return (
      <main className="mx-auto max-w-2xl p-6 lg:p-8">
        <a href="/" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
          &larr; Back to Support
        </a>
        <div className="mt-8 border-2 border-[var(--color-success)] bg-[var(--color-success-surface)] p-8 text-center shadow-brutal-sm">
          <CheckCircle2 className="mx-auto h-10 w-10 text-[var(--color-success)]" />
          <h1 className="mt-4 text-[28px] font-semibold text-[var(--color-text)] leading-tight">Message sent!</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Thanks for reaching out — our team will get back to you shortly.
          </p>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="mt-6 inline-flex items-center gap-2 border-2 bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-bg)] shadow-brutal-sm transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-brutal"
          >
            Send another message
          </button>
        </div>
      </main>
    );
  }

  const inputCls = (invalid?: string) =>
    `w-full border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)] focus:shadow-brutal-sm transition-all ${
      invalid ? 'border-[var(--color-error)]' : ''
    }`;

  return (
    <main className="mx-auto max-w-2xl p-6 lg:p-8">
      <a href="/" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
        &larr; Back to Support
      </a>

      <h1 className="mt-4 text-[28px] font-semibold text-[var(--color-text)] leading-tight">Contact Us</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
        Have a question or need help? We&apos;d love to hear from you.
      </p>

      <form className="mt-8 space-y-5" onSubmit={submit} noValidate>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Name <span className="text-[var(--color-text-muted)]">(optional)</span></label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            className={inputCls()}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputCls(fieldErrors.email)}
          />
          {fieldErrors.email && <p className="mt-1 text-xs text-[var(--color-error)]">{fieldErrors.email}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Message *</label>
          <textarea
            rows={5}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="How can we help?"
            className={inputCls(fieldErrors.message)}
          />
          {fieldErrors.message && <p className="mt-1 text-xs text-[var(--color-error)]">{fieldErrors.message}</p>}
        </div>

        <CaptchaWidget onSuccess={id => setCaptchaRayId(id)} />

        {status === 'error' && (
          <div className="flex items-start gap-3 border-2 border-[var(--color-error)] bg-[var(--color-error-surface)] p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-[var(--color-error)]" />
            <p className="text-sm text-[var(--color-error)]">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'sending'}
          className="inline-flex items-center gap-2 border-2 bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-bg)] shadow-brutal-sm transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-brutal disabled:opacity-50"
        >
          {status === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {status === 'sending' ? 'Sending…' : 'Send Message'}
        </button>
      </form>

      <div className="mt-10 border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-brutal-sm">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">Other ways to reach us</h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Email:{" "}
          <a href="mailto:hello@tirbeo.app" className="font-medium text-[var(--color-text)] underline hover:opacity-70 transition-opacity">
            hello@tirbeo.app
          </a>
        </p>
      </div>
    </main>
  );
}
