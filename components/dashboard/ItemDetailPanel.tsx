'use client';

import { Star, Share2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface ItemDetailData {
  id: number;
  name: string;
  icon?: string;
  rarity?: string;
  itemLevel?: number;
  currentPrice: number;
  change24h: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  volume?: number;
  trend?: 'up' | 'down' | 'sideways';
  description?: string;
}

interface ItemDetailPanelProps {
  item?: ItemDetailData;
  isLoading?: boolean;
  onAddToWatchlist?: () => void;
  onSetAlert?: () => void;
  onShare?: () => void;
}

/**
 * Right panel displaying detailed item information
 */
export function ItemDetailPanel({
  item,
  isLoading,
  onAddToWatchlist,
  onSetAlert,
  onShare,
}: ItemDetailPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="h-20 bg-surface rounded animate-pulse" />
        <div className="h-32 bg-surface rounded animate-pulse" />
        <div className="h-40 bg-surface rounded animate-pulse" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary text-sm p-4">
        Select an item to view details
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Item Header */}
      <div className="p-4 border-b">
        <div className="flex items-start gap-3">
          {item.icon && (
            <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center text-2xl">
              {item.icon}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-lg font-bold line-clamp-2">{item.name}</h2>
            <div className="text-xs text-text-secondary">
              {item.rarity && <span>{item.rarity} </span>}
              {item.itemLevel && <span>Item Level {item.itemLevel}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Current Price */}
      <Card className="mx-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Current Price</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-3xl font-bold gold-text">
              {item.currentPrice.toLocaleString()} g
            </div>
            <div
              className={`text-sm font-medium ${item.change24h > 0 ? 'text-success' : 'text-destructive'}`}
            >
              {item.change24h > 0 ? '+' : ''}{item.change24h.toFixed(1)}% (24h)
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-surface rounded">
              <div className="text-text-secondary">Average</div>
              <div className="font-semibold">{item.avgPrice.toLocaleString()} g</div>
            </div>
            <div className="p-2 bg-surface rounded">
              <div className="text-text-secondary">Volume</div>
              <div className="font-semibold">{(item.volume || 0).toLocaleString()}</div>
            </div>
            <div className="p-2 bg-surface rounded">
              <div className="text-text-secondary">Min</div>
              <div className="font-semibold">{item.minPrice.toLocaleString()} g</div>
            </div>
            <div className="p-2 bg-surface rounded">
              <div className="text-text-secondary">Max</div>
              <div className="font-semibold">{item.maxPrice.toLocaleString()} g</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Indicator */}
      {item.trend && (
        <div className="mx-4 p-3 rounded-lg bg-primary/10 text-sm">
          <div className="text-text-secondary mb-1">Market Trend</div>
          <div className="font-semibold capitalize">
            {item.trend === 'up' && '📈 Bullish'}
            {item.trend === 'down' && '📉 Bearish'}
            {item.trend === 'sideways' && '➡️ Sideways'}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2 px-4">
        <Button
          className="w-full"
          variant="default"
          onClick={onAddToWatchlist}
        >
          <Star className="h-4 w-4 mr-2" />
          Add to Watchlist
        </Button>
        <Button
          className="w-full"
          variant="outline"
          onClick={onSetAlert}
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          Set Price Alert
        </Button>
        <Button
          className="w-full"
          variant="outline"
          onClick={onShare}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Description */}
      {item.description && (
        <div className="mx-4 p-3 text-xs text-text-secondary">
          {item.description}
        </div>
      )}
    </div>
  );
}
