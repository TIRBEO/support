'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCurrentUser, getLoginUrl } from '../../../lib/auth';
import { api } from '../../../lib/api-client';
import { ArrowLeft, Loader2, Send, MessageSquare, Clock, Paperclip, X, ImageIcon, CheckCircle2, FileText, Download, Upload } from 'lucide-react';

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

const IMG_RE = /!\[tirbeo-img\]\(([^)]+)\)/g;

function parseImages(text: string): { text: string; images: string[] } {
  const images: string[] = [];
  let out = '';
  let last = 0;
  let m: RegExpExecArray | null;
  IMG_RE.lastIndex = 0;
  while ((m = IMG_RE.exec(text)) !== null) {
    out += text.slice(last, m.index);
    images.push(m[1]);
    last = m.index + m[0].length;
  }
  out += text.slice(last);
  return { text: out, images };
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
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
  const [picked, setPicked] = useState<{ file: File; preview: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [zoomUrl, setZoomUrl] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [attUploading, setAttUploading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [justResolved, setJustResolved] = useState(false);
  const [live, setLive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const attFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCurrentUser().then(u => {
      if (!u) { window.location.href = getLoginUrl(); return; }
      setUser(u);
      loadTicket();
      loadAttachments();
    });
  }, [ticketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  useEffect(() => {
    if (!ticketId) return;
    const t = setInterval(() => {
      loadTicket(true);
      loadAttachments();
    }, 10000);
    return () => clearInterval(t);
  }, [ticketId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setZoomUrl(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const loadTicket = async (silent = false) => {
    try {
      const data = await api.get<TicketDetail>(`/api/support/tickets/${ticketId}`);
      setTicket(data);
      if (silent) setLive(true);
    } catch {}
    if (!silent) setLoading(false);
  };

  const loadAttachments = async () => {
    try {
      const d = await api.get<any>(`/api/support/tickets/${ticketId}/attachments`);
      setAttachments(d?.attachments || []);
    } catch {}
  };

  const closed = ticket?.status === 'resolved' || ticket?.status === 'closed';

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/')).slice(0, 6 - picked.length);
    const next = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
    setPicked(p => [...p, ...next].slice(0, 6));
    e.target.value = '';
  };

  const removePick = (idx: number) => {
    setPicked(p => {
      URL.revokeObjectURL(p[idx].preview);
      return p.filter((_, i) => i !== idx);
    });
  };

  const onAttPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setAttUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        await api.request(`/api/support/tickets/${ticketId}/attachments`, { method: 'POST', body: fd });
      }
      loadAttachments();
    } catch (err) {
      console.error('Upload failed', err);
    }
    setAttUploading(false);
    e.target.value = '';
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending || closed) return;
    if (!message.trim() && picked.length === 0) return;
    setSending(true);
    try {
      const imageUrls: string[] = [];
      if (picked.length > 0) {
        setUploading(true);
        for (const p of picked) {
          const fd = new FormData();
          fd.append('file', p.file);
          const res = await api.request<any>('/api/media/upload', { method: 'POST', body: fd });
          if (res?.url) imageUrls.push(res.url);
        }
        setUploading(false);
      }
      const msg = await api.post<any>(`/api/support/tickets/${ticketId}/messages`, {
        content: message.trim(),
        isInternal: false,
        imageUrls,
      });
      setTicket(t => t ? { ...t, messages: [...t.messages, msg] } : t);
      setMessage('');
      setPicked(p => { p.forEach(x => URL.revokeObjectURL(x.preview)); return []; });
    } catch (err: unknown) {
      setUploading(false);
      console.error(err);
    }
    setSending(false);
  };

  const resolve = async () => {
    if (resolving || closed) return;
    setResolving(true);
    try {
      await api.put(`/api/support/tickets/${ticketId}`, { status: 'resolved' });
      await loadTicket(true);
      setJustResolved(true);
      setTimeout(() => setJustResolved(false), 2500);
    } catch (err) {
      console.error(err);
    }
    setResolving(false);
  };

  const getStatusColor = (status: string) => {    switch (status) {
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

        <div className="relative border-2 border-[var(--color-border)] bg-[var(--color-surface)] shadow-brutal-sm mb-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.05),transparent_70%)]" />
          <div className="relative p-6 border-b border-[var(--color-border)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold mb-2 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">{ticket.subject || ticket.title}</h1>                <div className="flex items-center gap-3">
                  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(ticket.status))}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  {!closed && live && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-[var(--color-success)] bg-[var(--color-success-surface)]">
                      <span className="w-1 h-1 rounded-full bg-[var(--color-success)] animate-pulse" />
                      live
                    </span>
                  )}
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
            {!closed && (
              <button
                onClick={resolve}
                disabled={resolving}
                className={cn(
                  'mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all disabled:opacity-50',
                  justResolved
                    ? 'bg-[var(--color-success)] text-[var(--color-bg)]'
                    : 'bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-text)] hover:border-[var(--color-primary)]'
                )}
              >
                {resolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {resolving ? 'Resolving…' : justResolved ? 'Resolved ✓' : 'Mark resolved'}
              </button>
            )}
            {resolving && (
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
                <div className="h-full w-full origin-left animate-[progressbar_1.2s_ease-in-out_infinite] rounded-full bg-[var(--color-success)]" />
              </div>
            )}
          </div>

          {closed && (
            <div className="mx-6 mt-5 flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
              <CheckCircle2 className="w-5 h-5 text-[var(--color-success)] flex-shrink-0" />
              <p className="text-sm text-[var(--color-text-secondary)]">
                This ticket is <span className="text-[var(--color-text)] font-medium capitalize">{ticket.status}</span>. Replies are disabled. Open a new ticket if you need more help.
              </p>
            </div>
          )}

          <div className="p-6">
            <h2 className="text-sm font-semibold text-[var(--color-text)] mb-4">Messages</h2>
            <div className="space-y-4 mb-6">
              {ticket.messages?.length === 0 ? (
                <p className="text-sm text-[var(--color-text-tertiary)] text-center py-8">No messages yet</p>
              ) : (
                ticket.messages?.map((msg: any) => {
                  const { text: bodyText, images: msgImages } = parseImages(msg.content || '');
                  return (
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
                        {bodyText && (
                          <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap">{bodyText}</p>
                        )}
                        {msgImages.length > 0 && (
                          <div className="mt-2 grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(msgImages.length, 3)}, minmax(0, 1fr))` }}>
                            {msgImages.map((src, i) => (
                              <button key={i} onClick={() => setZoomUrl(src)} className="group relative overflow-hidden rounded-lg border border-[var(--color-border)] bg-black/40 focus:outline-none">
                                <img src={src} alt="attachment" loading="lazy" className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105" />
                                <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                                  <ImageIcon className="w-5 h-5 text-white/0 group-hover:text-white transition-colors" />
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Ticket Attachments Section */}
            <div className="mb-6 p-4 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Attachments ({attachments.length})
                </h3>
                {!closed && (
                  <button
                    onClick={() => attFileRef.current?.click()}
                    disabled={attUploading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-primary)] transition-colors disabled:opacity-50"
                  >
                    {attUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    {attUploading ? 'Uploading...' : 'Upload file'}
                  </button>
                )}
                <input ref={attFileRef} type="file" multiple hidden onChange={onAttPick} />
              </div>
              {attachments.length === 0 ? (
                <p className="text-xs text-[var(--color-text-tertiary)] text-center py-4">No attachments yet</p>
              ) : (
                <div className="space-y-2">
                  {attachments.map((att: any) => (
                    <div key={att.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                      <FileText className="w-4 h-4 text-[var(--color-text-tertiary)] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--color-text)] truncate">{att.fileName}</p>
                        <p className="text-[11px] text-[var(--color-text-tertiary)]">
                          {formatSize(att.fileSize || 0)} · {att.createdAt ? new Date(att.createdAt).toLocaleString() : ''}
                        </p>
                      </div>
                      <a
                        href={att.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary-surface)] transition-colors"
                      >
                        <Download className="w-3 h-3" /> Download
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {closed ? (
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-tertiary)] py-2">
                <LockIcon />
                Messaging is disabled for {ticket.status} tickets.
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-3">
                {picked.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {picked.map((p, i) => (
                      <div key={i} className="relative">
                        <img src={p.preview} alt="preview" className="h-16 w-16 rounded-lg object-cover border border-[var(--color-border)]" />
                        <button
                          type="button"
                          onClick={() => removePick(i)}
                          className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/80 text-white border border-white/20 hover:bg-black transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={sending || uploading || picked.length >= 6}
                    title="Attach images"
                    className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center border-2 border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-primary)] transition-colors disabled:opacity-40"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onPick} />
                  <div className="flex-1">
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      rows={2}
                      placeholder="Type your message... (you can attach images)"
                      className="w-full px-4 py-2.5 border-2 border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:shadow-brutal-sm resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending || uploading || (!message.trim() && picked.length === 0)}
                    className="inline-flex h-11 items-center gap-2 px-4 border-2 bg-[var(--color-primary)] text-[var(--color-bg)] text-sm font-medium shadow-brutal-sm hover:bg-[var(--color-primary-hover)] hover:shadow-brutal transition-all disabled:opacity-50 flex-shrink-0">
                    {sending || uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {zoomUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setZoomUrl(null)}>
          <button
            onClick={() => setZoomUrl(null)}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <img src={zoomUrl} alt="Zoomed attachment" className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
