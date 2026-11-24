'use client';

import { CheckCircle2, Flag, Users, XCircle } from 'lucide-react';
import { getConfirmationRate, getDominantCrowd } from '@/lib/geo';
import { Bhandara, CrowdLevel, VoteType } from '@/lib/types';

interface CommunityTrustWidgetProps {
  bhandara: Bhandara;
  userVote: VoteType | null;
  crowdVoted: CrowdLevel | null;
  toast: string;
  onVote: (type: VoteType) => void;
  onCrowdVote: (level: CrowdLevel) => void;
}

export function CommunityTrustWidget({
  bhandara,
  userVote,
  crowdVoted,
  toast,
  onVote,
  onCrowdVote,
}: CommunityTrustWidgetProps) {
  const crowd = getDominantCrowd(bhandara);
  const confirmRate = getConfirmationRate(bhandara);

  return (
    <div className="mt-6 rounded-3xl border-2 border-orange-200 bg-[#FFFBEB] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-black text-[#431407]">
            🔍 Kya Abhi Bhandara Chal Raha Hai? (Live Status)
          </h2>
          <p className="mt-0.5 text-xs font-medium text-orange-900/75">
            Aapke 1 click se baaki Indore ke bhakton ka samay bachega!
          </p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
          {confirmRate}% Trust Score
        </span>
      </div>

      {/* Confirmation progress bar */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-orange-200/70">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
          style={{ width: `${confirmRate}%` }}
        />
      </div>

      {toast && (
        <div className="mt-3 rounded-xl bg-emerald-100 px-3.5 py-2 text-xs font-bold text-emerald-900">
          {toast}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onVote('chal_raha')}
          className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-sm font-extrabold transition ${
            userVote === 'chal_raha'
              ? 'border-emerald-600 bg-emerald-600 text-white shadow'
              : 'border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          Haan Chal Raha ({bhandara.votes.chal_raha})
        </button>

        <button
          type="button"
          onClick={() => onVote('khatam')}
          className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-sm font-extrabold transition ${
            userVote === 'khatam'
              ? 'border-amber-600 bg-amber-600 text-white shadow'
              : 'border-amber-300 bg-white text-amber-900 hover:bg-amber-50'
          }`}
        >
          <XCircle className="h-4 w-4" />
          Khatam Ho Gaya ({bhandara.votes.khatam})
        </button>

        <button
          type="button"
          onClick={() => onVote('fake')}
          className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-sm font-extrabold transition ${
            userVote === 'fake'
              ? 'border-red-600 bg-red-600 text-white shadow'
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
                onClick={() => onCrowdVote(item.k)}
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
  );
}
