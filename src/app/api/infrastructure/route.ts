import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.from('nuclear_facilities').select('*');

  if (error) {
    console.error('Failed to fetch nuclear facilities from Supabase:', error);
    return NextResponse.json({ infrastructure: [], total: 0, error: error.message }, { status: 500 });
  }

  let dynamicFacilities = data || [];

  try {
    // Fetch recent earthquakes (M4.5+ in the past 24 hours) from USGS
    const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson', { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const eqData = await res.json();
      const earthquakes = eqData.features || [];

      // Fast distance approximation (km)
      const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const dx = (lng1 - lng2) * Math.cos((lat1 + lat2) / 2 * Math.PI / 180);
        const dy = lat1 - lat2;
        return Math.sqrt(dx * dx + dy * dy) * 111.32;
      };

      dynamicFacilities = dynamicFacilities.map(facility => {
        // Check if any quake is within 150km
        const nearbyQuakes = earthquakes.filter((eq: any) => {
          const [eqLng, eqLat] = eq.geometry.coordinates;
          return getDistanceKm(facility.lat, facility.lng, eqLat, eqLng) < 150;
        });

        if (nearbyQuakes.length > 0) {
          const maxMag = Math.max(...nearbyQuakes.map((eq: any) => eq.properties.mag));
          return {
            ...facility,
            status: `SEISMIC RISK (M${maxMag.toFixed(1)})`,
          };
        }
        return facility;
      });
    }
  } catch (e) {
    // Fallback to static list if API fails
  }
  
  // Make sure capacityMW matches the frontend's expected capacityMW (the DB has capacity_mw)
  const mappedFacilities = dynamicFacilities.map((f: any) => ({
    ...f,
    capacityMW: f.capacity_mw
  }));

  return NextResponse.json({
    infrastructure: mappedFacilities,
    total: mappedFacilities.length,
    timestamp: new Date().toISOString(),
  }, {
    headers: { 
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
}
