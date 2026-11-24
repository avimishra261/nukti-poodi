'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Camera,
  Check,
  Clock,
  LocateFixed,
  MapPin,
  Plus,
  Sparkles,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { LoginModal } from '@/components/LoginModal';
import { createBhandaraClient, getSavedUser } from '@/lib/client-api';
import { getBhandaraDetailPath } from '@/lib/geo';
import { compressImageToDataUrl } from '@/lib/utils/image';
import { FOOD_CHIP_OPTIONS, INDORE_AREAS } from '@/lib/indore-areas';
import { PRESET_BHANDARA_PHOTOS } from '@/lib/seed-data';
import { UserProfile } from '@/lib/types';

const LocationPickerMap = dynamic(
  () => import('@/components/LocationPickerMap').then((m) => m.LocationPickerMap),
  { ssr: false }
);

function toLocalDateTimeInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function AddBhandaraPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [foodItems, setFoodItems] = useState<string[]>(['Nukti', 'Poodi', 'Aloo Sabzi']);
  const [customFood, setCustomFood] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState('Vijay Nagar');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [lat, setLat] = useState(22.7533);
  const [lng, setLng] = useState(75.8937);

  const now = new Date();
  const [startTime, setStartTime] = useState(toLocalDateTimeInput(now));
  const [endTime, setEndTime] = useState(
    toLocalDateTimeInput(new Date(now.getTime() + 3 * 60 * 60 * 1000))
  );
  const [photoUrl, setPhotoUrl] = useState(PRESET_BHANDARA_PHOTOS[0].url);
  const [submitting, setSubmitting] = useState(false);
  const [gpsMsg, setGpsMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setUser(getSavedUser());
    const sync = () => setUser(getSavedUser());
    window.addEventListener('nukti-user-changed', sync);
    return () => window.removeEventListener('nukti-user-changed', sync);
  }, []);

  const handleAreaChange = (newArea: string) => {
    setArea(newArea);
    const found = INDORE_AREAS.find((a) => a.name === newArea);
    if (found) {
      setLat(found.lat);
      setLng(found.lng);
    }
  };

  const toggleFood = (item: string) => {
    setFoodItems((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const addCustomFood = () => {
    const clean = customFood.trim();
    if (!clean) return;
    if (!foodItems.includes(clean)) {
      setFoodItems((prev) => [...prev, clean]);
    }
    setCustomFood('');
  };

  const applyTimePreset = (preset: 'now3' | 'evening' | 'tomorrow') => {
    const base = new Date();
    if (preset === 'now3') {
      setStartTime(toLocalDateTimeInput(base));
      setEndTime(
        toLocalDateTimeInput(new Date(base.getTime() + 3 * 60 * 60 * 1000))
      );
    } else if (preset === 'evening') {
      const s = new Date(base);
      s.setHours(18, 0, 0, 0);
      const e = new Date(base);
      e.setHours(22, 0, 0, 0);
      setStartTime(toLocalDateTimeInput(s));
      setEndTime(toLocalDateTimeInput(e));
    } else {
      const s = new Date(base.getTime() + 24 * 60 * 60 * 1000);
      s.setHours(11, 30, 0, 0);
      const e = new Date(s.getTime() + 4.5 * 60 * 60 * 1000);
      setStartTime(toLocalDateTimeInput(s));
      setEndTime(toLocalDateTimeInput(e));
    }
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setGpsMsg('Browser me GPS available nahi hai.');
      return;
    }
    setGpsMsg('GPS location le rahe hain...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Math.round(pos.coords.latitude * 100000) / 100000);
        setLng(Math.round(pos.coords.longitude * 100000) / 100000);
        setGpsMsg('✅ Aapki exact location map pe pin ho gayi!');
      },
      () => {
        setGpsMsg('Location permission nahi mili. Map pe click karke pin lagayein.');
      }
    );
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageToDataUrl(file);
      setPhotoUrl(compressed);
    } catch {
      setError('Photo padhne me dikkat aayi, doosri photo chunein.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const currentUser = getSavedUser();
    if (!currentUser) {
      setLoginOpen(true);
      return;
    }

    if (title.trim().length < 3) {
      setError('Bhandara ya Mandir ka naam daalein.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createBhandaraClient({
        title: title.trim(),
        organizerName: organizerName.trim() || undefined,
        foodItems: foodItems.length > 0 ? foodItems : ['Prasad'],
        description: description.trim() || undefined,
        area,
        address: address.trim() || `${area}, Indore`,
        landmark: landmark.trim() || `${area} ke paas`,
        lat,
        lng,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        photoUrl,
        createdBy: currentUser.id,
        createdByName: currentUser.name,
      });

      const path = getBhandaraDetailPath(created);
      const joiner = path.includes('?') ? '&' : '?';
      router.push(`${path}${joiner}created=1`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Save karne me samasya aayi, kripya dobara koshish karein.'
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBEB] pb-16">
      <Navbar />

      <main className="mx-auto max-w-2xl px-3 py-6 sm:px-6">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white px-3.5 py-1.5 text-xs font-extrabold text-[#431407] shadow-sm hover:bg-orange-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Wapas Jayein
        </Link>

        <div className="rounded-3xl border border-orange-200 bg-white p-5 shadow-lg sm:p-7">
          <div className="flex items-center gap-3 border-b border-orange-100 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 text-2xl text-white shadow">
              🍛
            </div>
            <div>
              <h1 className="text-xl font-black text-[#431407] sm:text-2xl">
                Naya Bhandara Jodo
              </h1>
              <p className="text-xs font-semibold text-orange-700">
                1 minute me jaankari daalein — poora Indore dekhega 🙏
              </p>
            </div>
          </div>

          {!user && (
            <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-bold text-amber-950">
                Fake posts rokne ke liye post karne se pehle 1-tap naam login
                zaroori hai.
              </p>
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                className="shrink-0 rounded-xl bg-orange-600 px-4 py-2 text-xs font-extrabold text-white"
              >
                1-Tap Login Karein
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl bg-red-100 p-3 text-xs font-bold text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-extrabold text-[#431407]">
                Bhandara / Mandir ka Naam *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Jaise: Hanuman Mandir Mangalwar Bhandara"
                className="w-full rounded-xl border-2 border-orange-200 bg-orange-50/40 px-4 py-3 text-sm font-semibold text-[#431407] focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-extrabold text-[#431407]">
                Aayojak / Committee ka Naam (Optional)
              </label>
              <input
                type="text"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                placeholder="Jaise: Yuva Bhakt Mandal"
                className="w-full rounded-xl border-2 border-orange-200 bg-orange-50/40 px-4 py-2.5 text-sm font-medium text-[#431407] focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Food Chips */}
            <div>
              <label className="mb-2 block text-sm font-extrabold text-[#431407]">
                🍽️ Prasad me kya-kya hai? (Tap karke chunein)
              </label>
              <div className="flex flex-wrap gap-2">
                {FOOD_CHIP_OPTIONS.map((item) => {
                  const selected = foodItems.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleFood(item)}
                      className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-extrabold transition ${
                        selected
                          ? 'bg-orange-600 text-white shadow-sm'
                          : 'border border-orange-200 bg-orange-50 text-[#431407] hover:bg-orange-100'
                      }`}
                    >
                      {selected && <Check className="h-3 w-3" />}
                      {item}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2.5 flex gap-2">
                <input
                  type="text"
                  value={customFood}
                  onChange={(e) => setCustomFood(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomFood();
                    }
                  }}
                  placeholder="Kuch aur item jodein (jaise: Gulab Jamun)"
                  className="flex-1 rounded-xl border border-orange-200 px-3 py-2 text-xs font-medium text-[#431407] focus:border-orange-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addCustomFood}
                  className="inline-flex items-center gap-1 rounded-xl bg-orange-100 px-3 py-2 text-xs font-extrabold text-orange-900 hover:bg-orange-200"
                >
                  <Plus className="h-3.5 w-3.5" /> Jodo
                </button>
              </div>
            </div>

            {/* Area & Landmark */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-extrabold text-[#431407]">
                  Indore Area *
                </label>
                <select
                  value={area}
                  onChange={(e) => handleAreaChange(e.target.value)}
                  className="w-full rounded-xl border-2 border-orange-200 bg-white px-3.5 py-2.5 text-sm font-bold text-[#431407] focus:border-orange-500 focus:outline-none"
                >
                  {INDORE_AREAS.map((a) => (
                    <option key={a.name} value={a.name}>
                      {a.name} ({a.hindiName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-extrabold text-[#431407]">
                  Landmark / Pehchan *
                </label>
                <input
                  type="text"
                  required
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Jaise: Pani ki tanki ke saamne"
                  className="w-full rounded-xl border-2 border-orange-200 bg-orange-50/40 px-3.5 py-2.5 text-sm font-medium text-[#431407] focus:border-orange-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-extrabold text-[#431407]">
                Poora Pata (Address)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Gali / Colony / Road ka naam"
                className="w-full rounded-xl border-2 border-orange-200 bg-orange-50/40 px-4 py-2.5 text-sm font-medium text-[#431407] focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Map Location Picker */}
            <div className="space-y-2 rounded-2xl border border-orange-200 bg-orange-50/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-sm font-extrabold text-[#431407]">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  Map Pe Pin Lagayein
                </span>
                <button
                  type="button"
                  onClick={handleUseGps}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-3 py-1.5 text-xs font-extrabold text-white shadow hover:bg-orange-700"
                >
                  <LocateFixed className="h-3.5 w-3.5" />
                  Meri GPS Location Le Lo
                </button>
              </div>
              <p className="text-[11px] font-medium text-orange-900/75">
                {gpsMsg ||
                  'Map par kahin bhi tap karke exact bhandara sthal chunein.'}
              </p>
              <LocationPickerMap
                lat={lat}
                lng={lng}
                onChange={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                }}
              />
            </div>

            {/* Timing */}
            <div className="space-y-3 rounded-2xl border border-orange-200 bg-orange-50/60 p-4">
              <div className="flex items-center gap-1.5 text-sm font-extrabold text-[#431407]">
                <Clock className="h-4 w-4 text-orange-600" />
                Bhandara Timing *
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyTimePreset('now3')}
                  className="rounded-full border border-orange-300 bg-white px-3 py-1 text-xs font-bold text-[#431407] hover:bg-orange-100"
                >
                  🔴 Abhi se 3 ghante
                </button>
                <button
                  type="button"
                  onClick={() => applyTimePreset('evening')}
                  className="rounded-full border border-orange-300 bg-white px-3 py-1 text-xs font-bold text-[#431407] hover:bg-orange-100"
                >
                  🌙 Aaj Shaam 6–10 PM
                </button>
                <button
                  type="button"
                  onClick={() => applyTimePreset('tomorrow')}
                  className="rounded-full border border-orange-300 bg-white px-3 py-1 text-xs font-bold text-[#431407] hover:bg-orange-100"
                >
                  ☀️ Kal Dopahar
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-orange-900">
                    Shuru Hone Ka Samay
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-bold text-[#431407]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-orange-900">
                    Khatam Hone Ka Samay
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-bold text-[#431407]"
                  />
                </div>
              </div>
            </div>

            {/* Photo Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-sm font-extrabold text-[#431407]">
                  <Camera className="h-4 w-4 text-orange-600" />
                  Photo Lagayein (Ya Preset Chunein)
                </label>
                <label className="cursor-pointer rounded-xl border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs font-extrabold text-orange-900 hover:bg-orange-100">
                  📷 Photo Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {PRESET_BHANDARA_PHOTOS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setPhotoUrl(p.url)}
                    className={`overflow-hidden rounded-xl border-2 transition ${
                      photoUrl === p.url
                        ? 'border-orange-600 ring-2 ring-orange-400'
                        : 'border-orange-100 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={p.url}
                      alt={p.label}
                      className="aspect-video w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-extrabold text-[#431407]">
                Vishesh Jaankari (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jaise: Mahilaon aur senior citizens ke liye alag line hai..."
                className="w-full rounded-xl border-2 border-orange-200 bg-orange-50/40 px-4 py-2.5 text-sm font-medium text-[#431407] focus:border-orange-500 focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 text-base font-black text-white shadow-xl shadow-orange-600/30 transition hover:brightness-110 disabled:opacity-60"
            >
              <Sparkles className="h-5 w-5" />
              {submitting ? 'Live Ho Raha Hai...' : '🚀 Bhandara Live Karein!'}
            </button>
          </form>
        </div>
      </main>

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        reason="Bhandara post karne ke liye 1-tap login karein"
      />
    </div>
  );
}
