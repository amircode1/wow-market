'use client';

import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export interface TrendingItem {
  id: number;
  name: string;
  volume?: number;
  icon?: string;
  change?: number;
}

interface TrendingWidgetProps {
  items: TrendingItem[];
  isLoading?: boolean;
  title?: string;
  description?: string;
}

/**
 * Widget showing trending items by volume
 */
export function TrendingWidget({
  items,
  isLoading,
  title = 'Trending Items',
  description = 'Highest live listed quantity in the selected realm',
}: TrendingWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-surface rounded animate-pulse" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => (
              <Link key={item.id} href={`/items/${item.id}`}>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-surface/80 transition-colors cursor-pointer h-full">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-lg flex-shrink-0">
                    {item.icon ? (
                      <img src={item.icon} alt="" className="h-10 w-10 rounded object-cover" loading="lazy" />
                    ) : '📊'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium line-clamp-1">{item.name}</div>
                    <div className="text-xs text-text-secondary">
                      {(item.volume || 0).toLocaleString()} listings
                    </div>
                    <div className="text-xs text-text-secondary">Ranked by listed quantity</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-text-secondary text-sm">
            No trending items
          </div>
        )}
      </CardContent>
    </Card>
  );
}
