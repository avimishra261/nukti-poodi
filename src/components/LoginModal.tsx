'use client';

import { useState } from 'react';
import { X, Sparkles, MapPin } from 'lucide-react';
import { INDORE_AREAS } from '@/lib/indore-areas';
import { saveUser } from '@/lib/client-api';
import { UserProfile } from '@/lib/types';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (user: UserProfile) => void;
  reason?: string;
}

export function LoginModal({ open, onClose, onSuccess, reason }: LoginModalProps) {
  const [name, setName] = useState('');
  const [area, setArea] = useState('Vijay Nagar');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    const user: UserProfile = {
      id: `bhakt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: cleanName,
      area,
      createdAt: new Date().toISOString(),
    };
    saveUser(user);
    onSuccess?.(user);
    onClose();
  };

  const handleQuickGuest = () => {
    const user: UserProfile = {
      id: `bhakt-${Date.now()}`,
      name: 'Indori Bhakt',
      area: 'Rajwada',
      createdAt: new Date().toISOString(),
    };
    saveUser(user);
    onSuccess?.(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl border-2 border-orange-200 bg-[#FFFBEB] p-6 shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Band karein"
          className="absolute right-4 top-4 rounded-full p-2 text-orange-900/60 hover:bg-orange-100 hover:text-orange-900"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-2xl shadow-md">
            🍛
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#431407]">
              1-Tap Bhakt Login 🙏
            </h2>
            <p className="text-xs font-medium text-orange-800">
              {reason || 'Bhandara jodne aur live status update karne ke liye'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-[#431407]">
              Aapka Shubh Naam *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jaise: Rahul Patidar / Priya Sharma"
              className="w-full rounded-xl border-2 border-orange-200 bg-white px-4 py-3 text-sm font-medium text-[#431407] placeholder:text-orange-900/40 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-[#431407]">
              <MapPin className="h-4 w-4 text-orange-600" />
              Aapka Indore Area
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full rounded-xl border-2 border-orange-200 bg-white px-4 py-3 text-sm font-medium text-[#431407] focus:border-orange-500 focus:outline-none"
            >
              {INDORE_AREAS.map((a) => (
                <option key={a.name} value={a.name}>
                  {a.name} ({a.hindiName})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-5 py-3.5 text-base font-extrabold text-white shadow-lg shadow-orange-600/25 transition hover:brightness-110 active:scale-[0.99]"
          >
            <Sparkles className="h-5 w-5" />
            Shuru Karein • Jai Bhandara!
          </button>
        </form>

        <div className="mt-4 border-t border-orange-200 pt-3 text-center">
          <button
            type="button"
            onClick={handleQuickGuest}
            className="text-xs font-bold text-orange-700 underline underline-offset-4 hover:text-orange-900"
          >
            Jaldi hai? &quot;Indori Bhakt&quot; ban kar aage badhein →
          </button>
        </div>
      </div>
    </div>
  );
}
