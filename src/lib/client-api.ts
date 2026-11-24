import {
  createSeedBhandaras,
  PRESET_BHANDARA_PHOTOS,
  refreshSeedTimestamps,
} from './seed-data';
import { decodeSharedBhandara } from './geo';
import { Bhandara, CrowdLevel, UserProfile, VoteType } from './types';

const USER_KEY = 'nukti_poodi_user_v1';
const CUSTOM_KEY = 'nukti_poodi_custom_bhandaras_v1';
const OVERRIDES_KEY = 'nukti_poodi_overrides_v1';
const VOTED_KEY = 'nukti_poodi_user_votes_v1';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';
const PUBLIC_GIST_ID = process.env.NEXT_PUBLIC_GIST_ID || '';

function isStaticHosting(): boolean {
  if (typeof window === 'undefined') return false;
  if (BASE_PATH) return true;
  return window.location.hostname.endsWith('github.io');
}

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

function setUserVoteForBhandara(bhandaraId: string, voteType: VoteType): void {
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

function readLocalCustom(): Bhandara[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    return raw ? (JSON.parse(raw) as Bhandara[]) : [];
  } catch {
    return [];
  }
}

function writeLocalCustom(list: Bhandara[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
}

function readLocalOverrides(): Record<string, Partial<Bhandara> & { _deleted?: boolean }> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeLocalOverrides(
  map: Record<string, Partial<Bhandara> & { _deleted?: boolean }>
): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(map));
}

async function fetchPublicGistBhandaras(): Promise<Bhandara[] | null> {
  if (!PUBLIC_GIST_ID) return null;
  try {
    const res = await fetch(`https://api.github.com/gists/${PUBLIC_GIST_ID}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    const content = json?.files?.['nukti-poodi-db.json']?.content;
    if (!content) return null;
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed.bhandaras)) {
      return parsed.bhandaras as Bhandara[];
    }
  } catch {
    return null;
  }
  return null;
}

function mergeWithLocalState(remoteList: Bhandara[]): Bhandara[] {
  const custom = readLocalCustom();
  const overrides = readLocalOverrides();
  const byId = new Map<string, Bhandara>();

  for (const b of remoteList) {
    byId.set(b.id, b);
  }
  for (const c of custom) {
    byId.set(c.id, c);
  }

  const merged: Bhandara[] = [];
  for (const [id, item] of Array.from(byId.entries())) {
    const ov = overrides[id];
    if (ov?._deleted) continue;
    merged.push(ov ? { ...item, ...ov } : item);
  }

  return merged.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function fetchAllBhandaras(includeHidden = false): Promise<Bhandara[]> {
  if (!isStaticHosting()) {
    try {
      const res = await fetch(
        `${BASE_PATH}/api/bhandaras${includeHidden ? '?all=true' : ''}`,
        { cache: 'no-store' }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.bhandaras)) {
          return data.bhandaras as Bhandara[];
        }
      }
    } catch {
      // fall through to static/gist mode
    }
  }

  const gistData = await fetchPublicGistBhandaras();
  const base = refreshSeedTimestamps(
    gistData && gistData.length > 0 ? gistData : createSeedBhandaras()
  );
  const merged = mergeWithLocalState(base);
  return includeHidden ? merged : merged.filter((b) => !b.isHidden);
}

export function importSharedBhandaraFromParam(encoded: string): Bhandara | null {
  const decoded = decodeSharedBhandara(encoded, PRESET_BHANDARA_PHOTOS[0].url);
  if (!decoded) return null;
  const existing = readLocalCustom();
  if (!existing.some((b) => b.id === decoded.id)) {
    writeLocalCustom([decoded, ...existing]);
  }
  return decoded;
}

export async function fetchBhandaraById(id: string): Promise<Bhandara | null> {
  if (!isStaticHosting()) {
    try {
      const res = await fetch(`${BASE_PATH}/api/bhandaras/${encodeURIComponent(id)}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.bhandara) return data.bhandara as Bhandara;
      }
    } catch {
      // fallback
    }
  }

  const all = await fetchAllBhandaras(true);
  return all.find((b) => b.id === id) || null;
}

export async function createBhandaraClient(
  payload: Omit<
    Bhandara,
    'id' | 'isVerified' | 'isHidden' | 'createdAt' | 'votes' | 'crowdVotes'
  >
): Promise<Bhandara> {
  const custom = readLocalCustom();
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentByUser = custom.filter(
    (b) =>
      b.createdBy === payload.createdBy &&
      new Date(b.createdAt).getTime() >= dayAgo
  ).length;
  if (recentByUser >= 5) {
    throw new Error(
      'Ek din me adhiktam 5 bhandare hi jode ja sakte hain (Spam Protection).'
    );
  }

  if (!isStaticHosting()) {
    try {
      const res = await fetch(`${BASE_PATH}/api/bhandaras`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.bhandara) return data.bhandara as Bhandara;
      } else if (res.status === 429) {
        const errData = await res.json();
        throw new Error(errData.error || 'Daily limit reached');
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('adhiktam 5')) {
        throw err;
      }
      // fallback to local persistence
    }
  }

  const newRecord: Bhandara = {
    ...payload,
    id: `np-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    isVerified: false,
    isHidden: false,
    isSeed: false,
    createdAt: new Date().toISOString(),
    votes: { chal_raha: 1, khatam: 0, fake: 0 },
    crowdVotes: { normal: 1, medium: 0, heavy: 0 },
  };
  writeLocalCustom([newRecord, ...custom]);
  return newRecord;
}

export async function submitVoteClient(
  id: string,
  voteType?: VoteType,
  crowdLevel?: CrowdLevel
): Promise<Bhandara | null> {
  if (voteType) {
    setUserVoteForBhandara(id, voteType);
  }

  if (!isStaticHosting()) {
    try {
      const res = await fetch(`${BASE_PATH}/api/bhandaras/${encodeURIComponent(id)}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType, crowdLevel }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.bhandara) return data.bhandara as Bhandara;
      }
    } catch {
      // fallback
    }
  }

  const target = await fetchBhandaraById(id);
  if (!target) return null;

  const updated: Bhandara = {
    ...target,
    votes: { ...target.votes },
    crowdVotes: { ...(target.crowdVotes || { normal: 0, medium: 0, heavy: 0 }) },
  };
  if (voteType) {
    updated.votes[voteType] = (updated.votes[voteType] || 0) + 1;
    if (updated.votes.fake >= 3) {
      updated.isHidden = true;
    }
  }
  if (crowdLevel) {
    updated.crowdVotes[crowdLevel] = (updated.crowdVotes[crowdLevel] || 0) + 1;
  }

  const overrides = readLocalOverrides();
  overrides[id] = {
    ...overrides[id],
    votes: updated.votes,
    crowdVotes: updated.crowdVotes,
    isHidden: updated.isHidden,
  };
  writeLocalOverrides(overrides);
  return updated;
}

export async function adminUpdateBhandaraClient(
  id: string,
  patch: Partial<Bhandara>
): Promise<Bhandara | null> {
  if (!isStaticHosting()) {
    try {
      const res = await fetch(`${BASE_PATH}/api/bhandaras/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.bhandara) return data.bhandara as Bhandara;
      }
    } catch {
      // fallback
    }
  }

  const overrides = readLocalOverrides();
  overrides[id] = { ...overrides[id], ...patch };
  writeLocalOverrides(overrides);
  return fetchBhandaraById(id);
}

export async function adminDeleteBhandaraClient(id: string): Promise<boolean> {
  if (!isStaticHosting()) {
    try {
      const res = await fetch(`${BASE_PATH}/api/bhandaras/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) return true;
    } catch {
      // fallback
    }
  }

  const custom = readLocalCustom().filter((b) => b.id !== id);
  writeLocalCustom(custom);
  const overrides = readLocalOverrides();
  overrides[id] = { _deleted: true };
  writeLocalOverrides(overrides);
  return true;
}
