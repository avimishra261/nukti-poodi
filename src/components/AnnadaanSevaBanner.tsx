import Link from 'next/link';

export function AnnadaanSevaBanner() {
  return (
    <section className="mx-auto mt-10 max-w-6xl px-3 sm:px-6">
      <div className="rounded-3xl border border-orange-200 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-black text-[#431407] sm:text-lg">
              🍱 Bacha Hua Khana? Indore Annadaan Seva
            </h2>
            <p className="mt-1 text-xs font-medium text-orange-900/85 sm:text-sm">
              Aayojakon se nivedan hai: bhandara samapt hone ke baad agar shuddh
              bhojan bache to aas-paas ke gareebon, hospital ke baahar ya Roti
              Bank / Annakshetra me zaroor bhejwayein.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/add"
              className="rounded-2xl bg-orange-600 px-4 py-2.5 text-center text-xs font-extrabold text-white shadow hover:bg-orange-700"
            >
              ➕ Bhandara Jodo
            </Link>
            <Link
              href="/about"
              className="rounded-2xl bg-[#431407] px-4 py-2.5 text-center text-xs font-extrabold text-white hover:bg-orange-900"
            >
              Seva Niyam &amp; App Guide →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
