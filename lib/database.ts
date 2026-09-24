import Dexie, { Table } from 'dexie';
import type { PriceSnapshot, Item, Auction, ItemMedia, OHLCV } from '@/types';

export interface CachedItem extends Omit<Item, 'id'> {
  id?: number; // Optional auto-incremented database key
  itemId: number;
  cachedAt: number;
}

export interface CachedAuctionData {
  id: string;
  realmId: number;
  timestamp: number;
  auctions: Auction[];
  cachedAt: number;
}

export interface CachedItemMedia extends Omit<ItemMedia, 'id'> {
  id?: number; // Optional auto-incremented database key
  itemId: number;
  cachedAt: number;
}

export interface CachedChartData {
  id: string;
  itemId: number;
  realmId: number;
  timeframe: string;
  data: OHLCV[];
  cachedAt: number;
}

class WoWMarketDB extends Dexie {
  priceHistory!: Table<PriceSnapshot>;
  itemsCache!: Table<CachedItem>;
  auctionsCache!: Table<CachedAuctionData>;
  mediaCache!: Table<CachedItemMedia>;
  chartDataCache!: Table<CachedChartData>;

  constructor() {
    super('WoWMarketTrackerDB');
    
    this.version(1).stores({
      priceHistory: '++id, itemId, realmId, timestamp',
      itemsCache: '++id, itemId, cachedAt',
      auctionsCache: '++id, realmId, timestamp, cachedAt',
      mediaCache: '++id, itemId, cachedAt',
      chartDataCache: '++id, itemId, realmId, timeframe, cachedAt',
    });
    this.version(2).stores({
      priceHistory: 'id, [itemId+realmId], itemId, realmId, timestamp',
    });
    this.version(3).stores({
      itemsCache: '++id, itemId, cachedAt',
      mediaCache: '++id, itemId, cachedAt',
    });
  }
}

export const db = new WoWMarketDB();

// Cache management utilities
export class CacheManager {
  private static readonly CACHE_DURATIONS = {
    priceHistory: 365 * 24 * 60 * 60 * 1000, // 1 year
    itemsCache: 7 * 24 * 60 * 60 * 1000, // 7 days
    auctionsCache: 60 * 60 * 1000, // 1 hour
    mediaCache: 30 * 24 * 60 * 60 * 1000, // 30 days
    chartDataCache: 24 * 60 * 60 * 1000, // 1 day
  };

  // Price History
  static async savePriceSnapshot(snapshot: PriceSnapshot): Promise<void> {
    const record = {
      ...snapshot,
      id: `${snapshot.itemId}-${snapshot.realmId}-${snapshot.timestamp}`,
    };
    try {
      await db.priceHistory.put(record);
    } catch {
      this.saveLocalPriceSnapshot(snapshot);
    }
  }

  static async savePriceSnapshots(snapshots: PriceSnapshot[]): Promise<void> {
    if (snapshots.length === 0) return;
    try {
      await db.priceHistory.bulkPut(snapshots.map((snapshot) => ({
        ...snapshot,
        id: `${snapshot.itemId}-${snapshot.realmId}-${snapshot.timestamp}`,
      })));
    } catch {
      snapshots.forEach((snapshot) => this.saveLocalPriceSnapshot(snapshot));
    }
  }

  static async getPriceHistory(itemId: number, realmId: number, limit?: number): Promise<PriceSnapshot[]> {
    const cutoff = Date.now() - this.CACHE_DURATIONS.priceHistory;

    try {
      let query = db.priceHistory
        .where('[itemId+realmId]')
        .between([itemId, realmId], [itemId, realmId])
        .and(snapshot => snapshot.timestamp > cutoff)
        .reverse()
        .sortBy('timestamp');

      if (limit) {
        query = query.then(results => results.slice(0, limit));
      }

      const results = await query;
      return this.mergeLocalPriceHistory(itemId, realmId, results, limit);
    } catch {
      // Older local databases may not have the compound index yet.
      try {
        const results = (await db.priceHistory.toArray())
          .filter((snapshot) => snapshot.itemId === itemId && snapshot.realmId === realmId && snapshot.timestamp > cutoff)
          .sort((a, b) => b.timestamp - a.timestamp);
        return this.mergeLocalPriceHistory(itemId, realmId, results, limit);
      } catch {
        return this.mergeLocalPriceHistory(itemId, realmId, [], limit);
      }
    }
  }

  private static localPriceHistoryKey(itemId: number, realmId: number): string {
    return `wow-market-price-history-${realmId}-${itemId}`;
  }

  private static saveLocalPriceSnapshot(snapshot: PriceSnapshot): void {
    if (typeof window === 'undefined') return;
    const key = this.localPriceHistoryKey(snapshot.itemId, snapshot.realmId);
    try {
      const current = JSON.parse(localStorage.getItem(key) || '[]') as PriceSnapshot[];
      const next = [...current.filter((item) => item.timestamp !== snapshot.timestamp), snapshot]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 500);
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Local storage is only a recovery path; chart collection should continue.
    }
  }

  private static mergeLocalPriceHistory(
    itemId: number,
    realmId: number,
    results: PriceSnapshot[],
    limit?: number
  ): PriceSnapshot[] {
    if (typeof window === 'undefined') return limit ? results.slice(0, limit) : results;
    try {
      const local = JSON.parse(localStorage.getItem(this.localPriceHistoryKey(itemId, realmId)) || '[]') as PriceSnapshot[];
      const merged = [...results, ...local]
        .filter((snapshot) => snapshot.itemId === itemId && snapshot.realmId === realmId)
        .sort((a, b) => b.timestamp - a.timestamp)
        .filter((snapshot, index, all) => all.findIndex((item) => item.timestamp === snapshot.timestamp) === index);
      return limit ? merged.slice(0, limit) : merged;
    } catch {
      return limit ? results.slice(0, limit) : results;
    }
  }

  static async getLatestPriceSnapshot(itemId: number, realmId: number): Promise<PriceSnapshot | undefined> {
    const cutoff = Date.now() - this.CACHE_DURATIONS.priceHistory;
    
    return db.priceHistory
      .where('[itemId+realmId]')
      .between([itemId, realmId], [itemId, realmId])
      .and(snapshot => snapshot.timestamp > cutoff)
      .reverse()
      .first();
  }

  static async getLatestSnapshotsByItem(realmId: number): Promise<Map<number, PriceSnapshot[]>> {
    const snapshots = await db.priceHistory
      .where('realmId')
      .equals(realmId)
      .reverse()
      .sortBy('timestamp');
    const latestByItem = new Map<number, PriceSnapshot[]>();

    for (const snapshot of snapshots) {
      const itemSnapshots = latestByItem.get(snapshot.itemId) ?? [];
      if (itemSnapshots.length < 2) {
        itemSnapshots.push(snapshot);
        latestByItem.set(snapshot.itemId, itemSnapshots);
      }
    }

    return latestByItem;
  }

  // Items Cache
  static async cacheItem(item: Item): Promise<void> {
    const existing = await db.itemsCache.where('itemId').equals(item.id).first();
    const record = {
      ...item,
      itemId: item.id,
      cachedAt: Date.now(),
    };
    if (existing?.id !== undefined) {
      await db.itemsCache.put({ ...record, id: existing.id });
    } else {
      await db.itemsCache.add(record);
    }
  }

  static async getCachedItem(itemId: number): Promise<Item | null> {
    const cutoff = Date.now() - this.CACHE_DURATIONS.itemsCache;
    
    const cached = await db.itemsCache
      .where('itemId')
      .equals(itemId)
      .and(item => item.cachedAt > cutoff)
      .first();

    if (!cached) return null;

    // Remove cache-specific fields
    const { cachedAt, itemId: _, id, ...item } = cached;
    return item as Item;
  }

  // Auctions Cache
  static async cacheAuctions(realmId: number, auctions: Auction[], timestamp: number): Promise<void> {
    await db.auctionsCache.put({
      id: `${realmId}-${timestamp}`,
      realmId,
      timestamp,
      auctions,
      cachedAt: Date.now(),
    });
  }

  static async getCachedAuctions(realmId: number, timestamp: number): Promise<Auction[] | null> {
    const cutoff = Date.now() - this.CACHE_DURATIONS.auctionsCache;
    
    const cached = await db.auctionsCache
      .where('id')
      .equals(`${realmId}-${timestamp}`)
      .and(data => data.cachedAt > cutoff)
      .first();

    return cached ? cached.auctions : null;
  }

  static async getLatestAuctions(realmId: number): Promise<Auction[] | null> {
    const cutoff = Date.now() - this.CACHE_DURATIONS.auctionsCache;
    
    const cached = await db.auctionsCache
      .where('realmId')
      .equals(realmId)
      .and(data => data.cachedAt > cutoff)
      .reverse()
      .sortBy('timestamp')
      .then(results => results[0]);

    return cached ? cached.auctions : null;
  }

  // Media Cache
  static async cacheItemMedia(itemId: number, media: ItemMedia): Promise<void> {
    const existing = await db.mediaCache.where('itemId').equals(itemId).first();
    const record = {
      ...media,
      itemId,
      cachedAt: Date.now(),
    };
    if (existing?.id !== undefined) {
      await db.mediaCache.put({ ...record, id: existing.id });
    } else {
      await db.mediaCache.add(record);
    }
  }

  static async getCachedItemMedia(itemId: number): Promise<ItemMedia | null> {
    const cutoff = Date.now() - this.CACHE_DURATIONS.mediaCache;
    
    const cached = await db.mediaCache
      .where('itemId')
      .equals(itemId)
      .and(media => media.cachedAt > cutoff)
      .first();

    if (!cached) return null;

    const { cachedAt, itemId: _, id, ...media } = cached;
    return media as ItemMedia;
  }

  // Chart Data Cache
  static async cacheChartData(
    itemId: number,
    realmId: number,
    timeframe: string,
    data: OHLCV[]
  ): Promise<void> {
    await db.chartDataCache.put({
      id: `${itemId}-${realmId}-${timeframe}`,
      itemId,
      realmId,
      timeframe,
      data,
      cachedAt: Date.now(),
    });
  }

  static async getCachedChartData(
    itemId: number,
    realmId: number,
    timeframe: string
  ): Promise<OHLCV[] | null> {
    const cutoff = Date.now() - this.CACHE_DURATIONS.chartDataCache;
    
    const cached = await db.chartDataCache
      .where('id')
      .equals(`${itemId}-${realmId}-${timeframe}`)
      .and(data => data.cachedAt > cutoff)
      .first();

    return cached ? cached.data : null;
  }

  // Cleanup methods
  static async cleanupExpiredData(): Promise<void> {
    const now = Date.now();
    
    // Clean up expired price history
    await db.priceHistory
      .where('timestamp')
      .below(now - this.CACHE_DURATIONS.priceHistory)
      .delete();

    // Clean up expired items cache
    await db.itemsCache
      .where('cachedAt')
      .below(now - this.CACHE_DURATIONS.itemsCache)
      .delete();

    // Clean up expired auctions cache
    await db.auctionsCache
      .where('cachedAt')
      .below(now - this.CACHE_DURATIONS.auctionsCache)
      .delete();

    // Clean up expired media cache
    await db.mediaCache
      .where('cachedAt')
      .below(now - this.CACHE_DURATIONS.mediaCache)
      .delete();

    // Clean up expired chart data cache
    await db.chartDataCache
      .where('cachedAt')
      .below(now - this.CACHE_DURATIONS.chartDataCache)
      .delete();
  }

  static async getCacheSize(): Promise<{
    priceHistory: number;
    itemsCache: number;
    auctionsCache: number;
    mediaCache: number;
    chartDataCache: number;
    total: number;
  }> {
    const [priceHistory, itemsCache, auctionsCache, mediaCache, chartDataCache] = await Promise.all([
      db.priceHistory.count(),
      db.itemsCache.count(),
      db.auctionsCache.count(),
      db.mediaCache.count(),
      db.chartDataCache.count(),
    ]);

    const total = priceHistory + itemsCache + auctionsCache + mediaCache + chartDataCache;

    return {
      priceHistory,
      itemsCache,
      auctionsCache,
      mediaCache,
      chartDataCache,
      total,
    };
  }

  static async clearAllCache(): Promise<void> {
    await Promise.all([
      db.priceHistory.clear(),
      db.itemsCache.clear(),
      db.auctionsCache.clear(),
      db.mediaCache.clear(),
      db.chartDataCache.clear(),
    ]);
  }
}

// Initialize cleanup on app start
if (typeof window !== 'undefined') {
  // Run cleanup every hour
  setInterval(() => {
    CacheManager.cleanupExpiredData().catch(console.error);
  }, 60 * 60 * 1000);
}
