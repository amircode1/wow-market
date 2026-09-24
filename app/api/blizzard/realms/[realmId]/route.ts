import { NextRequest, NextResponse } from 'next/server';
import { getBlizzardAPI } from '@/lib/blizzard-api-helper';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ realmId: string }> }
) {
  try {
    const { realmId: realmIdStr } = await params;
    const realmId = parseInt(realmIdStr);
    
    if (isNaN(realmId)) {
      return NextResponse.json(
        { error: 'Invalid realm ID' },
        { status: 400 }
      );
    }

    const api = getBlizzardAPI(request);
    const data = await api.getConnectedRealmDetails(realmId);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400', // 7 days
      },
    });
  } catch (error: any) {
    console.error('Error fetching realm details:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch realm details' },
      { status: error.response?.status || 500 }
    );
  }
}
