import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (companyName: string) => void;
  disabled: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, disabled }) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim() && !disabled) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl relative">
      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        disabled={disabled}
        placeholder="Enter company name..."
        className="w-full bg-[#0a0a0f] border border-slate-800 rounded-2xl py-6 pl-16 pr-40 text-lg focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-2xl text-white placeholder-slate-600 disabled:opacity-50 font-mono font-bold"
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <button
          onClick={handleSearch}
          disabled={disabled || !query.trim()}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-2 px-4 rounded-xl transition-colors text-sm tracking-wider uppercase"
        >
          Initiate Audit
        </button>
      </div>
    </div>
  );
};
