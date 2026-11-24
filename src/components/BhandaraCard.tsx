'use client';

import Link from 'next/link';
import {
  MapPin,
  Navigation,
  Share2,
  CheckCircle2,
  Clock,
  BadgeCheck,
  Users,
} from 'lucide-react';
import { Bhandara } from '@/lib/types';
import {
  buildWhatsAppShareUrl,
  getBhandaraDetailPath,
  getDominantCrowd,
  getGoogleMapsUrl,
  getStatusLabel,
} from '@/lib/geo';

interface BhandaraCardProps {
  bhandara: Bhandara;
  distanceKm?: number | null;
  onQuickConfirm?: (id: string) => void;
  userVoted?: boolean;
}

export function BhandaraCard({
  bhandara,
  distanceKm,
  onQuickConfirm,
  userVoted,
}: BhandaraCardProps) {
  const statusInfo = getStatusLabel(bhandara);
  const crowd = getDominantCrowd(bhandara);
  const detailPath = getBhandaraDetailPath(bhandara);
  const mapsUrl = getGoogleMapsUrl(bhandara.lat, bhandara.lng);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH || ''}${detailPath}`
      : detailPath;
  const whatsappUrl = buildWhatsAppShareUrl(bhandara, shareUrl);

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-orange-200/90 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-900/10">
      <Link href={detailPath} className="relative block aspect-[16/9] w-full overflow-hidden bg-orange-100">
        <img
          src={bhandara.photoUrl}
          alt={bhandara.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Status Pill */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          {statusInfo.status === 'live' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-extrabold text-white shadow-md">
              <span className="relative flex h-2 w-2">
                <span className="live-pulse-ring absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              {statusInfo.badgeText}
            </span>
          ) : statusInfo.status === 'upcoming' ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-extrabold text-white shadow-md">
              <Clock className="h-3 w-3" />
              {statusInfo.badgeText}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-stone-700/90 px-3 py-1 text-xs font-bold text-white shadow-md">
              {statusInfo.badgeText}
            </span>
          )}
        </div>

        {/* Distance & Verified Badges */}
        <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
          {typeof distanceKm === 'number' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-extrabold text-[#431407] shadow">
              <MapPin className="h-3 w-3 text-orange-600" />
              {distanceKm} km
            </span>
          )}
          {bhandara.isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow">
              <BadgeCheck className="h-3.5 w-3.5" />
              Verified Mandir
            </span>
          )}
        </div>

        {/* Area tag bottom-left */}
        <div className="absolute bottom-2.5 left-3">
          <span className="rounded-lg bg-black/65 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
            📍 {bhandara.area}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={detailPath} className="block">
          <h3 className="line-clamp-2 text-lg font-extrabold leading-snug text-[#431407] group-hover:text-orange-700">
            {bhandara.title}
          </h3>
        </Link>

        <p className="mt-1 line-clamp-1 text-xs font-medium text-orange-900/70">
          {bhandara.landmark}
        </p>

        {/* Food chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {bhandara.foodItems.slice(0, 5).map((item) => (
            <span
              key={item}
              className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-900"
            >
              🍽️ {item}
            </span>
          ))}
        </div>

        {/* Trust & Crowd Stats */}
        <div className="mt-3 flex items-center justify-between border-t border-orange-100 pt-3 text-xs font-semibold text-orange-900/80">
          <span className="flex items-center gap-1 text-emerald-700 font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {bhandara.votes.chal_raha} ne confirm kiya
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-orange-600" />
            {crowd.emoji} {crowd.label.split(' ')[0]}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 rounded-xl bg-orange-600 px-2 py-2 text-xs font-extrabold text-white transition hover:bg-orange-700"
          >
            <Navigation className="h-3.5 w-3.5" />
            Raasta
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 rounded-xl bg-emerald-600 px-2 py-2 text-xs font-extrabold text-white transition hover:bg-emerald-700"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </a>

          <button
            type="button"
            disabled={userVoted}
            onClick={() => onQuickConfirm?.(bhandara.id)}
            className={`flex items-center justify-center gap-1 rounded-xl border px-2 py-2 text-xs font-extrabold transition ${
              userVoted
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                : 'border-orange-200 bg-orange-50 text-[#431407] hover:bg-orange-100'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {userVoted ? 'Confirmed' : 'Chal Raha'}
          </button>
        </div>
      </div>
    </article>
  );
}
