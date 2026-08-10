'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getLoginUrl } from '../../lib/auth';
import { api } from '../../lib/api-client';
import {
  Plus, Search, MessageSquare, Clock, ChevronRight,
  AlertCircle, CheckCircle2, Loader2,
} from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  title?: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  messages?: any[];
}

export default function TicketsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    getCurrentUser().then(u => {
      if (!u) { window.location.href = getLoginUrl(); return; }
      setUser(u);
      loadTickets();
    });
  }, []);

  const loadTickets = async () => {
    try {
      const data = await api.get<any>('/api/support/tickets?limit=50');
      setTickets(data.tickets || data.data || []);
    } catch {}
    setLoading(false);
  };

  const filtered = tickets.filter(t => {
    const matchesSearch = (t.subject || t.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-[var(--color-primary)] bg-[var(--color-primary-surface)]';
      case 'in_progress': return 'text-[var(--color-warning)] bg-[var(--color-warning-surface)]';
      case 'resolved': return 'text-[var(--color-success)] bg-[var(--color-success-surface)]';
      case 'closed': return 'text-[var(--color-text-tertiary)] bg-[var(--color-surface-muted)]';
      default: return 'text-[var(--color-text-secondary)] bg-[var(--color-surface-muted)]';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4 text-[var(--color-error)]" />;
      case 'medium': return <Clock className="w-4 h-4 text-[var(--color-warning)]" />;
      case 'low': return <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />;
      default: return <MessageSquare className="w-4 h-4 text-[var(--color-text-tertiary)]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-4xl p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[28px] font-semibold text-[var(--color-text)] leading-tight">Support Tickets</h1>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Manage your support requests</p>
          </div>
          <button onClick={() => router.push('/tickets/create')}
            className="inline-flex items-center gap-2 px-5 py-2.5 border-2 bg-[var(--color-primary)] text-[var(--color-bg)] text-sm font-medium shadow-brutal-sm hover:bg-[var(--color-primary-hover)] hover:shadow-brutal transition-all">
            <Plus className="w-4 h-4" /> New Ticket
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tickets..."
              className="w-full pl-9 pr-4 py-2.5 border-2 border-[var(--color-border)] bg-[var(--color-surface)] text-sm outline-none focus:border-[var(--color-primary)] focus:shadow-brutal-sm" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border-2 border-[var(--color-border)] bg-[var(--color-surface)] text-sm outline-none focus:border-[var(--color-primary)] focus:shadow-brutal-sm">
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center shadow-brutal-sm">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-tertiary)]" />
            <h3 className="text-lg font-medium text-[var(--color-text)] mb-1">No tickets found</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">Create a ticket to get help from our team</p>
            <button onClick={() => router.push('/tickets/create')}
              className="inline-flex items-center gap-2 px-5 py-2.5 border-2 bg-[var(--color-primary)] text-[var(--color-bg)] text-sm font-medium shadow-brutal-sm hover:bg-[var(--color-primary-hover)] hover:shadow-brutal transition-all">
              <Plus className="w-4 h-4" /> Create Ticket
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(ticket => (
              <div key={ticket.id} onClick={() => router.push(`/tickets/${ticket.id}`)}
                className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-brutal-sm hover:border-[var(--color-primary-border)] hover:shadow-brutal transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      {getPriorityIcon(ticket.priority)}
                      <h3 className="text-sm font-semibold text-[var(--color-text)] truncate">{ticket.subject || ticket.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[var(--color-text-tertiary)]">
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium', getStatusColor(ticket.status))}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {ticket.messages?.length || 0} messages
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--color-text-tertiary)] flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
