'use client';

import { useItemPrices } from '@/hooks/useApi';
import { formatGold } from '@/lib/utils';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GoldAmount } from '@/components/ui/GoldAmount';

interface ItemPriceProps {
  itemId: number;
  className?: string;
}

export function ItemPrice({ itemId, className }: ItemPriceProps) {
  const { data: prices, isLoading, error } = useItemPrices(itemId);

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Price:</span>
          <Loader2 className="h-3 w-3 animate-spin text-text-secondary" />
        </div>
      </div>
    );
  }

  if (error || !prices) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Price:</span>
          <span className="text-sm text-text-secondary">No listings</span>
        </div>
      </div>
    );
  }

  const sourceLabel = prices.source === 'commodities' ? 'Commodities' : 'Realm AH';

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary">Source:</span>
        <span className="text-xs text-text-secondary">{sourceLabel}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-secondary">Market Price:</span>
        <span className="font-medium gold-text">
          <GoldAmount copper={prices.marketPrice} />
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-secondary">Min Price:</span>
        <span className="text-sm gold-text">
          <GoldAmount copper={prices.minPrice} />
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-secondary">Listings:</span>
        <span className="text-sm text-text-secondary">
          {prices.totalListings} ({prices.totalQuantity} total)
        </span>
      </div>
    </div>
  );
}

