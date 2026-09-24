import { NextRequest, NextResponse } from 'next/server';
import { getBlizzardAPI } from '@/lib/blizzard-api-helper';

export async function GET(request: NextRequest) {
  try {
    const api = getBlizzardAPI(request);
    const data = await api.getWowTokenPrice();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error: any) {
    console.error('Token endpoint error:', error);
    return NextResponse.json(
      {
        error: 'Blizzard API token check failed',
        details: error.message || 'Unknown error',
      },
      { status: 502 }
    );
  }
}
