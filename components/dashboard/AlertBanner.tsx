'use client';

import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  dismissible?: boolean;
}

interface AlertBannerProps {
  alerts?: Alert[];
  onDismiss?: (id: string) => void;
}

const alertConfig = {
  info: {
    icon: Info,
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-700 dark:text-blue-400',
  },
  success: {
    icon: CheckCircle2,
    bg: 'bg-success/10',
    border: 'border-success/20',
    text: 'text-success',
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    text: 'text-yellow-700 dark:text-yellow-400',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    text: 'text-destructive',
  },
};

/**
 * Alert banner for server status, maintenance, market events
 */
export function AlertBanner({ alerts = [], onDismiss }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
    onDismiss?.(id);
  };

  const visibleAlerts = alerts.filter((alert) => !dismissed.has(alert.id));

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {visibleAlerts.map((alert) => {
        const config = alertConfig[alert.type];
        const Icon = config.icon;

        return (
          <div
            key={alert.id}
            className={cn(
              'flex items-start gap-3 rounded-lg border p-3',
              config.bg,
              config.border,
              config.text
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">{alert.title}</h3>
              <p className="text-xs opacity-90">{alert.message}</p>
            </div>
            {alert.dismissible !== false && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDismiss(alert.id)}
                className="h-6 w-6 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
