import React, { useState, useEffect, useRef } from 'react';
import { NavTab } from '../types';
import { searchAll, SearchResults, ApiError } from '../lib/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (tab: NavTab) => void;
}

interface FlatResult {
  key: string;
  title: string;
  category: string;
  tab: NavTab;
  icon: string;
  subtitle?: string;
}

function flatten(results: SearchResults): FlatResult[] {
  const out: FlatResult[] = [];
  for (const t of results.tasks) {
    out.push({ key: `task-${t.id}`, title: t.title, category: 'Study Task', tab: 'academics', icon: 'school', subtitle: t.status });
  }
  for (const s of results.sessions) {
    out.push({ key: `session-${s.id}`, title: s.title, category: 'Study Session', tab: 'academics', icon: 'event', subtitle: s.status });
  }
  for (const e of results.expenses) {
    out.push({ key: `expense-${e.id}`, title: e.title, category: 'Expense', tab: 'finance', icon: 'account_balance_wallet', subtitle: `₹${e.amount} • ${e.category}` });
  }
  for (const n of results.notifications) {
    out.push({ key: `notif-${n.id}`, title: n.title, category: 'Alert', tab: 'home', icon: 'notifications', subtitle: n.category });
  }
  for (const s of results.spots) {
    out.push({ key: `spot-${s.id}`, title: s.title, category: 'Explore', tab: 'explore', icon: 'location_on', subtitle: s.category });
  }
  for (const s of results.shopping) {
    out.push({ key: `shop-${s.id}`, title: s.title, category: 'Shopping', tab: 'finance', icon: 'shopping_bag', subtitle: `₹${s.price}` });
  }
  return out;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FlatResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setSearchError(null);
      return;
    }
  }, [isOpen ]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchAll(trimmed);
        setResults(flatten(data));
        setSearchError(null);
      } catch (err) {
        setSearchError(err instanceof ApiError ? err.message : 'Search is unavailable right now.');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  if (!isOpen) return null;

  const hasQuery = query.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-xs p-4 pt-16">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-4 space-y-3 border border-gray-200 animate-in zoom-in-95 duration-150">
        {/* Search input bar */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
          <span className="material-symbols-outlined text-[20px] text-indigo-600">search</span>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your tasks, expenses, spots..."
            className="w-full bg-transparent text-xs text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            aria-label="Close search"
            className="w-6 h-6 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-300 transition-colors cursor-pointer text-xs"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Results list */}
        <div className="space-y-1.5 max-h-72 overflow-y-auto">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
            {!hasQuery
              ? 'Type to search your data'
              : isSearching
              ? 'Searching…'
              : searchError
              ? 'Search failed'
              : `${results.length} result${results.length === 1 ? '' : 's'} found`}
          </span>

          {!hasQuery && (
            <p className="text-[11px] text-gray-400 px-1 py-2">
              Searches your study tasks, sessions, expenses, alerts, campus spots, and shopping.
            </p>
          )}

          {searchError && (
            <p className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {searchError}
            </p>
          )}

          {hasQuery && !isSearching && !searchError && results.length === 0 && (
            <p className="text-[11px] text-gray-400 px-1 py-2">
              Nothing matched “{query.trim()}”. Try a different keyword.
            </p>
          )}

          {results.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                onSelectResult(item.tab);
                onClose();
              }}
              className="w-full p-2.5 rounded-xl hover:bg-gray-50 flex items-center justify-between text-left transition-colors cursor-pointer group"
              type="button"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gray-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#1a1a1a] truncate">{item.title}</p>
                  <span className="text-[11px] text-gray-400">
                    {item.category}{item.subtitle ? ` • ${item.subtitle}` : ''}
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[16px] text-gray-400 group-hover:text-indigo-600 transition-colors">
                chevron_right
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
