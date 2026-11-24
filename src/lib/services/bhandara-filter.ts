import { Bhandara } from '../types';
import { getDistanceKm } from '../utils/geo';
import { getBhandaraStatus, isTodayInIndore } from '../utils/time';

export type TabKey = 'live' | 'today' | 'upcoming' | 'all';
export type SortKey = 'nearest' | 'popular' | 'newest';

export interface BhandaraStats {
  liveCount: number;
  todayCount: number;
  upcomingCount: number;
  allCount: number;
  totalConfirmations: number;
}

export interface FilterOptions {
  tab: TabKey;
  sortBy: SortKey;
  selectedArea: string;
  foodKeyword: string;
  searchQuery: string;
  userLocation: { lat: number; lng: number } | null;
}

export interface FilteredBhandaraItem {
  bhandara: Bhandara;
  distanceKm: number | null;
}

export function computeBhandaraStats(
  bhandaras: Bhandara[],
  now = new Date()
): BhandaraStats {
  let liveCount = 0;
  let todayCount = 0;
  let upcomingCount = 0;
  let totalConfirmations = 0;

  for (const b of bhandaras) {
    const st = getBhandaraStatus(b, now);
    if (st === 'live') liveCount += 1;
    if (st === 'upcoming') upcomingCount += 1;
    if (
      (st === 'live' || st === 'upcoming') &&
      (isTodayInIndore(b.startTime, now) || st === 'live')
    ) {
      todayCount += 1;
    }
    totalConfirmations += b.votes.chal_raha || 0;
  }

  return {
    liveCount,
    todayCount,
    upcomingCount,
    allCount: bhandaras.length,
    totalConfirmations,
  };
}

export function filterAndSortBhandaras(
  bhandaras: Bhandara[],
  options: FilterOptions,
  now = new Date()
): FilteredBhandaraItem[] {
  const { tab, sortBy, selectedArea, foodKeyword, searchQuery, userLocation } = options;
  const q = searchQuery.trim().toLowerCase();

  const matched = bhandaras.filter((b) => {
    const status = getBhandaraStatus(b, now);
    if (tab === 'live' && status !== 'live') return false;
    if (
      tab === 'today' &&
      status !== 'live' &&
      !isTodayInIndore(b.startTime, now)
    ) {
      return false;
    }
    if (tab === 'upcoming' && status !== 'upcoming') return false;

    if (selectedArea !== 'ALL' && b.area !== selectedArea) return false;

    if (foodKeyword) {
      const hasFood = b.foodItems.some((f) =>
        f.toLowerCase().includes(foodKeyword.toLowerCase())
      );
      if (!hasFood) return false;
    }

    if (q) {
      const hay = `${b.title} ${b.area} ${b.landmark} ${b.address} ${
        b.organizerName || ''
      } ${b.foodItems.join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    return true;
  });

  return matched
    .map((b) => ({
      bhandara: b,
      distanceKm: userLocation
        ? getDistanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng)
        : null,
    }))
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return b.bhandara.votes.chal_raha - a.bhandara.votes.chal_raha;
      }
      if (sortBy === 'newest') {
        return (
          new Date(b.bhandara.createdAt).getTime() -
          new Date(a.bhandara.createdAt).getTime()
        );
      }
      if (a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      const statusOrder = { live: 0, upcoming: 1, ended: 2 };
      const diff =
        statusOrder[getBhandaraStatus(a.bhandara, now)] -
        statusOrder[getBhandaraStatus(b.bhandara, now)];
      if (diff !== 0) return diff;
      return b.bhandara.votes.chal_raha - a.bhandara.votes.chal_raha;
    });
}
