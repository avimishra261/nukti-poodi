'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BadgeCheck,
  Eye,
  EyeOff,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Lock,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import {
  adminDeleteBhandaraClient,
  adminUpdateBhandaraClient,
  fetchAllBhandaras,
} from '@/lib/client-api';
import { getBhandaraDetailPath, getStatusLabel } from '@/lib/geo';
import { Bhandara } from '@/lib/types';

const ADMIN_PASSCODE = 'jai-bhandara-indore';

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [err, setErr] = useState('');
  const [bhandaras, setBhandaras] = useState<Bhandara[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const list = await fetchAllBhandaras(true);
    setBhandaras(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (unlocked) {
      loadAll();
    }
  }, [unlocked, loadAll]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passInput.trim() === ADMIN_PASSCODE) {
      setUnlocked(true);
      setErr('');
    } else {
      setErr('Galat passcode! Demo ke liye neeche button dabayein.');
    }
  };

  const toggleVerify = async (b: Bhandara) => {
    const updated = await adminUpdateBhandaraClient(b.id, {
      isVerified: !b.isVerified,
    });
    if (updated) {
      setBhandaras((prev) => prev.map((x) => (x.id === b.id ? updated : x)));
    }
  };

  const toggleHide = async (b: Bhandara) => {
    const updated = await adminUpdateBhandaraClient(b.id, {
      isHidden: !b.isHidden,
    });
    if (updated) {
      setBhandaras((prev) => prev.map((x) => (x.id === b.id ? updated : x)));
    }
  };

  const resetVotes = async (b: Bhandara) => {
    const updated = await adminUpdateBhandaraClient(b.id, {
      isHidden: false,
      votes: { chal_raha: b.votes.chal_raha, khatam: 0, fake: 0 },
    });
    if (updated) {
      setBhandaras((prev) => prev.map((x) => (x.id === b.id ? updated : x)));
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await adminDeleteBhandaraClient(id);
    if (ok) {
      setBhandaras((prev) => prev.filter((x) => x.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBEB] pb-16">
      <Navbar />

      <main className="mx-auto max-w-5xl px-3 py-6 sm:px-6">
        {!unlocked ? (
          <div className="mx-auto mt-10 max-w-md rounded-3xl border-2 border-orange-200 bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 text-white">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-[#431407]">
                  Admin Moderation Panel
                </h1>
                <p className="text-xs font-semibold text-orange-800">
                  Reported posts hatane aur mandiron ko Verify karne ke liye
                </p>
              </div>
            </div>

            <form onSubmit={handleUnlock} className="mt-5 space-y-3">
              <input
                type="password"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                placeholder="Admin Passcode daalein..."
                className="w-full rounded-xl border-2 border-orange-200 px-4 py-3 text-sm font-bold text-[#431407] focus:border-orange-500 focus:outline-none"
              />
              {err && <p className="text-xs font-bold text-red-600">{err}</p>}
              <button
                type="submit"
                className="w-full rounded-xl bg-[#431407] py-3 text-sm font-extrabold text-white hover:bg-orange-900"
              >
                Admin Panel Kholein
              </button>
            </form>

            <button
              type="button"
              onClick={() => setUnlocked(true)}
              className="mt-3 w-full rounded-xl border border-orange-200 bg-orange-50 py-2 text-xs font-bold text-orange-800 hover:bg-orange-100"
            >
              Quick Demo Unlock (jai-bhandara-indore)
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-7 w-7 text-orange-600" />
                <div>
                  <h1 className="text-2xl font-black text-[#431407]">
                    Nukti Poodi Moderation
                  </h1>
                  <p className="text-xs font-semibold text-orange-800">
                    Total {bhandaras.length} posts • Hidden:{' '}
                    {bhandaras.filter((b) => b.isHidden).length}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={loadAll}
                className="rounded-xl border border-orange-200 bg-white px-4 py-2 text-xs font-extrabold text-[#431407]"
              >
                Refresh List
              </button>
            </div>

            {loading ? (
              <div className="p-10 text-center font-bold text-orange-800">
                Load ho raha hai...
              </div>
            ) : (
              <div className="space-y-3">
                {bhandaras.map((b) => {
                  const st = getStatusLabel(b);
                  return (
                    <div
                      key={b.id}
                      className={`flex flex-col gap-3 rounded-2xl border p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between ${
                        b.isHidden
                          ? 'border-red-300 bg-red-50/70'
                          : 'border-orange-200 bg-white'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={getBhandaraDetailPath(b)}
                            className="text-base font-extrabold text-[#431407] hover:underline"
                          >
                            {b.title}
                          </Link>
                          {b.isVerified && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                              ✓ Verified
                            </span>
                          )}
                          {b.isHidden && (
                            <span className="rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white">
                              Hidden / Reported
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-orange-900/75">
                          📍 {b.area} • {st.badgeText} • By {b.createdByName}
                        </p>
                        <p className="text-xs font-bold text-stone-700">
                          ✅ {b.votes.chal_raha} | ❌ {b.votes.khatam} | 🚩 Fake:{' '}
                          {b.votes.fake}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => toggleVerify(b)}
                          className="inline-flex items-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
                        >
                          <BadgeCheck className="h-3.5 w-3.5" />
                          {b.isVerified ? 'Unverify' : 'Verify'}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleHide(b)}
                          className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100"
                        >
                          {b.isHidden ? (
                            <>
                              <Eye className="h-3.5 w-3.5" /> Restore
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3.5 w-3.5" /> Hide
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => resetVotes(b)}
                          className="inline-flex items-center gap-1 rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-[#431407] hover:bg-orange-100"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Reset Flags
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(b.id)}
                          className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
