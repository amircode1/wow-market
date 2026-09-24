import { NextRequest, NextResponse } from 'next/server';
import { getBlizzardAPI } from '@/lib/blizzard-api-helper';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').trim();
    const page = parseInt(searchParams.get('page') || '1');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const api = getBlizzardAPI(request);
    const raw = await api.searchItems(query, page);
    const searchTokens = query.toLowerCase().split(/\s+/).filter(Boolean);

    // Blizzard search API returns lightweight objects – we need full item details
    let rawResults = (raw as any).results ?? [];
    if (searchTokens.length > 1 && page === 1) {
      // Blizzard's name filter can miss exact multi-word names. Search the
      // most specific token across the first few pages, then rank locally.
      const broadQuery = [...searchTokens].sort((a, b) => b.length - a.length)[0];
      const broadPages = await Promise.all(
        [1, 2, 3].map((resultPage) => api.searchItems(broadQuery, resultPage))
      );
      rawResults = [...rawResults, ...broadPages.flatMap((result) => (result as any).results ?? [])];
    }
    const ids: number[] = rawResults
      .map((r: any) => r.data?.id ?? r.id ?? r.data?.key?.id ?? r.key?.id)
      .map((id: unknown) => typeof id === 'number' ? id : Number(id))
      .filter((id: number) => Number.isInteger(id) && id > 0)
      .filter((id: number, index: number, all: number[]) => all.indexOf(id) === index);

    // Limit concurrency to avoid rate limiting / slowdowns
    const idsToFetch = ids.slice(0, 50);
    const concurrency = 8;
    const items: Array<unknown | null> = new Array(idsToFetch.length).fill(null);
    let idx = 0;

    async function worker() {
      while (idx < idsToFetch.length) {
        const currentIndex = idx++;
        const current = idsToFetch[currentIndex];
        try {
          const item = await api.getItemDetails(current);
          items[currentIndex] = item;
        } catch {
          items[currentIndex] = null;
        }
      }
    }

    await Promise.all(Array.from({ length: Math.min(concurrency, idsToFetch.length) }, () => worker()));

    const fetchedItems = items.filter((i): i is NonNullable<typeof i> => i !== null) as any[];

    // Fuzzy rank results by query relevance (tolerates typos & word order)
    const q = query.toLowerCase().trim();
    const tokens = searchTokens;

    const normalize = (s: string) =>
      s
        .toLowerCase()
        .replace(/['’]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const levenshtein = (a: string, b: string, max: number) => {
      // Bounded Levenshtein: returns max+1 if distance > max
      if (a === b) return 0;
      if (!a.length) return b.length <= max ? b.length : max + 1;
      if (!b.length) return a.length <= max ? a.length : max + 1;
      if (Math.abs(a.length - b.length) > max) return max + 1;

      const v0 = new Array(b.length + 1).fill(0);
      const v1 = new Array(b.length + 1).fill(0);
      for (let j = 0; j <= b.length; j++) v0[j] = j;

      for (let i = 0; i < a.length; i++) {
        v1[0] = i + 1;
        let rowMin = v1[0];
        for (let j = 0; j < b.length; j++) {
          const cost = a[i] === b[j] ? 0 : 1;
          v1[j + 1] = Math.min(
            v1[j] + 1,
            v0[j + 1] + 1,
            v0[j] + cost
          );
          rowMin = Math.min(rowMin, v1[j + 1]);
        }
        if (rowMin > max) return max + 1;
        for (let j = 0; j <= b.length; j++) v0[j] = v1[j];
      }
      const d = v1[b.length];
      return d <= max ? d : max + 1;
    };

    const fuzzyScore = (nameRaw: string) => {
      const name = normalize(nameRaw);
      const qn = normalize(q);
      if (!name || !qn) return 1e9;

      // Lower is better
      let score = 1000;

      if (name === qn) score -= 800;
      if (name.startsWith(qn)) score -= 500;
      if (name.includes(qn)) score -= 250;

      // Token presence / proximity
      if (tokens.length) {
        let missing = 0;
        let tokenDistSum = 0;
        const words = name.split(' ');
        for (const tRaw of tokens) {
          const t = normalize(tRaw);
          if (!t) continue;
          if (name.includes(t)) {
            score -= 60;
            continue;
          }
          // closest word edit distance (bounded)
          let best = 4; // max+1 where max=3
          for (const w of words) {
            const d = levenshtein(t, w, 3);
            if (d < best) best = d;
            if (best === 0) break;
          }
          if (best <= 3) {
            score -= (40 - best * 10); // 0=>40, 1=>30, 2=>20, 3=>10
            tokenDistSum += best;
          } else {
            missing++;
          }
        }
        score += missing * 120;
        score += tokenDistSum * 10;
      }

      // Whole-string typo tolerance (bounded)
      const dWhole = levenshtein(qn, name, 6);
      if (dWhole <= 6) score += dWhole * 10;

      // Prefer shorter names when tied
      score += Math.min(name.length, 80) / 10;
      return score;
    };

    const ranked = fetchedItems
      .filter((it) => typeof it?.name === 'string')
      .map((it) => ({ it, s: fuzzyScore(it.name) }))
      .sort((a, b) => a.s - b.s)
      .map((x) => x.it);

    const matchesAllQueryTokens = (nameRaw: string) => {
      const words = normalize(nameRaw).split(' ').filter(Boolean);
      return tokens.every((token) =>
        words.some((word) => word.includes(normalize(token)) || levenshtein(normalize(token), word, 2) <= 2)
      );
    };

    // A multi-word search must keep every query word. This prevents
    // "Obsidium Bar" from returning unrelated "Obsidium Ore" results.
    const strictMatches = ranked.filter((item) => matchesAllQueryTokens(item.name));
    const filteredItems = tokens.length > 1 ? strictMatches : ranked;

    // Attach iconUrl via media endpoint (avoids broken itemId-based icon URLs)
const top = filteredItems.slice(0, 12);
  const mediaConcurrency = 3;
    const withIcons: any[] = new Array(top.length);
    let mIdx = 0;

    async function mediaWorker() {
      while (mIdx < top.length) {
        const i = mIdx++;
        const item = top[i];
        try {
          const media = await api.getItemMedia(item.id);
          const iconUrl =
            media?.assets?.find((a: any) => a?.key === 'icon')?.value ??
            media?.assets?.[0]?.value ??
            null;
          withIcons[i] = { ...item, iconUrl };
        } catch {
          withIcons[i] = { ...item, iconUrl: null };
        }
      }
    }

    await Promise.all(Array.from({ length: Math.min(mediaConcurrency, top.length) }, () => mediaWorker()));

    const response = {
      page: (raw as any).page ?? page,
      pageSize: withIcons.length,
      maxPageSize: withIcons.length,
      pageCount: (raw as any).pageCount ?? (filteredItems.length > 0 ? (raw as any).pageCount ?? 1 : 0),
      resultCountCapped: (raw as any).resultCountCapped ?? false,
      results: withIcons,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', // 1 hour
      },
    });
  } catch (error: any) {
    console.error('Error searching items:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      stack: error.stack,
    });
    return NextResponse.json(
      { 
        error: error.message || 'Failed to search items',
        details: error.response?.data || undefined,
      },
      { status: error.response?.status || 500 }
    );
  }
}
