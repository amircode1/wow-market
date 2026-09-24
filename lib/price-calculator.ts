import type { Auction, PriceSnapshot, OHLCV } from '@/types';

export interface PriceStats {
  minBuyout: number;
  maxBuyout: number;
  avgPrice: number;
  medianPrice: number;
  marketPrice: number; // weighted by quantity
  totalListings: number;
  totalQuantity: number;
  uniqueSellers: number;
  priceStdDev: number;
  priceRange: number;
}

export function calculatePriceStats(auctions: Auction[]): PriceStats | null {
  const validAuctions = auctions.filter(a => a.buyout && a.buyout > 0);
  
  if (validAuctions.length === 0) {
    return null;
  }
  
  const prices = validAuctions.map(a => a.buyout!);
  const sorted = [...prices].sort((a, b) => a - b);
  
  const totalQuantity = validAuctions.reduce((sum, a) => sum + a.quantity, 0);
  const weightedSum = validAuctions.reduce((sum, a) => sum + (a.buyout! * a.quantity), 0);
  
  // Calculate standard deviation
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
  const stdDev = Math.sqrt(variance);
  
  // Count unique sellers (simplified - in real implementation you'd track seller IDs)
  const uniqueSellers = new Set(validAuctions.map(a => a.id)).size;
  
  return {
    minBuyout: sorted[0],
    maxBuyout: sorted[sorted.length - 1],
    avgPrice: mean,
    medianPrice: sorted[Math.floor(sorted.length / 2)],
    marketPrice: totalQuantity > 0 ? weightedSum / totalQuantity : 0,
    totalListings: validAuctions.length,
    totalQuantity,
    uniqueSellers,
    priceStdDev: stdDev,
    priceRange: sorted[sorted.length - 1] - sorted[0],
  };
}

export function aggregateToOHLCV(
  snapshots: PriceSnapshot[],
  interval: '1h' | '6h' | '12h' | '1d' | '3d' | '1w' | '2w' | '1m' | '3m' | '6m' | '1y'
): OHLCV[] {
  if (snapshots.length === 0) return [];
  
  const intervalMs = getIntervalMs(interval);
  const grouped = new Map<number, PriceSnapshot[]>();
  
  // Group snapshots by time interval
  snapshots.forEach(snapshot => {
    const timeKey = Math.floor(snapshot.timestamp / intervalMs) * intervalMs;
    if (!grouped.has(timeKey)) {
      grouped.set(timeKey, []);
    }
    grouped.get(timeKey)!.push(snapshot);
  });
  
  // Convert groups to OHLCV data
  const ohlcvData: OHLCV[] = [];
  
  grouped.forEach((groupSnapshots, timeKey) => {
    if (groupSnapshots.length === 0) return;
    
    const prices = groupSnapshots.map(s => s.minBuyout).filter(p => p > 0);
    if (prices.length === 0) return;
    
    const volumes = groupSnapshots.map(s => s.totalQuantity);
    const totalVolume = volumes.reduce((a, b) => a + b, 0);
    
    ohlcvData.push({
      time: timeKey,
      open: prices[0],
      high: Math.max(...prices),
      low: Math.min(...prices),
      close: prices[prices.length - 1],
      volume: totalVolume,
    });
  });
  
  return ohlcvData.sort((a, b) => a.time - b.time);
}

function getIntervalMs(interval: string): number {
  const intervals: Record<string, number> = {
    '1h': 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '12h': 12 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
    '3d': 3 * 24 * 60 * 60 * 1000,
    '1w': 7 * 24 * 60 * 60 * 1000,
    '2w': 14 * 24 * 60 * 60 * 1000,
    '1m': 30 * 24 * 60 * 60 * 1000,
    '3m': 90 * 24 * 60 * 60 * 1000,
    '6m': 180 * 24 * 60 * 60 * 1000,
    '1y': 365 * 24 * 60 * 60 * 1000,
  };
  return intervals[interval] || intervals['1d'];
}

export function calculatePriceChange(current: number, previous: number): {
  absolute: number;
  percentage: number;
} {
  if (previous === 0) {
    return { absolute: 0, percentage: 0 };
  }
  
  const absolute = current - previous;
  const percentage = (absolute / previous) * 100;
  
  return { absolute, percentage };
}

export function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;
  
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] > 0) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
  }
  
  if (returns.length === 0) return 0;
  
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
  
  return Math.sqrt(variance) * 100; // Return as percentage
}

export function detectTrend(prices: number[], period: number = 7): 'up' | 'down' | 'sideways' {
  if (prices.length < period) return 'sideways';
  
  const recent = prices.slice(-period);
  const first = recent[0];
  const last = recent[recent.length - 1];
  const change = (last - first) / first;
  
  if (change > 0.05) return 'up';
  if (change < -0.05) return 'down';
  return 'sideways';
}

export function calculateMovingAverage(prices: number[], period: number): number[] {
  const result: number[] = [];
  
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / period);
  }
  
  return result;
}

export function calculateEMA(prices: number[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);
  
  if (prices.length === 0) return result;
  
  result.push(prices[0]); // First value is the same
  
  for (let i = 1; i < prices.length; i++) {
    const ema = (prices[i] * multiplier) + (result[i - 1] * (1 - multiplier));
    result.push(ema);
  }
  
  return result;
}
