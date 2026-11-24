import { NextRequest, NextResponse } from 'next/server';
import { addBhandaraRecord, readDatabase } from '@/lib/db';
import { PRESET_BHANDARA_PHOTOS } from '@/lib/seed-data';
import { Bhandara } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const includeAll = req.nextUrl.searchParams.get('all') === 'true';
    const db = await readDatabase();
    const list = includeAll
      ? db.bhandaras
      : db.bhandaras.filter((b) => !b.isHidden);
    return NextResponse.json({ bhandaras: list, updatedAt: db.updatedAt });
  } catch (err) {
    console.error('GET /api/bhandaras error:', err);
    return NextResponse.json(
      { error: 'Failed to load bhandaras' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title = String(body.title || '').trim();
    const area = String(body.area || 'Other').trim();
    const address = String(body.address || '').trim();
    const landmark = String(body.landmark || '').trim();

    if (!title || title.length < 3) {
      return NextResponse.json(
        { error: 'Bhandara ka naam kam se kam 3 akshar ka hona chahiye' },
        { status: 400 }
      );
    }

    const startTime = body.startTime
      ? new Date(body.startTime)
      : new Date();
    const endTime = body.endTime
      ? new Date(body.endTime)
      : new Date(startTime.getTime() + 3 * 60 * 60 * 1000);

    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      return NextResponse.json(
        { error: 'Valid start aur end time dein' },
        { status: 400 }
      );
    }

    const maxDurationMs = 24 * 60 * 60 * 1000;
    const clampedEnd =
      endTime.getTime() - startTime.getTime() > maxDurationMs
        ? new Date(startTime.getTime() + maxDurationMs)
        : endTime;

    const foodItems = Array.isArray(body.foodItems)
      ? body.foodItems.map((x: unknown) => String(x).trim()).filter(Boolean)
      : ['Nukti', 'Poodi'];

    const newRecord: Bhandara = {
      id: `np-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      organizerName: body.organizerName
        ? String(body.organizerName).trim()
        : undefined,
      foodItems: foodItems.length > 0 ? foodItems : ['Prasad'],
      description: body.description
        ? String(body.description).trim()
        : undefined,
      area,
      address: address || `${area}, Indore`,
      landmark: landmark || `${area} ke paas`,
      lat: typeof body.lat === 'number' ? body.lat : 22.7196,
      lng: typeof body.lng === 'number' ? body.lng : 75.8577,
      startTime: startTime.toISOString(),
      endTime: clampedEnd.toISOString(),
      photoUrl: body.photoUrl || PRESET_BHANDARA_PHOTOS[0].url,
      isVerified: false,
      isHidden: false,
      isSeed: false,
      createdBy: String(body.createdBy || 'guest'),
      createdByName: String(body.createdByName || 'Indore Bhakt'),
      createdAt: new Date().toISOString(),
      votes: { chal_raha: 1, khatam: 0, fake: 0 },
      crowdVotes: { normal: 1, medium: 0, heavy: 0 },
    };

    const saved = await addBhandaraRecord(newRecord);
    return NextResponse.json({ bhandara: saved }, { status: 201 });
  } catch (err) {
    console.error('POST /api/bhandaras error:', err);
    return NextResponse.json(
      { error: 'Bhandara save karne me error aaya' },
      { status: 500 }
    );
  }
}
