'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Search } from 'lucide-react';
import { formatGold } from '@/lib/utils';
import { DashboardPriceChart } from '@/components/dashboard/DashboardPriceChart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { DashboardCenter } from '@/components/layout/DashboardCenter';
import { StatCard } from '@/components/dashboard/StatCard';
import { ChartWidget } from '@/components/dashboard/ChartWidget';
import { TopMoversCard } from '@/components/dashboard/TopMoversCard';
import { TrendingWidget } from '@/components/dashboard/TrendingWidget';
import { AlertBanner } from '@/components/dashboard/AlertBanner';
import { useDashboardState } from '@/hooks/useDashboardState';
import { useItemDetails, useItemPrices } from '@/hooks/useApi';
import { ItemDetailPanel } from '@/components/dashboard/ItemDetailPanel';
import { GoldAmount } from '@/components/ui/GoldAmount';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const router = useRouter();
  const dashboard = useDashboardState();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/items?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const alerts = !dashboard.selectedRealmByRegion[dashboard.selectedRegion]
    ? [{
        id: 'realm-required',
        type: 'warning' as const,
        title: 'Select a realm',
        message: 'Choose a realm to load live auction house data.',
        dismissible: false,
      }]
    : dashboard.error
    ? [{
        id: 'market-error',
        type: 'error' as const,
        title: 'Market data unavailable',
        message: dashboard.error,
        dismissible: false,
      }]
    : [];

  return (
    <DashboardLayout
      header={
        <DashboardHeader
          title="Market Overview"
          description="Real-time auction house data and market analytics"
          actions={
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                <Input
                  type="text"
                  placeholder="Quick search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-48 h-9"
                />
              </div>
            </form>
          }
        />
      }
      sidebar={
        <div className="space-y-4">
          <div className="px-4 py-3 border-b">
            <h3 className="font-semibold text-sm">Dashboard Filters</h3>
          </div>
          <div className="px-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-text-secondary">Refresh Rate</label>
              <select
                value={dashboard.refreshRate}
                onChange={(e) => dashboard.setRefreshRate(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 rounded border bg-background text-sm"
              >
                <option value={30}>Every 30 seconds</option>
                <option value={60}>Every minute</option>
                <option value={300}>Every 5 minutes</option>
                <option value={600}>Every 10 minutes</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="alerts"
                checked={dashboard.alertsEnabled}
                onChange={(e) => dashboard.setAlertsEnabled(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="alerts" className="text-xs font-medium cursor-pointer">
                Enable Alerts
              </label>
            </div>
          </div>
        </div>
      }
      panelOpen={dashboard.selectedItemForPanel !== null}
      panel={
        dashboard.selectedItemForPanel ? (
          <HomeItemPanel itemId={dashboard.selectedItemForPanel} />
        ) : undefined
      }
    >
      <DashboardCenter>
        <div className="space-y-6">
          {!dashboard.selectedRealmByRegion[dashboard.selectedRegion] && (
            <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
              Select a realm from the header to load live Blizzard Auction House data.
            </div>
          )}
          {/* Alerts */}
          <AlertBanner alerts={alerts} />

          {/* Market Stats */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Market Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<BarChart3 className="h-4 w-4" />}
                title="Total Items"
                value={dashboard.stats?.totalItems.toLocaleString() ?? '—'}
                subtitle="Items tracked"
              />
              <StatCard
                icon={<BarChart3 className="h-4 w-4" />}
                title="Active Auctions"
                value={dashboard.stats?.totalAuctions.toLocaleString() ?? '—'}
                subtitle="Current listings"
              />
              <StatCard
                icon={<BarChart3 className="h-4 w-4" />}
                title="Market Value"                value={dashboard.stats?.marketValue != null
                  ? <GoldAmount copper={dashboard.stats.marketValue} />
                    : '—'
                }
                subtitle="Total value"
              />
              <StatCard
                icon={<BarChart3 className="h-4 w-4" />}
                title="Active Sellers"
                value={dashboard.stats?.activeSellers != null ? dashboard.stats.activeSellers.toLocaleString() : '—'}
                subtitle="Seller data unavailable from API"
              />
            </div>
          </div>

          {/* Charts & Top Movers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartWidget
              title="WoW Token Price"
              timeframe={dashboard.selectedTimeframe}
              onTimeframeChange={dashboard.setTimeframe}
              isLoading={dashboard.isLoading}
            >
              <DashboardPriceChart
                itemId={dashboard.selectedItemForPanel ?? dashboard.trending[0]?.id ?? 0}
                realmId={dashboard.selectedRealmByRegion[dashboard.selectedRegion] ?? 0}
                timeframe={dashboard.selectedTimeframe}
              />
            </ChartWidget>

            <div className="space-y-4">
              <TopMoversCard
                title="Top Gainers"
                type="gainers"
                items={dashboard.topGainers}
                isLoading={dashboard.isLoading}
                footer={
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/items?filter=gainers">View All Gainers</a>
                  </Button>
                }
              />
            </div>
          </div>

          {/* Top Losers & Trending */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopMoversCard
              title="Top Losers"
              type="losers"
              items={dashboard.topLosers}
              isLoading={dashboard.isLoading}
              footer={
                <Button variant="outline" className="w-full" asChild>
                  <a href="/items?filter=losers">View All Losers</a>
                </Button>
              }
            />

            <TrendingWidget
              title="Trending Items"
              items={dashboard.trending}
              isLoading={dashboard.isLoading}
            />
          </div>
        </div>
      </DashboardCenter>
    </DashboardLayout>
  );
}

/**
 * Loads the selected item and its live market price from Blizzard-backed API routes.
 */
function HomeItemPanel({ itemId }: { itemId: number }) {
  const { data: prices, isLoading } = useItemPrices(itemId);
  const { data: details } = useItemDetails(itemId);

  return (
    <ItemDetailPanel
      item={{
        id: itemId,
        name: details?.name ?? `Item #${itemId}`,
        currentPrice: prices?.marketPrice ?? 0,
        change24h: 0,
        avgPrice: prices?.avgPrice ?? 0,
        minPrice: prices?.minPrice ?? 0,
        maxPrice: prices?.maxPrice ?? 0,
        volume: prices?.totalQuantity ?? 0,
        trend: 'sideways',
      }}
      isLoading={isLoading}
    />
  );
}
