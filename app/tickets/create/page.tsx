'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser, getLoginUrl } from '../../../lib/auth';
import { api } from '../../../lib/api-client';
import { CaptchaWidget } from '../../components/captcha/captcha-widget';
import { ArrowLeft, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';

export default function CreateTicketPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  // Captcha-appeal prefill: /tickets/create?appeal=1&form=...&formTitle=...&rayId=...&reason=...
  const appealRayId = searchParams?.get('rayId') || '';
  const appealFormTitle = searchParams?.get('formTitle') || '';
  const appealReason = searchParams?.get('reason') || '';
  const isAppeal = searchParams?.get('appeal') === '1';
  const [title, setTitle] = useState(isAppeal ? `Appeal: flag on "${appealFormTitle}"` : '');
  const [description, setDescription] = useState(isAppeal
    ? `I am appealing a CAPTCHA flag on my form.

Form: ${appealFormTitle}
Ray ID: ${appealRayId}
Reason: ${appealReason}

Please review and unblock my form.`
    : '');
  const [priority, setPriority] = useState(isAppeal ? 'high' : 'medium');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [captchaRayId, setCaptchaRayId] = useState('');

  useEffect(() => {
    getCurrentUser().then(u => {
      if (!u) { window.location.href = getLoginUrl(); return; }
      setUser(u);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Please enter a subject'); return; }
    if (!captchaRayId) { setError('Please complete the human verification first'); return; }
    setSubmitting(true);
    setError('');
    try {
      const ticket = await api.post<any>('/api/support/tickets/create', {
        title: title.trim(),
        description: description.trim(),
        priority,
        status: 'open',
        captchaRayId,
        ...(isAppeal ? { appealRayId } : {}),
      });
      router.push(`/tickets/${ticket.id}`);
    } catch (e: any) {
      setError(e?.message || 'Failed to create ticket');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-2xl p-6 lg:p-8">
        <button onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to tickets
        </button>

        <h1 className="text-[28px] font-semibold text-[var(--color-text)] leading-tight mb-1">{isAppeal ? 'Appeal a Block' : 'Create Ticket'}</h1>
        {isAppeal ? (
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">We'll review your appeal and get back to you — usually within 24 hours.</p>
        ) : (
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">Describe your issue and we'll get back to you</p>
        )}

        <form onSubmit={handleSubmit} className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] shadow-brutal-sm p-6 lg:p-8">
          {isAppeal && (
            <div className="mb-6 p-4 border-2 border-[var(--color-warning)] bg-[var(--color-warning-surface)] flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-[var(--color-text)]">
                <p className="font-semibold mb-1">Appeal for flagged form "{appealFormTitle}"</p>
                <p className="text-[var(--color-text-secondary)]">Ray ID: <code className="font-mono">{appealRayId}</code> · Reason: {appealReason}</p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="text-sm font-medium text-[var(--color-text)] mb-1.5 block">Subject *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Brief summary of your issue"
              className="w-full px-4 py-3 border-2 border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-primary)] focus:shadow-brutal-sm transition-all" />
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium text-[var(--color-text)] mb-1.5 block">Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[var(--color-border)] bg-[var(--color-surface)] text-sm outline-none focus:border-[var(--color-primary)] focus:shadow-brutal-sm">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium text-[var(--color-text)] mb-1.5 block">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Describe your issue in detail..."
              rows={6}
              className="w-full px-4 py-3 border-2 border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-primary)] focus:shadow-brutal-sm transition-all resize-none" />
          </div>

          {error && (
            <div className="mb-4 p-4 border-2 bg-[var(--color-error-surface)] border-[var(--color-error)] flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[var(--color-error)] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--color-error)]">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <CaptchaWidget onSuccess={id => setCaptchaRayId(id)} />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={() => router.back()}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 border-2 bg-[var(--color-primary)] text-[var(--color-bg)] text-sm font-medium shadow-brutal-sm hover:bg-[var(--color-primary-hover)] hover:shadow-brutal transition-all disabled:opacity-50">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
