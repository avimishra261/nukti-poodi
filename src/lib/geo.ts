import { Bhandara, BhandaraStatus, CrowdLevel } from './types';

export function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function getBhandaraStatus(bhandara: Bhandara, now = new Date()): BhandaraStatus {
  if (bhandara.votes.khatam >= 3) {
    return 'ended';
  }
  const start = new Date(bhandara.startTime).getTime();
  const end = new Date(bhandara.endTime).getTime();
  const current = now.getTime();

  if (current < start) return 'upcoming';
  if (current <= end) return 'live';
  return 'ended';
}

export function isTodayInIndore(isoDate: string, now = new Date()): boolean {
  const d = new Date(isoDate);
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' });
  return fmt.format(d) === fmt.format(now);
}

export function formatTimeIST(isoDate: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(isoDate));
}

export function formatDayTimeIST(isoDate: string, now = new Date()): string {
  const d = new Date(isoDate);
  const fmtDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' });
  const todayStr = fmtDate.format(now);
  const targetStr = fmtDate.format(d);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = fmtDate.format(tomorrow);

  const timeStr = formatTimeIST(isoDate);
  if (targetStr === todayStr) return `Aaj ${timeStr}`;
  if (targetStr === tomorrowStr) return `Kal ${timeStr}`;

  const dateLabel = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
  }).format(d);
  return `${dateLabel}, ${timeStr}`;
}

export function getStatusLabel(bhandara: Bhandara, now = new Date()): {
  status: BhandaraStatus;
  badgeText: string;
  detailText: string;
} {
  const status = getBhandaraStatus(bhandara, now);
  if (status === 'live') {
    const msLeft = Math.max(0, new Date(bhandara.endTime).getTime() - now.getTime());
    const minsLeft = Math.round(msLeft / 60000);
    const leftText =
      minsLeft >= 60
        ? `${Math.floor(minsLeft / 60)}h ${minsLeft % 60 > 0 ? `${minsLeft % 60}m ` : ''}aur`
        : `${minsLeft} min aur`;
    return {
      status,
      badgeText: `LIVE • ${formatTimeIST(bhandara.endTime)} tak`,
      detailText: `Abhi chal raha hai (${leftText})`,
    };
  }
  if (status === 'upcoming') {
    return {
      status,
      badgeText: `${formatDayTimeIST(bhandara.startTime, now)} se`,
      detailText: `Shuru hoga: ${formatDayTimeIST(bhandara.startTime, now)} – ${formatTimeIST(
        bhandara.endTime
      )}`,
    };
  }
  return {
    status,
    badgeText: 'Khatam ho gaya',
    detailText: `Samapt hua (${formatDayTimeIST(bhandara.endTime, now)})`,
  };
}

export function getGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function getDominantCrowd(bhandara: Bhandara): {
  level: CrowdLevel;
  label: string;
  emoji: string;
} {
  const { normal, medium, heavy } = bhandara.crowdVotes || {
    normal: 0,
    medium: 0,
    heavy: 0,
  };
  if (heavy > medium && heavy > normal) {
    return { level: 'heavy', label: 'Bahut Bheed Hai', emoji: '🔥' };
  }
  if (medium >= normal && medium > 0) {
    return { level: 'medium', label: 'Medium Bheed', emoji: '👥' };
  }
  return { level: 'normal', label: 'Aaram Se Prasad Milega', emoji: '🟢' };
}

export function getBhandaraDetailPath(bhandara: Pick<Bhandara, 'id' | 'isSeed'>): string {
  if (bhandara.isSeed) {
    return `/bhandara/${bhandara.id}`;
  }
  return `/bhandara/custom?id=${encodeURIComponent(bhandara.id)}`;
}

export function buildWhatsAppShareUrl(bhandara: Bhandara, pageUrl: string): string {
  const statusInfo = getStatusLabel(bhandara);
  const mapsUrl = getGoogleMapsUrl(bhandara.lat, bhandara.lng);
  const menu = bhandara.foodItems.join(', ');
  const msg = `🍛 *Jai Bhandara! Nukti Poodi Indore*\n\n📍 *${bhandara.title}*\nArea: ${bhandara.area} (${bhandara.landmark})\n🍽️ Prasad: ${menu}\n⏰ Time: ${statusInfo.detailText}\n\n🧭 Raasta (Maps): ${mapsUrl}\n📲 Live Status & Details: ${pageUrl}\n\n_Indore ke aur live bhandare dekhne ke liye Nukti Poodi kholein!_`;
  return `https://wa.me/?text=${encodeURIComponent(msg)}`;
}
