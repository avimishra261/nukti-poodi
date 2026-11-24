'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  PlusCircle,
  User,
  LogOut,
  ShieldCheck,
  Info,
  Download,
  MapPin,
} from 'lucide-react';
import { getSavedUser, logoutUser } from '@/lib/client-api';
import { UserProfile } from '@/lib/types';
import { LoginModal } from './LoginModal';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface NavbarProps {
  gpsActive?: boolean;
  onRequestGps?: () => void;
}

export function Navbar({ gpsActive, onRequestGps }: NavbarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    setUser(getSavedUser());
    const sync = () => setUser(getSavedUser());
    window.addEventListener('nukti-user-changed', sync);

    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    return () => {
      window.removeEventListener('nukti-user-changed', sync);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-orange-200/80 bg-[#FFFBEB]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-red-700 text-xl sm:text-2xl shadow-md shadow-orange-600/20 transition group-hover:scale-105">
              🍛
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-[#431407]">
                  Nukti Poodi
                </span>
                <span className="hidden rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-800 sm:inline-block">
                  नुक्ती पूड़ी
                </span>
              </div>
              <p className="text-[11px] font-semibold text-orange-700 leading-tight">
                इंदौर का अपना भंडारा फाइंडर 🙏
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {onRequestGps && (
              <button
                type="button"
                onClick={onRequestGps}
                className={`hidden md:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  gpsActive
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-orange-100 text-orange-900 hover:bg-orange-200'
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />
                {gpsActive ? 'GPS Active ✓' : 'Location On Karein'}
              </button>
            )}

            {deferredPrompt && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1.5 text-xs font-bold text-amber-900 border border-amber-300 hover:bg-amber-200"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">App Install</span>
              </button>
            )}

            <Link
              href="/add"
              className={`flex items-center gap-1.5 rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-extrabold shadow-md transition ${
                pathname === '/add'
                  ? 'bg-[#431407] text-white'
                  : 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-orange-600/20 hover:brightness-110'
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              <span>Bhandara Jodo</span>
            </Link>

            <Link
              href="/about"
              title="About & App Guide"
              className={`rounded-full p-2 text-orange-900 hover:bg-orange-100 ${
                pathname === '/about' ? 'bg-orange-100' : ''
              }`}
            >
              <Info className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>

            <Link
              href="/admin"
              title="Admin Panel"
              className={`hidden sm:inline-flex rounded-full p-2 text-orange-900 hover:bg-orange-100 ${
                pathname === '/admin' ? 'bg-orange-100' : ''
              }`}
            >
              <ShieldCheck className="h-5 w-5" />
            </Link>

            {user ? (
              <div className="flex items-center gap-1 rounded-full border border-orange-200 bg-white py-1 pl-2.5 pr-1.5 shadow-sm">
                <span className="max-w-[80px] truncate text-xs font-bold text-[#431407]">
                  {user.name}
                </span>
                <button
                  type="button"
                  onClick={logoutUser}
                  title="Logout"
                  className="rounded-full p-1 text-orange-700 hover:bg-orange-100"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                className="flex items-center gap-1 rounded-full border border-orange-300 bg-white px-2.5 py-1.5 text-xs font-bold text-[#431407] shadow-sm hover:bg-orange-50"
              >
                <User className="h-3.5 w-3.5 text-orange-600" />
                <span className="hidden sm:inline">Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
