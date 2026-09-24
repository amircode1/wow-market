'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CacheManager } from '@/lib/database';
import { calculateItemPrices } from '@/hooks/useApi';
import type { Auction, PriceSnapshot } from '@/types';

interface MarketDataCollectorOptions {
  realmId: number | null | undefined;
  auctions: Auction[];
  enabled?: boolean;
}

interface MarketDataCollectorState {
  isCollecting: boolean;
  error: string | null;
  lastCollectedAt: number | null;
}

/** Persists each fetched auction response as reusable per-item market snapshots. */
export function useMarketDataCollector({
  realmId,
  auctions,
  enabled = true,
}: MarketDataCollectorOptions): MarketDataCollectorState {
  const queryClient = useQueryClient();
  const [state, setState] = useState<MarketDataCollectorState>({
    isCollecting: false,
    error: null,
    lastCollectedAt: null,
  });

  useEffect(() => {
    if (!enabled || !realmId || auctions.length === 0) return;

    let cancelled = false;
    const currentRealmId = realmId;
    const timestamp = Date.now();

    async function collect() {
      setState((current) => ({ ...current, isCollecting: true, error: null }));

      try {
        const grouped = new Map<number, Auction[]>();
        for (const auction of auctions) {
          const itemId = auction.item?.id;
          if (!itemId) continue;
          const itemAuctions = grouped.get(itemId) ?? [];
          itemAuctions.push(auction);
          grouped.set(itemId, itemAuctions);
        }

        const snapshots: PriceSnapshot[] = [];
        for (const [itemId, itemAuctions] of grouped) {
          const prices = calculateItemPrices(itemAuctions, 'realm');
          if (!prices) continue;
          snapshots.push({
            id: `${itemId}-${currentRealmId}-${timestamp}`,
            itemId,
            realmId: currentRealmId,
            timestamp,
            minBuyout: prices.minPrice,
            maxBuyout: prices.maxPrice,
            avgPrice: prices.avgPrice,
            medianPrice: prices.medianPrice,
            marketPrice: prices.marketPrice,
            totalListings: prices.totalListings,
            totalQuantity: prices.totalQuantity,
            uniqueSellers: 0,
            priceStdDev: 0,
            listings: [],
          });
        }

        await Promise.all([
          CacheManager.cacheAuctions(currentRealmId, auctions, timestamp).catch(() => undefined),
          CacheManager.savePriceSnapshots(snapshots),
        ]);

        if (cancelled) return;
        setState({ isCollecting: false, error: null, lastCollectedAt: timestamp });
        await queryClient.invalidateQueries({ queryKey: ['priceHistory'] });
        await queryClient.invalidateQueries({ queryKey: ['market-movers'] });
      } catch (error) {
        if (cancelled) return;
        setState({
          isCollecting: false,
          error: error instanceof Error ? error.message : 'Failed to collect market data',
          lastCollectedAt: null,
        });
      }
    }

    collect();
    return () => {
      cancelled = true;
    };
  }, [auctions, enabled, queryClient, realmId]);

  return state;
}