'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, Star, BarChart3, AlertCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuctionData, useItemDetails, useItemMedia, useItemPrices, usePriceHistory } from '@/hooks/useApi';
import { useMarketDataCollector } from '@/hooks/useMarketDataCollector';
import { aggregateToOHLCV } from '@/lib/price-calculator';
import { PriceChart } from '@/components/charts/PriceChart';
import { useRegionStore, useRealmStore } from '@/store';
import { useWatchlist } from '@/lib/storage';
import { formatGold, getQualityColor, cn } from '@/lib/utils';
import { GoldAmount } from '@/components/ui/GoldAmount';
import Link from 'next/link';
import Image from 'next/image';

interface ItemDetailClientProps {
  itemId: number;
}

function formatChartGold(price: number): string {
  return formatGold(Math.round(price));
}

export function ItemDetailClient({ itemId }: ItemDetailClientProps) {
  const { data: item, isLoading: itemLoading, error: itemError } = useItemDetails(itemId);
  const { data: media, isLoading: mediaLoading } = useItemMedia(itemId);
  const { data: prices, isLoading: priceLoading, error: priceError } = useItemPrices(itemId);
  const { selectedRegion } = useRegionStore();
  const { selectedRealmByRegion } = useRealmStore();
  const realmId = selectedRealmByRegion[selectedRegion] ?? 0;
  const auctionHouse = useAuctionData(realmId);
  useMarketDataCollector({
    realmId,
    auctions: auctionHouse.data?.auctions ?? [],
    enabled: Boolean(realmId),
  });
  const history = usePriceHistory(itemId, realmId, 500);
  const [timeframe, setTimeframe] = useState<'1h' | '6h' | '1d' | '1w' | '1m'>('1d');
  const chartData = useMemo(
    () => aggregateToOHLCV(history.data ?? [], timeframe),
    [history.data, timeframe]
  );
  const { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  const mediaIconUrl =
    media?.assets?.find((a) => a.key === 'icon')?.value ??
    media?.assets?.[0]?.value ??
    null;

  const handleWatchlistToggle = () => {
    if (isInWatchlist(itemId)) {
      removeFromWatchlist(itemId);
    } else {
      addToWatchlist(itemId, undefined, undefined, {
        name: item?.name,
        iconUrl: mediaIconUrl,
        quality: item?.quality?.name,
        itemClass: item?.item_class?.name,
      });
    }
  };

  const getQualityClass = (quality: string) => {
    const qualityMap: Record<string, string> = {
      'POOR': 'quality-poor',
      'COMMON': 'quality-common',
      'UNCOMMON': 'quality-uncommon',
      'RARE': 'quality-rare',
      'EPIC': 'quality-epic',
      'LEGENDARY': 'quality-legendary',
      'ARTIFACT': 'quality-artifact',
      'HEIRLOOM': 'quality-heirloom',
    };
    return qualityMap[quality] || 'quality-common';
  };

  if (itemLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-surface rounded w-32 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-surface rounded-lg"></div>
              <div className="h-32 bg-surface rounded-lg"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-surface rounded-lg"></div>
              <div className="h-32 bg-surface rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (itemError || !item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-4">Item Not Found</h1>
          <p className="text-text-secondary mb-8">
            The item you're looking for doesn't exist or couldn't be loaded.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link href="/items">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Items
              </Link>
            </Button>
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/items">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Items
          </Link>
        </Button>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Item Icon and Basic Info */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <Image
                src={mediaIconUrl || `https://render.worldofwarcraft.com/us/icons/256/${item.id}.jpg`}
                alt={item.name}
                width={128}
                height={128}
                className="rounded-lg"
                unoptimized
              />
              <Badge 
                className={cn("absolute -top-2 -right-2", getQualityClass(item.quality.name))}
              >
                {item.quality.name}
              </Badge>
            </div>
            <div className="flex-1">
              <h1 
                className="text-3xl font-bold mb-2" 
                style={{ color: getQualityColor(item.quality.name) }}
              >
                {item.name}
              </h1>
              <div className="space-y-2 text-text-secondary">
                <div>Level {item.level} • {item.item_class.name}</div>
                <div>Required Level: {item.required_level}</div>
                {item.max_count > 1 && (
                  <div>Stack Size: {item.max_count}</div>
                )}
                {item.is_equippable && (
                  <div>Equippable Item</div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleWatchlistToggle}
              variant={isInWatchlist(itemId) ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              <Star className={cn("h-4 w-4", isInWatchlist(itemId) && "fill-current")} />
              {isInWatchlist(itemId) ? 'In Watchlist' : 'Add to Watchlist'}
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Set Price Alert
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share Item
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Charts and Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Price History
                  </CardTitle>
                  <CardDescription>Live snapshots collected from the selected realm</CardDescription>
                </div>
                <div className="flex gap-1">
                  {(['1h', '6h', '1d', '1w', '1m'] as const).map((period) => (
                    <Button
                      key={period}
                      size="sm"
                      variant={timeframe === period ? 'default' : 'outline'}
                      className="h-8 px-2 text-xs"
                      onClick={() => setTimeframe(period)}
                    >
                      {period.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="min-h-64 rounded-lg bg-surface flex items-center justify-center">
                {history.isLoading ? (
                  <div className="h-64 w-full animate-pulse rounded-lg bg-surface-elevated" />
                ) : history.error ? (
                  <div className="text-center px-6 text-sm text-destructive">Price history could not be loaded.</div>
                ) : chartData.length >= 1 ? (
                  <PriceChart data={chartData} height={300} showVolume priceFormatter={formatChartGold} />
                ) : (
                  <div className="text-center px-6"><BarChart3 className="h-12 w-12 text-text-secondary mx-auto mb-2" /><p className="text-text-secondary">The collector is waiting for the first market snapshot.</p></div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Item Details */}
          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Basic Information</h4>
                  <div className="space-y-1 text-sm text-text-secondary">
                    <div>Item ID: {item.id}</div>
                    <div>Item Level: {item.level}</div>
                    <div>Required Level: {item.required_level}</div>
                    <div>Item Class: {item.item_class.name}</div>
                    <div>Item Subclass: {item.item_subclass.name}</div>
                    <div>Inventory Type: {item.inventory_type.name}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Properties</h4>
                  <div className="space-y-1 text-sm text-text-secondary">
                    <div>Quality: {item.quality.name}</div>
                    <div>Stackable: {item.is_stackable ? 'Yes' : 'No'}</div>
                    {item.max_count > 1 && (
                      <div>Max Stack: {item.max_count}</div>
                    )}
                    {item.purchase_price > 0 && (
                      <div>Vendor Price: {formatGold(item.purchase_price)}</div>
                    )}
                    {item.sell_price > 0 && (
                      <div>Sell Price: {formatGold(item.sell_price)}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Item Description */}
              {item.preview_item?.description && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-text-secondary italic">
                    {item.preview_item.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Price Info and Stats */}
        <div className="space-y-6">
          {/* Current Price */}
          <Card>
            <CardHeader>
              <CardTitle>Current Market Price</CardTitle>
              <CardDescription>
                Live auction house data for this item
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {priceLoading && (
                  <div className="text-center text-sm text-text-secondary">
                    Loading prices...
                  </div>
                )}
                {!priceLoading && (!prices || priceError) && (
                  <div className="text-sm text-text-secondary">
                    No auction listings found for this item in the selected realm.
                  </div>
                )}
                {!priceLoading && prices && (
                  <>
                    <div className="text-center">
                      <div className="text-3xl font-bold gold-text mb-2">
                        <GoldAmount copper={prices.marketPrice} />
                      </div>
                      <div className="text-sm text-text-secondary">
                        Market price (weighted by quantity) • {prices.source === 'commodities' ? 'Commodities' : 'Realm AH'}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Min Price:</span>
                        <span><GoldAmount copper={prices.minPrice} /></span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Max Price:</span>
                        <span><GoldAmount copper={prices.maxPrice} /></span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Average:</span>
                        <span><GoldAmount copper={prices.avgPrice} /></span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Median:</span>
                        <span><GoldAmount copper={prices.medianPrice} /></span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Market Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Market Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {priceLoading && (
                <div className="text-sm text-text-secondary">
                  Loading market statistics...
                </div>
              )}
              {!priceLoading && prices && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary">Total Listings:</span>
                    <span className="font-medium">{prices.totalListings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary">Total Quantity:</span>
                    <span className="font-medium">{prices.totalQuantity.toLocaleString()}</span>
                  </div>
                </div>
              )}
              {!priceLoading && !prices && (
                <div className="text-sm text-text-secondary">
                  No market statistics available for this item.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  View Recipe Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


