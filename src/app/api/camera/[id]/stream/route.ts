import { NextResponse } from 'next/server';
import { stealthFetch } from '@/lib/stealthFetch';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing lat or lng' }, { status: 400 });
  }

  const WINDY_API_KEY = process.env.WINDY_API_KEY || '';

  if (WINDY_API_KEY) {
    const url = new URL('https://api.windy.com/webcams/api/v3/webcams');
    url.searchParams.set('nearby', `${lat},${lng},5`);
    url.searchParams.set('include', 'images,player');
    url.searchParams.set('limit', '1');

    try {
      const res = await stealthFetch(url.toString(), {
        headers: { 'x-windy-api-key': WINDY_API_KEY },
        signal: AbortSignal.timeout(10000),
      });

      if (res.ok) {
        const data = await res.json();
        const webcams = data.webcams || [];
        if (webcams.length > 0) {
          const webcam = webcams[0];
          let player_embed = null;
          let image_url = null;

          if (webcam.player?.day) player_embed = webcam.player.day;
          if (webcam.player?.live) player_embed = webcam.player.live;
          if (webcam.images?.current?.preview) image_url = webcam.images.current.preview;

          if (player_embed) {
            return NextResponse.json({
              status: "LIVE UPLINK ESTABLISHED",
              stream_url: player_embed,
              image_url: image_url,
              uptime: "99.9%"
            });
          }
        }
      }
    } catch (e) {
      console.warn("Windy fetch failed:", e);
    }
  }

  // Fallback
  return NextResponse.json({
    status: "LIVE UPLINK ESTABLISHED (SIMULATED)",
    stream_url: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&controls=0&loop=1&playlist=dQw4w9WgXcQ",
    image_url: "https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=500&q=60",
    uptime: "99.9%"
  });
}
