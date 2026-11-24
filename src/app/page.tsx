'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { FilterToolbar } from '@/components/FilterToolbar';
import { BhandaraCard } from '@/components/BhandaraCard';
import { AnnadaanSevaBanner } from '@/components/AnnadaanSevaBanner';
import { LoginModal } from '@/components/LoginModal';
import {
  fetchAllBhandaras,
  getSavedUser,
  getUserVoteForBhandara,
  submitVoteClient,
} from '@/lib/client-api';
import {
  computeBhandaraStats,
  filterAndSortBhandaras,
  SortKey,
  TabKey,
} from '@/lib/services/bhandara-filter';
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

  const stats = useMemo(() => computeBhandaraStats(bhandaras), [bhandaras]);

  const filteredList = useMemo(
    () =>
      filterAndSortBhandaras(bhandaras, {
        tab,
        sortBy,
        selectedArea,
        foodKeyword,
        searchQuery,
        userLocation,
      }),
    [bhandaras, tab, sortBy, selectedArea, foodKeyword, searchQuery, userLocation]
  );

  return (
    <div className="min-h-screen pb-24">
      <Navbar gpsActive={!!userLocation} onRequestGps={requestGps} />

      <HeroBanner
        stats={stats}
        userLocation={userLocation}
        gpsStatusText={gpsStatusText}
        selectedArea={selectedArea}
        onRequestGps={requestGps}
        onQuickSelectArea={(areaName) => {
          setSelectedArea(areaName);
          if (areaName !== 'ALL' && tab === 'live') {
            setTab('all');
          }
        }}
      />

      <main className="mx-auto max-w-6xl px-3 py-5 sm:px-6">
        <FilterToolbar
          tab={tab}
          onTabChange={setTab}
          stats={stats}
          sortBy={sortBy}
          onSortChange={setSortBy}
          selectedArea={selectedArea}
          onAreaChange={setSelectedArea}
          foodKeyword={foodKeyword}
          onFoodChange={setFoodKeyword}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          loading={loading}
          onRefresh={loadData}
        />

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

      <AnnadaanSevaBanner />

      <footer className="mt-10 border-t border-orange-200 bg-white/80 py-6 text-center text-xs text-orange-900/75">
        <div className="mx-auto max-w-6xl space-y-2 px-4">
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
