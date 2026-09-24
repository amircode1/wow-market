'use client';

import { cn } from '@/lib/utils';

interface GoldAmountProps {
  copper: number;
  className?: string;
}

export function GoldAmount({ copper, className }: GoldAmountProps) {
  const amount = Math.round(copper);
  const absolute = Math.abs(amount);
  const gold = Math.floor(absolute / 10000);
  const silver = Math.floor((absolute % 10000) / 100);
  const copperAmount = absolute % 100;

  return (
    <span className={cn('whitespace-nowrap', className)}>
      {amount < 0 && <span>-</span>}
      {gold > 0 && <span className="gold-text">{gold.toLocaleString()}g</span>}
      {gold > 0 && silver > 0 && ' '}
      {silver > 0 && <span className="silver-text">{silver}s</span>}
      {(gold > 0 || silver > 0) && ' '}
      <span className="copper-text">{copperAmount}c</span>
    </span>
  );
}