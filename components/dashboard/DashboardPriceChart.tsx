'use client';

import { useEffect, useMemo, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { useWowTokenPrice } from '@/hooks/useApi';
import { aggregateToOHLCV } from '@/lib/price-calculator';
import { PriceChart } from '@/components/charts/PriceChart';
import { formatGold } from '@/lib/utils';
import { useRegionStore } from '@/store';
import { GoldAmount } from '@/components/ui/GoldAmount';

interface TokenObservation {
  timestamp: number;
  price: number;
}

function getTokenCandleInterval(timeframe: string): '1h' | '6h' | '1d' {
  if (timeframe === '1M') return '1d';
  if (timeframe === '1W') return '6h';
  return '1h';
}

export function DashboardPriceChart({ itemId, realmId, timeframe }: { itemId: number; realmId: number; timeframe: string }) {
  const token = useWowTokenPrice();
  const { selectedRegion } = useRegionStore();
  const [observations, setObservations] = useState<TokenObservation[]>([]);

  useEffect(() => {
    const storageKey = `wow-token-history-${selectedRegion}`;
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || '[]') as TokenObservation[];
      setObservations(Array.isArray(stored) ? stored : []);
    } catch {
      setObservations([]);
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (!token.data) return;
    const storageKey = `wow-token-history-${selectedRegion}`;
    let stored: TokenObservation[] = [];
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || '[]');
      stored = Array.isArray(parsed) ? parsed : [];
    } catch {
      stored = [];
    }
    const next = [...stored, { timestamp: Date.now(), price: token.data.price }].slice(-120);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Recover from a full/corrupted localStorage without breaking the chart.
      try {
        localStorage.removeItem(storageKey);
        localStorage.setItem(storageKey, JSON.stringify(next.slice(-30)));
      } catch {
        // The in-memory state is still enough to render the latest candle.
      }
    }
    setObservations(next);
  }, [selectedRegion, token.data]);

  const chartData = useMemo(() => aggregateToOHLCV(
    observations.map((observation) => ({
      itemId: 0,
      realmId: 0,
      timestamp: observation.timestamp,
      minBuyout: observation.price,
      maxBuyout: observation.price,
      avgPrice: observation.price,
      medianPrice: observation.price,
      marketPrice: observation.price,
      totalListings: 1,
      totalQuantity: 1,
      uniqueSellers: 0,
      priceStdDev: 0,
      listings: [],
    })),
    getTokenCandleInterval(timeframe)
  ), [observations, timeframe]);

  if (token.isLoading) return <div className="h-64 animate-pulse rounded-lg bg-surface" />;
  if (token.error || !token.data) return <EmptyChart message="WoW Token price could not be loaded." />;
  const formatChartGold = (price: number) => formatGold(Math.round(price));
  return <div>
    <div className="mb-3 text-center text-lg font-semibold"><GoldAmount copper={token.data.price} /></div>
    <PriceChart data={chartData} height={220} showVolume={false} timeframe={timeframe} priceFormatter={formatChartGold} />
  </div>;
}

function EmptyChart({ message }: { message: string }) {
  return <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface/50 px-6 text-center"><BarChart3 className="mb-3 h-8 w-8 text-text-tertiary" /><p className="font-medium">No historical market data</p><p className="mt-1 text-sm text-text-secondary">{message}</p></div>;
}
