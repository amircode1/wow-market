import { NextRequest, NextResponse } from 'next/server';
import { getBlizzardAPI } from '@/lib/blizzard-api-helper';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> }
) {
  try {
    const { recipeId: recipeIdStr } = await params;
    const recipeId = parseInt(recipeIdStr);
    
    if (isNaN(recipeId)) {
      return NextResponse.json(
        { error: 'Invalid recipe ID' },
        { status: 400 }
      );
    }

    const api = getBlizzardAPI(request);
    const data = await api.getRecipe(recipeId);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800', // 24 hours
      },
    });
  } catch (error: any) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch recipe' },
      { status: error.response?.status || 500 }
    );
  }
}
