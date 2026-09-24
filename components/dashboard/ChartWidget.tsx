'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ChartWidgetProps {
  title?: string;
  children?: ReactNode;
  timeframe?: string;
  onTimeframeChange?: (timeframe: string) => void;
  isLoading?: boolean;
  actions?: ReactNode;
}

/**
 * Wrapper component for charts with controls
 */
export function ChartWidget({
  title = 'Price Chart',
  children,
  timeframe = '1d',
  onTimeframeChange,
  isLoading,
  actions,
}: ChartWidgetProps) {
  const timeframes = [
    { value: '1h', label: '1H' },
    { value: '4h', label: '4H' },
    { value: '1d', label: '1D' },
    { value: '1w', label: '1W' },
    { value: '1m', label: '1M' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center gap-2">
            {onTimeframeChange && (
              <div className="flex gap-1">
                {timeframes.map((tf) => (
                  <Button
                    key={tf.value}
                    variant={timeframe === tf.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onTimeframeChange(tf.value)}
                    className="h-8 px-2 text-xs"
                  >
                    {tf.label}
                  </Button>
                ))}
              </div>
            )}
            {actions}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 bg-surface rounded animate-pulse" />
        ) : (
          <div className="min-h-64">
            {children || (
              <div className="flex items-center justify-center h-64 text-text-secondary">
                No price history yet — collect real snapshots by refreshing market data.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
