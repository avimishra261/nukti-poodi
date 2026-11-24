import type { Metadata, Viewport } from 'next';
import { Noto_Sans_Devanagari, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { PwaRegistrar } from '@/components/PwaRegistrar';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const devanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-devanagari',
  display: 'swap',
});

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata: Metadata = {
  title: '🍛 Nukti Poodi (नुक्ती पूड़ी) — Indore Bhandara Finder',
  description:
    'Indore me abhi, paas me, kahan bhandara chal raha hai? 2 tap me dekhein live bhandare, prasad menu, aur Google Maps raasta. Jai Bhandara!',
  manifest: `${BASE_PATH}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Nukti Poodi',
  },
  openGraph: {
    title: '🍛 Nukti Poodi — Indore Live Bhandara Finder',
    description:
      'Indore ke aas-paas chal rahe live bhandare, prasad menu aur direct Google Maps raasta.',
    type: 'website',
    locale: 'en_IN',
  },
};

export const viewport: Viewport = {
  themeColor: '#EA580C',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" className={`${jakarta.variable} ${devanagari.variable}`}>
      <head>
        <link rel="icon" href={`${BASE_PATH}/icon.svg`} type="image/svg+xml" />
        <link rel="apple-touch-icon" href={`${BASE_PATH}/icon.svg`} />
      </head>
      <body className="min-h-screen bg-[#FFFBEB] font-sans antialiased selection:bg-orange-200 selection:text-orange-950">
        <PwaRegistrar />
        {children}
      </body>
    </html>
  );
}
