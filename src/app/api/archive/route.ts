import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Fetch dynamic archives (incidents, earthquakes, jamming) up to 7 days old
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: dynamicRecords, error: archiveError } = await supabase
      .from('archive_records')
      .select('*')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false });
      
    if (archiveError) {
      console.error('Failed to fetch archive records:', archiveError);
    }

    // 2. Fetch static strategic bases
    const { data: bases, error: basesError } = await supabase
      .from('strategic_bases')
      .select('*');
      
    if (basesError) {
      console.error('Failed to fetch strategic bases:', basesError);
    }

    // 3. Fetch static nuclear facilities
    const { data: nukes, error: nukesError } = await supabase
      .from('nuclear_facilities')
      .select('*');
      
    if (nukesError) {
      console.error('Failed to fetch nuclear facilities:', nukesError);
    }

    // Format all records uniformly for the Archive Page
    const records: any[] = [];

    // Format dynamic records (already mostly formatted, just map them to the expected structure)
    (dynamicRecords || []).forEach(r => {
      records.push({
        id: r.id,
        type: r.type,
        name: r.name,
        location: r.location,
        lat: r.lat,
        lng: r.lng,
        classification: r.classification,
        date: r.date,
        detail: r.detail,
        status: r.status,
        country: r.country,
        raw: r.raw_data
      });
    });

    // Format strategic bases
    (bases || []).forEach(b => {
      records.push({
        id: b.id,
        type: 'STRATEGIC_BASE',
        name: b.callsign || 'UNKNOWN BASE',
        location: `${b.lat?.toFixed(5)}, ${b.lng?.toFixed(5)}`,
        lat: b.lat,
        lng: b.lng,
        classification: b.status === 'INACTIVE' ? 'RESTRICTED' : 'TOP_SECRET',
        date: new Date().toISOString().split('T')[0],
        detail: b.type?.replace('_', ' ') || 'MILITARY INSTALLATION',
        status: b.status || 'ACTIVE',
        country: b.country || 'UNKNOWN',
        raw: b
      });
    });

    // Format nuclear facilities
    (nukes || []).forEach(n => {
      records.push({
        id: n.id,
        type: 'NUCLEAR_FACILITY',
        name: n.name || 'UNKNOWN FACILITY',
        location: `${n.lat?.toFixed(5)}, ${n.lng?.toFixed(5)}`,
        lat: n.lat,
        lng: n.lng,
        classification: n.status?.includes('SEISMIC') ? 'TOP_SECRET' : 'RESTRICTED',
        date: new Date().toISOString().split('T')[0],
        detail: `${n.reactors} Reactors · ${n.capacity_mw} MW`,
        status: n.status || 'OPERATIONAL',
        country: n.country || 'UNKNOWN',
        raw: { ...n, capacityMW: n.capacity_mw } // Bridge the gap between db schema and frontend expectations
      });
    });

    return NextResponse.json({ records, total: records.length });
  } catch (error) {
    console.error('Archive fetch error:', error);
    return NextResponse.json({ records: [], error: 'Failed to fetch archive data' }, { status: 500 });
  }
}
