'use client';

import Link from 'next/link';
import { MapPin, Plus } from 'lucide-react';
import { BhandaraStats } from '@/lib/services/bhandara-filter';

interface HeroBannerProps {
  stats: BhandaraStats;
  userLocation: { lat: number; lng: number } | null;
  gpsStatusText: string;
  selectedArea: string;
  onRequestGps: () => void;
  onQuickSelectArea: (area: string) => void;
}

const POPULAR_AREAS = [
  'Khajrana',
  'Rajwada',
  'Vijay Nagar',
  'Bhawarkua',
  'Annapurna',
  'Sarafa',
];

export function HeroBanner({
  stats,
  userLocation,
  gpsStatusText,
  selectedArea,
  onRequestGps,
  onQuickSelectArea,
}: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#581C0C] via-[#9A3412] to-[#EA580C] text-white shadow-lg">
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20px 20px, #FFFBEB 2px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-9">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Indore Live Cloud Radar • 100% Free Seva
            </div>

            <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight sm:text-4xl">
              Indore me abhi kahan{' '}
              <span className="text-amber-300 underline decoration-wavy decoration-amber-400/80 underline-offset-4">
                Bhandara
              </span>{' '}
              chal raha hai? 🍛
            </h1>

            <p className="mt-2 text-sm font-medium text-orange-100/95 sm:text-base">
              Khajrana se Rajwada, Bhawarkua se Vijay Nagar — 2 tap me dekho
              live prasad menu, time, crowd status aur Google Maps raasta.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={onRequestGps}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-extrabold text-[#7C2D12] shadow-lg transition hover:bg-amber-50 active:scale-[0.98]"
              >
                <MapPin className="h-4 w-4 text-orange-600" />
                {userLocation
                  ? '📍 Near Me Active ✓'
                  : '📍 Mere Sabse Paas (Near Me)'}
              </button>
              <Link
                href="/add"
                className="inline-flex items-center gap-1.5 rounded-2xl border border-white/40 bg-white/15 px-4 py-2.5 text-sm font-extrabold text-white backdrop-blur-sm transition hover:bg-white/25"
              >
                <Plus className="h-4 w-4" />
                Naya Bhandara Jodo
              </Link>
            </div>

            {/* Quick Area Jump Pills */}
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[11px] font-bold text-orange-200">
                Hotspots:
              </span>
              {POPULAR_AREAS.map((areaName) => {
                const active = selectedArea === areaName;
                return (
                  <button
                    key={areaName}
                    type="button"
                    onClick={() =>
                      onQuickSelectArea(active ? 'ALL' : areaName)
                    }
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                      active
                        ? 'bg-amber-300 text-[#431407] shadow'
                        : 'bg-white/15 text-orange-50 hover:bg-white/25'
                    }`}
                  >
                    {areaName}
                  </button>
                );
              })}
            </div>

            {gpsStatusText && (
              <p className="mt-2.5 text-xs font-bold text-amber-200">
                {gpsStatusText}
              </p>
            )}
          </div>

          {/* Live Counters */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            <div className="rounded-2xl border border-white/25 bg-white/15 p-3.5 text-center shadow-inner backdrop-blur-md">
              <div className="text-2xl font-black text-amber-300 sm:text-3xl">
                {stats.liveCount}
              </div>
              <div className="mt-0.5 text-[11px] font-bold text-orange-50">
                🔴 Abhi LIVE
              </div>
            </div>
            <div className="rounded-2xl border border-white/25 bg-white/15 p-3.5 text-center shadow-inner backdrop-blur-md">
              <div className="text-2xl font-black text-white sm:text-3xl">
                {stats.todayCount}
              </div>
              <div className="mt-0.5 text-[11px] font-bold text-orange-50">
                📅 Aaj Total
              </div>
            </div>
            <div className="rounded-2xl border border-white/25 bg-white/15 p-3.5 text-center shadow-inner backdrop-blur-md">
              <div className="text-2xl font-black text-emerald-300 sm:text-3xl">
                {stats.totalConfirmations}
              </div>
              <div className="mt-0.5 text-[11px] font-bold text-orange-50">
                ✅ Confirmations
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
