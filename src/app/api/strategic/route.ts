import { NextResponse } from 'next/server';
import { getAuthRole } from '@/lib/auth';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  const role = await getAuthRole();
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.from('strategic_bases').select('*');

  if (error) {
    console.error('Failed to fetch strategic bases from Supabase:', error);
    return NextResponse.json({ bases: [], total: 0, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    bases: data || [],
    total: data ? data.length : 0,
    timestamp: new Date().toISOString(),
  }, {
    headers: { 
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
}

