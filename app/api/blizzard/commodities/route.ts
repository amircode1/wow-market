import { NextRequest, NextResponse } from 'next/server';
import { getBlizzardAPI } from '@/lib/blizzard-api-helper';

export async function GET(request: NextRequest) {
  try {
    const api = getBlizzardAPI(request);
    const data = await api.getCommodities();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error: any) {
    console.error('Error fetching commodities:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch commodities' },
      { status: error.response?.status || 500 }
    );
  }
}

