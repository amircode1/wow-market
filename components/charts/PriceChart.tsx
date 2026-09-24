'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { OHLCV } from '@/types';

type ChartModule = typeof import('lightweight-charts');

interface PriceChartProps { data: OHLCV[]; height?: number; className?: string; showVolume?: boolean; timeframe?: string; priceFormatter?: (price: number) => string; }

function resolveColor(variable: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return value || fallback;
}

function toChartTime(timestamp: number): number {
  return timestamp > 100_000_000_000 ? Math.floor(timestamp / 1000) : timestamp;
}

export function PriceChart({ data, height = 400, className, showVolume = true, priceFormatter }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;

    async function render() {
      if (!containerRef.current || data.length === 0) return;
      const module: ChartModule = await import('lightweight-charts');
      if (disposed || !containerRef.current) return;
      const colors = {
        text: resolveColor('--text-primary', '#E6E8EA'),
        border: resolveColor('--border', '#2B3139'),
        success: resolveColor('--success', '#0ECB81'),
        destructive: resolveColor('--destructive', '#F6465D'),
        primary: resolveColor('--primary', '#3861FB'),
      };
      const chart = module.createChart(containerRef.current, {
        layout: { background: { type: module.ColorType.Solid, color: 'transparent' }, textColor: colors.text },
        width: containerRef.current.clientWidth,
        height,
        grid: { vertLines: { color: colors.border }, horzLines: { color: colors.border } },
        crosshair: { mode: module.CrosshairMode.Normal, vertLine: { color: colors.primary, width: 1, style: 2 }, horzLine: { color: colors.primary, width: 1, style: 2 } },
        rightPriceScale: { borderColor: colors.border, scaleMargins: { top: 0.08, bottom: 0.08 } },
        timeScale: { borderColor: colors.border, timeVisible: true, secondsVisible: false, rightOffset: 4, barSpacing: 12 },
      });
      const candles = chart.addCandlestickSeries({ upColor: colors.success, downColor: colors.destructive, borderUpColor: colors.success, borderDownColor: colors.destructive, wickUpColor: colors.success, wickDownColor: colors.destructive, ...(priceFormatter ? { priceFormat: { type: 'custom' as const, formatter: priceFormatter } } : {}) });
      candles.setData(data.map((item) => ({ time: toChartTime(item.time) as never, open: item.open, high: item.high, low: item.low, close: item.close })));
      if (showVolume) {
        const volume = chart.addHistogramSeries({ color: colors.primary, priceFormat: { type: 'volume' }, priceScaleId: 'volume' });
        volume.setData(data.map((item) => ({ time: toChartTime(item.time) as never, value: item.volume, color: item.close >= item.open ? colors.success : colors.destructive })));
        chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
      }
      chart.timeScale().fitContent();
      const resize = () => containerRef.current && chart.applyOptions({ width: containerRef.current.clientWidth });
      window.addEventListener('resize', resize);
      cleanup = () => { window.removeEventListener('resize', resize); chart.remove(); };
    }

    render();
    return () => { disposed = true; cleanup?.(); };
  }, [data, height, showVolume, priceFormatter]);

  return <div className={cn('w-full', className)}><div ref={containerRef} className="w-full" /></div>;
}
