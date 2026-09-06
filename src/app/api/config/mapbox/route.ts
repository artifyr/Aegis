import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const token =
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
    process.env.MAPBOX_TOKEN ||
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
    process.env.MAPBOX_ACCESS_TOKEN ||
    '';

  return NextResponse.json({
    success: true,
    token: token.trim(),
  });
}
