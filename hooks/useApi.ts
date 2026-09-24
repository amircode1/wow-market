import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { blizzardAPI } from '@/lib/blizzard-api';
import { CacheManager } from '@/lib/database';
import { useRegionStore, useRealmStore } from '@/store';
import { getAuctionUnitPrice, makePriceSnapshot } from '@/lib/market-data';
import type { 
  ConnectedRealm, 
  AuctionHouse, 
  Item, 
  ItemMedia, 
  Recipe,
  SearchResponse,
  PriceSnapshot,
  Auction,
  WowTokenPrice
} from '@/types';

export type ItemSearchResultItem = Item & { iconUrl?: string | null };

export interface ItemPrices {
  /** Lowest unit price among the currently active listings. */
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  medianPrice: number;
  /** Current display price: the cheapest active listing. */
  marketPrice: number;
  totalListings: number;
  totalQuantity: number;
  source: 'commodities' | 'realm';
}

type PriceAuction = {
  quantity?: number;
  unit_price?: number;
  buyout?: number;
};

/**
 * Calculate prices from the current active auction response.
 *
 * Realm AH buyouts are the price of the complete stack, while commodities
 * expose a per-item unit_price. Keeping this conversion here makes minPrice
 * the current lowest live unit listing for both auction sources.
 */
export function calculateItemPrices(
  auctions: PriceAuction[],
  source: 'commodities' | 'realm'
): ItemPrices | null {
  const prices = auctions
    .map((auction) => {
      const quantity = auction.quantity && auction.quantity > 0 ? auction.quantity : 1;
      const price = source === 'commodities'
        ? auction.unit_price
        : getAuctionUnitPrice(auction);

      return { price, quantity };
    })
    .filter((entry): entry is { price: number; quantity: number } =>
      typeof entry.price === 'number' && Number.isFinite(entry.price) && entry.price > 0
    );

  if (prices.length === 0) return null;

  const sortedPrices = prices.map(({ price }) => price).sort((a, b) => a - b);
  const minPrice = sortedPrices[0];
  const maxPrice = sortedPrices[sortedPrices.length - 1];
  const medianPrice = sortedPrices[Math.floor(sortedPrices.length / 2)];
  const totalQuantity = prices.reduce((sum, entry) => sum + entry.quantity, 0);
  const totalValue = prices.reduce((sum, entry) => sum + entry.price * entry.quantity, 0);
  const avgPrice = totalQuantity > 0 ? totalValue / totalQuantity : minPrice;

  return {
    minPrice,
    maxPrice,
    avgPrice,
    medianPrice,
    marketPrice: minPrice,
    totalListings: prices.length,
    totalQuantity,
    source,
  };
}

// Query Keys
export const queryKeys = {
  realms: ['realms'] as const,
  realmDetails: (id: number) => ['realms', id] as const,
  auctions: (realmId: number) => ['auctions', realmId] as const,
  commodities: ['commodities'] as const,
  itemDetails: (id: number) => ['items', id] as const,
  itemMedia: (id: number) => ['items', id, 'media'] as const,
  itemSearch: (query: string, page: number) => ['items', 'search', query, page] as const,
  recipe: (id: number) => ['recipes', id] as const,
  priceHistory: (itemId: number, realmId: number) => ['priceHistory', itemId, realmId] as const,
  itemPrices: (itemId: number, realmId: number) => ['itemPrices', itemId, realmId] as const,
};

// Realms
export function useRealms() {
  const { selectedRegion, isHydrated } = useRegionStore();
  return useQuery({
    queryKey: [...queryKeys.realms, selectedRegion],
    queryFn: async () => {
      const response = await fetch(`/api/blizzard/realms?region=${selectedRegion}`);
      if (!response.ok) throw new Error('Failed to fetch realms');
      return response.json() as Promise<ConnectedRealm[]>;
    },
    enabled: isHydrated,
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    refetchOnWindowFocus: false,
  });
}

export function useRealmDetails(realmId: number) {
  const { selectedRegion, isHydrated } = useRegionStore();
  return useQuery({
    queryKey: [...queryKeys.realmDetails(realmId), selectedRegion],
    queryFn: async () => {
      const response = await fetch(`/api/blizzard/realms/${realmId}?region=${selectedRegion}`);
      if (!response.ok) throw new Error('Failed to fetch realm details');
      return response.json() as Promise<ConnectedRealm>;
    },
    enabled: isHydrated && !!realmId,
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// Auctions
export function useAuctionData(realmId: number) {
  const { selectedRegion, isHydrated } = useRegionStore();
  return useQuery({
    queryKey: [...queryKeys.auctions(realmId), selectedRegion],
    queryFn: async () => {
      const response = await fetch(`/api/blizzard/auctions/${realmId}?region=${selectedRegion}`);
      if (!response.ok) throw new Error('Failed to fetch auctions');
      return response.json() as Promise<AuctionHouse>;
    },
    enabled: isHydrated && !!realmId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
    refetchOnWindowFocus: true,
  });
}

export function useCommoditiesData() {
  const { selectedRegion, isHydrated } = useRegionStore();
  return useQuery({
    queryKey: [...queryKeys.commodities, selectedRegion],
    queryFn: async () => {
      const response = await fetch(`/api/blizzard/commodities?region=${selectedRegion}`);
      if (!response.ok) throw new Error('Failed to fetch commodities');
      return response.json() as Promise<{ auctions: Array<{ item: { id: number }; quantity: number; unit_price: number }> }>;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    enabled: isHydrated,
    refetchOnWindowFocus: true,
  });
}

export function useWowTokenPrice() {
  const { selectedRegion, isHydrated } = useRegionStore();
  return useQuery({
    queryKey: ['wow-token', selectedRegion],
    queryFn: async () => {
      const response = await fetch(`/api/blizzard/token?region=${selectedRegion}`);
      if (!response.ok) throw new Error('Failed to fetch WoW Token price');
      return response.json() as Promise<WowTokenPrice>;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    enabled: isHydrated,
    refetchOnWindowFocus: true,
  });
}

// Items
export function useItemDetails(itemId: number) {
  const { selectedRegion, isHydrated } = useRegionStore();
  return useQuery({
    queryKey: [...queryKeys.itemDetails(itemId), selectedRegion],
    queryFn: async () => {
      const response = await fetch(`/api/blizzard/items/${itemId}?region=${selectedRegion}`);
      if (!response.ok) throw new Error('Failed to fetch item details');
      const item = await response.json() as Item;
      await CacheManager.cacheItem(item).catch(() => undefined);
      return item;
    },
    enabled: isHydrated && !!itemId,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

export function useItemMedia(itemId: number) {
  const { selectedRegion, isHydrated } = useRegionStore();
  return useQuery({
    queryKey: [...queryKeys.itemMedia(itemId), selectedRegion],
    queryFn: async () => {
      const response = await fetch(`/api/blizzard/items/${itemId}/media?region=${selectedRegion}`);
      if (!response.ok) throw new Error('Failed to fetch item media');
      const media = await response.json() as ItemMedia;
      await CacheManager.cacheItemMedia(itemId, media).catch(() => undefined);
      return media;
    },
    enabled: isHydrated && !!itemId,
    staleTime: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
}

export function useItemSearch(query: string, page: number = 1) {
  const { selectedRegion, isHydrated } = useRegionStore();
  return useQuery({
    queryKey: [...queryKeys.itemSearch(query, page), selectedRegion],
    queryFn: async () => {
      const response = await fetch(`/api/blizzard/items/search?q=${encodeURIComponent(query)}&page=${page}&region=${selectedRegion}`);
      if (!response.ok) throw new Error('Failed to search items');
      return response.json() as Promise<SearchResponse<ItemSearchResultItem>>;
    },
    enabled: isHydrated && !!query && query.length >= 2,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useInfiniteItemSearch(query: string) {
  const { selectedRegion, isHydrated } = useRegionStore();
  return useInfiniteQuery({
    queryKey: [...queryKeys.itemSearch(query, 1), 'infinite', selectedRegion],
    queryFn: async ({ pageParam }) => {
      const response = await fetch(`/api/blizzard/items/search?q=${encodeURIComponent(query)}&page=${pageParam}&region=${selectedRegion}`);
      if (!response.ok) throw new Error('Failed to search items');
      return response.json() as Promise<SearchResponse<ItemSearchResultItem>>;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.pageCount ? lastPage.page + 1 : undefined,
    enabled: isHydrated && !!query && query.length >= 2,
    staleTime: 60 * 60 * 1000,
  });
}

// Recipes
export function useRecipe(recipeId: number) {
  const { selectedRegion, isHydrated } = useRegionStore();
  return useQuery({
    queryKey: [...queryKeys.recipe(recipeId), selectedRegion],
    queryFn: async () => {
      // BUG FIX: region param was missing so recipes always came from 'us'.
      const response = await fetch(`/api/blizzard/recipes/${recipeId}?region=${selectedRegion}`);
      if (!response.ok) throw new Error('Failed to fetch recipe');
      return response.json() as Promise<Recipe>;
    },
    enabled: isHydrated && !!recipeId,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

// Price History
export function usePriceHistory(itemId: number, realmId: number, limit?: number) {
  return useQuery({
    queryKey: queryKeys.priceHistory(itemId, realmId),
    queryFn: async () => {
      try {
        return await CacheManager.getPriceHistory(itemId, realmId, limit);
      } catch {
        return [];
      }
    },
    enabled: !!itemId && !!realmId,
    staleTime: 60 * 1000, // 1 minute
  });
}

// Item Prices from Auction House (uses cached auction data)
export function useItemPrices(itemId: number) {
  const { selectedRegion } = useRegionStore();
  const { selectedRealmByRegion } = useRealmStore();
  const selectedRealmId = selectedRealmByRegion[selectedRegion] ?? null;
  
  // First get the auction house data
  const {
    data: auctionHouse,
    isLoading: auctionsLoading,
    error: auctionsError,
  } = useAuctionData(selectedRealmId || 0);
  const {
    data: commodities,
    isLoading: commoditiesLoading,
    error: commoditiesError,
  } = useCommoditiesData();

  // Derive prices directly from the latest auction query data. A nested
  // useQuery here used to keep a separate 5-minute cache, so a refreshed
  // auction response could leave Min Price showing an older listing.
  const prices = useMemo(() => {
    const realmAuctions = selectedRealmId && auctionHouse
      ? auctionHouse.auctions.filter((auction) => auction.item.id === itemId)
      : [];
    const commodityAuctions = commodities?.auctions
      ? commodities.auctions.filter((auction) => auction.item.id === itemId)
      : [];

    // Prefer commodities when available (trade goods are region-wide).
    if (commodityAuctions.length > 0) {
      return calculateItemPrices(commodityAuctions, 'commodities');
    }
    if (realmAuctions.length > 0) {
      return calculateItemPrices(realmAuctions, 'realm');
    }
    return null;
  }, [auctionHouse, commodities, itemId, selectedRealmId]);    return {
    data: prices,
    isLoading: auctionsLoading || commoditiesLoading,
    error: auctionsError || commoditiesError || null,
  };
}

// Mutations
export function useSavePriceSnapshot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (snapshot: PriceSnapshot) => {
      await CacheManager.savePriceSnapshot(snapshot);
    },
    onSuccess: (_, snapshot) => {
      // Invalidate price history queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.priceHistory(snapshot.itemId, snapshot.realmId),
      });
    },
  });
}

export function useCacheAuctions() {
  return useMutation({
    mutationFn: async ({ realmId, auctions, timestamp }: {
      realmId: number;
      auctions: any[];
      timestamp: number;
    }) => {
      await CacheManager.cacheAuctions(realmId, auctions, timestamp);
    },
  });
}

// Utility hooks
export function useItemIcon(itemId: number) {
  return blizzardAPI.getItemIconUrl(itemId);
}

export function useItemIconHighRes(itemId: number) {
  return blizzardAPI.getItemIconUrlHighRes(itemId);
}

// Prefetch utilities
export function usePrefetchItemDetails() {
  const queryClient = useQueryClient();
  const { selectedRegion } = useRegionStore();
  
  return (itemId: number) => {
    queryClient.prefetchQuery({
      // BUG FIX: prefetch keys were missing the selectedRegion suffix used by
      // the main hooks, so prefetched data was never matched/reused.
      queryKey: [...queryKeys.itemDetails(itemId), selectedRegion],
      queryFn: async () => {
        const cached = await CacheManager.getCachedItem(itemId);
        if (cached) return cached;
        
        const response = await fetch(`/api/blizzard/items/${itemId}?region=${selectedRegion}`);
        if (!response.ok) throw new Error('Failed to fetch item details');
        const item = await response.json() as Item;
        
        await CacheManager.cacheItem(item);
        return item;
      },
      staleTime: 24 * 60 * 60 * 1000,
    });
  };
}

export function usePrefetchItemMedia() {
  const queryClient = useQueryClient();
  const { selectedRegion } = useRegionStore();
  
  return (itemId: number) => {
    queryClient.prefetchQuery({
      // BUG FIX: include selectedRegion in the key to match useItemMedia.
      queryKey: [...queryKeys.itemMedia(itemId), selectedRegion],
      queryFn: async () => {
        const cached = await CacheManager.getCachedItemMedia(itemId);
        if (cached) return cached;
        
        const response = await fetch(`/api/blizzard/items/${itemId}/media?region=${selectedRegion}`);
        if (!response.ok) throw new Error('Failed to fetch item media');
        const media = await response.json() as ItemMedia;
        
        await CacheManager.cacheItemMedia(itemId, media);
        return media;
      },
      staleTime: 30 * 24 * 60 * 60 * 1000,
    });
  };
}
