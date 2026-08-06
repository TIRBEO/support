'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCurrentUser, getLoginUrl } from '../../../lib/auth';
import { api } from '../../../lib/api-client';
import { ArrowLeft, Loader2, Send, MessageSquare, Clock, AlertCircle } from 'lucide-react';

interface TicketDetail {
  id: string;
  subject: string;
  title?: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  messages: any[];
}

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCurrentUser().then(u => {
      if (!u) { window.location.href = getLoginUrl(); return; }
      setUser(u);
      loadTicket();
    });
  }, [ticketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  const loadTicket = async () => {
    try {
      const data = await api.get<TicketDetail>(`/api/support/tickets/${ticketId}`);
      setTicket(data);
    } catch {}
    setLoading(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      const msg = await api.post<any>(`/api/support/tickets/${ticketId}/messages`, {
        content: message.trim(),
        isInternal: false,
      });
      setTicket(t => t ? { ...t, messages: [...t.messages, msg] } : t);
      setMessage('');
    } catch {}
    setSending(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-[var(--color-primary)] bg-[var(--color-primary-surface)]';
      case 'in_progress': return 'text-[var(--color-warning)] bg-[var(--color-warning-surface)]';
      case 'resolved': return 'text-[var(--color-success)] bg-[var(--color-success-surface)]';
      case 'closed': return 'text-[var(--color-text-tertiary)] bg-[var(--color-surface-muted)]';
      default: return 'text-[var(--color-text-secondary)] bg-[var(--color-surface-muted)]';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-tertiary)]" />
          <h3 className="text-lg font-medium text-[var(--color-text)] mb-1">Ticket not found</h3>
          <button onClick={() => router.push('/tickets')} className="text-sm text-[var(--color-primary)] hover:underline">Back to tickets</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-3xl p-6 lg:p-8">
        <button onClick={() => router.push('/tickets')}
          className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to tickets
        </button>

        <div className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] shadow-brutal-sm mb-6">
          <div className="p-6 border-b border-[var(--color-border)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-[var(--color-text)] mb-2">{ticket.subject || ticket.title}</h1>
                <div className="flex items-center gap-3">
                  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(ticket.status))}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-[var(--color-text-tertiary)] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            {ticket.description && (
              <p className="mt-4 text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap">{ticket.description}</p>
            )}
          </div>

          <div className="p-6">
            <h2 className="text-sm font-semibold text-[var(--color-text)] mb-4">Messages</h2>
            <div className="space-y-4 mb-6">
              {ticket.messages?.length === 0 ? (
                <p className="text-sm text-[var(--color-text-tertiary)] text-center py-8">No messages yet</p>
              ) : (
                ticket.messages?.map((msg: any) => (
                  <div key={msg.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary-surface)] flex items-center justify-center text-[var(--color-primary)] text-xs font-medium flex-shrink-0">
                      {msg.author?.name?.charAt(0)?.toUpperCase() || msg.author?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-[var(--color-text)]">{msg.author?.name || msg.author?.email || 'User'}</span>
                        <span className="text-xs text-[var(--color-text-tertiary)]">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input type="text" value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 border-2 border-[var(--color-border)] bg-[var(--color-bg)] text-sm outline-none focus:border-[var(--color-primary)] focus:shadow-brutal-sm"
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
              />
              <button type="submit" disabled={sending || !message.trim()}
                className="inline-flex items-center gap-2 px-4 py-2.5 border-2 bg-[var(--color-primary)] text-[var(--color-bg)] text-sm font-medium shadow-brutal-sm hover:bg-[var(--color-primary-hover)] hover:shadow-brutal transition-all disabled:opacity-50">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
