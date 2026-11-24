'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Flag,
  MapPin,
  Navigation,
  Share2,
  Users,
  XCircle,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { LoginModal } from '@/components/LoginModal';
import {
  fetchBhandaraById,
  getSavedUser,
  getUserVoteForBhandara,
  submitVoteClient,
} from '@/lib/client-api';
import {
  buildWhatsAppShareUrl,
  formatDayTimeIST,
  formatTimeIST,
  getDominantCrowd,
  getGoogleMapsUrl,
  getStatusLabel,
} from '@/lib/geo';
import { Bhandara, CrowdLevel, VoteType } from '@/lib/types';

const LocationPickerMap = dynamic(
  () => import('@/components/LocationPickerMap').then((m) => m.LocationPickerMap),
  { ssr: false }
);

export function BhandaraDetailClient({ routeId }: { routeId: string }) {
  const searchParams = useSearchParams();
  const resolvedId =
    routeId === 'custom' ? searchParams.get('id') || 'custom' : routeId;

  const [bhandara, setBhandara] = useState<Bhandara | null>(null);
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState<VoteType | null>(null);
  const [crowdVoted, setCrowdVoted] = useState<CrowdLevel | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [toast, setToast] = useState<string>('');

  const isCreatedNow = searchParams.get('created') === '1';

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const data = await fetchBhandaraById(resolvedId);
      if (active) {
        setBhandara(data);
        setUserVote(getUserVoteForBhandara(resolvedId));
        setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [resolvedId]);

  const handleVote = async (voteType: VoteType) => {
    if (!bhandara) return;
    const user = getSavedUser();
    if (!user) {
      setLoginOpen(true);
      return;
    }
    const updated = await submitVoteClient(bhandara.id, voteType);
    if (updated) {
      setBhandara(updated);
      setUserVote(voteType);
      setToast(
        voteType === 'chal_raha'
          ? 'Dhanyawad! Aapne confirm kiya ki bhandara chal raha hai ✅'
          : voteType === 'khatam'
          ? 'Update ke liye shukriya. 3+ reports par auto-ended ho jayega.'
          : 'Report darj ho gayi. 3+ fake reports par post hide ho jayegi.'
      );
    }
  };

  const handleCrowdVote = async (level: CrowdLevel) => {
    if (!bhandara || crowdVoted) return;
    const updated = await submitVoteClient(bhandara.id, undefined, level);
    if (updated) {
      setBhandara(updated);
      setCrowdVoted(level);
      setToast('Bheed ka haal update ho gaya 🙏');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBEB]">
        <Navbar />
        <div className="mx-auto max-w-3xl p-6">
          <div className="h-96 animate-pulse rounded-3xl bg-orange-100" />
        </div>
      </div>
    );
  }

  if (!bhandara) {
    return (
      <div className="min-h-screen bg-[#FFFBEB]">
        <Navbar />
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <div className="text-5xl">🍛</div>
          <h1 className="mt-4 text-2xl font-black text-[#431407]">
            Ye Bhandara nahi mila
          </h1>
          <p className="mt-2 text-sm text-orange-900/70">
            Ho sakta hai ye post hata di gayi ho ya link galat ho.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 text-sm font-extrabold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Home pe Wapas Jayein
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusLabel(bhandara);
  const crowd = getDominantCrowd(bhandara);
  const mapsUrl = getGoogleMapsUrl(bhandara.lat, bhandara.lng);
  const currentUrl =
    typeof window !== 'undefined' ? window.location.href : '';
  const whatsappUrl = buildWhatsAppShareUrl(bhandara, currentUrl);

  return (
    <div className="min-h-screen bg-[#FFFBEB] pb-16">
      <Navbar />

      <main className="mx-auto max-w-3xl px-3 py-5 sm:px-6">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-extrabold text-[#431407] shadow-sm border border-orange-200 hover:bg-orange-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Saare Bhandare Dekho
        </Link>

        {isCreatedNow && (
          <div className="mb-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-emerald-950 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-black">
                  🎉 Jai Bhandara! Aapka Bhandara Live Ho Gaya!
                </h2>
                <p className="text-xs font-medium text-emerald-800">
                  Ab WhatsApp groups pe share karein taaki jyada se jyada bhakt
                  prasad paa sakein.
                </p>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white shadow"
              >
                <Share2 className="h-4 w-4" />
                WhatsApp Pe Bhejein
              </a>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-orange-200 bg-white shadow-lg">
          {/* Banner Photo */}
          <div className="relative aspect-[16/9] w-full bg-orange-100">
            <img
              src={bhandara.photoUrl}
              alt={bhandara.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold text-white shadow-md ${
                  statusInfo.status === 'live'
                    ? 'bg-red-600'
                    : statusInfo.status === 'upcoming'
                    ? 'bg-amber-500'
                    : 'bg-stone-700'
                }`}
              >
                {statusInfo.status === 'live' && (
                  <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                )}
                {statusInfo.badgeText}
              </span>
              {bhandara.isVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-extrabold text-white shadow-md">
                  <BadgeCheck className="h-4 w-4" />
                  Verified Mandir
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                  Community Post
                </span>
              )}
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-orange-700">
              <span>📍 {bhandara.area}, Indore</span>
              {bhandara.organizerName && (
                <>
                  <span>•</span>
                  <span>🛕 {bhandara.organizerName}</span>
                </>
              )}
            </div>

            <h1 className="mt-2 text-2xl font-black text-[#431407] sm:text-3xl">
              {bhandara.title}
            </h1>

            <p className="mt-2 flex items-center gap-2 text-sm font-bold text-orange-800">
              <Clock className="h-4 w-4 text-orange-600" />
              {formatDayTimeIST(bhandara.startTime)} –{' '}
              {formatTimeIST(bhandara.endTime)} ({statusInfo.detailText})
            </p>

            {bhandara.description && (
              <p className="mt-3 rounded-2xl bg-orange-50/80 p-3.5 text-sm font-medium text-orange-950">
                {bhandara.description}
              </p>
            )}

            {/* Prasad Menu */}
            <div className="mt-5">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-orange-800">
                🍽️ Aaj Ka Prasad Menu
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {bhandara.foodItems.map((item) => (
                  <span
                    key={item}
                    className="rounded-2xl border border-orange-200 bg-orange-50 px-3.5 py-1.5 text-sm font-extrabold text-[#431407]"
                  >
                    🍛 {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Primary Actions */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 px-5 py-4 text-base font-extrabold text-white shadow-lg shadow-orange-600/25 transition hover:brightness-110"
              >
                <Navigation className="h-5 w-5" />
                🧭 Google Maps Pe Raasta Dikhao
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 text-base font-extrabold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700"
              >
                <Share2 className="h-5 w-5" />
                📲 WhatsApp Pe Share Karo
              </a>
            </div>

            {/* Address & Mini Map */}
            <div className="mt-6 space-y-2">
              <h2 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-orange-800">
                <MapPin className="h-4 w-4 text-orange-600" />
                Pata aur Landmark
              </h2>
              <p className="text-sm font-bold text-[#431407]">
                {bhandara.address}
              </p>
              <p className="text-xs font-semibold text-orange-800">
                Pehchan (Landmark): {bhandara.landmark}
              </p>
              <LocationPickerMap
                lat={bhandara.lat}
                lng={bhandara.lng}
                interactive={false}
                heightClass="h-56"
              />
            </div>

            {/* Community Trust Engine */}
            <div className="mt-6 rounded-3xl border-2 border-orange-200 bg-[#FFFBEB] p-5">
              <h2 className="text-base font-black text-[#431407]">
                🔍 Kya Abhi Bhandara Chal Raha Hai? (Live Status Batayein)
              </h2>
              <p className="mt-0.5 text-xs font-medium text-orange-900/75">
                Aapke 1 click se baaki Indore ke bhakton ka samay bachega!
              </p>

              {toast && (
                <div className="mt-3 rounded-xl bg-emerald-100 px-3.5 py-2 text-xs font-bold text-emerald-900">
                  {toast}
                </div>
              )}

              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => handleVote('chal_raha')}
                  className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-sm font-extrabold transition ${
                    userVote === 'chal_raha'
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Haan Chal Raha ({bhandara.votes.chal_raha})
                </button>

                <button
                  type="button"
                  onClick={() => handleVote('khatam')}
                  className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-sm font-extrabold transition ${
                    userVote === 'khatam'
                      ? 'border-amber-600 bg-amber-600 text-white'
                      : 'border-amber-300 bg-white text-amber-900 hover:bg-amber-50'
                  }`}
                >
                  <XCircle className="h-4 w-4" />
                  Khatam Ho Gaya ({bhandara.votes.khatam})
                </button>

                <button
                  type="button"
                  onClick={() => handleVote('fake')}
                  className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-sm font-extrabold transition ${
                    userVote === 'fake'
                      ? 'border-red-600 bg-red-600 text-white'
                      : 'border-red-200 bg-white text-red-700 hover:bg-red-50'
                  }`}
                >
                  <Flag className="h-4 w-4" />
                  Fake Hai ({bhandara.votes.fake})
                </button>
              </div>

              {/* Crowd Meter */}
              <div className="mt-5 border-t border-orange-200 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-extrabold text-[#431407]">
                    <Users className="h-4 w-4 text-orange-600" />
                    Bheed ka Haal: {crowd.emoji} {crowd.label}
                  </span>
                  <div className="flex gap-1.5">
                    {(
                      [
                        { k: 'normal', label: '🟢 Kam' },
                        { k: 'medium', label: '👥 Medium' },
                        { k: 'heavy', label: '🔥 Bahut' },
                      ] as { k: CrowdLevel; label: string }[]
                    ).map((item) => (
                      <button
                        key={item.k}
                        type="button"
                        disabled={!!crowdVoted}
                        onClick={() => handleCrowdVote(item.k)}
                        className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                          crowdVoted === item.k
                            ? 'bg-[#431407] text-white'
                            : 'border border-orange-200 bg-white text-[#431407] hover:bg-orange-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs font-medium text-orange-900/60">
              <span>Post kiya: {bhandara.createdByName}</span>
              <span>Disclaimer: Khane ki zimmedari aayojak ki hai.</span>
            </div>
          </div>
        </div>
      </main>

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        reason="Vote / status update karne ke liye 1-tap login karein"
      />
    </div>
  );
}
