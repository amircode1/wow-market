import type { Auction, PriceSnapshot } from '@/types';
import type { ItemPrices } from '@/hooks/useApi';

export function getAuctionUnitPrice(auction: { unit_price?: number; buyout?: number; quantity?: number }): number {
  if (typeof auction.unit_price === 'number' && auction.unit_price > 0) return auction.unit_price;
  if (typeof auction.buyout === 'number' && auction.buyout > 0) {
    return auction.buyout / Math.max(auction.quantity || 1, 1);
  }
  return 0;
}

export function makePriceSnapshot(itemId: number, realmId: number, prices: ItemPrices, timestamp = Date.now()): PriceSnapshot {
  return {
    itemId,
    realmId,
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
  };
}
