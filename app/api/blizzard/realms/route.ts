import { NextRequest, NextResponse } from 'next/server';
import { getBlizzardAPI } from '@/lib/blizzard-api-helper';

async function fetchWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: NodeJS.Timeout;

  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timeout = setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]).finally(() => clearTimeout(timeout!));
}

async function fetchRealmDetailsWithConcurrency(api: ReturnType<typeof getBlizzardAPI>, realmIds: number[]) {
  const realms: unknown[] = [];
  const concurrency = 4;
  const timeoutMs = 12000;
  let index = 0;

  async function worker() {
    while (index < realmIds.length) {
      const currentIndex = index++;
      const realmId = realmIds[currentIndex];

      try {
        const realm = await fetchWithTimeout(api.getConnectedRealmDetails(realmId), timeoutMs);
        realms[currentIndex] = realm;
      } catch (error: any) {
        console.warn(`Skipping realm ${realmId}:`, error.message || error);
        realms[currentIndex] = null;
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, realmIds.length) }, () => worker()));
  return realms.filter((realm): realm is NonNullable<typeof realm> => Boolean(realm));
}

export async function GET(request: NextRequest) {
  try {
    const api = getBlizzardAPI(request);
    const index = await api.getConnectedRealms();
    const realmIds = (index.connected_realms || [])
      .map((link) => {
        const href = link?.href || '';
        const match = href.match(/connected-realm\/(\d+)/);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter((id): id is number => Number.isInteger(id));

    // Fetch details with limited concurrency to avoid Blizzard 429/timeouts.
    // Partial fallback data keeps the realm selector usable when some details fail.
    const realmsToFetch = realmIds.slice(0, 120);
    const realms = await fetchRealmDetailsWithConcurrency(api, realmsToFetch);

    return NextResponse.json(realms, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error: any) {
    console.error('Error fetching realms:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch realms' },
      { status: error.response?.status || 500 }
    );
  }
}
