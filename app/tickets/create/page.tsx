'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getLoginUrl } from '../../../lib/auth';
import { api } from '../../../lib/api-client';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function CreateTicketPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getCurrentUser().then(u => {
      if (!u) { window.location.href = getLoginUrl(); return; }
      setUser(u);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Please enter a subject'); return; }
    setSubmitting(true);
    setError('');
    try {
      const ticket = await api.post<any>('/api/support/tickets/create', {
        title: title.trim(),
        description: description.trim(),
        priority,
        status: 'open',
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

        <h1 className="text-[28px] font-semibold text-[var(--color-text)] leading-tight mb-1">Create Ticket</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">Describe your issue and we'll get back to you</p>

        <form onSubmit={handleSubmit} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm p-6 lg:p-8">
          <div className="mb-6">
            <label className="text-sm font-medium text-[var(--color-text)] mb-1.5 block">Subject *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Brief summary of your issue"
              className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-primary)] transition-colors" />
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium text-[var(--color-text)] mb-1.5 block">Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm outline-none focus:border-[var(--color-primary)]">
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
              className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-primary)] transition-colors resize-none" />
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-lg bg-[var(--color-error-surface)] border border-[var(--color-error)] flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[var(--color-error)] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--color-error)]">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={() => router.back()}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
