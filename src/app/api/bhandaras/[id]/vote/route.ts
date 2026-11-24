import { NextRequest, NextResponse } from 'next/server';
import { voteOnBhandara } from '@/lib/db';
import { CrowdLevel, VoteType } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const voteType = body.voteType as VoteType | undefined;
    const crowdLevel = body.crowdLevel as CrowdLevel | undefined;

    if (
      voteType &&
      !['chal_raha', 'khatam', 'fake'].includes(voteType)
    ) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
    }

    if (
      crowdLevel &&
      !['normal', 'medium', 'heavy'].includes(crowdLevel)
    ) {
      return NextResponse.json({ error: 'Invalid crowd level' }, { status: 400 });
    }

    const updated = await voteOnBhandara(params.id, voteType, crowdLevel);
    if (!updated) {
      return NextResponse.json({ error: 'Bhandara not found' }, { status: 404 });
    }

    return NextResponse.json({ bhandara: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 });
  }
}
