// FILE: src/components/contacts/ContactFilters.tsx
import React from 'react';
import { Search, Download, X, Filter } from 'lucide-react';
import { CONTACT_STATUSES } from '../../constants/constants';
import { ContactStatus } from '../../types';
import { Button } from '../ui/Button';

export interface FilterState {
  search: string;
  statuses: ContactStatus[];
  source: 'all' | 'csv' | 'pdf' | 'manual';
  hasReplies: 'all' | 'replied' | 'unreplied';
}

export interface ContactFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
  onExportCSV: () => void;
  totalFilteredCount: number;
}

export const ContactFilters: React.FC<ContactFiltersProps> = ({
  filters,
  onChange,
  onClear,
  onExportCSV,
  totalFilteredCount,
}) => {
  const hasActiveFilters =
    filters.search.length > 0 ||
    filters.statuses.length > 0 ||
    filters.source !== 'all' ||
    filters.hasReplies !== 'all';

  const toggleStatus = (status: ContactStatus) => {
    const next = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    onChange({ ...filters, statuses: next });
  };

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-xl p-4 shadow-xs space-y-3">
      {/* Top Search & Actions Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search by recruiter name, company, email, role..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-white/10 bg-[#0a0a0a] rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-transparent text-white placeholder-zinc-500"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasActiveFilters && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onClear}
              leftIcon={<X className="w-3.5 h-3.5" />}
            >
              Clear Filters
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={onExportCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV ({totalFilteredCount})
          </Button>
        </div>
      </div>

      {/* Filter Chips / Selectors */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5 text-xs">
        <span className="text-zinc-500 flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider mr-1">
          <Filter className="w-3 h-3 text-emerald-400" /> Status:
        </span>

        {CONTACT_STATUSES.map((st) => {
          const isSelected = filters.statuses.includes(st as ContactStatus);
          return (
            <button
              key={st}
              type="button"
              onClick={() => toggleStatus(st as ContactStatus)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-emerald-500 text-black border-emerald-500 font-semibold'
                  : 'bg-white/5 text-zinc-400 border-white/5 hover:border-white/20 hover:text-white'
              }`}
            >
              {st}
            </button>
          );
        })}

        <div className="h-4 w-[1px] bg-white/10 mx-1 hidden sm:block" />

        {/* Source Dropdown */}
        <select
          value={filters.source}
          onChange={(e) => onChange({ ...filters, source: e.target.value as any })}
          className="bg-[#0a0a0a] border border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-300 focus:outline-none cursor-pointer"
        >
          <option value="all" className="bg-[#0c0c0c] text-white">Source: All</option>
          <option value="csv" className="bg-[#0c0c0c] text-white">CSV Import</option>
          <option value="pdf" className="bg-[#0c0c0c] text-white">PDF Extract</option>
          <option value="manual" className="bg-[#0c0c0c] text-white">Manual Entry</option>
        </select>
      </div>
    </div>
  );
};
