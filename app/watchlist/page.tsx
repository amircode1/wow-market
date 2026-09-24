'use client';

import * as React from 'react';
import { Star, Trash2, ArrowUpDown, Search, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { DashboardCenter } from '@/components/layout/DashboardCenter';
import { useWatchlist, usePriceAlerts } from '@/lib/storage';
import { useItemDetails, useItemMedia, useItemPrices } from '@/hooks/useApi';
import { blizzardAPI } from '@/lib/blizzard-api';
import { useRealmStore, useRegionStore } from '@/store';
import { cn, getQualityColor } from '@/lib/utils';
import { GoldAmount } from '@/components/ui/GoldAmount';

type SortKey = 'name' | 'price' | 'change' | 'addedAt';
type SortDirection = 'asc' | 'desc';

export default function WatchlistPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortKey, setSortKey] = React.useState<SortKey>('addedAt');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc');
  const [selectedItemId, setSelectedItemId] = React.useState<number | null>(null);
  const { watchlist, removeFromWatchlist, clearWatchlist } = useWatchlist();
  const { selectedRegion } = useRegionStore();
  const { selectedRealmByRegion } = useRealmStore();
  const selectedRealmId = selectedRealmByRegion[selectedRegion] ?? null;

  // Caches populated by WatchlistRow renders so the parent can sort by
  // name/price even though details load asynchronously in child components.
  const [nameCache, setNameCache] = React.useState<Record<number, string>>({});
  const [priceCache, setPriceCache] = React.useState<Record<number, number>>({});

  const handleNameLoaded = React.useCallback((itemId: number, name: string) => {
    setNameCache((prev) => (prev[itemId] === name ? prev : { ...prev, [itemId]: name }));
  }, []);

  const handlePriceLoaded = React.useCallback((itemId: number, marketPrice: number) => {
    setPriceCache((prev) => (prev[itemId] === marketPrice ? prev : { ...prev, [itemId]: marketPrice }));
  }, []);

  const rows = React.useMemo(() => {
    // BUG FIX: sorting previously only worked for 'addedAt' and returned 0 for
    // every other key, so the sort button appeared broken. Name/price/change
    // are now resolved per row (details/prices load async, unknown values sort
    // last) and the button cycles asc/desc instead of always resetting to asc.
    const direction = sortDirection === 'asc' ? 1 : -1;
    const detailName = (itemId: number) => nameCache[itemId];
    const priceValue = (itemId: number) => priceCache[itemId];

    const term = searchQuery.trim().toLowerCase();
    return watchlist
      .filter((item) => !term || item.itemId.toString().includes(term) || nameCache[item.itemId]?.toLowerCase().includes(term))
      .sort((a, b) => {
        switch (sortKey) {
          case 'name': {
            const an = detailName(a.itemId) ?? '';
            const bn = detailName(b.itemId) ?? '';
            if (!an && !bn) return 0;
            if (!an) return 1;
            if (!bn) return -1;
            return an.localeCompare(bn) * direction;
          }
          case 'price': {
            const ap = priceValue(a.itemId);
            const bp = priceValue(b.itemId);
            if (ap == null && bp == null) return 0;
            if (ap == null) return 1;
            if (bp == null) return -1;
            return (ap - bp) * direction;
          }
          case 'change':
            // change is derived from prices; fall back to price ordering
            return ((priceValue(a.itemId) ?? Infinity) - (priceValue(b.itemId) ?? Infinity)) * direction;
          case 'addedAt':
          default:
            return (a.addedAt - b.addedAt) * direction;
        }
      });
  }, [watchlist, searchQuery, sortKey, sortDirection, nameCache, priceCache]);

  const selectedWatchlistItem = watchlist.find((item) => item.itemId === selectedItemId) ?? watchlist[0] ?? null;

  return (
    <DashboardLayout
      header={
        <DashboardHeader
          title="Watchlist"
          description="Track your favorite items and market opportunities"
          actions={
            watchlist.length > 0 ? (
              <Button variant="outline" size="sm" onClick={clearWatchlist}>
                Clear All
              </Button>
            ) : null
          }
        />
      }
      sidebar={
        <div className="space-y-4">
          <div className="px-4 py-3 border-b">
            <h3 className="font-semibold text-sm">Watchlist Tools</h3>
          </div>
          <div className="px-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <Input
                type="text"
                placeholder="Filter watchlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="rounded-lg bg-surface p-3 text-xs text-text-secondary">
              {!selectedRealmId ? (
                <>
                  <div className="font-medium text-warning mb-1">Realm required</div>
                  Select a realm to view live price alerts.
                </>
              ) : (
                <>
                  <div className="font-medium text-success mb-1">Connected</div>
                  {watchlist.length} watched items for this realm.
                </>
              )}
            </div>
          </div>
        </div>
      }
      panelOpen={!!selectedWatchlistItem}
      panel={selectedWatchlistItem ? <WatchlistItemPanel item={selectedWatchlistItem} /> : undefined}
    >
      <DashboardCenter>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Watched Items" value={watchlist.length} />
            <StatCard title="Tracked Prices" value={watchlist.filter(() => selectedRealmId).length} />
            <StatCard title="Realm" value={selectedRealmId ? 'Connected' : 'Missing'} />
          </div>

          {watchlist.length === 0 ? (
            <Card>
              <CardContent className="pt-10 text-center">
                <div className="text-6xl mb-4">⭐</div>
                <h3 className="text-xl font-semibold mb-2">Your watchlist is empty</h3>
                <p className="text-text-secondary mb-6">
                  Add items from item search or item details to track prices here.
                </p>
                <Button asChild>
                  <Link href="/items">Browse Items</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle>Watched Items</CardTitle>
                    <CardDescription>
                      Monitor prices and market movement across your selected realm.
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // BUG FIX: cycle sort key then flip direction instead of
                      // always resetting direction to 'asc'.
                      if (sortKey !== 'name') {
                        setSortKey('name');
                        setSortDirection('asc');
                      } else if (sortDirection === 'asc') {
                        setSortDirection('desc');
                      } else {
                        setSortKey('addedAt');
                        setSortDirection('desc');
                      }
                    }}
                  >
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Sort
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Trend</TableHead>
                      <TableHead>Listings</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((item) => (
                      <WatchlistRow
                        key={item.itemId}
                        item={item}
                        selected={selectedItemId === item.itemId}
                        onSelect={() => setSelectedItemId(item.itemId)}
                        onRemove={() => removeFromWatchlist(item.itemId)}
                        onNameLoaded={handleNameLoaded}
                        onPriceLoaded={handlePriceLoaded}
                      />
                    ))}
                  </TableBody>
                </Table>
                {rows.length === 0 && (
                  <div className="py-10 text-center text-sm text-text-secondary">
                    No watched items match your filter.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardCenter>
    </DashboardLayout>
  );
}

function WatchlistRow({
  item,
  selected,
  onSelect,
  onRemove,
  onNameLoaded,
  onPriceLoaded,
}: {
  item: { itemId: number; addedAt: number; notes?: string; targetPrice?: number; name?: string; iconUrl?: string | null; quality?: string; itemClass?: string };
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onNameLoaded?: (itemId: number, name: string) => void;
  onPriceLoaded?: (itemId: number, marketPrice: number) => void;
}) {
  const details = useItemDetails(item.itemId);
  const media = useItemMedia(item.itemId);
  const prices = useItemPrices(item.itemId);

  // Report loaded data up so the parent table can sort by name/price.
  React.useEffect(() => {
    if (details.data?.name) onNameLoaded?.(item.itemId, details.data.name);
  }, [details.data?.name, item.itemId, onNameLoaded]);

  React.useEffect(() => {
    if (prices.data?.marketPrice) onPriceLoaded?.(item.itemId, prices.data.marketPrice);
  }, [prices.data?.marketPrice, item.itemId, onPriceLoaded]);

  const mediaIconUrl =
    media.data?.assets?.find((a) => a.key.toLowerCase() === 'icon')?.value ??
    null;

  const qualityName = details.data?.quality?.name || item.quality || 'COMMON';
  const itemName = details.data?.name || item.name || (details.isError ? `Item #${item.itemId}` : 'Loading item...');
  const itemIcon = mediaIconUrl || item.iconUrl || blizzardAPI.getItemIconUrl(item.itemId);

  return (
    <TableRow
      className={cn('cursor-pointer', selected && 'bg-primary/10')}
      onClick={onSelect}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <Image
            src={itemIcon}
            alt={itemName}
            width={40}
            height={40}
            className="rounded"
            unoptimized
            onError={(event) => {
              event.currentTarget.src = '/item-placeholder.svg';
            }}
          />
          <div>
            <div className="font-medium line-clamp-1" style={{ color: getQualityColor(qualityName) }}>
              {itemName}
            </div>
            <div className="text-xs text-text-secondary">
              {details.data?.item_class?.name || item.itemClass || 'Unknown'} • Added {new Date(item.addedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {prices.data ? (
          <div className="font-semibold"><GoldAmount copper={prices.data.marketPrice} /></div>
        ) : (
          <div className="text-sm text-text-secondary">No price</div>
        )}
      </TableCell>
      <TableCell>
        {prices.data ? (
          <PriceChange />
        ) : (
          <span className="text-sm text-text-secondary">—</span>
        )}
      </TableCell>
      <TableCell>{prices.data ? prices.data.totalListings : '—'}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild onClick={(e) => e.stopPropagation()}>
            <Link href={`/items/${item.itemId}`}>View</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function WatchlistItemPanel({ item }: { item: { itemId: number; addedAt: number; notes?: string; targetPrice?: number; name?: string; iconUrl?: string | null; quality?: string; itemClass?: string } }) {
  const details = useItemDetails(item.itemId);
  const media = useItemMedia(item.itemId);
  const prices = useItemPrices(item.itemId);
  const mediaIconUrl =
    media.data?.assets?.find((a) => a.key.toLowerCase() === 'icon')?.value ??
    null;

  const qualityName = details.data?.quality?.name || item.quality || 'COMMON';
  const itemName = details.data?.name || item.name || (details.isError ? `Item #${item.itemId}` : 'Loading item...');
  const itemIcon = mediaIconUrl || item.iconUrl || blizzardAPI.getItemIconUrl(item.itemId);

  return (
    <div className="space-y-4">
      <div className="p-4 border-b">
        <div className="flex items-start gap-3">
          <Image
            src={itemIcon}
            alt={itemName}
            width={48}
            height={48}
            className="rounded"
            unoptimized
            onError={(event) => {
              event.currentTarget.src = '/item-placeholder.svg';
            }}
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold line-clamp-2" style={{ color: getQualityColor(qualityName) }}>
              {itemName}
            </h2>
            <p className="text-xs text-text-secondary">
              Level {details.data?.level ?? 'N/A'} • {details.data?.item_class?.name || item.itemClass || 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      <Card className="mx-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Market Price</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {prices.isLoading ? (
            <div className="text-sm text-text-secondary">Loading prices...</div>
          ) : prices.data ? (
            <>
              <div className="text-3xl font-bold gold-text">
                <GoldAmount copper={prices.data.marketPrice} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-surface rounded">
                  <div className="text-text-secondary">Min</div>
                  <div className="font-semibold"><GoldAmount copper={prices.data.minPrice} /></div>
                </div>
                <div className="p-2 bg-surface rounded">
                  <div className="text-text-secondary">Avg</div>
                  <div className="font-semibold"><GoldAmount copper={prices.data.avgPrice} /></div>
                </div>
                <div className="p-2 bg-surface rounded">
                  <div className="text-text-secondary">Listings</div>
                  <div className="font-semibold">{prices.data.totalListings}</div>
                </div>
                <div className="p-2 bg-surface rounded">
                  <div className="text-text-secondary">Qty</div>
                  <div className="font-semibold">{prices.data.totalQuantity.toLocaleString()}</div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-sm text-text-secondary">No live price data available.</div>
          )}
        </CardContent>
      </Card>

      {item.notes && (
        <div className="mx-4 p-3 rounded-lg bg-surface text-sm text-text-secondary">
          {item.notes}
        </div>
      )}

      {item.targetPrice && (
        <div className="mx-4 p-3 rounded-lg bg-warning/10 text-warning text-sm">
          Target price: <GoldAmount copper={item.targetPrice} />
        </div>
      )}

      <div className="space-y-2 px-4">
        <Button className="w-full" asChild>
          <Link href={`/items/${item.itemId}`}>View Details</Link>
        </Button>
        <Button className="w-full" variant="outline">
          <AlertCircle className="h-4 w-4 mr-2" />
          Manage Alert
        </Button>
      </div>
    </div>
  );
}

function PriceChange() {
  return <span className="text-xs text-text-secondary">Live price · no history yet</span>;
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
