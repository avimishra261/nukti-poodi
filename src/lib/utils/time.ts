import { Bhandara, BhandaraStatus } from '../types';

/**
 * Pure IST date/time formatting and bhandara lifecycle status helpers.
 */

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

export function getStatusLabel(
  bhandara: Bhandara,
  now = new Date()
): {
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
