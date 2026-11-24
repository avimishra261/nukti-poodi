'use client';

import {
  Calendar,
  Clock,
  Flame,
  List,
  Map as MapIcon,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { INDORE_AREAS, QUICK_FOOD_FILTERS } from '@/lib/indore-areas';
import { BhandaraStats, SortKey, TabKey } from '@/lib/services/bhandara-filter';

interface FilterToolbarProps {
  tab: TabKey;
  onTabChange: (t: TabKey) => void;
  stats: BhandaraStats;
  sortBy: SortKey;
  onSortChange: (s: SortKey) => void;
  selectedArea: string;
  onAreaChange: (a: string) => void;
  foodKeyword: string;
  onFoodChange: (f: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: 'list' | 'map';
  onViewModeChange: (v: 'list' | 'map') => void;
  loading: boolean;
  onRefresh: () => void;
}

export function FilterToolbar({
  tab,
  onTabChange,
  stats,
  sortBy,
  onSortChange,
  selectedArea,
  onAreaChange,
  foodKeyword,
  onFoodChange,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  loading,
  onRefresh,
}: FilterToolbarProps) {
  const tabs = [
    {
      key: 'live' as TabKey,
      label: `Abhi Chal Raha (${stats.liveCount})`,
      icon: <Flame className="h-4 w-4 text-red-500" />,
    },
    {
      key: 'today' as TabKey,
      label: `Aaj Ke (${stats.todayCount})`,
      icon: <Calendar className="h-4 w-4 text-orange-600" />,
    },
    {
      key: 'upcoming' as TabKey,
      label: `Aane Wale (${stats.upcomingCount})`,
      icon: <Clock className="h-4 w-4 text-amber-600" />,
    },
    {
      key: 'all' as TabKey,
      label: `Sabhi (${stats.allCount})`,
      icon: <Sparkles className="h-4 w-4 text-orange-600" />,
    },
  ];

  return (
    <div className="space-y-3.5">
      {/* Status Tabs + View Mode Toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => onTabChange(t.key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-extrabold transition ${
                  active
                    ? 'bg-[#431407] text-white shadow-md'
                    : 'border border-orange-200 bg-white text-[#431407] hover:bg-orange-50'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex rounded-2xl border border-orange-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                viewMode === 'list'
                  ? 'bg-orange-600 text-white'
                  : 'text-[#431407] hover:bg-orange-50'
              }`}
            >
              <List className="h-4 w-4" />
              List
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('map')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                viewMode === 'map'
                  ? 'bg-orange-600 text-white'
                  : 'text-[#431407] hover:bg-orange-50'
              }`}
            >
              <MapIcon className="h-4 w-4" />
              Map
            </button>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            title="Refresh"
            className="rounded-xl border border-orange-200 bg-white p-2 text-orange-700 shadow-sm hover:bg-orange-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search & Area Filter */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="relative sm:col-span-2">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Mandir, area, landmark ya prasad khojein (jaise: Khajrana, Dal Bafla, Kheer)..."
            className="w-full rounded-2xl border-2 border-orange-200 bg-white py-2.5 pl-10 pr-9 text-sm font-medium text-[#431407] placeholder:text-orange-900/40 focus:border-orange-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Search saaf karein"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-orange-700 hover:bg-orange-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <select
          value={selectedArea}
          onChange={(e) => onAreaChange(e.target.value)}
          aria-label="Indore Area Chunein"
          className="w-full rounded-2xl border-2 border-orange-200 bg-white px-4 py-2.5 text-sm font-bold text-[#431407] focus:border-orange-500 focus:outline-none"
        >
          <option value="ALL">📍 Poora Indore (Sabhi Areas)</option>
          {INDORE_AREAS.map((a) => (
            <option key={a.name} value={a.name}>
              {a.name} ({a.hindiName})
            </option>
          ))}
        </select>
      </div>

      {/* Quick Food Filter Chips + Sort */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
          {QUICK_FOOD_FILTERS.map((f) => {
            const active = foodKeyword === f.keyword;
            return (
              <button
                key={f.label}
                type="button"
                onClick={() => onFoodChange(f.keyword)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-extrabold transition ${
                  active
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'border border-orange-200 bg-white text-orange-900 hover:bg-orange-50'
                }`}
              >
                {f.emoji} {f.label}
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-1.5 text-xs">
          <span className="font-bold text-orange-900/70">Sort:</span>
          {(
            [
              { k: 'nearest', label: '📍 Paas / Live' },
              { k: 'popular', label: '🔥 Popular' },
              { k: 'newest', label: '🆕 Naye' },
            ] as { k: SortKey; label: string }[]
          ).map((s) => (
            <button
              key={s.k}
              type="button"
              onClick={() => onSortChange(s.k)}
              className={`rounded-full px-2.5 py-1 font-bold transition ${
                sortBy === s.k
                  ? 'bg-[#431407] text-white'
                  : 'border border-orange-200 bg-white text-[#431407] hover:bg-orange-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
