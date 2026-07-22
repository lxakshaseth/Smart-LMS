import React, { useState, useEffect, useRef } from "react";
import { Search, Mic, X, Clock, SlidersHorizontal } from "lucide-react";

interface SearchBarProps {
  query: string;
  setQuery: (q: string) => void;
  onSearch: (searchTerm: string) => void;
  sort: string;
  setSort: (sort: string) => void;
}

export default function SearchBar({
  query,
  setQuery,
  onSearch,
  sort,
  setSort
}: SearchBarProps) {
  const [showRecent, setShowRecent] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("yt_recent_searches");
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to load recent searches", e);
    }
  }, []);

  // Handle outside click to close recent searches dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowRecent(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveSearchTerm = (term: string) => {
    if (!term.trim()) return;
    const clean = term.trim();
    const updated = [clean, ...recentSearches.filter(s => s !== clean)].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem("yt_recent_searches", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save recent searches", e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    saveSearchTerm(query);
    setShowRecent(false);
    onSearch(query);
  };

  const handleSelectRecent = (term: string) => {
    setQuery(term);
    saveSearchTerm(term);
    setShowRecent(false);
    onSearch(term);
  };

  const clearRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== term);
    setRecentSearches(updated);
    try {
      localStorage.setItem("yt_recent_searches", JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to clear search term", err);
    }
  };

  const handleVoiceSearch = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      alert("Voice search listening... (Speak your topic now)");
    }, 1500);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <div ref={dropdownRef} className="relative flex-1">
          <div className="relative flex items-center">
            <Search className="absolute left-4 text-muted-foreground pointer-events-none" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowRecent(true);
              }}
              onFocus={() => setShowRecent(true)}
              placeholder="Search courses, tutorials, playlists, chapters..."
              className="w-full pl-12 pr-20 py-3.5 bg-card/80 backdrop-blur-md text-foreground rounded-2xl border border-border/80 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
            />
            <div className="absolute right-3 flex items-center gap-1.5">
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    onSearch("");
                  }}
                  className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`p-2 rounded-xl transition-all ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
                title="Voice Search"
              >
                <Mic size={18} />
              </button>
            </div>
          </div>

          {/* Recent Searches Dropdown */}
          {showRecent && recentSearches.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Recent Searches
              </div>
              {recentSearches.map((term, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectRecent(term)}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/70 cursor-pointer text-sm transition-colors group"
                >
                  <div className="flex items-center gap-3 text-foreground">
                    <Clock size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    <span>{term}</span>
                  </div>
                  <button
                    onClick={(e) => clearRecentSearch(e, term)}
                    className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sort Filter Selector */}
        <div className="flex items-center gap-2 bg-card border border-border px-3 py-3 rounded-2xl shadow-sm">
          <SlidersHorizontal size={16} className="text-muted-foreground" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-transparent text-xs font-medium text-foreground focus:outline-none cursor-pointer pr-2"
          >
            <option value="relevance">Most Relevant</option>
            <option value="date">Newest</option>
            <option value="viewCount">Most Viewed</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </form>
    </div>
  );
}
