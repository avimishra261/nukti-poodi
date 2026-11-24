import fs from 'fs';
import { createSeedBhandaras } from './seed-data';
import { Bhandara, BhandaraDatabase, CrowdLevel, VoteType } from './types';

const TMP_DB_PATH = '/tmp/nukti-poodi-db.json';
const GIST_FILENAME = 'nukti-poodi-db.json';

let memoryCache: BhandaraDatabase | null = null;

function getGistConfig() {
  const token = process.env.GITHUB_DB_TOKEN || '';
  const gistId = process.env.GITHUB_DB_GIST_ID || process.env.NEXT_PUBLIC_GIST_ID || '';
  return { token, gistId };
}

function getInitialDb(): BhandaraDatabase {
  return {
    bhandaras: createSeedBhandaras(),
    updatedAt: new Date().toISOString(),
  };
}

function readTmpDb(): BhandaraDatabase | null {
  try {
    if (fs.existsSync(TMP_DB_PATH)) {
      const raw = fs.readFileSync(TMP_DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as BhandaraDatabase;
      if (Array.isArray(parsed.bhandaras) && parsed.bhandaras.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore tmp read errors
  }
  return null;
}

function writeTmpDb(db: BhandaraDatabase) {
  try {
    fs.writeFileSync(TMP_DB_PATH, JSON.stringify(db), 'utf-8');
  } catch {
    // ignore tmp write errors
  }
}

export async function readDatabase(): Promise<BhandaraDatabase> {
  if (memoryCache) {
    return memoryCache;
  }

  const { token, gistId } = getGistConfig();
  if (gistId) {
    try {
      const headers: Record<string, string> = {
        Accept: 'application/vnd.github+json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers,
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        const fileContent = json?.files?.[GIST_FILENAME]?.content;
        if (fileContent) {
          const parsed = JSON.parse(fileContent) as BhandaraDatabase;
          if (Array.isArray(parsed.bhandaras) && parsed.bhandaras.length > 0) {
            memoryCache = parsed;
            writeTmpDb(parsed);
            return parsed;
          }
        }
      }
    } catch {
      // fallback to tmp or seed
    }
  }

  const tmp = readTmpDb();
  if (tmp) {
    memoryCache = tmp;
    return tmp;
  }

  const initial = getInitialDb();
  memoryCache = initial;
  writeTmpDb(initial);
  return initial;
}

export async function writeDatabase(db: BhandaraDatabase): Promise<void> {
  const nextDb: BhandaraDatabase = {
    bhandaras: db.bhandaras,
    updatedAt: new Date().toISOString(),
  };
  memoryCache = nextDb;
  writeTmpDb(nextDb);

  const { token, gistId } = getGistConfig();
  if (token && gistId) {
    try {
      await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: {
            [GIST_FILENAME]: {
              content: JSON.stringify(nextDb, null, 2),
            },
          },
        }),
      });
    } catch {
      // keep tmp & memory intact if remote Gist fails
    }
  }
}

export async function addBhandaraRecord(bhandara: Bhandara): Promise<Bhandara> {
  const db = await readDatabase();
  db.bhandaras = [bhandara, ...db.bhandaras];
  await writeDatabase(db);
  return bhandara;
}

export async function getBhandaraById(id: string): Promise<Bhandara | undefined> {
  const db = await readDatabase();
  return db.bhandaras.find((b) => b.id === id);
}

export async function updateBhandaraRecord(
  id: string,
  patch: Partial<Bhandara>
): Promise<Bhandara | null> {
  const db = await readDatabase();
  const idx = db.bhandaras.findIndex((b) => b.id === id);
  if (idx === -1) return null;

  const updated: Bhandara = {
    ...db.bhandaras[idx],
    ...patch,
  };
  db.bhandaras[idx] = updated;
  await writeDatabase(db);
  return updated;
}

export async function deleteBhandaraRecord(id: string): Promise<boolean> {
  const db = await readDatabase();
  const before = db.bhandaras.length;
  db.bhandaras = db.bhandaras.filter((b) => b.id !== id);
  if (db.bhandaras.length === before) return false;
  await writeDatabase(db);
  return true;
}

export async function voteOnBhandara(
  id: string,
  voteType?: VoteType,
  crowdLevel?: CrowdLevel
): Promise<Bhandara | null> {
  const db = await readDatabase();
  const idx = db.bhandaras.findIndex((b) => b.id === id);
  if (idx === -1) return null;

  const current = { ...db.bhandaras[idx] };
  current.votes = { ...current.votes };
  current.crowdVotes = { ...(current.crowdVotes || { normal: 0, medium: 0, heavy: 0 }) };

  if (voteType) {
    current.votes[voteType] = (current.votes[voteType] || 0) + 1;
    if (current.votes.fake >= 3) {
      current.isHidden = true;
    }
  }

  if (crowdLevel) {
    current.crowdVotes[crowdLevel] = (current.crowdVotes[crowdLevel] || 0) + 1;
  }

  db.bhandaras[idx] = current;
  await writeDatabase(db);
  return current;
}
