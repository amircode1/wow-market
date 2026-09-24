import { useQueries, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useRegionStore, useRealmStore } from '@/store';
import { useAuctionData } from '@/hooks/useApi';
import { useMarketDataCollector } from '@/hooks/useMarketDataCollector';
import { getAuctionUnitPrice } from '@/lib/market-data';
import { CacheManager } from '@/lib/database';
import { blizzardAPI } from '@/lib/blizzard-api';
import type { Item } from '@/types';

export interface DashboardStats { totalItems: number; totalAuctions: number; marketValue: number; activeSellers: number | null; }
export interface TopMover { id: number; name: string; price: number; change: number; volume?: number; icon?: string; }
export interface DashboardData { stats: DashboardStats | null; topGainers: TopMover[]; topLosers: TopMover[]; trending: TopMover[]; isLoading: boolean; error: string | null; }

export function useDashboardData(): DashboardData {
  const { selectedRegion } = useRegionStore();
  const { selectedRealmByRegion } = useRealmStore();
  const selectedRealmId = selectedRealmByRegion[selectedRegion];
  const auctionsQuery = useAuctionData(selectedRealmId || 0);
  const auctions = auctionsQuery.data?.auctions ?? [];
  const hasRealm = Boolean(selectedRealmId);
  useMarketDataCollector({ realmId: selectedRealmId, auctions, enabled: hasRealm });

  const stats = useMemo(() => {
    const itemIds = new Set(auctions.map((auction) => auction.item?.id).filter(Boolean));
    const marketValue = auctions.reduce(
      (sum, auction) => sum + getAuctionUnitPrice(auction) * Math.max(auction.quantity || 1, 1),
      0
    );
    return { totalItems: itemIds.size, totalAuctions: auctions.length, marketValue, activeSellers: null };
  }, [auctions]);

  const grouped = new Map<number, { prices: number[]; volume: number }>();
  for (const auction of auctions) {
    const id = auction.item?.id;
    const price = getAuctionUnitPrice(auction);
    if (!id || price <= 0) continue;
    const current = grouped.get(id) ?? { prices: [], volume: 0 };
    current.prices.push(price);
    current.volume += Math.max(auction.quantity || 1, 1);
    grouped.set(id, current);
  }

  const candidates = [...grouped.entries()]
    .map(([id, value]) => ({ id, price: Math.min(...value.prices), volume: value.volume }))
    .sort((a, b) => b.volume - a.volume).slice(0, 12);

  const moversQuery = useQuery({
    queryKey: ['market-movers', selectedRegion, selectedRealmId, auctionsQuery.data],
    queryFn: async () => {
      const snapshotsByItem = await CacheManager.getLatestSnapshotsByItem(selectedRealmId!);
      const movers = [...grouped.entries()].flatMap(([id, value]) => {
        const currentPrice = Math.min(...value.prices);
        const snapshots = snapshotsByItem.get(id) ?? [];
        const latest = snapshots[0];
        const previous = latest && Math.round(latest.minBuyout) === Math.round(currentPrice)
          ? snapshots[1]
          : latest;
        if (!previous || previous.minBuyout <= 0) return [];
        return [{
          id,
          price: currentPrice,
          volume: value.volume,
          change: ((currentPrice - previous.minBuyout) / previous.minBuyout) * 100,
        }];
      });
      return {
        gainers: movers.filter((item) => item.change > 0).sort((a, b) => b.change - a.change).slice(0, 5),
        losers: movers.filter((item) => item.change < 0).sort((a, b) => a.change - b.change).slice(0, 5),
      };
    },
    enabled: hasRealm && Boolean(auctionsQuery.data),
    staleTime: 60 * 1000,
  });

  const trendingCandidates = candidates.slice(0, 3);
  const moverCandidates = [...(moversQuery.data?.gainers ?? []), ...(moversQuery.data?.losers ?? [])];
  const itemCandidates = [...new Map([...trendingCandidates, ...moverCandidates].map((item) => [item.id, item])).values()];
  const itemQueries = useQueries({
    queries: itemCandidates.map((item) => ({
      queryKey: ['dashboard-item', selectedRegion, item.id],
      queryFn: async () => {
        const response = await fetch(`/api/blizzard/items/${item.id}?region=${selectedRegion}`);
        if (!response.ok) throw new Error('Failed to fetch item details');
        return response.json() as Promise<Item>;
      },
      staleTime: 24 * 60 * 60 * 1000,
      enabled: hasRealm,
    })),
  });
  const itemNames = new Map(itemCandidates.map((item, index) => [item.id, itemQueries[index]?.data?.name ?? `Item #${item.id}`]));
  const trending = trendingCandidates.map((item, index) => ({
    id: item.id,
    name: itemNames.get(item.id) ?? `Item #${item.id}`,
    price: item.price,
    change: 0,
    volume: item.volume,
    icon: blizzardAPI.getItemIconUrl(item.id),
  }));
  const topGainers = (moversQuery.data?.gainers ?? []).map((item) => ({
    ...item,
    name: itemNames.get(item.id) ?? `Item #${item.id}`,
    icon: blizzardAPI.getItemIconUrl(item.id),
  }));
  const topLosers = (moversQuery.data?.losers ?? []).map((item) => ({
    ...item,
    name: itemNames.get(item.id) ?? `Item #${item.id}`,
    icon: blizzardAPI.getItemIconUrl(item.id),
  }));

  return {
    stats: hasRealm && auctionsQuery.data ? stats : null,
    topGainers,
    topLosers,
    trending: hasRealm ? trending : [],
    isLoading: hasRealm && (auctionsQuery.isLoading || moversQuery.isLoading || itemQueries.some((query) => query.isLoading)),
    error: hasRealm ? ((auctionsQuery.error as Error | null)?.message ?? null) : null,
  };
}
