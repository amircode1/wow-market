import { NextRequest, NextResponse } from 'next/server';
import { getBlizzardAPI } from '@/lib/blizzard-api-helper';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId: itemIdStr } = await params;
    const itemId = parseInt(itemIdStr);
    
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      );
    }

    const api = getBlizzardAPI(request);
    const data = await api.getItemMedia(itemId);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=2592000, stale-while-revalidate=5184000', // 30 days
      },
    });
  } catch (error: any) {
    console.error('Error fetching item media:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch item media' },
      { status: error.response?.status || 500 }
    );
  }
}
