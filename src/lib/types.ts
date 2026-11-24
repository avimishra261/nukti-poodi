export type VoteType = 'chal_raha' | 'khatam' | 'fake';
export type CrowdLevel = 'normal' | 'medium' | 'heavy';
export type BhandaraStatus = 'live' | 'upcoming' | 'ended';

export interface UserProfile {
  id: string;
  name: string;
  area: string;
  createdAt: string;
}

export interface BhandaraVotes {
  chal_raha: number;
  khatam: number;
  fake: number;
}

export interface CrowdVotes {
  normal: number;
  medium: number;
  heavy: number;
}

export interface Bhandara {
  id: string;
  title: string;
  organizerName?: string;
  foodItems: string[];
  description?: string;
  area: string;
  address: string;
  landmark: string;
  lat: number;
  lng: number;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  photoUrl: string;
  isVerified: boolean;
  isHidden: boolean;
  isSeed?: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  votes: BhandaraVotes;
  crowdVotes: CrowdVotes;
}

export interface BhandaraDatabase {
  bhandaras: Bhandara[];
  updatedAt: string;
}

export interface IndoreArea {
  name: string;
  hindiName: string;
  lat: number;
  lng: number;
}
