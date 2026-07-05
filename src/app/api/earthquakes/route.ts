
import { NextResponse } from 'next/server';
import { getAuthRole } from '@/lib/auth';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

/**
 * AEGIS â€” Earthquake Data API
 * Fetches real-time seismic events from USGS (last 24h, M2.5+)
 * No API key required
 */

export async function GET() {
  const role = await getAuthRole();
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json({ earthquakes: [], error: 'USGS unavailable' });
    }

    const data = await res.json();
    const features = data.features || [];

    const earthquakes = features.map((f: any) => {
      const coords = f.geometry?.coordinates || [0, 0, 0];
      const props = f.properties || {};
      return {
        id: f.id,
        lat: coords[1],
        lng: coords[0],
        depth: coords[2],
        magnitude: props.mag,
        place: props.place,
        time: props.time,
        url: props.url,
        tsunami: props.tsunami,
        type: props.type,
        felt: props.felt,
        alert: props.alert,
      };
    });

    // Fire and forget archive to Supabase
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      
      const archiveRecords = earthquakes.map((e: any) => ({
        id: e.id,
        type: 'SEISMIC_EVENT',
        name: e.place || 'SEISMIC ANOMALY',
        location: `${e.lat?.toFixed(5)}, ${e.lng?.toFixed(5)}`,
        lat: e.lat,
        lng: e.lng,
        classification: 'UNCLASSIFIED',
        date: e.time ? new Date(e.time).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        detail: `Magnitude ${e.magnitude || '?'}`,
        status: (e.magnitude || 0) >= 6.0 ? 'CRITICAL' : 'MONITORED',
        country: 'TECTONIC BOUNDARY',
        raw_data: e
      }));
      
      if (archiveRecords.length > 0) {
        await supabase.from('archive_records').upsert(archiveRecords, { onConflict: 'id' });
        
        // Delete records older than 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        await supabase.from('archive_records').delete().lt('created_at', sevenDaysAgo.toISOString());
      }
    } catch (e) {
      console.error('Failed to archive earthquakes:', e);
    }

    return NextResponse.json({
      earthquakes,
      total: earthquakes.length,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Earthquake fetch error:', error);
    return NextResponse.json({ earthquakes: [], error: 'Failed to fetch earthquake data' }, { status: 500 });
  }
}

