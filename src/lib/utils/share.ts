import { Bhandara, CrowdLevel } from '../types';
import { getGoogleMapsUrl } from './geo';
import { getStatusLabel } from './time';

/**
 * Pure sharing, crowd signal, and cross-device payload helpers.
 */

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

export function getConfirmationRate(bhandara: Bhandara): number {
  const pos = bhandara.votes.chal_raha || 0;
  const neg = (bhandara.votes.khatam || 0) + (bhandara.votes.fake || 0);
  const total = pos + neg;
  if (total === 0) return 100;
  return Math.round((pos / total) * 100);
}

export function encodeSharedBhandara(b: Bhandara): string {
  try {
    const compact = {
      id: b.id,
      t: b.title,
      o: b.organizerName,
      f: b.foodItems,
      d: b.description,
      a: b.area,
      ad: b.address,
      l: b.landmark,
      lt: b.lat,
      lg: b.lng,
      st: b.startTime,
      et: b.endTime,
      cb: b.createdBy,
      cn: b.createdByName,
      ca: b.createdAt,
    };
    const json = JSON.stringify(compact);
    const bytes = new TextEncoder().encode(json);
    let bin = '';
    bytes.forEach((byte) => {
      bin += String.fromCharCode(byte);
    });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch {
    return '';
  }
}

export function decodeSharedBhandara(
  encoded: string,
  fallbackPhotoUrl: string
): Bhandara | null {
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
    const bin = atob(b64 + pad);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const c = JSON.parse(json);
    if (!c?.id || !c?.t) return null;
    return {
      id: c.id,
      title: c.t,
      organizerName: c.o,
      foodItems: Array.isArray(c.f) ? c.f : ['Prasad'],
      description: c.d,
      area: c.a || 'Indore',
      address: c.ad || `${c.a || 'Indore'}`,
      landmark: c.l || '',
      lat: typeof c.lt === 'number' ? c.lt : 22.7196,
      lng: typeof c.lg === 'number' ? c.lg : 75.8577,
      startTime: c.st || new Date().toISOString(),
      endTime: c.et || new Date(Date.now() + 3 * 3600000).toISOString(),
      photoUrl: fallbackPhotoUrl,
      isVerified: false,
      isHidden: false,
      isSeed: false,
      createdBy: c.cb || 'guest',
      createdByName: c.cn || 'Indore Bhakt',
      createdAt: c.ca || new Date().toISOString(),
      votes: { chal_raha: 1, khatam: 0, fake: 0 },
      crowdVotes: { normal: 1, medium: 0, heavy: 0 },
    };
  } catch {
    return null;
  }
}

export function getBhandaraDetailPath(bhandara: Bhandara): string {
  if (bhandara.isSeed) {
    return `/bhandara/${bhandara.id}`;
  }
  const encoded =
    typeof window !== 'undefined' ? encodeSharedBhandara(bhandara) : '';
  return encoded
    ? `/bhandara/custom?id=${encodeURIComponent(bhandara.id)}&d=${encoded}`
    : `/bhandara/custom?id=${encodeURIComponent(bhandara.id)}`;
}

export function buildWhatsAppShareUrl(bhandara: Bhandara, pageUrl: string): string {
  const statusInfo = getStatusLabel(bhandara);
  const mapsUrl = getGoogleMapsUrl(bhandara.lat, bhandara.lng);
  const menu = bhandara.foodItems.join(', ');
  const msg = `🍛 *Jai Bhandara! Nukti Poodi Indore*\n\n📍 *${bhandara.title}*\nArea: ${bhandara.area} (${bhandara.landmark})\n🍽️ Prasad: ${menu}\n⏰ Time: ${statusInfo.detailText}\n\n🧭 Raasta (Maps): ${mapsUrl}\n📲 Live Status & Details: ${pageUrl}\n\n_Indore ke aur live bhandare dekhne ke liye Nukti Poodi kholein!_`;
  return `https://wa.me/?text=${encodeURIComponent(msg)}`;
}
