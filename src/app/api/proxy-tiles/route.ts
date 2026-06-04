import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const targetUrl = new URL(url);
    const hostname = targetUrl.hostname;

    // Secure domain validation to prevent open proxy abuse (SSRF)
    const isAllowed = 
      hostname === 'cartocdn.com' || hostname.endsWith('.cartocdn.com') ||
      hostname === 'mapbox.com' || hostname.endsWith('.mapbox.com');

    if (!isAllowed) {
      return NextResponse.json({ error: 'Forbidden domain' }, { status: 403 });
    }

    const response = await fetch(targetUrl.toString(), {
      headers: {
        'Accept': '*/*',
        'User-Agent': 'Aegis-Tile-Proxy/1.0',
      },
      // Cache tiles locally at the server/CDN layer for 1 year
      next: {
        revalidate: 31536000,
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch tile' }, { status: response.status });
    }

    const data = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Tile proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
