'use client';

import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export interface WatchlistItem {
  id: number;
  name: string;
  price: number;
  change: number;
  alert?: boolean;
}

interface WatchlistPreviewProps {
  items?: WatchlistItem[];
  isLoading?: boolean;
  maxItems?: number;
}

/**
 * Watchlist preview widget for sidebar
 */
export function WatchlistPreview({
  items = [],
  isLoading,
  maxItems = 5,
}: WatchlistPreviewProps) {
  const displayItems = items.slice(0, maxItems);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Star className="h-4 w-4 fill-gold text-gold" />
          Watchlist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-surface rounded animate-pulse" />
            ))}
          </div>
        ) : displayItems.length > 0 ? (
          <>
            {displayItems.map((item) => (
              <Link key={item.id} href={`/items/${item.id}`}>
                <div className="flex items-center justify-between p-2 rounded bg-surface hover:bg-surface/80 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium line-clamp-1">{item.name}</div>
                    <div className="text-xs text-text-secondary">{item.price.toLocaleString()} g</div>
                  </div>
                  <div
                    className={`text-xs font-medium flex items-center gap-1 ${
                      item.change > 0 ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    {item.change > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(item.change).toFixed(1)}%
                  </div>
                </div>
              </Link>
            ))}
            {items.length > maxItems && (
              <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                <Link href="/watchlist">
                  View All ({items.length})
                </Link>
              </Button>
            )}
          </>
        ) : (
          <div className="text-center py-6 text-text-secondary text-xs">
            <Star className="h-4 w-4 mx-auto mb-2 opacity-50" />
            <p>No watched items</p>
            <Button variant="outline" size="sm" className="w-full mt-2" asChild>
              <Link href="/items">Browse Items</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
