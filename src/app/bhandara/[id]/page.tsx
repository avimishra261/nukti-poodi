import { Suspense } from 'react';
import type { Metadata } from 'next';
import { createSeedBhandaras } from '@/lib/seed-data';
import { getBhandaraById } from '@/lib/db';
import { BhandaraDetailClient } from '@/components/BhandaraDetailClient';

export function generateStaticParams() {
  const seeds = createSeedBhandaras();
  return [...seeds.map((b) => ({ id: b.id })), { id: 'custom' }];
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  if (params.id === 'custom') {
    return {
      title: '🍛 Bhandara Details — Nukti Poodi Indore',
      description:
        'Indore me live bhandara prasad menu, timing aur Google Maps raasta.',
    };
  }

  const found =
    (await getBhandaraById(params.id)) ||
    createSeedBhandaras().find((b) => b.id === params.id);

  if (!found) {
    return {
      title: '🍛 Nukti Poodi — Indore Bhandara Finder',
    };
  }

  const menu = found.foodItems.join(', ');
  return {
    title: `🍛 ${found.title} (${found.area}) — Nukti Poodi`,
    description: `Prasad: ${menu}. Landmark: ${found.landmark}. Live status aur Google Maps raasta dekhein!`,
    openGraph: {
      title: `🍛 ${found.title} • ${found.area}`,
      description: `Prasad: ${menu} | ${found.landmark}`,
      type: 'article',
    },
  };
}

export default function BhandaraDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFBEB] p-8 text-center font-bold text-orange-800">
          🍛 Bhandara details load ho rahi hain...
        </div>
      }
    >
      <BhandaraDetailClient routeId={params.id} />
    </Suspense>
  );
}
