'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, MessageSquare, ChevronRight, HelpCircle, Shield, Settings, Activity, Globe, Bug, Lock, Bell, Link, Zap, BookOpen, LifeBuoy } from 'lucide-react';
import { api } from '../../lib/api-client';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  icon: string;
}

interface HelpData {
  articles: Article[];
  categories: string[];
}

const ICON_MAP: Record<string, any> = {
  zap: Zap, shield: Shield, settings: Settings, activity: Activity, globe: Globe,
  bug: Bug, lock: Lock, bell: Bell, link: Link, help: HelpCircle, book: BookOpen, lifebuoy: LifeBuoy,
};

export default function HelpCenterPage() {
  const [data, setData] = useState<HelpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    api.get<HelpData>('/api/public/faq')
      .then((d: HelpData) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    let articles = data.articles;
    if (selectedCategory !== 'All') articles = articles.filter(a => a.category === selectedCategory);
    if (searchQuery) articles = articles.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.content.toLowerCase().includes(searchQuery.toLowerCase()));
    return articles;
  }, [data, selectedCategory, searchQuery]);

  const categories = useMemo(() => {
    if (!data) return ['All'];
    const cats = Array.from(new Set(data.articles.map(a => a.category)));
    return ['All', ...cats];
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">Help Center</h1>
          <p className="text-[var(--color-text-secondary)]">Search our knowledge base or browse categories below</p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-tertiary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for answers..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-surface)] transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--color-border)]">
                <h2 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider">Categories</h2>
              </div>
              <nav className="p-2">
                {categories.map(cat => {
                  const Icon = cat === 'All' ? HelpCircle : (ICON_MAP[data?.articles.find(a => a.category === cat)?.icon || 'help'] || HelpCircle);
                  return (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setSelectedArticle(null); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === cat
                          ? 'bg-[var(--color-primary-surface)] text-[var(--color-primary)]'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{cat}</span>
                      {cat !== 'All' && (
                        <span className="ml-auto text-xs text-[var(--color-text-tertiary)]">
                          {data?.articles.filter(a => a.category === cat).length || 0}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {selectedArticle ? (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
                <div className="p-6 border-b border-[var(--color-border)]">
                  <button onClick={() => setSelectedArticle(null)} className="text-sm text-[var(--color-primary)] hover:underline mb-3">
                    ← Back to results
                  </button>
                  <h2 className="text-xl font-semibold text-[var(--color-text)]">{selectedArticle.title}</h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] mt-2">
                    {selectedArticle.category}
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-[var(--color-text-secondary)] whitespace-pre-wrap leading-relaxed">{selectedArticle.content}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[var(--color-text)]">
                    {selectedCategory === 'All' ? 'All Articles' : selectedCategory}
                  </h2>
                  <span className="text-sm text-[var(--color-text-tertiary)]">
                    {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
                  </span>
                </div>
                <div className="divide-y divide-[var(--color-border)]">
                  {filtered.length === 0 ? (
                    <div className="p-12 text-center">
                      <Search className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-tertiary)]" />
                      <h3 className="text-lg font-medium text-[var(--color-text)] mb-1">No articles found</h3>
                      <p className="text-sm text-[var(--color-text-secondary)]">Try adjusting your search or category filter</p>
                    </div>
                  ) : (
                    filtered.map(article => {
                      const Icon = ICON_MAP[article.icon] || HelpCircle;
                      return (
                        <button
                          key={article.id}
                          onClick={() => setSelectedArticle(article)}
                          className="w-full text-left p-5 hover:bg-[var(--color-surface-muted)] transition-colors flex items-start gap-4"
                        >
                          <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-surface)] flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-[var(--color-primary)]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-1">{article.title}</h3>
                            <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">{article.content}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[var(--color-text-tertiary)] flex-shrink-0 mt-1" />
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
