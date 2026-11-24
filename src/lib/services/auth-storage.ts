import { UserProfile, VoteType } from '../types';

const USER_KEY = 'nukti_poodi_user_v1';
const VOTED_KEY = 'nukti_poodi_user_votes_v1';

/**
 * Decoupled client-side user session & vote history persistence.
 */

export function getSavedUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: UserProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('nukti-user-changed'));
}

export function logoutUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event('nukti-user-changed'));
}

export function getUserVoteForBhandara(bhandaraId: string): VoteType | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(VOTED_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, VoteType>) : {};
    return map[bhandaraId] || null;
  } catch {
    return null;
  }
}

export function setUserVoteForBhandara(bhandaraId: string, voteType: VoteType): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(VOTED_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, VoteType>) : {};
    map[bhandaraId] = voteType;
    localStorage.setItem(VOTED_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}
