import { NextResponse } from 'next/server';
import { stealthFetch } from '@/lib/stealthFetch';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bbox = searchParams.get('bbox');
  const limit = searchParams.get('limit') || '50';

  if (!bbox) {
    return NextResponse.json({ error: 'Missing bbox parameter' }, { status: 400 });
  }

  const query = `[out:json][timeout:10];node["man_made"="surveillance"](${bbox});out body ${limit};`;
  const url = `https://overpass-api.de/api/interpreter`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(10000),
    });
    
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown Error');
      throw new Error(`Overpass returned ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (error) {
    console.error('CCTV fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CCTV data' },
      { status: 500 }
    );
  }
}
