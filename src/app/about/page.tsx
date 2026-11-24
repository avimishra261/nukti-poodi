import Link from 'next/link';
import { ArrowLeft, HeartHandshake, ShieldAlert, Smartphone } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FFFBEB] pb-16">
      <Navbar />

      <main className="mx-auto max-w-3xl px-3 py-6 sm:px-6 space-y-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white px-3.5 py-1.5 text-xs font-extrabold text-[#431407] shadow-sm hover:bg-orange-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Home Pe Wapas
        </Link>

        <section className="rounded-3xl border border-orange-200 bg-white p-6 shadow-md sm:p-8">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🍛</span>
            <div>
              <h1 className="text-2xl font-black text-[#431407]">
                Nukti Poodi (नुक्ती पूड़ी) — Indore
              </h1>
              <p className="text-xs font-bold text-orange-700">
                Indore ka apna community-powered Bhandara &amp; Prasad Finder
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-orange-950">
            Indore me har hafte aur har tyohar par hazaaron log prem aur shraddha
            se bhandare ka aayojan karte hain — lekin aas-paas ke logon aur
            students ko samay par sahi jaankari nahi mil paati.{' '}
            <strong>Nukti Poodi</strong> ka maksad hai ki koi bhi bhookha na
            rahe aur har bhakt tak prasad ki sahi jaankari 2 tap me pahunche.
          </p>
        </section>

        <section className="rounded-3xl border border-orange-200 bg-white p-6 shadow-md">
          <h2 className="flex items-center gap-2 text-lg font-black text-[#431407]">
            <Smartphone className="h-5 w-5 text-orange-600" />
            Phone Me App Jaise Kaise Install Karein? (PWA)
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-orange-50 p-4">
              <h3 className="text-sm font-extrabold text-[#431407]">
                🤖 Android (Chrome)
              </h3>
              <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs font-medium text-orange-950">
                <li>Chrome me upar right side ke 3 dots (⋮) par tap karein.</li>
                <li>&quot;Add to Home screen&quot; ya &quot;Install app&quot; chunein.</li>
                <li>Bas! Nukti Poodi aapke phone me app ban kar aa jayega.</li>
              </ol>
            </div>
            <div className="rounded-2xl bg-orange-50 p-4">
              <h3 className="text-sm font-extrabold text-[#431407]">
                🍎 iPhone (Safari)
              </h3>
              <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs font-medium text-orange-950">
                <li>Safari me neeche Share icon (⬆️) par tap karein.</li>
                <li>&quot;Add to Home Screen&quot; par click karein.</li>
                <li>Add dabayein aur 1 tap me kholein!</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-orange-200 bg-white p-6 shadow-md">
          <h2 className="flex items-center gap-2 text-lg font-black text-[#431407]">
            <HeartHandshake className="h-5 w-5 text-orange-600" />
            Bhandara Maryada aur Niyam
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm font-medium text-orange-950">
            <li>Prasad ko sirf utna hi lein jitna aap grahan kar sakein — ann barbad na karein.</li>
            <li>Prasad ki quality par star rating nahi hoti — sirf bhandara chal raha hai ya khatam ho gaya iski jaankari share karein.</li>
            <li>Fake ya galat location dalne par community report se post automatic hat jaati hai.</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-amber-300 bg-amber-50 p-6">
          <h2 className="flex items-center gap-2 text-base font-black text-[#431407]">
            <ShieldAlert className="h-5 w-5 text-amber-700" />
            Disclaimer
          </h2>
          <p className="mt-2 text-xs leading-relaxed font-medium text-amber-950">
            Nukti Poodi sirf ek community information platform hai. Yahan dikhaye
            gaye bhandaron ka aayojan, samay, aur bhojan ki shuddhata aur
            zimmedari sambandhit mandir committee ya aayojak ki hoti hai. Platform
            par kisi bhi prakar ke bhojan ya bheed se judi zimmedari aayojak ki
            rahegi.
          </p>
        </section>
      </main>
    </div>
  );
}
