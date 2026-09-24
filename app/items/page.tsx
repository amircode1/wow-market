'use client';

import * as React from 'react';
import { Search, Filter, Star, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { DashboardCenter } from '@/components/layout/DashboardCenter';
import { Suspense } from 'react';
import { useInfiniteItemSearch, useItemPrices, useAuctionData, useCommoditiesData } from '@/hooks/useApi';
import { useWatchlist } from '@/lib/storage';
import { useRealmStore, useRegionStore } from '@/store';
import { cn, formatGold, getQualityColor } from '@/lib/utils';
import { GoldAmount } from '@/components/ui/GoldAmount';

type QualityFilter = 'ALL' | 'POOR' | 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

const QUALITY_OPTIONS: QualityFilter[] = ['ALL', 'POOR', 'COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'];

export default function ItemsPage() {
  return (
    <Suspense fallback={<DashboardLoadingState />}>
      <ItemsPageContent />
    </Suspense>
  );
}

function ItemsPageContent() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  const [quality, setQuality] = React.useState<QualityFilter>('ALL');
  const [selectedItemId, setSelectedItemId] = React.useState<number | null>(null);
  const { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const searchParams = useSearchParams();
  const { selectedRegion } = useRegionStore();
  const { selectedRealmByRegion } = useRealmStore();
  const selectedRealmId = selectedRealmByRegion[selectedRegion] ?? null;
  const {
    data: searchPages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useInfiniteItemSearch(debouncedQuery);
  const { data: auctionHouse } = useAuctionData(selectedRealmId || 0);
  const { data: commodities } = useCommoditiesData();

  React.useEffect(() => {
    const initial = (searchParams.get('search') || '').trim();
    if (initial) {
      setSearchQuery(initial);
      setDebouncedQuery(initial);
    }
  }, [searchParams]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.endsWith(' ')) return;
      setDebouncedQuery(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedQuery(searchQuery.trim());
  };

  const handleWatchlistToggle = (itemId: number) => {
    if (isInWatchlist(itemId)) {
      removeFromWatchlist(itemId);
    } else {
      const item = filteredResults.find((result) => result.id === itemId);
      addToWatchlist(itemId, undefined, undefined, item ? {
        name: item.name,
        iconUrl: item.iconUrl,
        quality: item.quality?.name,
        itemClass: item.item_class?.name,
      } : undefined);
    }
  };

  const filteredResults = React.useMemo(() => {
    const allResults = searchPages?.pages.flatMap((page) => page.results) ?? [];
    const uniqueResults = [...new Map(allResults.map((item) => [item.id, item])).values()];
    if (!uniqueResults.length) return [];
    const qualityResults = quality === 'ALL'
      ? uniqueResults
      : uniqueResults.filter((item) => item.quality?.name === quality);
    const listedItemIds = new Set([
      ...(auctionHouse?.auctions ?? []).map((auction) => auction.item.id),
      ...(commodities?.auctions ?? []).map((auction) => auction.item.id),
    ]);

    return [...qualityResults].sort((a, b) => {
      const aListed = listedItemIds.has(a.id) ? 1 : 0;
      const bListed = listedItemIds.has(b.id) ? 1 : 0;
      return bListed - aListed;
    });
  }, [auctionHouse?.auctions, commodities?.auctions, searchPages?.pages, quality]);

  const searchPageCount = searchPages?.pages[0]?.pageCount ?? 0;

  const loadMoreRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: '480px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const selectedItem = filteredResults.find((item) => item.id === selectedItemId) ?? filteredResults[0] ?? null;
  const selectedItemPrices = useItemPrices(selectedItem?.id ?? 0);

  return (
    <DashboardLayout
      header={
        <DashboardHeader
          title="Item Browser"
          description="Search, filter, and inspect auction house items"
          actions={
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                <Input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 h-9"
                />
              </div>
            </form>
          }
        />
      }
      sidebar={
        <div className="space-y-4">
          <div className="px-4 py-3 border-b">
            <h3 className="font-semibold text-sm">Filters</h3>
          </div>
          <div className="px-4 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-4 w-4 text-text-secondary" />
                <span className="text-xs font-medium text-text-secondary">Quality</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {QUALITY_OPTIONS.map((option) => (
                  <Button
                    key={option}
                    size="sm"
                    variant={quality === option ? 'default' : 'outline'}
                    onClick={() => setQuality(option)}
                    className="text-xs"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-surface p-3 text-xs text-text-secondary">
              {!selectedRealmId ? (
                <>
                  <div className="font-medium text-warning mb-1">Realm required</div>
                  Select a realm from the header to view live prices.
                </>
              ) : (
                <>
                  <div className="font-medium text-success mb-1">Connected</div>
                  Viewing prices for the selected realm.
                </>
              )}
            </div>
          </div>
        </div>
      }
      panelOpen={!!selectedItem}
      panel={
        selectedItem ? (
          <div className="space-y-4">
            <div className="p-4 border-b">
              <div className="flex items-start gap-3">
                <Image
                  src={selectedItem.iconUrl || `https://render.worldofwarcraft.com/us/icons/56/${selectedItem.id}.jpg`}
                  alt={selectedItem.name || 'Item'}
                  width={48}
                  height={48}
                  className="rounded"
                  unoptimized
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold line-clamp-2" style={{ color: getQualityColor(selectedItem.quality?.name || 'COMMON') }}>
                    {selectedItem.name || 'Unknown Item'}
                  </h2>
                  <p className="text-xs text-text-secondary">
                    Level {selectedItem.level ?? 'N/A'} • {selectedItem.item_class?.name || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
            <Card className="mx-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Market Price</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedItemPrices.isLoading ? (
                  <div className="text-sm text-text-secondary">Loading prices...</div>
                ) : selectedItemPrices.data ? (
                  <>
                    <div className="text-3xl font-bold gold-text">
                      <GoldAmount copper={selectedItemPrices.data.marketPrice} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-surface rounded">
                        <div className="text-text-secondary">Min</div>
                        <div className="font-semibold"><GoldAmount copper={selectedItemPrices.data.minPrice} /></div>
                      </div>
                      <div className="p-2 bg-surface rounded">
                        <div className="text-text-secondary">Avg</div>
                        <div className="font-semibold"><GoldAmount copper={selectedItemPrices.data.avgPrice} /></div>
                      </div>
                      <div className="p-2 bg-surface rounded">
                        <div className="text-text-secondary">Listings</div>
                        <div className="font-semibold">{selectedItemPrices.data.totalListings}</div>
                      </div>
                      <div className="p-2 bg-surface rounded">
                        <div className="text-text-secondary">Qty</div>
                        <div className="font-semibold">{selectedItemPrices.data.totalQuantity.toLocaleString()}</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-text-secondary">No live price data available.</div>
                )}
              </CardContent>
            </Card>
            <div className="space-y-2 px-4">
              <Button className="w-full" asChild>
                <Link href={`/items/${selectedItem.id}`}>View Details</Link>
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => selectedItem && handleWatchlistToggle(selectedItem.id)}
              >
                <Star className="h-4 w-4 mr-2" />
                {selectedItem && isInWatchlist(selectedItem.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
              </Button>
            </div>
          </div>
        ) : undefined
      }
    >
      <DashboardCenter>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              {filteredResults.length > 0
                ? `Showing ${filteredResults.length} items`
                : debouncedQuery
                  ? 'No matching items'
                  : 'Enter a search query to begin'}
            </div>
            {searchPages && (
              <div className="text-sm text-text-secondary">
                {filteredResults.length} results{searchPageCount > 1 ? ` • ${searchPages.pages.length} pages loaded` : ''}
              </div>
            )}
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="h-12 bg-surface rounded animate-pulse mb-4" />
                    <div className="h-4 bg-surface rounded animate-pulse w-3/4 mb-2" />
                    <div className="h-3 bg-surface rounded animate-pulse w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {error && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-destructive mb-2">Could not load item results.</div>
                <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && filteredResults.length > 0 ? (
            <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
              {filteredResults.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'group flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-surface',
                    selectedItem?.id === item.id && 'bg-primary/5'
                  )}
                  onClick={() => setSelectedItemId(item.id)}
                >
                  <Image src={item.iconUrl || `https://render.worldofwarcraft.com/us/icons/56/${item.id}.jpg`} alt="" width={40} height={40} className="rounded" unoptimized />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium" style={{ color: getQualityColor(item.quality?.name || 'COMMON') }}>{item.name || 'Unknown Item'}</div>
                    <div className="truncate text-xs text-text-secondary">{item.item_class?.name || 'Unknown'} • {item.item_subclass?.name || 'Unknown'} • Stack {item.max_count || 1}</div>
                  </div>
                  <div className="hidden shrink-0 sm:block"><ItemMiniPrice itemId={item.id} /></div>
                  <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); handleWatchlistToggle(item.id); }} className={cn('shrink-0', isInWatchlist(item.id) && 'text-warning')}>
                    <Star className={cn('h-4 w-4', isInWatchlist(item.id) && 'fill-current')} />
                  </Button>
                  <Button variant="ghost" size="sm" asChild><Link href={`/items/${item.id}`}>Details</Link></Button>
                </div>
              ))}
            </div>
          ) : (
            !isLoading && !error && (
              <Card>
                <CardContent className="pt-10 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">
                    {debouncedQuery ? 'No Items Found' : 'Start Searching'}
                  </h3>
                  <p className="text-text-secondary mb-6">
                    {debouncedQuery
                      ? 'Try another item name or remove a filter.'
                      : 'Search for an item to see market results and details.'}
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button variant="outline" onClick={() => setQuality('ALL')}>
                      Reset Filters
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/watchlist">View Watchlist</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          )}

          {searchPages && <div ref={loadMoreRef} className="flex min-h-12 items-center justify-center text-sm text-text-secondary">
            {isFetchingNextPage ? 'Loading more items...' : hasNextPage ? 'Scroll to load more' : 'End of results'}
          </div>}
        </div>
      </DashboardCenter>
    </DashboardLayout>
  );
}

function DashboardLoadingState() {
  return (
    <div className="p-8">
      <div className="h-8 bg-surface rounded animate-pulse w-64 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-40 bg-surface rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function ItemMiniPrice({ itemId }: { itemId: number }) {
  const { data, isLoading } = useItemPrices(itemId);

  if (isLoading) {
    return <span className="text-xs text-text-secondary">Loading...</span>;
  }

  if (!data) {
    return <span className="text-xs text-text-secondary">No listings</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium"><GoldAmount copper={data.marketPrice} /></span>
      <span className="text-xs text-text-secondary">{data.totalListings.toLocaleString()} listings</span>
    </div>
  );
}
