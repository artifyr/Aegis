import { NextResponse } from 'next/server';
import { getAuthRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const role = await getAuthRole();
  if (!role) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  let yieldKt = parseFloat(searchParams.get('yield') || '100');
  let lat = parseFloat(searchParams.get('lat') || '0');
  let lng = parseFloat(searchParams.get('lng') || '0');

  // Clamp/validate inputs to prevent abuse
  if (isNaN(yieldKt) || !isFinite(yieldKt)) yieldKt = 100;
  if (isNaN(lat) || !isFinite(lat)) lat = 0;
  if (isNaN(lng) || !isFinite(lng)) lng = 0;
  yieldKt = Math.max(0.1, Math.min(50000, yieldKt)); // between 0.1kt and 50Mt
  lat = Math.max(-90, Math.min(90, lat));
  lng = Math.max(-180, Math.min(180, lng));


  // Simple approximations based on scaling laws for surface bursts
  // These are very rough estimates for the game/sim, not real scientific models
  // Real models depend heavily on altitude of burst, terrain, weather, etc.
  
  // W = yield in kilotons
  // Radius roughly scales with W^(1/3)
  
  // 1. Fireball radius (approx)
  // R = 0.028 * W^0.4 (in km)
  const fireball = 0.028 * Math.pow(yieldKt, 0.4) * 10; // boosted slightly for visual scale
  
  // 2. Heavy blast damage (20 psi) - concrete buildings destroyed
  // R = 0.28 * W^(1/3) (in km)
  const heavyBlast = 0.28 * Math.pow(yieldKt, 0.33);
  
  // 3. Moderate blast damage (5 psi) - most residential buildings collapse
  // R = 0.7 * W^(1/3) (in km)
  const moderateBlast = 0.7 * Math.pow(yieldKt, 0.33) * 2;
  
  // 4. Thermal radiation radius (3rd degree burns)
  // R = 1.2 * W^0.4 (in km)
  const thermal = 1.2 * Math.pow(yieldKt, 0.4) * 1.5;
  
  // 5. Light blast damage (1 psi) - glass windows break
  // R = 1.8 * W^(1/3) (in km)
  const lightBlast = 1.8 * Math.pow(yieldKt, 0.33) * 2.5;

  // Very rough population estimate casualty calculation based on city size heuristics
  // In a real app this would query a population density database
  
  // Base population density modifier based on lat/lng heuristics
  let popDensity = 100; // default low density
  if ((lat > 30 && lat < 50) && (lng > -125 && lng < -70)) popDensity = 800; // US
  if ((lat > 35 && lat < 60) && (lng > -10 && lng < 30)) popDensity = 1500; // Europe
  if ((lat > 10 && lat < 40) && (lng > 70 && lng < 120)) popDensity = 3000; // Asia
  if ((lat > 18 && lat < 20) && (lng > 72 && lng < 74)) popDensity = 25000; // Mumbai area
  if ((lat > 40.5 && lat < 41) && (lng > -74.5 && lng < -73.5)) popDensity = 10000; // NYC area
  if ((lat > 35 && lat < 36) && (lng > 139 && lng < 140)) popDensity = 15000; // Tokyo area

  // Area of heavy blast circle: A = pi * r^2
  const heavyArea = Math.PI * Math.pow(heavyBlast, 2);
  const moderateArea = Math.PI * Math.pow(moderateBlast, 2) - heavyArea;
  const lightArea = Math.PI * Math.pow(lightBlast, 2) - moderateArea - heavyArea;

  const fatalities = Math.floor((heavyArea * popDensity * 0.9) + (moderateArea * popDensity * 0.4));
  const injuries = Math.floor((moderateArea * popDensity * 0.4) + (lightArea * popDensity * 0.2));

  return NextResponse.json({
    yieldKt,
    radii: {
      fireball,
      heavyBlast,
      moderateBlast,
      thermal,
      lightBlast
    },
    casualties: {
      fatalities,
      injuries
    }
  });
}
