'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  MapPin,
  Search,
  List,
  Map as MapIcon,
  Plus,
  Flame,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { BhandaraCard } from '@/components/BhandaraCard';
import { LoginModal } from '@/components/LoginModal';
import {
  fetchAllBhandaras,
  getSavedUser,
  getUserVoteForBhandara,
  submitVoteClient,
} from '@/lib/client-api';
import {
  getBhandaraStatus,
  getDistanceKm,
  isTodayInIndore,
} from '@/lib/geo';
import { INDORE_AREAS, QUICK_FOOD_FILTERS } from '@/lib/indore-areas';
import { Bhandara } from '@/lib/types';

const BhandaraMap = dynamic(
  () => import('@/components/BhandaraMap').then((m) => m.BhandaraMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] items-center justify-center rounded-3xl border-2 border-orange-200 bg-orange-50 font-bold text-orange-800">
        🗺️ Indore ka Map load ho raha hai...
      </div>
    ),
  }
);

type TabKey = 'live' | 'today' | 'upcoming' | 'all';
type SortKey = 'nearest' | 'popular' | 'newest';

export default function HomePage() {
  const [bhandaras, setBhandaras] = useState<Bhandara[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('live');
  const [sortBy, setSortBy] = useState<SortKey>('nearest');
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [foodKeyword, setFoodKeyword] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [gpsStatusText, setGpsStatusText] = useState<string>('');
  const [votedIds, setVotedIds] = useState<Record<string, boolean>>({});
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const list = await fetchAllBhandaras(false);
    setBhandaras(list);
    const votesMap: Record<string, boolean> = {};
    for (const b of list) {
      if (getUserVoteForBhandara(b.id)) {
        votesMap[b.id] = true;
      }
    }
    setVotedIds(votesMap);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const requestGps = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsStatusText('Aapke browser me GPS support nahi hai');
      return;
    }
    setGpsStatusText('Location dhoondh rahe hain...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGpsStatusText('📍 Sabse paas wale bhandare upar dikh rahe hain!');
      },
      () => {
        setGpsStatusText(
          'Location permission nahi mili — neeche se Area chunein 👇'
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleQuickConfirm = async (id: string) => {
    const user = getSavedUser();
    if (!user) {
      setLoginPromptOpen(true);
      return;
    }
    const updated = await submitVoteClient(id, 'chal_raha');
    if (updated) {
      setBhandaras((prev) => prev.map((b) => (b.id === id ? updated : b)));
      setVotedIds((prev) => ({ ...prev, [id]: true }));
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    let liveCount = 0;
    let todayCount = 0;
    let totalConfirmations = 0;
    for (const b of bhandaras) {
      const st = getBhandaraStatus(b, now);
      if (st === 'live') liveCount += 1;
      if (
        (st === 'live' || st === 'upcoming') &&
        (isTodayInIndore(b.startTime, now) || st === 'live')
      ) {
        todayCount += 1;
      }
      totalConfirmations += b.votes.chal_raha || 0;
    }
    return { liveCount, todayCount, totalConfirmations };
  }, [bhandaras]);

  const filteredList = useMemo(() => {
    const now = new Date();
    const q = searchQuery.trim().toLowerCase();

    const matched = bhandaras.filter((b) => {
      const status = getBhandaraStatus(b, now);
      if (tab === 'live' && status !== 'live') return false;
      if (
        tab === 'today' &&
        status !== 'live' &&
        !isTodayInIndore(b.startTime, now)
      ) {
        return false;
      }
      if (tab === 'upcoming' && status !== 'upcoming') return false;

      if (selectedArea !== 'ALL' && b.area !== selectedArea) return false;

      if (foodKeyword) {
        const hasFood = b.foodItems.some((f) =>
          f.toLowerCase().includes(foodKeyword.toLowerCase())
        );
        if (!hasFood) return false;
      }

      if (q) {
        const hay = `${b.title} ${b.area} ${b.landmark} ${b.address} ${
          b.organizerName || ''
        } ${b.foodItems.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });

    return matched
      .map((b) => ({
        bhandara: b,
        distanceKm: userLocation
          ? getDistanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng)
          : null,
      }))
      .sort((a, b) => {
        if (sortBy === 'popular') {
          return b.bhandara.votes.chal_raha - a.bhandara.votes.chal_raha;
        }
        if (sortBy === 'newest') {
          return (
            new Date(b.bhandara.createdAt).getTime() -
            new Date(a.bhandara.createdAt).getTime()
          );
        }
        if (a.distanceKm !== null && b.distanceKm !== null) {
          return a.distanceKm - b.distanceKm;
        }
        const statusOrder = { live: 0, upcoming: 1, ended: 2 };
        const diff =
          statusOrder[getBhandaraStatus(a.bhandara, now)] -
          statusOrder[getBhandaraStatus(b.bhandara, now)];
        if (diff !== 0) return diff;
        return b.bhandara.votes.chal_raha - a.bhandara.votes.chal_raha;
      });
  }, [bhandaras, tab, sortBy, selectedArea, foodKeyword, searchQuery, userLocation]);

  return (
    <div className="min-h-screen pb-24">
      <Navbar gpsActive={!!userLocation} onRequestGps={requestGps} />

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#7C2D12] via-[#C2410C] to-[#EA580C] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20px 20px, #FFFBEB 2px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Indore Live Bhandara Radar • 100% Free Seva
              </div>
              <h1 className="mt-2.5 text-2xl font-black leading-tight sm:text-4xl">
                Indore me abhi kahan{' '}
                <span className="text-amber-300 underline decoration-wavy decoration-amber-400/70 underline-offset-4">
                  Bhandara
                </span>{' '}
                chal raha hai? 🍛
              </h1>
              <p className="mt-2 text-sm font-medium text-orange-100 sm:text-base">
                Khajrana se Rajwada, Bhawarkua se Vijay Nagar — 2 tap me dekho
                live prasad menu, time aur Google Maps raasta.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={requestGps}
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
              {gpsStatusText && (
                <p className="mt-2 text-xs font-bold text-amber-200">
                  {gpsStatusText}
                </p>
              )}
            </div>

            {/* Live Counters */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              <div className="rounded-2xl border border-white/20 bg-white/15 p-3 text-center backdrop-blur-sm">
                <div className="text-2xl font-black text-amber-300 sm:text-3xl">
                  {stats.liveCount}
                </div>
                <div className="mt-0.5 text-[11px] font-bold text-orange-50">
                  🔴 Abhi LIVE
                </div>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/15 p-3 text-center backdrop-blur-sm">
                <div className="text-2xl font-black text-white sm:text-3xl">
                  {stats.todayCount}
                </div>
                <div className="mt-0.5 text-[11px] font-bold text-orange-50">
                  📅 Aaj Total
                </div>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/15 p-3 text-center backdrop-blur-sm">
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

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-3 py-5 sm:px-6">
        {/* Status Tabs + View Mode Toggle */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
            {[
              {
                key: 'live' as TabKey,
                label: 'Abhi Chal Raha',
                icon: <Flame className="h-4 w-4 text-red-500" />,
              },
              {
                key: 'today' as TabKey,
                label: 'Aaj Ke Bhandare',
                icon: <Calendar className="h-4 w-4 text-orange-600" />,
              },
              {
                key: 'upcoming' as TabKey,
                label: 'Aane Wale',
                icon: <Clock className="h-4 w-4 text-amber-600" />,
              },
              {
                key: 'all' as TabKey,
                label: 'Sabhi',
                icon: <Sparkles className="h-4 w-4 text-orange-600" />,
              },
            ].map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
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
                onClick={() => setViewMode('list')}
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
                onClick={() => setViewMode('map')}
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
              onClick={loadData}
              title="Refresh"
              className="rounded-xl border border-orange-200 bg-white p-2 text-orange-700 shadow-sm hover:bg-orange-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Search & Area Filter */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Mandir, area, landmark ya prasad khojein (jaise: Khajrana, Dal Bafla, Kheer)..."
              className="w-full rounded-2xl border-2 border-orange-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-[#431407] placeholder:text-orange-900/40 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
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
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
            {QUICK_FOOD_FILTERS.map((f) => {
              const active = foodKeyword === f.keyword;
              return (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => setFoodKeyword(f.keyword)}
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
                onClick={() => setSortBy(s.k)}
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

        {/* Results */}
        <div className="mt-5">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-80 animate-pulse rounded-3xl border border-orange-200 bg-orange-100/60"
                />
              ))}
            </div>
          ) : filteredList.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-orange-300 bg-white p-10 text-center">
              <div className="text-5xl">🍛</div>
              <h3 className="mt-3 text-lg font-extrabold text-[#431407]">
                Is filter me abhi koi bhandara nahi mila
              </h3>
              <p className="mt-1 text-sm text-orange-900/70">
                Filter badlein, ya agar aapke aas-paas bhandara chal raha hai to
                abhi jodein!
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTab('all');
                    setSelectedArea('ALL');
                    setFoodKeyword('');
                    setSearchQuery('');
                  }}
                  className="rounded-xl border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-bold text-[#431407]"
                >
                  Sabhi Bhandare Dikhao
                </button>
                <Link
                  href="/add"
                  className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-extrabold text-white shadow"
                >
                  ➕ Bhandara Jodo
                </Link>
              </div>
            </div>
          ) : viewMode === 'map' ? (
            <BhandaraMap
              bhandaras={filteredList.map((x) => x.bhandara)}
              userLocation={userLocation}
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredList.map(({ bhandara, distanceKm }) => (
                <BhandaraCard
                  key={bhandara.id}
                  bhandara={bhandara}
                  distanceKm={distanceKm}
                  onQuickConfirm={handleQuickConfirm}
                  userVoted={!!votedIds[bhandara.id]}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Indore Seva & Zero Food Waste Banner */}
      <section className="mx-auto mt-10 max-w-6xl px-3 sm:px-6">
        <div className="rounded-3xl border border-orange-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-black text-[#431407] sm:text-lg">
                🍱 Bacha Hua Khana? Indore Annadaan Seva
              </h2>
              <p className="mt-1 text-xs font-medium text-orange-900/80 sm:text-sm">
                Aayojakon se nivedan hai: bhandara samapt hone ke baad agar
                shuddh bhojan bache to aas-paas ke gareebon, hospital ke baahar
                ya Roti Bank / Annakshetra me zaroor bhejwayein.
              </p>
            </div>
            <Link
              href="/about"
              className="shrink-0 rounded-2xl bg-[#431407] px-4 py-2.5 text-center text-xs font-extrabold text-white hover:bg-orange-900"
            >
              Seva Niyam &amp; App Guide →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 border-t border-orange-200 bg-white/80 py-6 text-center text-xs text-orange-900/75">
        <div className="mx-auto max-w-6xl px-4 space-y-2">
          <p className="font-bold text-[#431407]">
            🍛 Nukti Poodi (नुक्ती पूड़ी) — Indore Community Bhandara Finder
          </p>
          <p>
            Sirf jaankari ke liye platform. Prasad ka samman karein, ann barbad
            na karein 🙏
          </p>
          <div className="flex justify-center gap-4 pt-1 font-bold text-orange-700">
            <Link href="/add" className="hover:underline">
              Bhandara Jodo
            </Link>
            <Link href="/about" className="hover:underline">
              About &amp; Disclaimer
            </Link>
            <Link href="/admin" className="hover:underline">
              Admin
            </Link>
          </div>
        </div>
      </footer>

      {/* Mobile Floating CTA */}
      <Link
        href="/add"
        className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-600 to-red-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-2xl shadow-orange-700/40 transition hover:scale-105 sm:hidden"
      >
        <Plus className="h-5 w-5" />
        Bhandara Jodo
      </Link>

      <LoginModal
        open={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
        reason="Confirm karne ke liye apna naam batayein (1 tap)"
      />
    </div>
  );
}
