---
applyTo: '**/*.ts'
---

# GitHub Copilot Custom Instructions
## WoW Market Tracker Project

---

## Project Context

You are working on **WoW Market Tracker**, a professional real-time auction house price tracking application for World of Warcraft. This is a **frontend-only application** built with Next.js that fetches data directly from Blizzard Battle.net API.

---

## Technology Stack

### Core Technologies
- **Framework**: Next.js 14+ with App Router (React Server Components)
- **Language**: TypeScript 5.0+ in strict mode
- **Styling**: Tailwind CSS 4.0+
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

### Data & State Management
- **Server State**: TanStack Query (React Query) - for API data fetching and caching
- **Client State**: Zustand - for global UI state
- **Forms**: React Hook Form + Zod validation
- **Storage**: localStorage (preferences, watchlist) + IndexedDB via Dexie.js (large data, price history)

### Charts & Visualization
- **Primary Charts**: Lightweight Charts (TradingView library) for candlestick/OHLC charts
- **Secondary**: Recharts for simple visualizations
- **Data Viz**: D3.js for custom visualizations

### External API
- **Blizzard Battle.net API**: OAuth 2.0 Client Credentials
- Use Next.js API Routes as proxy (never expose credentials to client)

---

## Code Style & Conventions

### General Rules
1. **Always use TypeScript** - No JavaScript files
2. **Strict typing** - No `any` types, use `unknown` if type is truly unknown
3. **Functional components only** - No class components
4. **Named exports** for components, default export for pages
5. **File naming**: 
   - Components: `PascalCase.tsx` (e.g., `ItemCard.tsx`)
   - Utils/libs: `camelCase.ts` (e.g., `goldFormatter.ts`)
   - Hooks: `useCamelCase.ts` (e.g., `useAuctionData.ts`)
   - Types: `PascalCase.ts` (e.g., `Item.ts`)

### TypeScript
```typescript
// ✅ GOOD: Define explicit types
interface ItemCardProps {
  item: Item;
  onClick: (itemId: number) => void;
  showPrice?: boolean;
}

// ✅ GOOD: Use type imports
import type { Item, Realm } from '@/types';

// ❌ BAD: Avoid any
const data: any = fetchData(); // NO!

// ✅ GOOD: Use unknown and type guards
const data: unknown = fetchData();
if (isItem(data)) {
  // now data is Item
}
```

### React Components
```typescript
// ✅ GOOD: Functional component with types
interface ItemCardProps {
  item: Item;
  onSelect: (id: number) => void;
}

export function ItemCard({ item, onSelect }: ItemCardProps) {
  // Component logic
}

// ✅ GOOD: Use React hooks properly
const [isLoading, setIsLoading] = useState(false);
const itemData = useQuery({ ... });

// ✅ GOOD: Memoize expensive calculations
const sortedItems = useMemo(() => 
  items.sort((a, b) => a.price - b.price),
  [items]
);

// ✅ GOOD: Cleanup effects
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, []);
```

### Tailwind CSS
```tsx
// ✅ GOOD: Use Tailwind utilities
<div className="flex items-center gap-4 rounded-lg bg-surface p-4">

// ✅ GOOD: Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// ✅ GOOD: Dark mode support
<div className="bg-white dark:bg-surface text-black dark:text-white">

// ❌ BAD: Avoid inline styles
<div style={{ padding: '16px' }}> // NO!
```

### Data Fetching with TanStack Query
```typescript
// ✅ GOOD: Use React Query for API calls
export function useAuctionData(realmId: number) {
  return useQuery({
    queryKey: ['auctions', realmId],
    queryFn: () => fetchAuctions(realmId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// ✅ GOOD: Use mutations for actions
const mutation = useMutation({
  mutationFn: addToWatchlist,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['watchlist'] });
  },
});
```

### Error Handling
```typescript
// ✅ GOOD: Always handle errors
try {
  const data = await fetchData();
  return data;
} catch (error) {
  console.error('Failed to fetch data:', error);
  toast.error('Failed to load data. Please try again.');
  return null;
}

// ✅ GOOD: Type error objects
catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}

// ✅ GOOD: Use error boundaries for React errors
<ErrorBoundary fallback={<ErrorState />}>
  <Component />
</ErrorBoundary>
```

---

## Project-Specific Requirements

### 1. Blizzard API Integration

**ALWAYS use Next.js API routes as proxy:**
```typescript
// ❌ BAD: Never call Blizzard API from client
const data = await fetch('https://us.api.blizzard.com/data/wow/...');

// ✅ GOOD: Use Next.js API route
const data = await fetch('/api/blizzard/auctions/123');
```

**API Routes must handle OAuth:**
```typescript
// app/api/blizzard/auctions/[realmId]/route.ts
import { blizzardAPI } from '@/lib/blizzard-api';

export async function GET(
  request: NextRequest,
  { params }: { params: { realmId: string } }
) {
  try {
    const data = await blizzardAPI.getAuctions(Number(params.realmId));
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch auctions' },
      { status: 500 }
    );
  }
}
```

### 2. Gold Formatting

**Always store prices in copper (smallest unit):**
```typescript
// ✅ GOOD: Format gold correctly
export function formatGold(copper: number): string {
  const gold = Math.floor(copper / 10000);
  const silver = Math.floor((copper % 10000) / 100);
  const copperAmount = copper % 100;
  
  if (gold > 0) {
    return `${gold.toLocaleString()}g ${silver}s ${copperAmount}c`;
  }
  if (silver > 0) {
    return `${silver}s ${copperAmount}c`;
  }
  return `${copperAmount}c`;
}

// Usage
<span>{formatGold(item.price)}</span>
```

### 3. Price Calculations

**Calculate from raw auction data:**
```typescript
// ✅ GOOD: Calculate price statistics
interface PriceStats {
  minBuyout: number;
  maxBuyout: number;
  avgPrice: number;
  medianPrice: number;
  marketPrice: number; // weighted by quantity
  totalListings: number;
  totalQuantity: number;
}

export function calculatePriceStats(auctions: Auction[]): PriceStats {
  const prices = auctions
    .filter(a => a.buyout && a.buyout > 0)
    .map(a => a.buyout!);
  
  if (prices.length === 0) {
    return null;
  }
  
  const sorted = prices.sort((a, b) => a - b);
  
  return {
    minBuyout: sorted[0],
    maxBuyout: sorted[sorted.length - 1],
    avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
    medianPrice: sorted[Math.floor(sorted.length / 2)],
    // ... calculate other stats
  };
}
```

### 4. OHLCV Chart Data

**Convert snapshots to candlesticks:**
```typescript
interface OHLCV {
  time: number; // Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function aggregateToOHLCV(
  snapshots: PriceSnapshot[],
  interval: '1h' | '1d' | '1w'
): OHLCV[] {
  // Group snapshots by time interval
  // Calculate OHLC for each period
  // Return array of OHLCV objects
}
```

### 5. Client-Side Storage

**Use localStorage for small data:**
```typescript
// ✅ GOOD: Use typed localStorage wrapper
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue] as const;
}
```

**Use IndexedDB for large data:**
```typescript
// ✅ GOOD: Use Dexie for IndexedDB
import Dexie, { Table } from 'dexie';

interface PriceSnapshot {
  id?: string;
  itemId: number;
  realmId: number;
  timestamp: number;
  // ... other fields
}

class WoWMarketDB extends Dexie {
  priceHistory!: Table<PriceSnapshot>;

  constructor() {
    super('WoWMarketTrackerDB');
    this.version(1).stores({
      priceHistory: '++id, itemId, realmId, timestamp',
    });
  }
}

export const db = new WoWMarketDB();
```

### 6. Performance Optimizations

**Always implement these:**
```typescript
// ✅ GOOD: Debounce search input
import { useDebouncedValue } from '@/hooks/useDebounce';

const [searchQuery, setSearchQuery] = useState('');
const debouncedQuery = useDebouncedValue(searchQuery, 300);

// ✅ GOOD: Memoize expensive components
const ItemCard = memo(({ item }: { item: Item }) => {
  // Component logic
});

// ✅ GOOD: Virtual scrolling for long lists
import { useVirtualizer } from '@tanstack/react-virtual';

// ✅ GOOD: Code splitting
const PriceChart = lazy(() => import('@/components/charts/PriceChart'));

// ✅ GOOD: Image optimization
import Image from 'next/image';
<Image src={item.icon} alt={item.name} width={48} height={48} />
```

### 7. Loading States

**Every async operation needs loading UI:**
```typescript
// ✅ GOOD: Show loading state
function ItemDetail({ itemId }: { itemId: number }) {
  const { data: item, isLoading, error } = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => fetchItem(itemId),
  });

  if (isLoading) {
    return <ItemSkeleton />;
  }

  if (error) {
    return <ErrorState message="Failed to load item" />;
  }

  if (!item) {
    return <EmptyState message="Item not found" />;
  }

  return <ItemContent item={item} />;
}
```

### 8. Mobile Responsive

**Always use mobile-first approach:**
```tsx
// ✅ GOOD: Mobile-first responsive design
<div className="
  grid 
  grid-cols-1          /* Mobile: 1 column */
  md:grid-cols-2       /* Tablet: 2 columns */
  lg:grid-cols-3       /* Desktop: 3 columns */
  gap-4                /* Consistent spacing */
">
  {items.map(item => <ItemCard key={item.id} item={item} />)}
</div>

// ✅ GOOD: Touch-friendly buttons
<button className="
  min-h-[44px]         /* Minimum touch target */
  min-w-[44px]
  px-4 py-2
">
  Click me
</button>
```

---

## Common Patterns

### Fetching Item Details
```typescript
export function useItemDetails(itemId: number) {
  return useQuery({
    queryKey: ['item', itemId],
    queryFn: async () => {
      const response = await fetch(`/api/blizzard/items/${itemId}`);
      if (!response.ok) throw new Error('Failed to fetch item');
      return response.json() as Promise<Item>;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (items are static)
  });
}
```

### Fetching Auction Data
```typescript
export function useAuctionData(realmId: number) {
  return useQuery({
    queryKey: ['auctions', realmId],
    queryFn: async () => {
      const response = await fetch(`/api/blizzard/auctions/${realmId}`);
      if (!response.ok) throw new Error('Failed to fetch auctions');
      return response.json() as Promise<AuctionHouse>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
}
```

### Watchlist Management
```typescript
export function useWatchlist() {
  const [watchlist, setWatchlist] = useLocalStorage<number[]>('watchlist', []);

  const addToWatchlist = useCallback((itemId: number) => {
    setWatchlist(prev => {
      if (prev.includes(itemId)) return prev;
      return [...prev, itemId];
    });
    toast.success('Added to watchlist');
  }, [setWatchlist]);

  const removeFromWatchlist = useCallback((itemId: number) => {
    setWatchlist(prev => prev.filter(id => id !== itemId));
    toast.success('Removed from watchlist');
  }, [setWatchlist]);

  const isInWatchlist = useCallback((itemId: number) => {
    return watchlist.includes(itemId);
  }, [watchlist]);

  return { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist };
}
```

---

## Do's and Don'ts

### DO ✅
- Use TypeScript strict mode
- Define explicit types for all props and functions
- Use functional components with hooks
- Implement proper error handling
- Add loading states for async operations
- Use Tailwind CSS utilities
- Implement mobile-first responsive design
- Cache API responses appropriately
- Use Next.js Image component for images
- Implement proper SEO with metadata
- Use semantic HTML
- Add ARIA labels for accessibility
- Format gold amounts correctly (g/s/c)
- Store prices in copper
- Use Next.js API routes for Blizzard API
- Implement debouncing for search inputs
- Use memo/useMemo for expensive operations
- Clean up effects properly

### DON'T ❌
- Don't use `any` type
- Don't use inline styles (use Tailwind)
- Don't use class components
- Don't expose Blizzard API credentials to client
- Don't call Blizzard API directly from client
- Don't forget loading states
- Don't forget error handling
- Don't ignore mobile users
- Don't use CSS modules (use Tailwind)
- Don't forget to cleanup effects
- Don't store large data in localStorage (use IndexedDB)
- Don't request new OAuth token for every call
- Don't fetch auction data more often than every 5 minutes
- Don't forget to handle empty states
- Don't use default exports for components (use named)

---

## Component Structure Template

```typescript
// components/items/ItemCard.tsx
import { memo } from 'react';
import Image from 'next/image';
import { formatGold } from '@/lib/gold-formatter';
import type { Item } from '@/types';

interface ItemCardProps {
  item: Item;
  onSelect?: (itemId: number) => void;
  showPrice?: boolean;
}

export const ItemCard = memo(function ItemCard({
  item,
  onSelect,
  showPrice = true,
}: ItemCardProps) {
  return (
    <div
      className="flex items-center gap-3 rounded-lg bg-surface p-4 hover:bg-surface-elevated cursor-pointer transition-colors"
      onClick={() => onSelect?.(item.id)}
    >
      <Image
        src={item.icon}
        alt={item.name}
        width={48}
        height={48}
        className="rounded"
      />
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate" style={{ color: item.qualityColor }}>
          {item.name}
        </h3>
        
        {showPrice && item.price && (
          <p className="text-sm text-text-secondary">
            {formatGold(item.price)}
          </p>
        )}
      </div>
    </div>
  );
});
```

---

## Testing Checklist

Before committing code, ensure:
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No ESLint warnings (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Component renders without errors
- [ ] Loading states work
- [ ] Error states work
- [ ] Mobile responsive design works
- [ ] Dark mode works
- [ ] No console errors
- [ ] Performance is acceptable

---

## Quick Reference

### Common Imports
```typescript
// React
import { useState, useEffect, useMemo, useCallback, memo } from 'react';

// Next.js
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// TanStack Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Zustand
import { create } from 'zustand';

// Form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// UI
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

// Utils
import { cn } from '@/lib/utils';
import { formatGold } from '@/lib/gold-formatter';

// Types
import type { Item, Auction, Realm } from '@/types';
```

### Tailwind CSS Classes (Most Used)
```
Layout: flex, grid, items-center, justify-between, gap-4
Spacing: p-4, px-6, py-2, m-4, space-x-2
Sizing: w-full, h-screen, max-w-7xl, min-h-[44px]
Colors: bg-surface, text-text-primary, border-border
Typography: text-sm, font-semibold, truncate
Effects: rounded-lg, shadow-lg, hover:bg-surface-elevated
Responsive: md:grid-cols-2, lg:flex-row, sm:text-base
Dark mode: dark:bg-surface, dark:text-white
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_BLIZZARD_REGION=us
BLIZZARD_CLIENT_ID=your_client_id
BLIZZARD_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Summary

When writing code for this project:
1. **Type everything** with TypeScript
2. **Use Next.js API routes** for Blizzard API (never from client)
3. **Cache aggressively** (auction data: 5min, items: 24h)
4. **Store prices in copper**, format on display
5. **Mobile-first** responsive design
6. **Handle errors** gracefully everywhere
7. **Show loading states** for all async operations
8. **Use Tailwind** for all styling
9. **Optimize performance** (memo, lazy load, code split)
10. **Follow patterns** shown in this document

This is a **professional trading platform** - write production-ready code with proper error handling, performance optimization, and user experience in mind.