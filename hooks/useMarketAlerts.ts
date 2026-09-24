import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDashboardData } from './useDashboardData';
import { useDashboardStore, useUIStore } from '@/store';

export interface PriceAlert {
  itemId: number;
  name: string;
  threshold: number; // Price threshold
  type: 'above' | 'below'; // Alert when price goes above/below
  lastAlerted?: number;
}

/**
 * Hook to monitor price alerts against live market data
 */
export function useMarketAlerts() {
  const dashboardData = useDashboardData();
  const { alertsEnabled } = useDashboardStore();
  const { addNotification } = useUIStore();

  // Alerts are user preferences stored locally; market prices are fetched live.
  const alerts: PriceAlert[] = [];

  // Monitor alerts
  useEffect(() => {
    if (!alertsEnabled || !dashboardData.topGainers || !dashboardData.topLosers) {
      return;
    }

    const allItems = [...dashboardData.topGainers, ...dashboardData.topLosers];

    alerts.forEach((alert) => {
      const item = allItems.find((i) => i.id === alert.itemId);
      if (!item) return;

      const shouldAlert =
        (alert.type === 'above' && item.price > alert.threshold) ||
        (alert.type === 'below' && item.price < alert.threshold);

      if (shouldAlert && (!alert.lastAlerted || Date.now() - alert.lastAlerted > 60000)) {
        addNotification({
          type: 'warning',
          message: `${item.name} is now ${alert.type} ${alert.threshold} gold (Current: ${item.price})`,
        });
        alert.lastAlerted = Date.now();
      }
    });
    // BUG FIX: `alerts` was missing from the dependency array.
  }, [alerts, dashboardData.topGainers, dashboardData.topLosers, alertsEnabled, addNotification]);

  return { alerts };
}
